#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";

const DEFAULTS = {
  outputDir: "output/cdx",
  limit: 200,
  timeoutMs: 30_000,
};

const options = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

async function main() {
  if (!options.domain) {
    throw new Error("Missing --domain. Example: node scripts/fetch-cdx.mjs --domain interviewbits.com");
  }

  await mkdir(options.outputDir, { recursive: true });

  const rows = await fetchCdxRows(options.domain);
  const normalized = rows.map((row) => ({
    timestamp: row[0] || "",
    original: row[1] || "",
    statuscode: row[2] || "",
    mimetype: row[3] || "",
    digest: row[4] || "",
  }));

  const safeDomain = options.domain.replace(/[^a-z0-9.-]/gi, "_");
  const jsonPath = `${options.outputDir}/${safeDomain}-cdx.json`;
  const csvPath = `${options.outputDir}/${safeDomain}-cdx.csv`;

  await writeFile(jsonPath, `${JSON.stringify(normalized, null, 2)}\n`);
  await writeFile(csvPath, toCsv(normalized));

  console.log(`Fetched ${normalized.length} exact CDX rows for ${options.domain}`);
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${csvPath}`);
  console.log("");
  console.log("Sample rows:");
  for (const row of normalized.slice(0, 10)) {
    console.log(`${row.timestamp},${row.original},${row.statuscode},${row.mimetype},${row.digest}`);
  }
}

function parseArgs(argv) {
  const out = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--domain") out.domain = normalizeDomain(next), i += 1;
    else if (arg === "--output-dir") out.outputDir = next, i += 1;
    else if (arg === "--limit") out.limit = Number(next), i += 1;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!Number.isFinite(out.limit) || out.limit <= 0) throw new Error("--limit must be a positive number");
  return out;
}

function printHelp() {
  console.log(`Usage:
  node scripts/fetch-cdx.mjs --domain example.com [options]

Options:
  --limit <n>          Max exact CDX rows to fetch. Default: ${DEFAULTS.limit}
  --output-dir <path>  Output folder. Default: ${DEFAULTS.outputDir}

The script exports exact Wayback CDX rows with:
timestamp, original, statuscode, mimetype, digest
`);
}

function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

async function fetchCdxRows(domain) {
  const variants = [
    `${domain}/*`,
    `www.${domain}/*`,
    `${domain}/`,
    `www.${domain}/`,
  ];

  const seen = new Set();
  const rows = [];

  for (const variant of variants) {
    const batch = await queryCdx(variant);
    for (const row of batch) {
      const key = `${row[0]} ${row[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
    if (rows.length >= options.limit) break;
  }

  return rows.slice(0, options.limit);
}

async function queryCdx(urlPattern) {
  const query = new URL("https://web.archive.org/cdx");
  query.searchParams.set("url", urlPattern);
  query.searchParams.set("output", "json");
  query.searchParams.set("fl", "timestamp,original,statuscode,mimetype,digest");
  query.searchParams.append("filter", "statuscode:200");
  query.searchParams.append("filter", "mimetype:text/html");
  query.searchParams.set("collapse", "urlkey");
  query.searchParams.set("limit", String(options.limit));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await fetch(query, {
      signal: controller.signal,
      headers: { "user-agent": "LazarusCDXFetcher/1.0" },
    });
    if (!response.ok) {
      console.error(`CDX ${urlPattern}: HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.slice(1).filter((row) => Array.isArray(row) && row[1]);
  } catch (error) {
    console.error(`CDX ${urlPattern}: ${error.name === "AbortError" ? "timeout" : error.message}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function toCsv(rows) {
  const columns = ["timestamp", "original", "statuscode", "mimetype", "digest"];
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(row[column] || "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function csvEscape(value) {
  const string = String(value).replace(/\s+/g, " ").trim();
  if (/[",\n]/.test(string)) return `"${string.replace(/"/g, '""')}"`;
  return string;
}
