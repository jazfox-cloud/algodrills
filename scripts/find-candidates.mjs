#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { URL } from "node:url";
import dns from "node:dns/promises";

const DEFAULTS = {
  startId: 7_000_000,
  endId: 9_000_000,
  sample: 400,
  batch: 40,
  maxCandidates: 20,
  outputDir: "output/candidates",
  minCdxRows: 3,
  timeoutMs: 10_000,
  cdxTimeoutMs: 20_000,
};

const options = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

async function main() {
  await mkdir(options.outputDir, { recursive: true });

  console.error("Finding old Show HN seed domains...");
  const seeds = await findShowHnSeeds();
  console.error(`Found ${seeds.length} unique seed domains.`);

  const rows = [];
  for (const seed of seeds) {
    console.error(`Checking ${seed.domain}...`);
    const checked = await checkCandidate(seed);
    rows.push(checked);
  }

  rows.sort((a, b) => scoreCandidate(b) - scoreCandidate(a));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = `${options.outputDir}/candidates-${stamp}.json`;
  const csvPath = `${options.outputDir}/candidates-${stamp}.csv`;

  await writeFile(jsonPath, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(csvPath, toCsv(rows));

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${csvPath}`);
  console.log("");
  console.log("Top candidates:");
  for (const row of rows.slice(0, 10)) {
    console.log(
      [
        row.domain,
        row.candidate_status,
        `score=${scoreCandidate(row)}`,
        `cdx_html_rows=${row.cdx_html_rows}`,
        `current=${row.current_status}`,
        row.hn_title,
      ].join(" | "),
    );
  }
}

function parseArgs(argv) {
  const out = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--start-id") out.startId = Number(next), i += 1;
    else if (arg === "--end-id") out.endId = Number(next), i += 1;
    else if (arg === "--sample") out.sample = Number(next), i += 1;
    else if (arg === "--batch") out.batch = Number(next), i += 1;
    else if (arg === "--max-candidates") out.maxCandidates = Number(next), i += 1;
    else if (arg === "--output-dir") out.outputDir = next, i += 1;
    else if (arg === "--min-cdx-rows") out.minCdxRows = Number(next), i += 1;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  validateOptions(out);
  return out;
}

function printHelp() {
  console.log(`Usage:
  node scripts/find-candidates.mjs [options]

Options:
  --sample <n>           Number of HN item ids to sample. Default: ${DEFAULTS.sample}
  --max-candidates <n>   Max unique Show HN domains to check. Default: ${DEFAULTS.maxCandidates}
  --start-id <n>         Start HN item id. Default: ${DEFAULTS.startId}
  --end-id <n>           End HN item id. Default: ${DEFAULTS.endId}
  --output-dir <path>    Output folder. Default: ${DEFAULTS.outputDir}
  --min-cdx-rows <n>     Minimum HTML CDX rows for a viable candidate. Default: ${DEFAULTS.minCdxRows}
`);
}

function validateOptions(value) {
  for (const key of ["startId", "endId", "sample", "batch", "maxCandidates", "minCdxRows"]) {
    if (!Number.isFinite(value[key]) || value[key] <= 0) {
      throw new Error(`Invalid positive number for ${key}`);
    }
  }
  if (value.endId <= value.startId) {
    throw new Error("--end-id must be greater than --start-id");
  }
}

async function findShowHnSeeds() {
  const ids = randomIds(options.startId, options.endId, options.sample);
  const seeds = [];
  const seen = new Set();

  for (let i = 0; i < ids.length; i += options.batch) {
    const chunk = ids.slice(i, i + options.batch);
    const items = await Promise.all(chunk.map((id) => fetchHnItem(id)));

    for (const item of items) {
      if (!item?.url || !item?.title || !/^show hn/i.test(item.title)) continue;

      const parsed = parseHttpUrl(item.url);
      if (!parsed) continue;

      const domain = normalizeDomain(parsed.hostname);
      if (!domain || seen.has(domain)) continue;

      seen.add(domain);
      seeds.push({
        hn_id: item.id,
        hn_date: new Date(item.time * 1000).toISOString().slice(0, 10),
        hn_title: cleanCell(item.title),
        seed_url: item.url,
        domain,
      });

      if (seeds.length >= options.maxCandidates) return seeds;
    }
  }

  return seeds;
}

function randomIds(start, end, count) {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(start + Math.random() * (end - start)));
  }
  return [...ids];
}

async function fetchHnItem(id) {
  return fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, options.timeoutMs);
}

function parseHttpUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

function normalizeDomain(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

async function checkCandidate(seed) {
  const dnsResult = await checkDns(seed.domain);
  const current = await checkCurrentHttp(seed.domain);
  const cdx = await checkWaybackCdx(seed.domain);
  const candidate_status = classifyCandidate(dnsResult, current, cdx);

  return {
    ...seed,
    candidate_status,
    dns_status: dnsResult.status,
    dns_note: dnsResult.note,
    current_status: current.status,
    current_url: current.url || "",
    current_note: current.note,
    cdx_status: cdx.status,
    cdx_html_rows: cdx.rows.length,
    cdx_note: cdx.note,
    sample_archived_urls: cdx.rows.slice(0, 5).map((row) => row.original).join(" | "),
    next_action: nextAction(candidate_status, cdx),
  };
}

async function checkDns(domain) {
  try {
    const addresses = await dns.lookup(domain, { all: true });
    return {
      status: addresses.length ? "resolves" : "no_records",
      note: addresses.map((item) => item.address).slice(0, 3).join(" "),
    };
  } catch (error) {
    return {
      status: "dns_error",
      note: error.code || error.message,
    };
  }
}

async function checkCurrentHttp(domain) {
  const attempts = [`https://${domain}/`, `http://${domain}/`];

  for (const url of attempts) {
    const result = await fetchText(url, options.timeoutMs);
    if (result.ok || result.status) {
      return {
        status: result.status ? `http_${result.status}` : "reachable",
        url: result.url || url,
        note: detectLiveNote(result),
      };
    }
  }

  return {
    status: "unreachable",
    url: "",
    note: "Both HTTPS and HTTP failed or timed out.",
  };
}

async function checkWaybackCdx(domain) {
  const query = new URL("https://web.archive.org/cdx");
  query.searchParams.set("url", `${domain}/*`);
  query.searchParams.set("output", "json");
  query.searchParams.set("fl", "timestamp,original,statuscode,mimetype");
  query.searchParams.append("filter", "statuscode:200");
  query.searchParams.append("filter", "mimetype:text/html");
  query.searchParams.set("collapse", "urlkey");
  query.searchParams.set("limit", "20");

  const data = await fetchJson(query.toString(), options.cdxTimeoutMs);
  if (!Array.isArray(data)) {
    return { status: "cdx_error", rows: [], note: "No JSON array returned." };
  }

  const rows = data
    .slice(1)
    .map((row) => ({
      timestamp: row[0],
      original: row[1],
      statuscode: row[2],
      mimetype: row[3],
    }))
    .filter((row) => row.original);

  return {
    status: rows.length ? "has_html_archives" : "no_html_archives",
    rows,
    note: rows.length ? "" : "CDX returned no HTML rows.",
  };
}

function classifyCandidate(dnsResult, current, cdx) {
  if (cdx.rows.length < options.minCdxRows) return "weak_no_archive_depth";
  if (dnsResult.status === "dns_error") return "candidate_dead_dns_with_archives";
  if (current.status === "unreachable") return "candidate_unreachable_with_archives";
  if (/^http_(404|410|500|502|503|504)$/.test(current.status)) {
    return "candidate_broken_http_with_archives";
  }
  if (/(parking|expired|for sale|not original)/i.test(current.note)) {
    return "candidate_changed_or_parked_with_archives";
  }
  return "probably_live_review_manually";
}

function nextAction(status, cdx) {
  if (status.startsWith("candidate_")) {
    const sample = cdx.rows[0]?.original || "";
    return sample ? `Run Lazarus public_recovery on this domain; inspect ${sample}` : "Run Lazarus public_recovery.";
  }
  if (status === "probably_live_review_manually") return "Open manually before using Lazarus.";
  return "Skip unless another signal suggests value.";
}

function scoreCandidate(row) {
  let score = 0;
  if (row.candidate_status.startsWith("candidate_")) score += 100;
  if (row.candidate_status === "candidate_dead_dns_with_archives") score += 20;
  if (row.candidate_status === "candidate_unreachable_with_archives") score += 15;
  score += Math.min(row.cdx_html_rows, 20);
  if (/blog|guide|docs|interview|questions|tutorial|learn|course/i.test(`${row.hn_title} ${row.sample_archived_urls}`)) {
    score += 10;
  }
  if (row.candidate_status === "probably_live_review_manually") score -= 50;
  if (row.candidate_status === "weak_no_archive_depth") score -= 80;
  return score;
}

async function fetchJson(url, timeoutMs) {
  const result = await fetchText(url, timeoutMs);
  if (!result.ok) return null;
  try {
    return JSON.parse(result.body);
  } catch {
    return null;
  }
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "LazarusCandidateFinder/1.0",
      },
    });
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      body: body.slice(0, 2_000),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      body: "",
      error: error.name === "AbortError" ? "timeout" : error.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

