#!/usr/bin/env node

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "boilerplate/content/gold");
const distDir = path.join(root, "dist");
const site = {
  title: "Algorithm Notes",
  description: "Independent algorithm interview notes rebuilt from verified historical archive evidence.",
  baseUrl: normalizeBaseUrl(process.env.SITE_URL || "https://algodrills.com"),
};

await main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const articles = await loadArticles();
  articles.sort((a, b) => a.title.localeCompare(b.title));

  await writeFile(path.join(distDir, "index.html"), renderIndex(articles));
  await writeFile(path.join(distDir, "robots.txt"), renderRobots());
  await writeFile(path.join(distDir, "sitemap.xml"), renderSitemap(articles));

  for (const page of policyPages()) {
    const dir = path.join(distDir, page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), renderPolicyPage(page));
  }

  for (const article of articles) {
    const dir = path.join(distDir, article.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), renderArticle(article, articles));
  }

  console.log(`Built ${articles.length} articles into ${distDir}`);
}

async function loadArticles() {
  const files = await readdir(contentDir);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const articles = [];

  for (const file of markdownFiles) {
    const raw = await readFile(path.join(contentDir, file), "utf8");
    const parsed = parseMarkdownFile(raw);
    const slug = file.replace(/\.md$/, "");
    articles.push({
      ...parsed.frontmatter,
      slug,
      body: markdownToHtml(parsed.body),
    });
  }

  return articles;
}

function parseMarkdownFile(raw) {
  if (!raw.startsWith("---\n")) throw new Error("Markdown file is missing frontmatter");
  const end = raw.indexOf("\n---", 4);
  if (end === -1) throw new Error("Markdown file has unterminated frontmatter");

  const block = raw.slice(4, end);
  const frontmatter = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    frontmatter[match[1]] = stripQuotes(match[2].trim());
  }

  return { frontmatter, body: raw.slice(end + 5).trim() };
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = [];
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderIndex(articles) {
  const cards = articles
    .map(
      (article) => `
        <article class="card">
          <a href="/${article.slug}/">${escapeHtml(article.title)}</a>
          <p>${escapeHtml(article.topic)} · ${escapeHtml(article.evidence_tier)} · independently rewritten</p>
        </article>`,
    )
    .join("\n");

  return layout({
    title: site.title,
    description: site.description,
    canonicalPath: "/",
    body: `
      <section class="hero">
        <p class="eyebrow">Public recovery mode</p>
        <h1>Algorithm interview notes rebuilt from verified archive rows.</h1>
        <p>${escapeHtml(site.description)}</p>
      </section>
      <section class="grid">${cards}</section>
      <section class="notice">
        <h2>Source policy</h2>
        <p>This site does not claim ownership of the historical domain and does not use old-domain redirects. Each article was rewritten from verified Wayback CDX evidence.</p>
      </section>`,
  });
}

function renderArticle(article, articles) {
  const related = articles
    .filter((item) => item.slug !== article.slug)
    .map((item) => `<li><a href="/${item.slug}/">${escapeHtml(item.title)}</a></li>`)
    .join("");

  return layout({
    title: `${article.title} · ${site.title}`,
    description: `${article.topic} note rebuilt in public recovery mode.`,
    canonicalPath: `/${article.slug}/`,
    body: `
      <article class="article">
        ${article.body}
        <aside class="source">
          <h2>Archive Evidence</h2>
          <p><strong>Evidence tier:</strong> ${escapeHtml(article.evidence_tier)}</p>
          <p><strong>Historical source path:</strong> <code>${escapeHtml(article.source_path)}</code></p>
          <p><strong>Wayback snapshot:</strong> <a href="${escapeHtml(article.wayback_snapshot)}" rel="nofollow noopener">${escapeHtml(article.wayback_snapshot)}</a></p>
        </aside>
      </article>
      <nav class="related">
        <h2>More Notes</h2>
        <ul>${related}</ul>
      </nav>`,
  });
}

