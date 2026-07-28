#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const measurementId = "G-2YQHQBV332";
const canonicalHost = "algodrills.com";
const errors = [];

await main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

async function main() {
  const files = await listFiles(root);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  if (!htmlFiles.length) errors.push("No HTML files found to audit");

  const allText = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  const ids = [...new Set(allText.match(/G-[A-Z0-9]+/g) || [])];
  if (ids.length !== 1 || ids[0] !== measurementId) {
    errors.push(`Expected only ${measurementId}, found ${ids.length ? ids.join(", ") : "none"}`);
  }
  if (allText.includes("dataLayer.push(args)")) errors.push("Forbidden dataLayer.push(args) pattern found");
  if (!allText.includes("dataLayer.push(arguments)")) errors.push("Required dataLayer.push(arguments) pattern missing");
  if (!allText.includes(`window.location.hostname === canonicalHost`)) errors.push("Production hostname guard is missing");
  if (!allText.includes(`var canonicalHost = "${canonicalHost}"`)) errors.push(`Canonical host ${canonicalHost} is missing`);

  for (const key of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) {
    if (!allText.includes(key)) errors.push(`Consent Mode v2 key missing: ${key}`);
  }
  const analyticsCalls = [
    ...allText.matchAll(/window\.gtag\("event",[\s\S]*?\}\);/g),
    ...allText.matchAll(/window\.gtag\("config",[\s\S]*?\}\);/g),
  ].map((match) => match[0]).join("\n");
  for (const field of ["answer", "input_value", "code", "output", "error_message"]) {
    const eventParamPattern = new RegExp(`\\b${field}\\s*:`);
    if (eventParamPattern.test(analyticsCalls)) errors.push(`Forbidden analytics-style parameter found: ${field}`);
  }
  if (/Google-certified advertising CMP/i.test(allText) && !/does not currently load Google AdSense or a Google-certified advertising CMP/i.test(allText)) {
    errors.push("Privacy text may overstate Google-certified advertising CMP status");
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const relative = path.relative(root, file);
    if ((html.match(/script\.src = "https:\/\/www\.googletagmanager\.com\/gtag\/js\?id="/g) || []).length !== 1) {
      errors.push(`${relative}: expected one gtag.js loader assignment`);
    }
    if ((html.match(/document\.querySelector\('script\[src\*="googletagmanager\.com\/gtag\/js\?id=/g) || []).length !== 1) {
      errors.push(`${relative}: expected one gtag.js duplicate-load guard`);
    }
    if (!html.includes("Cookie Settings")) errors.push(`${relative}: footer Cookie Settings control missing`);
    if (!html.includes("data-accept-analytics")) errors.push(`${relative}: accept control missing`);
    if (!html.includes("data-reject-analytics")) errors.push(`${relative}: reject control missing`);
  }

  if (errors.length) {
    console.error("GA4 consent audit failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`GA4 consent audit passed for ${htmlFiles.length} HTML files`);
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
    else files.push(fullPath);
  }
  return files;
}
