# AlgoDrills

Interactive algorithm and data structure drills for practicing problem-solving patterns.

**Try it online:** [AlgoDrills.com](https://algodrills.com/)

Practice algorithms, data structures, and coding interview patterns through focused, repeatable drills.

# Lazarus

Lazarus is a prompt-based recovery workflow for dead websites.

Original content is hard to create, and millions of sites disappear from the web every year. The Wayback Machine may still have their pages, but not every archived page is worth recovering. Lazarus helps a web-enabled AI find archived pages, classify SEO evidence, rewrite useful material into new Markdown, and hand the result to AutoCode for deployment.

The v1 package is intentionally lightweight: no crawler, no backend, no paid SEO API dependency. Copy `prompt.md` into a web-enabled AI, provide a dead domain, and let the AI produce a small, auditable recovery pack.

## What Lazarus Does

1. Confirms the domain is dead or unavailable.
2. Uses the Wayback CDX API to discover historical URLs.
3. Filters low-value URLs before spending time on content.
4. Classifies each candidate as `Gold`, `Silver`, or `Skip` using auditable public evidence.
5. Restores only the best pages, with a hard cap of 1-5 rewritten articles per run.
6. Writes clean Markdown with compact frontmatter.
7. Generates an AutoCode deployment prompt with safe path and redirect guidance.

## Two Recovery Modes

Lazarus supports two different modes. The mode changes the compliance and redirect rules.

### Public Recovery Mode

Use this when the old site is a third-party dead domain that you do not own.

- Use archived pages only as research material.
- Rewrite from scratch instead of copying.
- Do not claim to be the old site owner, brand, or official continuation.
- Do not generate old-domain 301 redirects because you cannot control the old domain.
- You may preserve similar URL paths on the new site for clarity, but this is not a redirect from the old domain.

### Owned Migration Mode

Use this when the user or their company owns the old content and controls the old domain or old site export.

- Run the ownership checklist before rewriting.
- Direct content migration is allowed when the user confirms rights.
- 301 redirects are allowed only when the old domain and new destination are both controlled by the user or company.

## Why Evidence Tiers

Google Search Console URL Inspection cannot be used for arbitrary dead domains because it requires ownership of the Search Console property. Lazarus therefore uses evidence tiers instead of pretending to confirm private index data.

- `Gold`: at least one direct public search or external evidence item strongly matches the old URL, title, snippet, or path.
- `Silver`: at least two weaker signals suggest the page had value, such as repeated Wayback captures, internal links, clear topic intent, old sitemap traces, or external mentions.
- `Skip`: the page is thin, duplicated, irrelevant, unsupported by evidence, or unsafe to recover.

Every tier decision must be explained in `reports/recovery-report.md`. If public search evidence is unstable or inaccessible, the page cannot be promoted to `Gold`.

## Compliance Boundary

Lazarus is for research and rewritten recovery, not copy-paste resurrection.

Use archived pages as source material for topic reconstruction, structure, facts to verify, and historical context. Do not publish old text verbatim unless you own the rights or have explicit permission. If a page appears to contain copyrighted, personal, medical, legal, financial, or brand-sensitive material, mark it in the report and either skip it or output only a summary and rewrite brief.

If the user does not control the old domain, deployment guidance must not promise old-domain redirects or authority transfer. It can only produce content pages, same-path routing on the new site, and a manual review list.

## Quick Start

1. Open `prompt.md`.
2. Copy the whole file into a web-enabled AI such as Claude Code or ChatGPT with browsing.
3. Replace the placeholder domain with a dead domain.
4. Ask the AI to run one Lazarus recovery pass.
5. Put the AI output into the `boilerplate/` structure.
6. Run `npm run validate`.
7. Run `npm run build`, or `SITE_URL=https://algodrills.com npm run build` when the production domain is known.
8. Deploy the generated `dist/` folder to any static host.

## Find Candidate Dead Sites

Use the candidate finder to discover old small-site domains before running Lazarus:

```bash
node scripts/find-candidates.mjs --sample 400 --max-candidates 20
```

Requires Node.js 18 or newer. In this Codex workspace, if `node` is not on `PATH`, use the bundled Node executable shown by the workspace dependencies panel.

The script samples old Hacker News `Show HN` posts, checks whether each project domain still resolves or responds, then asks Wayback CDX for a small set of archived HTML pages.

Outputs are written to:

```text
output/candidates/
```

Start with rows whose `candidate_status` begins with `candidate_`, especially:

- `candidate_dead_dns_with_archives`
- `candidate_unreachable_with_archives`
- `candidate_broken_http_with_archives`
- `candidate_changed_or_parked_with_archives`

Then run `prompt.md` in `public_recovery` mode for the best domain. The finder is only a triage tool; Lazarus still needs to verify evidence before recovering content.

## Validate A Recovery Pack

After an AI fills `boilerplate/`, run:

```bash
node scripts/validate-output.mjs boilerplate
```

The validator catches common prompt drift:

- CSV headers that no longer match the Lazarus schema.
- Markdown articles missing frontmatter.
- Articles whose `source_url` is absent from `url-inventory.csv`.
- Selected pages without a `200` Wayback timestamp row.
- Generic search labels that should be replaced with exact queries and observed evidence.

## Export Exact CDX Rows

Before asking an AI to recover a domain, export exact Wayback rows locally:

```bash
node scripts/fetch-cdx.mjs --domain interviewbits.com --limit 200
```

This writes:

```text
output/cdx/interviewbits.com-cdx.csv
output/cdx/interviewbits.com-cdx.json
```

Paste the CSV rows into the Lazarus prompt run. This prevents the AI from inventing URLs or stopping because it lacks exact CDX evidence.

## Expected Output

```text
boilerplate/
  content/
    gold/
    silver/
  data/
    url-inventory.csv
    backlog.csv
    redirect-review.csv
  reports/
    recovery-report.md
  deploy/
    static-deploy.md
```

The first run should aim for a small proof of value: 5 classified URLs, 1-5 rewritten Markdown pages, and a deploy prompt that includes safe path mapping and redirect guidance when old-domain control is confirmed.

## Useful APIs

- Wayback CDX API: `https://web.archive.org/cdx?url=example.com/*&output=json&fl=timestamp,original,statuscode,mimetype,digest&filter=statuscode:200&collapse=digest`
- Wayback snapshot URL format: `https://web.archive.org/web/{timestamp}/{original_url}`
- Wayback availability API: `https://archive.org/wayback/available?url=example.com`

## Project Files

- `prompt.md`: main Lazarus operating prompt.
- `templates/recovery-report.md`: report format for evidence and decisions.
- `templates/ownership-checklist.md`: optional ownership/control checklist for owned migrations.
- `templates/content-audit.md`: audit template for publish/rewrite/archive decisions.
- `templates/content-frontmatter.md`: compact article frontmatter contract.
- `templates/autocode-deploy-prompt.md`: deploy handoff template.
- `scripts/build-site.mjs`: zero-dependency static-site builder for recovered content.
- `scripts/find-candidates.mjs`: one-command candidate dead-site finder.
- `scripts/fetch-cdx.mjs`: exports exact Wayback CDX rows for a chosen domain.
- `scripts/validate-output.mjs`: local validator for AI-generated recovery packs.
- `boilerplate/`: output structure that a recovery run should fill.
