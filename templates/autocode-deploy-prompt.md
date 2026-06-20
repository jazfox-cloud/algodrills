# AutoCode Deploy Prompt for Lazarus Output

You are AutoCode. Deploy this Lazarus recovery pack as a static content site.

## Inputs

Read these folders and files:

```text
content/gold/
content/silver/
data/url-inventory.csv
data/backlog.csv
data/redirect-review.csv
reports/recovery-report.md
```

## Build Goal

Create a clean static site from the Markdown files in `content/gold/` and `content/silver/`.

Default target:

- Cloudflare Pages

Optional targets if the user requests them:

- Hugo
- WordPress

## Content Rules

- Gold pages should be treated as primary content.
- Silver pages can be published if the report does not flag them as risky.
- Preserve each article's title, topic, source URL, source path, Wayback snapshot, and evidence tier.
- Do not publish pages marked unsafe or requiring manual review.
- Add source/evidence notes in an unobtrusive way if the site design supports it.

## Redirect Rules

Before generating redirects, check the Lazarus report:

- If old-domain control is confirmed, redirects are allowed.
- If old-domain control is not confirmed, do not create old-domain redirect claims. You may preserve equivalent paths on the new site, but mark redirect status as `not_applicable_no_old_domain_control`.

For every published article where redirects are allowed:

1. Read `source_path` from the Markdown frontmatter.
2. Generate the new article path from the site routing system.
3. Create a 301 redirect from `source_path` to the new article path.

For Cloudflare Pages, generate a `_redirects` file:

```text
/old-path/ /new-path/ 301
```

For Hugo, use `aliases` in frontmatter or an equivalent static redirect mechanism only when old-domain control is confirmed.

If a source path cannot be safely mapped, do not guess. Add it to `data/redirect-review.csv` with:

```csv
source_path,new_path,redirect_status,reason
```

Use `redirect_status=needs_review`.

## Deployment Requirements

- Prefer a simple static generator setup.
- Keep the homepage focused on recovered topic clusters.
- Generate readable article pages with canonical URLs on the new domain.
- Include a sitemap.
- Include robots.txt.
- Include `_redirects` for Cloudflare Pages when applicable and allowed.
- Do not create redirects for skipped pages unless the report explicitly approves them.

## Final Output

Return:

- Site framework chosen.
- File tree created.
- Build and deploy commands.
- Redirect summary.
- Any pages skipped for safety or ambiguity.