function detectLiveNote(result) {
  const text = `${result.url || ""}\n${result.body || ""}`.toLowerCase();
  if (/(domain is for sale|buy this domain|this domain may be for sale)/i.test(text)) return "parking_or_for_sale";
  if (/(expired|renew this domain|domain parking)/i.test(text)) return "expired_or_parking";
  if (/404 not found/i.test(text)) return "not_found_page";
  if (/500 server error|internal server error|bad gateway|gateway time-out/i.test(text)) return "server_error";
  if (result.status >= 200 && result.status < 300) return "reachable_2xx";
  return result.error || "non_2xx_or_unknown";
}

function toCsv(rows) {
  const columns = [
    "domain",
    "candidate_status",
    "score",
    "hn_id",
    "hn_date",
    "hn_title",
    "seed_url",
    "dns_status",
    "dns_note",
    "current_status",
    "current_url",
    "current_note",
    "cdx_status",
    "cdx_html_rows",
    "sample_archived_urls",
    "next_action",
  ];

  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(
      columns
        .map((column) => {
          const value = column === "score" ? scoreCandidate(row) : row[column];
          return csvEscape(value ?? "");
        })
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

function csvEscape(value) {
  const string = cleanCell(String(value));
  if (/[",\n]/.test(string)) return `"${string.replace(/"/g, '""')}"`;
  return string;
}

function cleanCell(value) {
  return String(value).replace(/\s+/g, " ").trim();
}