function policyPages() {
  return [
    {
      slug: "about",
      title: "About Algorithm Notes",
      description: "About Algorithm Notes, its archive evidence, editorial process, and independent status.",
      body: `<h1>About Algorithm Notes</h1><p>Algorithm Notes is an independent educational reference rebuilt from verified historical archive evidence. It turns recoverable interview-problem topics into newly written explanations rather than copying archived pages.</p><h2>Editorial approach</h2><p>Each article identifies its evidence tier, historical source path, and Wayback snapshot. The archive proves that a topic existed; the published explanation, examples, and structure are independently rewritten and manually reviewed.</p><h2>Independent status</h2><p>This site does not claim ownership of the historical domain or affiliation with the companies, interview platforms, or archives mentioned in source notes.</p>`
    },
    {
      slug: "contact",
      title: "Contact Algorithm Notes",
      description: "Contact Algorithm Notes about corrections, archive evidence, privacy, or accessibility.",
      body: `<h1>Contact Algorithm Notes</h1><p>Email <a href="mailto:hello@algodrills.com">hello@algodrills.com</a> for technical corrections, archive-source questions, privacy requests, or accessibility reports.</p><p>For a correction, include the page URL, the exact statement or code example to review, and a reliable technical reference. We do not provide personalized interview, hiring, or academic-assessment services.</p>`
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      description: "Privacy policy for Algorithm Notes.",
      body: `<h1>Privacy Policy</h1><p>Algorithm Notes does not require accounts or payments to read educational content. Hosting, analytics, and security providers may process IP addresses, browser or device information, requested pages, timestamps, and referral data to operate and protect the site.</p><h2>Advertising cookies</h2><p>Algorithm Notes may use third-party advertising services, including Google AdSense. Third-party vendors, including Google, may use cookies, web beacons, IP addresses, or similar identifiers to serve and measure ads based on a visitor's prior visits to this website or other websites.</p><p>You can control or opt out of personalized Google advertising through <a href="https://adssettings.google.com/">Google Ads Settings</a>. Additional industry opt-out choices are available at <a href="https://www.aboutads.info/choices/">aboutads.info</a>.</p><h2>Contact</h2><p>Privacy questions can be sent to <a href="mailto:hello@algodrills.com">hello@algodrills.com</a>.</p><p>Last updated July 11, 2026.</p>`
    },
    {
      slug: "terms",
      title: "Terms of Use",
      description: "Terms governing use of Algorithm Notes educational content.",
      body: `<h1>Terms of Use</h1><p>Last updated July 11, 2026.</p><h2>Educational use</h2><p>Algorithm Notes provides independent educational explanations and code examples. Content is not a guarantee of interview, hiring, academic, or production-software outcomes.</p><h2>Archive evidence</h2><p>Historical paths and Wayback links document topic provenance. They do not imply endorsement, ownership of a former domain, or permission to misrepresent archived material.</p><h2>Acceptable use</h2><p>Do not interfere with the site, use it to facilitate cheating or deception, or republish substantial portions of its editorial work as your own.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:hello@algodrills.com">hello@algodrills.com</a>.</p>`
    }
  ];
}

function renderPolicyPage(page) {
  return layout({ title: `${page.title} · ${site.title}`, description: page.description, canonicalPath: `/${page.slug}/`, body: `<article class="article">${page.body}</article>` });
}

function layout({ title, description, canonicalPath, body }) {
  const canonicalUrl = `${site.baseUrl}${canonicalPath}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <style>
    :root {
      color-scheme: light;
      --text: #172033;
      --muted: #5f6b7a;
      --line: #d9e0ea;
      --soft: #f6f8fb;
      --accent: #2457c5;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: #fff; line-height: 1.65; }
    a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
    .shell { max-width: 960px; margin: 0 auto; padding: 28px 20px 56px; }
    header { display: flex; justify-content: space-between; gap: 20px; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 16px; margin-bottom: 48px; }
    header a { color: var(--text); text-decoration: none; font-weight: 700; }
    header span { color: var(--muted); font-size: 14px; }
    .hero { max-width: 760px; margin-bottom: 28px; }
    .eyebrow { color: var(--accent); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 10px; }
    h1 { font-size: clamp(34px, 7vw, 56px); line-height: 1.05; margin: 0 0 18px; letter-spacing: 0; }
    h2 { font-size: 24px; margin-top: 38px; }
    h3 { font-size: 19px; margin-top: 28px; }
    p { margin: 0 0 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin: 34px 0; }
    .card { border: 1px solid var(--line); border-radius: 8px; padding: 18px; background: #fff; }
    .card a { display: block; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .card p, .notice p, header span { color: var(--muted); }
    .notice, .source, .related { border-top: 1px solid var(--line); margin-top: 38px; padding-top: 22px; }
    .article { max-width: 760px; }
    .article h1 { font-size: clamp(30px, 6vw, 46px); }
    code { background: var(--soft); border: 1px solid var(--line); border-radius: 5px; padding: 1px 5px; font-size: .92em; }
    pre { overflow: auto; background: var(--soft); border: 1px solid var(--line); border-radius: 8px; padding: 14px; }
    pre code { border: 0; padding: 0; background: transparent; }
    ul { padding-left: 22px; }
    footer { margin-top: 54px; color: var(--muted); font-size: 14px; border-top: 1px solid var(--line); padding-top: 18px; }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <a href="/">Algorithm Notes</a>
      <span>No old-domain redirects · Public recovery</span>
    </header>
    <main>${body}</main>
    <footer>Independent educational notes rebuilt from verified archive evidence. <a href="/about/">About</a> · <a href="/contact/">Contact</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></footer>
  </div>
</body>
</html>`;
}

function renderRobots() {
  return `User-agent: *
Allow: /
Sitemap: ${site.baseUrl}/sitemap.xml
`;
}

function renderSitemap(articles) {
  const urls = ["/", ...policyPages().map((page) => `/${page.slug}/`), ...articles.map((article) => `/${article.slug}/`)]
    .map((url) => `  <url><loc>${site.baseUrl}${url}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function normalizeBaseUrl(value) {
  const parsed = new URL(String(value).replace(/\/+$/, ""));
  parsed.protocol = "https:";
  if (parsed.hostname === "www.algodrills.com") {
    parsed.hostname = "algodrills.com";
  }
  return parsed.toString().replace(/\/+$/, "");
}
