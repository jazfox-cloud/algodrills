# Lazarus Recovery Report: interviewbits.com

## Domain

- Target domain: interviewbits.com
- New site name: Algorithm Notes
- Run date: 2026-06-20
- Operator: Codex
- Recovery mode: public_recovery
- Ownership/control statement: old-domain control is unverified; no 301 redirects are generated.

## Death Check

| Check | Result | Evidence |
| --- | --- | --- |
| HTTP/HTTPS | inactive/unreliable | previous live checks could not resolve or fetch the original domain consistently |
| DNS | unavailable in recovery run | treated as public recovery candidate |
| RDAP/WHOIS | not used | not required for this static recovery pass |
| Parking/new owner/original content | excluded | 2022/2023 CDX rows were ignored as likely domain drift |
| Wayback availability | available | 2014-2015 CDX rows provided exact 200 text/html captures |

Conclusion: recover only exact 2014-2015 `/blog/` CDX rows and do not claim old-domain authority.

## CDX Recon Summary

- CDX query: exported by `scripts/fetch-cdx.mjs --domain interviewbits.com --limit 50`
- Raw URL count: 50 exported rows
- HTML-like candidate count: 10 reviewed 2014-2015 blog rows
- Reviewed candidate count: 10
- Overflow fuse triggered: no
- Notes: excluded homepage, archive/category pages, and 2022/2023 rows.

## URL Decisions

| Source URL | Source Path | Tier | Selected | Evidence / Reason |
| --- | --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2014/11/28/keypad | /blog/2014/11/28/keypad | Gold | yes | exact 200 text/html CDX row; classic algorithm-interview topic |
| http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | /blog/2014/11/29/square-root/ | Gold | yes | exact 200 text/html CDX row; classic algorithm-interview topic |
| http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | /blog/2014/12/03/power-set/ | Gold | yes | exact 200 text/html CDX row; classic algorithm-interview topic |
| http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | /blog/2014/12/01/plus-minus-array/ | Gold | yes | exact 200 text/html CDX row; plus/minus array has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | /blog/2014/12/02/log-every-second/ | Gold | yes | exact 200 text/html CDX row; timer scheduling has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | /blog/2014/12/15/celebrities/ | Gold | yes | exact 200 text/html CDX row; celebrity elimination has clear algorithm-interview intent |

## Content Audit

| URL | Audit Status | Reason | Needs User Review |
| --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2014/11/28/keypad | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | publish-ready | rewritten as independent educational content | no |

## Gold Evidence

Record exact public-search queries or external evidence. If search evidence was unstable, write `unverified_public_search`.

| URL | Query or Source | Observed Evidence | Confidence |
| --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2014/11/28/keypad | CDX export row | 20150212075129, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | CDX export row | 20141228212350, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | CDX export row | 20141228212413, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | CDX export row | 20141228212355, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | CDX export row | 20141228212406, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | CDX export row | 20141228193310, 200, text/html | high |

## Silver Evidence

Each Silver page needs at least two weaker signals.

| URL | Signal 1 | Signal 2 | Other Notes |
| --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2015/02/02/center-points/ | exact CDX row | deferred by recovery batch limit | one page remains in backlog |

## Skipped Pages

| URL | Reason |
| --- | --- |
| 2022/2023 rows | likely domain drift or unrelated later content |
| archive/category pages | low standalone recovery value |

## Restored Pages

| Output File | Source URL | Snapshot | Tier | New Path |
| --- | --- | --- | --- | --- |
| content/gold/keypad.md | http://www.interviewbits.com:80/blog/2014/11/28/keypad | https://web.archive.org/web/20150212075129/http://www.interviewbits.com:80/blog/2014/11/28/keypad | Gold | /keypad/ |
| content/gold/square-root.md | http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | https://web.archive.org/web/20141228212350/http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | Gold | /square-root/ |
| content/gold/power-set.md | http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | https://web.archive.org/web/20141228212413/http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | Gold | /power-set/ |
| content/gold/plus-minus-array.md | http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | https://web.archive.org/web/20141228212355/http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | Gold | /plus-minus-array/ |
| content/gold/log-every-second.md | http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | https://web.archive.org/web/20141228212406/http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | Gold | /log-every-second/ |
| content/gold/celebrities.md | http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | https://web.archive.org/web/20141228193310/http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | Gold | /celebrities/ |

## Risks and Compliance Notes

- Copyright risk: mitigated by independent rewrite and source evidence disclosure.
- Outdated factual claims: low; content is algorithmic and evergreen.
- Brand/person/legal/medical/financial sensitivity: low.
- Old-domain redirect eligibility: not eligible; old-domain control is unverified.
- Pages requiring manual review: none in the first three-page batch.

## Backlog

One exact CDX row remains in `data/backlog.csv` for a later batch.
