#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.argv[2] || "boilerplate";
const requiredCsvHeaders = {
  "data/url-inventory.csv":
    "source_url,source_path,latest_timestamp,statuscode,mimetype,capture_count,evidence_tier,decision_reason,selected_for_rewrite",
  "data/backlog.csv": "source_url,source_path,evidence_tier,reason,next_action",
  "data/redirect-review.csv": "source_path,new_path,redirect_status,reason",
};

const errors = [];
const warnings = [];

await main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

async function main() {
  for (const [relativePath, header] of Object.entries(requiredCsvHeaders)) {
    await checkCsvHeader(relativePath, header);
  }

  const inventory = await readCsv("data/url-inventory.csv");
  const inventoryByUrl = new Map(inventory.rows.map((row) => [row.source_url, row]));
  const selectedUrls = new Set(
    inventory.rows
      .filter((row) => isTruthy(row.selected_for_rewrite))
      .map((row) => row.source_url),
  );

  for (const row of inventory.rows) {
    if (isTruthy(row.selected_for_rewrite)) {
      if (!row.latest_timestamp) errors.push(`${row.source_url}: selected row missing latest_timestamp`);
      if (row.statuscode !== "200") errors.push(`${row.source_url}: selected row statuscode is not 200`);
      if (!/html/i.test(row.mimetype || "")) warnings.push(`${row.source_url}: selected row mimetype is not HTML-like`);
    }
    if (row.evidence_tier && !["Gold", "Silver", "Skip"].includes(row.evidence_tier)) {
      warnings.push(`${row.source_url}: evidence_tier should use canonical casing Gold/Silver/Skip`);
    }
  }

  const redirects = await readCsv("data/redirect-review.csv");
  for (const row of redirects.rows) {
    if (!row.redirect_status) continue;
    if (!["generated", "needs_review", "not_applicable_no_old_domain_control"].includes(row.redirect_status)) {
      errors.push(
        `${row.source_path || "(redirect row)"}: redirect_status must be generated, needs_review, or not_applicable_no_old_domain_control`,
      );
    }
  }

  const markdownFiles = [
    ...(await listMarkdown("content/gold")),
    ...(await listMarkdown("content/silver")),
  ];

  for (const file of markdownFiles) {
    await checkMarkdown(file, inventoryByUrl, selectedUrls);
  }

  const report = await readOptional("reports/recovery-report.md");
  if (report && /google_search_(exact|partial)_match/i.test(report)) {
    warnings.push("recovery-report.md uses generic google_search_* labels; prefer exact queries and observed evidence.");
  }

  if (errors.length) {
    console.error("Lazarus output validation failed:");
    for (const error of errors) console.error(`- ${error}`);
  }
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }

  if (errors.length) process.exit(1);
  console.log(`Lazarus output validation passed for ${root}`);
  if (warnings.length) process.exitCode = 2;
}

async function checkCsvHeader(relativePath, expected) {
  const text = await readOptional(relativePath);
  if (!text) {
    errors.push(`${relativePath}: missing file`);
    return;
  }
  const firstLine = text.split(/\r?\n/, 1)[0]?.trim();
  if (firstLine !== expected) {
    errors.push(`${relativePath}: header mismatch. Expected "${expected}" but found "${firstLine}"`);
  }
}

async function readCsv(relativePath) {
  const text = (await readOptional(relativePath)) || "";
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
  return { headers, rows };
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (quoted && char === "\"" && next === "\"") {
      current += "\"";
      i += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((value) => value.trim());
}

async function listMarkdown(relativeDir) {
  const fullDir = path.join(root, relativeDir);
  try {
    const entries = await readdir(fullDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(relativeDir, entry.name));
  } catch {
    return [];
  }
}

async function checkMarkdown(relativePath, inventoryByUrl, selectedUrls) {
  const text = await readOptional(relativePath);
  if (!text) return;
  const frontmatter = parseFrontmatter(text);
  if (!frontmatter) {
    errors.push(`${relativePath}: missing YAML frontmatter`);
    return;
  }

  const originalGuide = frontmatter.content_type === "original-guide";
  const requiredFields = originalGuide
    ? ["title", "content_type", "description", "topic", "rewrite_status"]
    : ["title", "description", "source_url", "source_path", "wayback_snapshot", "evidence_tier", "topic", "rewrite_status"];

  for (const field of requiredFields) {
    if (!frontmatter[field]) errors.push(`${relativePath}: missing frontmatter field ${field}`);
  }

  if (frontmatter.source_url && !inventoryByUrl.has(frontmatter.source_url)) {
    errors.push(`${relativePath}: source_url is absent from data/url-inventory.csv`);
  }
  if (frontmatter.source_url && selectedUrls.size && !selectedUrls.has(frontmatter.source_url)) {
    errors.push(`${relativePath}: source_url is not marked selected_for_rewrite in data/url-inventory.csv`);
  }
  if (frontmatter.wayback_snapshot && !frontmatter.wayback_snapshot.startsWith("https://web.archive.org/web/")) {
    errors.push(`${relativePath}: wayback_snapshot is not a Wayback snapshot URL`);
  }
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  const block = text.slice(4, end);
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return data;
}

async function readOptional(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

function isTruthy(value) {
  return /^(yes|true|1)$/i.test(String(value || "").trim());
}
