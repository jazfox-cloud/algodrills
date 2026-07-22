#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv.find((value) => !value.startsWith("--") && value !== process.argv[0] && value !== process.argv[1]) || "dist");
const jsonOutput = process.argv.includes("--json");
const origin = "https://algodrills.com";
const socialImageUrl = `${origin}/images/algodrills-social.png`;
const socialImageFile = "images/algodrills-social.png";
const errors = [];
const warnings = [];

const result = await audit().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});

if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`SEO audit passed: ${result.pages.length} indexable pages, ${result.internalLinks} internal links, ${result.images.total} content images, 1 verified social image.`);
  if (warnings.length) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
}

if (errors.length) {
  console.error("SEO audit failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
}

async function audit() {
  const sitemapText = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const robotsText = await readFile(path.join(root, "robots.txt"), "utf8");
  const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1].trim()));
  const uniqueUrls = new Set(sitemapUrls);

  if (uniqueUrls.size !== sitemapUrls.length) errors.push("sitemap.xml contains duplicate URLs");
  if (!robotsText.includes(`Sitemap: ${origin}/sitemap.xml`)) errors.push("robots.txt does not declare the canonical sitemap URL");

  const htmlFiles = await listHtml(root);
  const indexableFiles = htmlFiles.filter((file) => path.basename(file) === "index.html");
  const expectedUrls = indexableFiles.map(fileToUrl).sort();
  const sitemapSorted = [...uniqueUrls].sort();
  if (JSON.stringify(expectedUrls) !== JSON.stringify(sitemapSorted)) {
    errors.push("sitemap URLs do not exactly match indexable build pages");
  }

  const pages = [];
  const knownPaths = new Set(expectedUrls.map((url) => new URL(url).pathname));
  const inbound = new Map([...knownPaths].map((pathname) => [pathname, new Set()]));
  let internalLinks = 0;
  let totalImages = 0;
  let missingAlt = 0;
  let emptyAlt = 0;

  for (const file of indexableFiles) {
    const html = await readFile(file, "utf8");
    const url = fileToUrl(file);
    const urlPath = new URL(url).pathname;
    const page = inspectHtml(html, url);
    pages.push(page);

    if (!page.title) errors.push(`${urlPath}: missing title`);
    if (page.title.length > 60) errors.push(`${urlPath}: title is ${page.title.length} characters`);
    if (!page.description) errors.push(`${urlPath}: missing meta description`);
    if (page.description.length < 120 || page.description.length > 155) {
      errors.push(`${urlPath}: meta description is ${page.description.length} characters`);
    }
    if (page.canonical !== url) errors.push(`${urlPath}: canonical is not self-referencing`);
    if (/noindex/i.test(page.robots)) errors.push(`${urlPath}: sitemap page is noindex`);
    if (page.h1Count !== 1) errors.push(`${urlPath}: expected one H1, found ${page.h1Count}`);

    for (const key of ["title", "description", "url", "type"]) {
      if (!page.openGraph[key]) errors.push(`${urlPath}: missing og:${key}`);
    }
    if (page.openGraph.title !== page.title) errors.push(`${urlPath}: og:title differs from title`);
    if (page.openGraph.description !== page.description) errors.push(`${urlPath}: og:description differs from description`);
    if (page.openGraph.url !== page.canonical) errors.push(`${urlPath}: og:url differs from canonical`);
    if (page.openGraph.image !== socialImageUrl) errors.push(`${urlPath}: og:image is not the canonical social PNG URL`);
    if (page.openGraph.imageWidth !== "1200") errors.push(`${urlPath}: og:image:width is not 1200`);
    if (page.openGraph.imageHeight !== "630") errors.push(`${urlPath}: og:image:height is not 630`);
    if (page.openGraph.imageType !== "image/png") errors.push(`${urlPath}: og:image:type is not image/png`);
    if (!page.openGraph.imageAlt) errors.push(`${urlPath}: missing og:image:alt`);
    for (const key of ["card", "title", "description"]) {
      if (!page.twitter[key]) errors.push(`${urlPath}: missing twitter:${key}`);
    }
    if (page.twitter.card !== "summary_large_image") errors.push(`${urlPath}: twitter:card is not summary_large_image`);
    if (page.twitter.title !== page.title) errors.push(`${urlPath}: twitter:title differs from title`);
    if (page.twitter.description !== page.description) errors.push(`${urlPath}: twitter:description differs from description`);
    if (page.twitter.image !== socialImageUrl) errors.push(`${urlPath}: twitter:image is not the canonical social PNG URL`);
    if (!page.twitter.imageAlt) errors.push(`${urlPath}: missing twitter:image:alt`);

    totalImages += page.images.length;
    missingAlt += page.images.filter((image) => image.alt === null).length;
    emptyAlt += page.images.filter((image) => image.alt === "").length;
    for (const image of page.images) {
      if (image.alt === null) errors.push(`${urlPath}: image ${image.src || "(missing src)"} lacks alt`);
      if (image.src?.startsWith("/")) {
        const asset = path.join(root, image.src.replace(/^\/+/, ""));
        if (!(await exists(asset))) errors.push(`${urlPath}: image asset not found: ${image.src}`);
      }
    }

    for (const link of page.links) {
      let target;
      try {
        target = new URL(link, url);
      } catch {
        errors.push(`${urlPath}: invalid link ${link}`);
        continue;
      }
      if (target.origin !== origin) continue;
      internalLinks += 1;
      const targetPath = normalizePath(target.pathname);
      if (!knownPaths.has(targetPath)) errors.push(`${urlPath}: broken internal link ${link}`);
      else inbound.get(targetPath)?.add(urlPath);
      if (target.pathname !== targetPath) errors.push(`${urlPath}: internal link points to a non-canonical path ${link}`);
    }

    for (const block of page.jsonLd) {
      try {
        JSON.parse(block);
      } catch {
        errors.push(`${urlPath}: invalid JSON-LD`);
      }
    }
  }

  findDuplicates(pages, "title");
  findDuplicates(pages, "description");
  for (const [pathname, sources] of inbound) {
    if (pathname !== "/" && sources.size === 0) errors.push(`${pathname}: indexable orphan page`);
  }

  const notFoundFile = path.join(root, "404.html");
  const notFoundHtml = await readFile(notFoundFile, "utf8");
  const notFound = inspectHtml(notFoundHtml, `${origin}/not-a-real-page/`);
  notFound.status = 404;
  notFound.indexable = false;
  notFound.inSitemap = false;
  if (!/noindex/i.test(notFound.robots)) errors.push("404.html: missing noindex robots meta");
  if (notFound.canonical) errors.push("404.html: must not declare a canonical URL");
  if (notFound.openGraph.url) errors.push("404.html: must not declare og:url");
  if (notFound.openGraph.image) errors.push("404.html: must not declare og:image");
  if (notFound.twitter.image) errors.push("404.html: must not declare twitter:image");
  if (notFound.h1Count !== 1) errors.push(`404.html: expected one H1, found ${notFound.h1Count}`);

  const png = await inspectPng(path.join(root, socialImageFile));
  if (!png.valid) errors.push(`${socialImageFile}: invalid PNG signature or header`);
  if (png.width !== 1200 || png.height !== 630) errors.push(`${socialImageFile}: expected 1200x630, found ${png.width}x${png.height}`);
  if (png.hasAlpha) errors.push(`${socialImageFile}: social image must have an opaque background`);

  for (const page of pages) {
    page.inboundSources = inbound.get(new URL(page.url).pathname)?.size || 0;
  }

  return {
    generatedAt: new Date().toISOString(),
    root,
    sitemap: { count: sitemapUrls.length, unique: uniqueUrls.size },
    pages: pages.sort((a, b) => a.url.localeCompare(b.url)),
    internalLinks,
    images: { total: totalImages, missingAlt, emptyAlt },
    socialImage: { url: socialImageUrl, file: socialImageFile, ...png },
    notFound,
    warnings,
    errors,
  };
}

