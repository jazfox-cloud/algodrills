# Content Audit Template

Use this audit after Gold/Silver/Skip evidence review and before writing Markdown.

## Audit Statuses

| Status | Meaning | Output |
| --- | --- | --- |
| `publish-ready` | Topic is useful, low risk, and can be rewritten cleanly. | Write Markdown. |
| `rewrite-needed` | Topic is useful, but content needs heavier restructuring, updates, or caveats. | Write Markdown only after removing risky/outdated claims. |
| `archive-only` | Useful as a record, but not safe or useful to publish as an article. | Document in report only. |
| `skip` | Low value, duplicate, thin, unsafe, or unsupported. | No article. |

## Audit Record

For each reviewed URL, write:

```text
URL:
Evidence tier: Gold / Silver / Skip
Audit status: publish-ready / rewrite-needed / archive-only / skip
Reason:
Needs user review: yes/no
Notes:
```

## Rules

- Gold does not automatically mean publish-ready.
- Silver can be publish-ready if the topic is clear and the rewrite is low risk.
- Any page with personal, legal, medical, financial, or brand-sensitive claims should be `rewrite-needed`, `archive-only`, or `skip`.
- Do not invent updated facts. If a claim is outdated and cannot be verified, remove it or mark it for user review.
- `archive-only` pages should appear in `reports/recovery-report.md` but should not generate Markdown articles.
