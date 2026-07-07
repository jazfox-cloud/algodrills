# Lazarus Recovery Report: interviewbits.com

## Domain

- Target domain: interviewbits.com
- New site name: Algorithm Notes
- Run date: 2026-07-03
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

- CDX query: exported by `scripts/fetch-cdx.mjs --domain interviewbits.com --limit 500`
- Raw URL count: 152 exported rows
- HTML-like candidate count: 13 reviewed 2014-2015 blog rows
- Reviewed candidate count: 13
- Overflow fuse triggered: no
- Notes: excluded homepage, archive/category pages, and 2022/2023 rows; expanded export surfaced additional exact rows for `sort-by-length-then-frequency`, `car_race`, and `rectangles-store`.

## URL Decisions

| Source URL | Source Path | Tier | Selected | Evidence / Reason |
| --- | --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2014/11/28/keypad | /blog/2014/11/28/keypad | Gold | yes | exact 200 text/html CDX row; classic algorithm-interview topic |
| http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | /blog/2014/11/29/square-root/ | Gold | yes | exact 200 text/html CDX row; classic algorithm-interview topic |
| http://www.interviewbits.com:80/blog/2014/11/29/insert/ | /blog/2014/11/29/insert/ | Gold | yes | exact 200 text/html CDX row; interval insertion has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | /blog/2014/12/03/power-set/ | Gold | yes | exact 200 text/html CDX row; classic algorithm-interview topic |
| http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/ | /blog/2014/12/03/sort-by-length-then-frequency/ | Gold | yes | exact 200 text/html CDX row; archived title and question clearly describe composite word sorting |
| http://www.interviewbits.com:80/blog/2014/12/03/car_race/ | /blog/2014/12/03/car_race/ | Gold | yes | exact 200 text/html CDX row; archived title and description clearly describe a linear-track race problem |
| http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | /blog/2014/12/01/plus-minus-array/ | Gold | yes | exact 200 text/html CDX row; plus/minus array has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | /blog/2014/12/02/log-every-second/ | Gold | yes | exact 200 text/html CDX row; timer scheduling has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/ | /blog/2014/12/11/random-number-with-distribution/ | Gold | yes | exact 200 text/html CDX row; weighted random selection has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | /blog/2014/12/15/celebrities/ | Gold | yes | exact 200 text/html CDX row; celebrity elimination has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/ | /blog/2014/12/18/rectangles-store/ | Gold | yes | exact 200 text/html CDX row; archived title and description clearly describe a rectangle storage problem |
| http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/ | /blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/ | Gold | yes | exact 200 text/html CDX row; bitwise arithmetic has clear algorithm-interview intent |
| http://www.interviewbits.com:80/blog/2015/02/02/center-points/ | /blog/2015/02/02/center-points/ | Silver | yes | exact 200 text/html CDX row; promoted from backlog for geometric center interview coverage |

## Content Audit

| URL | Audit Status | Reason | Needs User Review |
| --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2014/11/28/keypad | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/11/29/insert/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/03/car_race/ | publish-ready | rewritten as independent educational content using the archived linear-track leaderboard prompt | no |
| http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/ | publish-ready | rewritten as independent educational content | no |
| http://www.interviewbits.com:80/blog/2015/02/02/center-points/ | publish-ready | rewritten as independent educational content | no |

## Gold Evidence

Record exact public-search queries or external evidence. If search evidence was unstable, write `unverified_public_search`.

| URL | Query or Source | Observed Evidence | Confidence |
| --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2014/11/28/keypad | CDX export row | 20150212075129, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/11/29/square-root/ | CDX export row | 20141228212350, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/11/29/insert/ | CDX export row | 20141228212345, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | CDX export row | 20141228212413, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/ | CDX export row | 20141228193235, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/03/car_race/ | CDX export row | 20141228193216, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | CDX export row | 20141228212355, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | CDX export row | 20141228212406, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/ | CDX export row | 20141228193243, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | CDX export row | 20141228193310, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/ | CDX export row | 20141228193350, 200, text/html | high |
| http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/ | CDX export row | 20150212021013, 200, text/html | high |

## Silver Evidence

Each Silver page needs at least two weaker signals.

| URL | Signal 1 | Signal 2 | Other Notes |
| --- | --- | --- | --- |
| http://www.interviewbits.com:80/blog/2015/02/02/center-points/ | exact CDX row | promoted from backlog after batch limit cleared | selected for rewrite |

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
| content/gold/insert-interval.md | http://www.interviewbits.com:80/blog/2014/11/29/insert/ | https://web.archive.org/web/20141228212345/http://www.interviewbits.com:80/blog/2014/11/29/insert/ | Gold | /insert-interval/ |
| content/gold/power-set.md | http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | https://web.archive.org/web/20141228212413/http://www.interviewbits.com:80/blog/2014/12/03/power-set/ | Gold | /power-set/ |
| content/gold/car-race.md | http://www.interviewbits.com:80/blog/2014/12/03/car_race/ | https://web.archive.org/web/20141228193216/http://www.interviewbits.com:80/blog/2014/12/03/car_race/ | Gold | /car-race/ |
| content/gold/sort-by-length-then-frequency.md | http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/ | https://web.archive.org/web/20141228193235/http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/ | Gold | /sort-by-length-then-frequency/ |
| content/gold/plus-minus-array.md | http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | https://web.archive.org/web/20141228212355/http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/ | Gold | /plus-minus-array/ |
| content/gold/log-every-second.md | http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | https://web.archive.org/web/20141228212406/http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/ | Gold | /log-every-second/ |
| content/gold/weighted-random.md | http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/ | https://web.archive.org/web/20141228193243/http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/ | Gold | /weighted-random/ |
| content/gold/celebrities.md | http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | https://web.archive.org/web/20141228193310/http://www.interviewbits.com:80/blog/2014/12/15/celebrities/ | Gold | /celebrities/ |
| content/gold/rectangles-store.md | http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/ | https://web.archive.org/web/20141228193350/http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/ | Gold | /rectangles-store/ |
| content/gold/bitwise-arithmetic.md | http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/ | https://web.archive.org/web/20150212021013/http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/ | Gold | /bitwise-arithmetic/ |
| content/gold/center-points.md | http://www.interviewbits.com:80/blog/2015/02/02/center-points/ | https://web.archive.org/web/20150212021106/http://www.interviewbits.com:80/blog/2015/02/02/center-points/ | Silver | /center-points/ |

## Risks and Compliance Notes

- Copyright risk: mitigated by independent rewrite and source evidence disclosure.
- Outdated factual claims: low; content is algorithmic and evergreen.
- Brand/person/legal/medical/financial sensitivity: low.
- Old-domain redirect eligibility: not eligible; old-domain control is unverified.
- Pages requiring manual review: none in the current exact-CDX set.

## Backlog

No exact CDX backlog rows remain after publishing `car_race`.