function inspectHtml(html, url) {
  const title = textContent(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = meta(html, "name", "description");
  const images = (html.match(/<img\b[^>]*>/gi) || []).map((tag) => ({
    src: attribute(tag, "src") || "",
    alt: hasAttribute(tag, "alt") ? attribute(tag, "alt") : null,
  }));
  return {
    url,
    status: 200,
    indexable: !/noindex/i.test(meta(html, "name", "robots")),
    inSitemap: true,
    canonical: link(html, "canonical"),
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    h1: textContent(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""),
    h1Count: (html.match(/<h1\b/gi) || []).length,
    robots: meta(html, "name", "robots"),
    xRobotsTag: "not applicable to static build",
    openGraph: {
      title: meta(html, "property", "og:title"),
      description: meta(html, "property", "og:description"),
      url: meta(html, "property", "og:url"),
      type: meta(html, "property", "og:type"),
      image: meta(html, "property", "og:image"),
      imageWidth: meta(html, "property", "og:image:width"),
      imageHeight: meta(html, "property", "og:image:height"),
      imageType: meta(html, "property", "og:image:type"),
      imageAlt: meta(html, "property", "og:image:alt"),
    },
    twitter: {
      card: meta(html, "name", "twitter:card"),
      title: meta(html, "name", "twitter:title"),
      description: meta(html, "name", "twitter:description"),
      image: meta(html, "name", "twitter:image"),
      imageAlt: meta(html, "name", "twitter:image:alt"),
    },
    images,
    links: (html.match(/<a\b[^>]*>/gi) || []).map((tag) => attribute(tag, "href")).filter(Boolean),
    jsonLd: [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]),
  };
}

function meta(html, key, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attribute(tag, key).toLowerCase() === value.toLowerCase()) return decode(attribute(tag, "content"));
  }
  return "";
}

function link(html, rel) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attribute(tag, "rel").toLowerCase().split(/\s+/).includes(rel)) return decode(attribute(tag, "href"));
  }
  return "";
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return decode(match?.[2] || "");
}

function hasAttribute(tag, name) {
  return new RegExp(`\\b${name}(?:\\s*=|\\s|>)`, "i").test(tag);
}

function textContent(value) {
  return decode(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decode(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalizePath(pathname) {
  if (pathname === "/") return "/";
  if (path.posix.extname(pathname)) return pathname;
  return `${pathname.replace(/\/+$/, "")}/`;
}

function fileToUrl(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const pathname = relative === "index.html" ? "/" : `/${relative.replace(/\/index\.html$/, "/")}`;
  return `${origin}${pathname}`;
}

async function listHtml(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listHtml(fullPath)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function inspectPng(file) {
  try {
    const buffer = await readFile(file);
    const valid = buffer.length >= 33 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && buffer.toString("ascii", 12, 16) === "IHDR";
    if (!valid) return { valid: false, width: 0, height: 0, hasAlpha: false, bytes: buffer.length };
    const colorType = buffer[25];
    return {
      valid: true,
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
      hasAlpha: colorType === 4 || colorType === 6,
      colorType,
      bytes: buffer.length,
    };
  } catch {
    return { valid: false, width: 0, height: 0, hasAlpha: false, bytes: 0 };
  }
}

function findDuplicates(pages, field) {
  const seen = new Map();
  for (const page of pages) {
    const value = page[field];
    if (!value) continue;
    if (seen.has(value)) errors.push(`duplicate ${field}: ${seen.get(value)} and ${page.url}`);
    else seen.set(value, page.url);
  }
}
