# AlgoDrills 聚焦式 Ahrefs 技术 SEO 审计与本地整改

- 审计日期：2026-07-22（America/Los_Angeles）
- 仓库：`/Users/jazfox/Documents/wayback`
- 生产域名：`https://algodrills.com/`
- 审计基线：`main` / `4b25be8e897960caa9ec179c76a92d3dbb9ef25d`
- 远端比较：`HEAD...origin/main = 0 0`
- 范围：审计、本地代码整改、本地构建、浏览器视觉验证、报告
- 明确未执行：git add、commit、push、deploy、Cloudflare/GSC 写操作、Ahrefs Validate Fix、请求索引

## 1. 结论摘要

没有 Ahrefs 逐 URL CSV，因此无法把旧邮件中的约 19/19/16/13 条告警逐条映射到 URL。本报告没有按旧数量机械修改，而是用当前生产 HTML、当前 Git 源码、最终本地构建、sitemap、robots、canonical 和真实内部链接重新复现。

| 问题类别 | 当前生产复现 | 最终本地构建 | 处理结论 |
| --- | ---: | ---: | --- |
| Open Graph 不完整（含图片字段） | 20 | 0 | 已创建原创品牌图并补齐 image/width/height/type/alt |
| Twitter 核心字段缺失 | 20 | 0 | 已通过共享布局补齐 `card/title/description` |
| Description 低于本轮 120 字符目标 | 18 | 0 | 18 页基于现有内容保守改写；另外 2 页原描述合理保留 |
| Title 超过 60 字符 | 14 | 0 | 15 个文章 title 去除模板站名，其中 9 个进一步保守缩短；H1 不变 |

额外发现并本地修复：

- 生产未知路径返回 `200` 首页、首页 canonical，构成 soft 404。本地新增真实 `404.html`，预览服务器对未知路径返回 `404`，页面为 `noindex, follow` 且无 canonical。
- 移动端长 Wayback URL 会把 `/square-root/` 和 `/bitwise-arithmetic/` 撑至约 772–776px。本地加入仅影响换行的 CSS 后，390px 视口下文档宽度回落至 375px（滚动条占用后的正常宽度），无全页横向溢出。
- 新建原创 AlgoDrills SVG/PNG 社交图；20 个正式页面完整接入，404 明确排除社交图片。

## 2. 开始前安全检查

| 检查 | 结果 |
| --- | --- |
| `pwd` | `/Users/jazfox/Documents/wayback` |
| `git status --short` | `?? reports/`；其中已有 GSC 周报经用户确认属于已知文件 |
| `git branch --show-current` | `main` |
| `git rev-parse HEAD` | `4b25be8e897960caa9ec179c76a92d3dbb9ef25d` |
| `git fetch origin` | 成功，无输出 |
| `git rev-parse origin/main` | `4b25be8e897960caa9ec179c76a92d3dbb9ef25d` |
| `git rev-list --left-right --count HEAD...origin/main` | `0 0` |
| 最近 5 条提交 | `4b25be8`、`091758a`、`5017261`、`e562415`、`6b512ab` |
| 初始 `git diff --name-only` / `--stat` | 无已跟踪改动 |

近期记录确认存在 GitHub 链接提交 `091758a`，以及历史 canonical 修复 `10abceb`、`2284c72`、`5740250`。现有 `reports/gsc-weekly/2026-07-22-algodrills.com-gsc-weekly-review.md` 明确把 `/square-root/` 视为监测对象；本轮保留其 URL、canonical、索引策略、H1、正文、公式和搜索意图。

### 2.1 仓库身份确认

- `git rev-parse --show-toplevel`：`/Users/jazfox/Documents/wayback`。
- remote：`https://github.com/jazfox-cloud/algodrills.git`（fetch/push）。
- README 明确链接 `https://algodrills.com/`。
- `scripts/build-site.mjs` 默认 `SITE_URL` 为 `https://algodrills.com`，canonical、sitemap 和社交图 URL均由该 apex HTTPS 基址生成。
- `functions/_middleware.js` 的 canonical host 为 `algodrills.com`。
- `boilerplate/deploy/static-deploy.md` 指定 `SITE_URL=https://algodrills.com npm run build` 并发布 `dist/`。
- 仓库未包含 wrangler、Pages workflow 或其他与不同域名冲突的部署配置。

结论：`wayback` 只是本地目录/历史项目名；当前仓库、remote、站点配置、canonical、sitemap、metadata 和仓库内可见部署说明均属于 AlgoDrills，没有操作错仓库。

### 2.2 `dist` 提交策略

结论为 **A：`dist` 是受控、必须同步提交的发布产物**。

依据：

- `git ls-files dist` 显示 22 个正式跟踪文件。
- `.gitignore` 仅忽略 `output/`，不忽略 `dist/`。
- `git log --oneline -- dist` 从初始发布至最新内容发布持续包含 `dist`。
- 最近正常发布提交 `4b25be8`、`091758a`、`e562415`、`6b512ab` 均同步提交源码/生成逻辑与相应 `dist` 页面。
- README 与静态部署文档均要求构建后发布 `dist/`。
- 仓库没有可证明 Cloudflare 会在部署时替代性重建并允许忽略已跟踪 `dist` 的配置。因此不能把历史受控产物排除在后续暂存范围外。

最终连续两次构建的全 `dist` 聚合 SHA-256 均为 `574ec2cf10177896b1ac5747ffa1d1879b99ab866d5232858fb66012f4c5baf8`，构建具幂等性。没有删除、还原或清理 `dist`。

## 3. 方法与限制

证据来源：

- 当前 Git 源码与 `dist/` 最终构建产物
- 2026-07-22 只读抓取的 20 个生产 sitemap URL
- 生产 `robots.txt`、`sitemap.xml`、未知路径和 HTTP/HTTPS/www/apex/path/query 重定向
- 最终构建中解析出的 342 个 HTML 内部链接
- 1440×900 与 390×844 本地浏览器检查

限制：

- 没有 Ahrefs 逐 URL CSV，不能逐条关闭旧告警。
- 本轮禁止部署，因此 production 仍展示整改前 metadata 与 soft 404；“最终本地构建”列不是生产已生效声明。
- 静态构建没有响应头环境；生产 20 个正式页面的 `X-Robots-Tag` 实测均为空。本地报告对此标记为不适用。
- 页面没有 JSON-LD；因此结果是“0 个待解析块、0 个解析错误”，不是“已新增结构化数据”。

## 4. 完整正式页面清单（最终本地构建）

统一结果：20 页均为本地预期 HTTP 200、可索引、在 sitemap、canonical 自指、一个 H1、无 robots meta、生产 `X-Robots-Tag` 为空。OG 均覆盖 title/description/url/type/image/width/height/image type/image alt；Twitter 均覆盖 `summary_large_image`/title/description/image/image alt。正文图片数/缺 alt/合理空 alt为 `0/0/0`，另有一张统一社交 metadata 资产。

| URL | 类型 | Title（字符） | Description（字符） | H1 | OG type | HTML 入站来源数 |
| --- | --- | --- | --- | --- | --- | ---: |
| `/` | 普通页 | Algorithm Notes (15) | Explore archive-backed algorithm interview problems and original guides covering reusable patterns, implementations, complexity, and edge cases. (144) | Archive-backed problems and original guides for reusable algorithm patterns. | website | 20 |
| `/about/` | 普通页 | About Algorithm Notes · Algorithm Notes (39) | Learn how Algorithm Notes uses verified archive evidence and original editorial work to publish independent algorithm interview study guides. (141) | About Algorithm Notes | website | 20 |
| `/contact/` | 普通页 | Contact Algorithm Notes · Algorithm Notes (41) | Contact Algorithm Notes to report a technical correction, ask about archive evidence, or raise a privacy or accessibility concern. (130) | Contact Algorithm Notes | website | 20 |
| `/privacy/` | 普通页 | Privacy Policy · Algorithm Notes (32) | Read how Algorithm Notes and its hosting, analytics, security, and advertising providers may process visitor and device information. (132) | Privacy Policy | website | 20 |
| `/terms/` | 普通页 | Terms of Use · Algorithm Notes (30) | Review the terms for using Algorithm Notes educational explanations, code examples, archive evidence, and independently written material. (137) | Terms of Use | website | 20 |
| `/algorithm-interview-pattern-roadmap/` | 文章 | Algorithm Interview Pattern Roadmap: What to Practice First (59) | Use the archived InterviewBits algorithms track as a pattern map for choosing which interview problem types to practice first. (126) | Algorithm Interview Pattern Roadmap: What to Practice First | article | 15 |
| `/backtracking-vs-iterative-generation/` | 文章 | Backtracking vs Iterative Combinatorial Generation (50) | Learn when to use backtracking, bit masks, or iterative expansion to generate combinations and subsets in algorithm interviews. (127) | Backtracking vs Iterative Generation for Combinatorial Problems | article | 15 |
| `/bitwise-arithmetic/` | 文章 | Bitwise Arithmetic: Multiply, Powers, and Modulo (48) | Learn how shifts and masks replace multiplication by powers of two, test powers of two, and compute modulo when the divisor is a power of two. (142) | Bitwise Arithmetic: Replacing Multiplication, Powers, and Modulo | article | 15 |
| `/car-race/` | 文章 | Car Race Leaderboard on a Linear Track (38) | Model a linear car race as ordered events, update positions when speeds change, and track the current leader without simulating every instant. (142) | Car Race Leaderboard: Tracking the Fastest Car on a Linear Track | article | 15 |
| `/celebrities/` | 文章 | Celebrity Problem: Directed Knows Graph Strategy (48) | Solve the celebrity problem with candidate elimination, then verify the directed knows-graph conditions in linear time and constant space. (138) | Celebrity Problem: Elimination Strategy for a Directed Knows Graph | article | 15 |
| `/center-points/` | 文章 | Center Points in Interview Geometry Problems (44) | Compare midpoint, centroid, and bounding-box center definitions, with formulas and edge cases for choosing the intended center of a set of points. (146) | Center Points: Midpoints and Geometric Centers in Interview Problems | article | 15 |
| `/insert-interval/` | 文章 | Insert Interval: Merging a New Range Into Sorted Intervals (58) | Insert a new interval into a sorted non-overlapping list, merge overlaps in one scan, and review complexity, boundary cases, and implementation. (144) | Insert Interval: Merging a New Range Into Sorted Intervals | article | 15 |
| `/keypad/` | 文章 | Phone Keypad Letter Combinations with Backtracking (50) | Generate phone keypad letter combinations with backtracking, including the digit mapping, recursive state, complexity, and input edge cases. (140) | Phone Keypad Letter Combinations: A Backtracking Interview Problem | article | 15 |
| `/log-every-second/` | 文章 | Log Every Second Without Blocking (33) | Compare blocking and timer-based ways to emit one value per second, including scheduling drift, cancellation, completion, and testing concerns. (143) | Log Every Second: Scheduling Repeated Output Without Blocking | article | 15 |
| `/plus-minus-array/` | 文章 | Plus Minus Array: Reordering Positive and Negative Values (57) | Rearrange positive and negative array values by grouping or alternating signs, with stable and in-place approaches plus their tradeoffs. (136) | Plus Minus Array: Reordering Positive and Negative Values | article | 15 |
| `/power-set/` | 文章 | Power Set Generation: Two Practical Interview Approaches (56) | Generate every subset with bit masks or backtracking, understand the 2^N output size, and compare ordering, memory, and duplicate handling. (139) | Power Set Generation: Two Practical Interview Approaches | article | 15 |
| `/rectangles-store/` | 文章 | Rectangle Store: Fast Point Queries (35) | Design a rectangle store for fast point queries using candidate filtering and spatial indexing, with overlap, boundary, and complexity considerations. (150) | Rectangles Store: Fast Point Queries Over Overlapping Rectangles | article | 15 |
| `/sort-by-length-then-frequency/` | 文章 | Sort Words by Length and Frequency (34) | Count distinct words, then sort them by length and frequency with explicit tie-breakers for deterministic output and predictable complexity. (140) | Sort Words by Length and Frequency | article | 15 |
| `/square-root/` | 文章 | Compute a Square Root Without a Library Function (48) | Compute integer or approximate square roots without a library call using binary search or Newton's method, with boundary and precision checks. (142) | How to Compute a Square Root Without Calling a Library Function | article | 15 |
| `/weighted-random/` | 文章 | Weighted Random Selection: Picking Values by Distribution (57) | Implement weighted random selection with prefix sums and binary search, then handle invalid weights, floating-point boundaries, and repeated draws. (147) | Weighted Random Selection: Picking Values by Distribution | article | 15 |

未发现正式 noindex 页面、重定向 URL、query URL、历史兼容 URL或静态资源进入 sitemap。`404.html` 单独列于第 10 节，不计入正式页面清单。

## 5. Title 修改前后

| URL | 原 title（字符） | 新 title（字符） | 依据 |
| --- | --- | --- | --- |
| `/algorithm-interview-pattern-roadmap/` | Algorithm Interview Pattern Roadmap: What to Practice First · Algorithm Notes (77) | Algorithm Interview Pattern Roadmap: What to Practice First (59) | 去除模板重复站名，保留完整主题与练习意图 |
| `/backtracking-vs-iterative-generation/` | Backtracking vs Iterative Generation for Combinatorial Problems · Algorithm Notes (81) | Backtracking vs Iterative Combinatorial Generation (50) | 保留 backtracking/iterative/combinatorial generation 核心查询 |
| `/bitwise-arithmetic/` | Bitwise Arithmetic: Replacing Multiplication, Powers, and Modulo · Algorithm Notes (82) | Bitwise Arithmetic: Multiply, Powers, and Modulo (48) | 与正文 shifts/masks/powers/modulo 内容一致 |
| `/car-race/` | Car Race Leaderboard: Tracking the Fastest Car on a Linear Track · Algorithm Notes (82) | Car Race Leaderboard on a Linear Track (38) | 保留 leaderboard 与 linear track 问题意图 |
| `/celebrities/` | Celebrity Problem: Elimination Strategy for a Directed Knows Graph · Algorithm Notes (84) | Celebrity Problem: Directed Knows Graph Strategy (48) | 保留 celebrity、directed knows graph、strategy |
| `/center-points/` | Center Points: Midpoints and Geometric Centers in Interview Problems · Algorithm Notes (86) | Center Points in Interview Geometry Problems (44) | 保留 center points 与 interview geometry |
| `/insert-interval/` | Insert Interval: Merging a New Range Into Sorted Intervals · Algorithm Notes (76) | Insert Interval: Merging a New Range Into Sorted Intervals (58) | 仅移除模板站名，核心关键词完整 |
| `/keypad/` | Phone Keypad Letter Combinations: A Backtracking Interview Problem · Algorithm Notes (84) | Phone Keypad Letter Combinations with Backtracking (50) | 保留 keypad、letter combinations、backtracking |
| `/log-every-second/` | Log Every Second: Scheduling Repeated Output Without Blocking · Algorithm Notes (79) | Log Every Second Without Blocking (33) | 保留每秒调度与 non-blocking 意图 |
| `/plus-minus-array/` | Plus Minus Array: Reordering Positive and Negative Values · Algorithm Notes (75) | Plus Minus Array: Reordering Positive and Negative Values (57) | 仅移除模板站名，数组符号重排意图不变 |
| `/power-set/` | Power Set Generation: Two Practical Interview Approaches · Algorithm Notes (74) | Power Set Generation: Two Practical Interview Approaches (56) | 仅移除模板站名，方法对比意图不变 |
| `/rectangles-store/` | Rectangles Store: Fast Point Queries Over Overlapping Rectangles · Algorithm Notes (82) | Rectangle Store: Fast Point Queries (35) | 保留数据结构与 point query 核心意图 |
| `/sort-by-length-then-frequency/` | Sort Words by Length and Frequency · Algorithm Notes (52) | Sort Words by Length and Frequency (34) | 去除不必要站名，核心排序规则完整 |
| `/square-root/` | How to Compute a Square Root Without Calling a Library Function · Algorithm Notes (81) | Compute a Square Root Without a Library Function (48) | 保守保留 square root 与 no-library 搜索意图；H1/正文不变 |
| `/weighted-random/` | Weighted Random Selection: Picking Values by Distribution · Algorithm Notes (75) | Weighted Random Selection: Picking Values by Distribution (57) | 仅移除模板站名，distribution 意图不变 |

首页与 4 个政策/联系页 title 长度合理且唯一，未修改。

## 6. Description 修改前后

| URL | 原 description（字符） | 新 description（字符） |
| --- | --- | --- |
| `/` | Independent algorithm interview notes combining verified archive recovery with original learning guides. (104) | Explore archive-backed algorithm interview problems and original guides covering reusable patterns, implementations, complexity, and edge cases. (144) |
| `/about/` | About Algorithm Notes, its archive evidence, original guides, editorial process, and independent status. (104) | Learn how Algorithm Notes uses verified archive evidence and original editorial work to publish independent algorithm interview study guides. (141) |
| `/contact/` | Contact Algorithm Notes about corrections, archive evidence, privacy, or accessibility. (87) | Contact Algorithm Notes to report a technical correction, ask about archive evidence, or raise a privacy or accessibility concern. (130) |
| `/privacy/` | Privacy policy for Algorithm Notes. (35) | Read how Algorithm Notes and its hosting, analytics, security, and advertising providers may process visitor and device information. (132) |
| `/terms/` | Terms governing use of Algorithm Notes educational content. (59) | Review the terms for using Algorithm Notes educational explanations, code examples, archive evidence, and independently written material. (137) |
| `/bitwise-arithmetic/` | algorithm-interview note rebuilt in public recovery mode. (57) | Learn how shifts and masks replace multiplication by powers of two, test powers of two, and compute modulo when the divisor is a power of two. (142) |
| `/car-race/` | algorithm-interview note rebuilt in public recovery mode. (57) | Model a linear car race as ordered events, update positions when speeds change, and track the current leader without simulating every instant. (142) |
| `/celebrities/` | algorithm-interview note rebuilt in public recovery mode. (57) | Solve the celebrity problem with candidate elimination, then verify the directed knows-graph conditions in linear time and constant space. (138) |
| `/center-points/` | algorithm-interview note rebuilt in public recovery mode. (57) | Compare midpoint, centroid, and bounding-box center definitions, with formulas and edge cases for choosing the intended center of a set of points. (146) |
| `/insert-interval/` | algorithm-interview note rebuilt in public recovery mode. (57) | Insert a new interval into a sorted non-overlapping list, merge overlaps in one scan, and review complexity, boundary cases, and implementation. (144) |
| `/keypad/` | algorithm-interview note rebuilt in public recovery mode. (57) | Generate phone keypad letter combinations with backtracking, including the digit mapping, recursive state, complexity, and input edge cases. (140) |
| `/log-every-second/` | algorithm-interview note rebuilt in public recovery mode. (57) | Compare blocking and timer-based ways to emit one value per second, including scheduling drift, cancellation, completion, and testing concerns. (143) |
| `/plus-minus-array/` | algorithm-interview note rebuilt in public recovery mode. (57) | Rearrange positive and negative array values by grouping or alternating signs, with stable and in-place approaches plus their tradeoffs. (136) |
| `/power-set/` | algorithm-interview note rebuilt in public recovery mode. (57) | Generate every subset with bit masks or backtracking, understand the 2^N output size, and compare ordering, memory, and duplicate handling. (139) |
| `/rectangles-store/` | algorithm-interview note rebuilt in public recovery mode. (57) | Design a rectangle store for fast point queries using candidate filtering and spatial indexing, with overlap, boundary, and complexity considerations. (150) |
| `/sort-by-length-then-frequency/` | algorithm-interview note rebuilt in public recovery mode. (57) | Count distinct words, then sort them by length and frequency with explicit tie-breakers for deterministic output and predictable complexity. (140) |
| `/square-root/` | algorithm-interview note rebuilt in public recovery mode. (57) | Compute integer or approximate square roots without a library call using binary search or Newton's method, with boundary and precision checks. (142) |
| `/weighted-random/` | algorithm-interview note rebuilt in public recovery mode. (57) | Implement weighted random selection with prefix sums and binary search, then handle invalid weights, floating-point boundaries, and repeated draws. (147) |

`/algorithm-interview-pattern-roadmap/`（126）和 `/backtracking-vs-iterative-generation/`（127）原描述已唯一、长度合理且与正文一致，合理保留。

## 7. Open Graph、Twitter 与社交图片

| 字段 | 生产覆盖 | 最终本地覆盖 | 结论 |
| --- | ---: | ---: | --- |
| `og:title` | 20/20 | 20/20 | 与页面 title 一致 |
| `og:description` | 20/20 | 20/20 | 与页面 description 一致 |
| `og:url` | 20/20 | 20/20 | 与 canonical 一致，绝对 HTTPS apex URL |
| `og:type` | 20/20 | 20/20 | 文章为 `article`；首页和政策/联系页改为 `website` |
| `og:image` | 0/20 | 20/20 | 统一绝对 URL `https://algodrills.com/images/algodrills-social.png` |
| `og:image:width` / `height` / `type` / `alt` | 0/20 | 20/20 | `1200` / `630` / `image/png` / 准确品牌 alt |
| `twitter:card` | 0/20 | 20/20 | `summary_large_image` |
| `twitter:title` | 0/20 | 20/20 | 与页面 title 一致 |
| `twitter:description` | 0/20 | 20/20 | 与页面 description 一致 |
| `twitter:image` / `twitter:image:alt` | 0/20 | 20/20 | 与 OG 使用同一品牌图与 alt |

### 社交图设计与许可

- 可编辑源：`public/images/algodrills-social.svg`。
- 生产 PNG：`public/images/algodrills-social.png`。
- 构建输出：`dist/images/algodrills-social.svg`、`dist/images/algodrills-social.png`。
- 图中文字：`AlgoDrills`、`Algorithm Practice, Explained Clearly`、`ARCHIVE-BACKED NOTES · ORIGINAL GUIDES`。
- 设计：不透明深蓝技术背景、蓝青节点路径、分支线与数组方格，延续现站 `#172033` / `#2457c5` 的开发者教育视觉语言。
- PNG：真实 PNG，1200×630，8-bit RGB、3 通道、无 alpha，140,848 bytes（约 138 KiB），SHA-256 `48ff029c1787ab904d7488ab2cc9b02add4abf6cf2f7644cf6a18b6af66a590b`。
- SVG：XML 可解析，4,810 bytes，viewBox 与显式尺寸均为 1200×630。
- 许可/来源：视觉方向由本任务使用 OpenAI 内置 image generation 生成原创概念，最终交付由本任务以独立 SVG 图元重建；没有嵌入生成位图、第三方 logo、照片、截图、字体文件或受保护插图。SVG `<metadata>` 记录创作日期、无第三方资产声明和 AlgoDrills 项目使用许可。
- 未添加 `twitter:site`、`twitter:creator` 或任何未经支持的功能/结果承诺。
- 404 仍使用普通 `summary` card，但不输出 `og:image`、`twitter:image` 或 `og:url`。

内置 image generation 用于原创视觉方向，最终提示词为：

```text
Use case: ads-marketing
Asset type: Open Graph and Twitter social sharing image for AlgoDrills, 1.91:1 wide banner
Primary request: Create an original, polished visual direction for AlgoDrills, an independent site with clearly explained algorithm interview notes and practice guides.
Scene/backdrop: Opaque deep navy-to-indigo technical backdrop with subtle grid geometry.
Subject: Abstract algorithm path made from connected nodes, a small array of square cells, and branching route lines; no recognizable third-party symbols.
Style/medium: Crisp vector-inspired editorial graphic, modern developer education brand, high contrast, minimal and professional.
Composition/framing: Wide landscape, strong safe margins; brand copy grouped on the left, abstract algorithm system on the right; balanced at small thumbnail size.
Color palette: Deep navy #172033, indigo #2457c5, bright cyan and soft off-white accents, matching the current AlgoDrills site.
Text (verbatim): "AlgoDrills" and "Algorithm Practice, Explained Clearly"
Constraints: Opaque background; text must be exactly spelled; no claims, metrics, badges, people, screenshots, or platform affiliations; no third-party logos; no GitHub, Google, LeetCode, or company logos; no watermark; safe crop margins.
```

## 7A. 显式 `/404` 重定向循环独立诊断与本地修复（2026-07-22 补充）

### 7A.1 范围与安全基线

- 生产基线：`main` / `4d386df2f4cfc6e403c035051ecafe03bf7944ae`。
- `git fetch origin` 后 `HEAD = origin/main`，`HEAD...origin/main = 0 0`。
- 工作区开始时只有既有、未跟踪的 `reports/gsc-weekly/2026-07-22-algodrills.com-gsc-weekly-review.md`；该文件未修改、移动、删除或暂存。
- 本轮未执行 git add、commit、push、deploy、Cloudflare/GSC/Ahrefs 写操作，也未修改 DNS、SSL 或 Zone 规则。

### 7A.2 生产逐跳证据

所有请求均禁用自动跟随。生产响应的 `Server` 均为 `cloudflare`；Pages/Functions 路径的 `CF-Cache-Status` 为 `DYNAMIC`。重定向响应无正文或 Content-Type，普通未知路径最终 404 为 `text/html; charset=utf-8`、`Cache-Control: no-store`，正文是顶层自定义 404。

| 初始地址 | 生产逐跳路径 | Query/正文结果 |
| --- | --- | --- |
| `https://algodrills.com/404` | `301 Location: https://algodrills.com/404/` → `308 Location: /404` → 循环 | 无正文 |
| `https://algodrills.com/404/` | `308 Location: /404` → `301 Location: https://algodrills.com/404/` → 循环 | 无正文 |
| `https://algodrills.com/404.html` | `308 Location: /404` → `301 .../404/` → `308 /404` → 循环 | 无正文 |
| `https://algodrills.com/missing-page` | `301 .../missing-page/` → `404` | 自定义 404，`no-store` |
| `https://algodrills.com/missing-page/` | `404` | 自定义 404，`no-store` |
| `https://algodrills.com/missing-page?ref=audit` | `301 .../missing-page/?ref=audit` → `404` | Query 保留 |
| `https://algodrills.com/this-page-does-not-exist/` | `404` | 自定义 404 |
| `https://algodrills.com/missing/nested/path/` | `404` | 自定义 404 |

HTTP apex 先单跳到同路径的 HTTPS apex；www 先单跳到同路径的 HTTPS apex，之后进入上述相同路径处理。`http://www.algodrills.com/missing-page?ref=audit` 的完整链为 HTTPS apex 同路径 → 补尾斜杠并保留 query → 404，没有跳转首页。

本次抽样的重定向和 404 响应均带独立 `CF-Ray`，例如 `/404` 的 301 为 `a1f327dbddda63f0-LHR`、后续 308 为 `a1f327dd7fa563f0-LHR`，`/missing-page/` 的最终 404 为 `a1f327eb3b3d63f0-LHR`。这些独立 Ray 证明每一跳都是新的 Cloudflare 请求；未读取或输出任何凭据。

### 7A.3 根因

这是仓库 middleware 与 Cloudflare Pages 静态 HTML 规范化共同形成的循环，不是 `_redirects` 或 Zone 规则单独造成：

1. 仓库没有 `public/_redirects` 或 `dist/_redirects`，也没有其他 Pages Function；只有全局 `functions/_middleware.js`。
2. middleware 的统一规则会给所有无扩展名、无尾斜杠路径追加 `/`，因此 `/404` 被仓库层 301 到 `/404/`。
3. Cloudflare Pages 会把 HTML 文件路由规范化为无扩展名形式。顶层 `404.html` 对应显式 `/404`；Pages 将 `/404.html` 和 `/404/` 以 308 规范化到 `/404`。
4. 两层规则方向相反，形成 `/404` 301→`/404/` 308→`/404` 的闭环。
5. 普通静态预览服务器只做文件查找与 404 fallback，无法复现 Pages 的 HTML extensionless 308；Wrangler Pages runtime 能完整复现生产 301/308 循环。

Cloudflare 官方 Serving Pages 文档说明 Pages 会把 `.html` 路由重定向到无扩展名形式；官方 Functions 路由文档说明 trailing slash 对 Function 匹配通常可选，未命中 Function 后回退到静态资产路由。本项目的全局 middleware 先执行，随后 `context.next()` 进入 Pages 静态资产匹配，和实测完全一致。

### 7A.4 最小本地修复

只修改 `functions/_middleware.js`：在 `shouldUseTrailingSlash()` 中把精确路径 `/404` 排除出“追加尾斜杠”规则。没有增加 `_redirects`、新 Function、catch-all、首页 rewrite、meta refresh 或 JavaScript 跳转。

采用方案 A：

- `/404` 由 Pages 稳定返回 `200` 和顶层 `404.html`；页面仍为 `noindex, follow`。
- `/404/` 由 Pages 单次 308 到 `/404`。
- `/404.html` 由 Pages 单次 308 到 `/404`。
- 普通未知 URL 继续返回真实 404。

该修复让 Pages 自己保有静态 HTML 的规范化权，只取消 middleware 中与平台方向冲突的一个特殊路径规则。无需 Cloudflare Dashboard、Zone、DNS、SSL 或 Single Redirect 配置。

### 7A.5 Wrangler Pages 修复前后矩阵

使用现有缓存中的 Wrangler `4.113.0`，以 `wrangler pages dev dist --local-protocol=https` 启动真实 Pages/Functions runtime；通过本地解析把 `algodrills.com:8788` 指向 `127.0.0.1`，使 middleware 看到与生产一致的 HTTPS canonical host，全程没有访问生产域名。

| 路径 | 修复前 Wrangler | 修复后 Wrangler | 结论 |
| --- | --- | --- | --- |
| `/404` | `301 → /404/` | `200`，无 Location | 稳定显式错误页 |
| `/404/` | `308 → /404 → 301 → /404/` | `308 → /404`，随后 200 | 单跳，无循环 |
| `/404.html` | `308 → /404 → 301 → /404/` | `308 → /404`，随后 200 | 单跳，无循环 |
| `/missing-page` | `301 → /missing-page/ → 404` | 相同 | 未知路径策略不变 |
| `/missing-page/` | `404` | `404` | 真实 404 保持 |
| `/missing-page?ref=audit` | `301 → /missing-page/?ref=audit → 404` | 相同 | Query 保留 |
| `/missing/nested/path/` | `404` | `404` | 嵌套未知路径保持 |
| `/square-root/` | `200` | `200` | 正式页面不变 |
| `/square-root` | `301 → /square-root/` | 相同 | 正式尾斜杠策略不变 |
| `/` | `200` | `200` | 首页不变 |
| `/sitemap.xml` | `200` | `200` | 集合不变 |
| `/robots.txt` | `200` | `200` | 声明不变 |
| `/images/algodrills-social.png` | `200 image/png` | `200 image/png` | 社交图不变 |

本地 `/404` 最终 HTML 和普通未知路径的 404 HTML 均包含自定义 H1、普通 Return home 链接和 `noindex, follow`；均无 canonical、`og:url`、`og:image`、`twitter:image`、meta refresh 或 JavaScript 自动跳转。

### 7A.6 SEO、构建与视觉回归

- `npm run validate`：通过。
- 连续两次 `npm run build`：均构建 15 篇文章和 20 个正式页面；全 `dist` 聚合 SHA-256 均为 `574ec2cf10177896b1ac5747ffa1d1879b99ab866d5232858fb66012f4c5baf8`。
- `npm run audit:seo`：通过；20 个 indexable 页面、342 条内部链接、broken/redirecting internal links/orphan 均为 0。
- sitemap 仍为 20 个唯一 URL；20/20 canonical、title、description、OG、Twitter 均未变化。
- `/square-root/` 构建哈希保持 `c1a0ff4f8c3b2bcc9d5876af7cf8416726d4bea49198be07f7cfbfd1d425c81c`；正文、公式、代码、H1、canonical 和索引策略未变化。
- 社交 PNG/SVG 哈希分别保持 `48ff029c1787ab904d7488ab2cc9b02add4abf6cf2f7644cf6a18b6af66a590b` 与 `049f37ab1aa8fb4d7f8fee76fd968a059f0127afa36bbb3ab15b345801d7c783`。
- `git diff --check` 无输出。
- 1440×900 与 390×844 下检查普通未知路径、稳定 `/404`、首页和 `/square-root/`：无全页横向溢出、重叠、破图、metadata 泄漏或自动跳转；正式页面无视觉回归。控制台仅在真实未知路径上记录预期 HTTP 404，显式 `/404` 和正式页面无 error/warning。

### 7A.7 本轮修改与停止点

本轮仅有两个已跟踪文件修改：

- `functions/_middleware.js`：增加精确 `/404` 尾斜杠例外。
- `reports/ahrefs-technical-seo-audit-2026-07-22.md`：追加本节诊断、修复和验证证据。

两次构建没有造成 `dist` 差异。GSC 周报仍为唯一未跟踪文件。修复可以完全在仓库层完成，不需要 Cloudflare 配置或人工规则决定；下一步如需发布，必须另行确认，本轮在未暂存状态停止。

## 8. Sitemap、canonical、robots、H1 与内链

- 生产 sitemap：HTTP 200，20 个 URL，20 个唯一 URL；最终构建相同。
- sitemap 与 20 个正式可索引构建页面一一对应；没有 HTTP、www、query、redirect、404 或 noindex URL。
- 20 个正式页面 canonical 均自指最终 HTTPS apex trailing-slash URL。
- 生产与最终构建 robots.txt 均为 `Allow: /`，并声明 `https://algodrills.com/sitemap.xml`。
- 无 sitemap/noindex 冲突，无意外 noindex。
- 20 个正式页面各有且仅有一个 H1；title 可与 H1形成合理短版对应，H1 未改。
- title 重复：0；description 重复：生产有 13 页共用兜底文案，本地为 0。
- 解析 342 个 HTML 内部链接；broken internal links：0；指向 redirect URL：0。
- indexable orphan pages：0。文章页各有 15 个不同正式页面入站来源，首页/政策页各有 20 个。
- JSON-LD：0 个块；解析错误 0。没有为了本轮告警虚构 schema。

## 9. 图片与 alt 分类

- 正文 `<img>` 总数：0；缺失 alt：0；合理装饰性空 alt：0。
- 社交 metadata 图片资产：1 套 SVG/PNG，20/20 正式页面引用。
- `og:image:alt` 与 `twitter:image:alt`：20/20，值为 `AlgoDrills — Algorithm Practice, Explained Clearly`。
- 构建资源缺失：0；源 PNG 与构建 PNG SHA-256 相同。
- 本地 HTTP：`/images/algodrills-social.png` 返回 200、`Content-Type: image/png`。

## 10. 404 结果

生产实测：

- `https://algodrills.com/this-page-does-not-exist/` 返回 HTTP 200。
- 返回首页 HTML、首页 H1、首页 canonical `https://algodrills.com/`，且无 noindex。
- 结论：真实 soft 404，已复现。

最终本地构建与预览：

- 新增 `dist/404.html`，本地预览未知路径返回 HTTP 404。
- title：`Page Not Found · Algorithm Notes`。
- H1：`Page not found`，一个 H1。
- robots：`noindex, follow`。
- canonical：不存在。
- `og:url`、`og:image`、`twitter:image`：均不存在。
- 页面有返回首页链接，Header/Footer 正常。

需要后续独立任务在获准部署后验证 Cloudflare Pages 是否按预期选择 `404.html` 并返回真实 404。本轮未部署或修改 Cloudflare。

## 11. Redirect 逐跳矩阵

| 输入 URL | 第 1 跳 | 最终结果 |
| --- | --- | --- |
| `http://algodrills.com/` | 301 → `https://algodrills.com/` | 200 |
| `https://algodrills.com/` | 无跳转 | 200 |
| `http://www.algodrills.com/` | 301 → `https://algodrills.com/` | 200 |
| `https://www.algodrills.com/` | 301 → `https://algodrills.com/` | 200 |
| `http://www.algodrills.com/square-root/?ref=audit` | 301 → `https://algodrills.com/square-root/?ref=audit` | 200 |
| `https://www.algodrills.com/square-root/?ref=audit` | 301 → `https://algodrills.com/square-root/?ref=audit` | 200 |
| `https://algodrills.com/square-root` | 301 → `https://algodrills.com/square-root/` | 200 |
| `https://algodrills.com/square-root/?ref=audit` | 无跳转 | 200 |

结论：协议、主机与 trailing slash 规范化均为单跳；path 和 query string 正确保留；没有 chain 或 loop。本轮不需要 Cloudflare Single Redirect 建议或配置写操作。

## 12. `/square-root/` 保护与回归

只修改了 document title、meta description、共享 OG/Twitter 字段和移动端长链接换行：

- URL 未改：`/square-root/`。
- canonical 未改：`https://algodrills.com/square-root/`。
- 索引策略未改；仍为可索引且在 sitemap。
- H1 原样保留：`How to Compute a Square Root Without Calling a Library Function`。
- 二分搜索、Newton's method、公式、边界说明、代码、用户可见数学结论均未改。
- 无输入/计算器组件可测试；当前页面是静态算法指南，不把它误报为交互式计算器。
- 1440×900 与 390×844 均正常；移动端长 Wayback URL 不再造成全页横向溢出。

## 13. 代码与回归脚本

项目原有 `validate-output.mjs` 负责恢复内容与 CSV/frontmatter 证据校验，不覆盖构建产物 SEO。新增轻量 `scripts/audit-seo.mjs`，仅使用 Node 标准库，检查：

- sitemap 与构建页面一致性、唯一性
- canonical、title、description、robots、OG、Twitter、H1
- 20 页完整 OG 图片字段、Twitter 图片字段与 `summary_large_image`
- 社交 PNG URL、实际文件、PNG 签名、1200×630 尺寸与无 alpha
- 重复 title/description
- 内部链接、redirect-like 非规范路径、孤儿页
- 图片文件、alt 分类
- JSON-LD 可解析性
- 404 noindex、canonical、`og:url` 与社交图片排除条件

同时新增标准库本地预览脚本 `scripts/preview-site.mjs`，使未知路径按 `404.html` 返回 404，并为 PNG/SVG 返回正确 MIME，供视觉/HTTP 回归。`package.json` 仅新增 `audit:seo` 和 `preview` 两个脚本，没有新增依赖或 lockfile。构建脚本使用 Node 标准库把 `public/` 确定性复制到 `dist/`。

## 14. 本地质量验证

| 命令 | 结果 | 数量 / 说明 |
| --- | --- | --- |
| `npm run validate` | 通过 | 现有恢复内容校验通过；无 warning |
| `npm run build` | 通过 | 构建 15 篇文章、4 个政策/联系页、首页，共 20 个正式页面；另生成 404 |
| 连续两次 `npm run build` | 通过 | 两次全 `dist` 聚合 SHA-256 均为 `574ec2cf10177896b1ac5747ffa1d1879b99ab866d5232858fb66012f4c5baf8` |
| `npm run audit:seo` | 通过 | 20 个可索引页面、342 个 HTML 内链、0 张正文图片、1 张已验证社交图；无 warning |
| `xmllint --noout public/images/algodrills-social.svg` | 通过 | SVG XML 可解析，无输出 |
| 本地 PNG/404 HTTP 检查 | 通过 | PNG 200 `image/png`；未知路径 404 |
| `git diff --check` | 通过 | 无空白错误 |

项目没有 `lint`、`typecheck`、`check` 或 `test` script，因此未虚构执行结果。`validate` 与 `audit:seo` 是脚本级校验，没有测试框架的 test case 数量。

## 15. 桌面与移动视觉结果

浏览器视口：1440×900、390×844。检查路径：

- `/`
- `/square-root/`
- `/backtracking-vs-iterative-generation/`（代表性原创指南与 title 修改页）
- `/bitwise-arithmetic/`（title + description 修改页）
- `/about/`
- `/this-page-does-not-exist/`（真实本地 404）
- `/images/algodrills-social.png` 原尺寸与 400×210 缩略显示

最终结果：

- Header、Footer、导航、H1、正文正常；metadata 没有渲染到正文。
- 0 个坏图；社交 PNG 浏览器 natural size 为 1200×630，400×210 缩放正常。
- 0 个全页横向溢出元素；`pre` 在需要时保持内部滚动，不撑宽页面。
- 未发现元素重叠。
- 浏览器控制台 error/warn：0。
- 首页可见简介保持原文，没有因 meta description 扩写而改变正文。
- `/square-root/` 核心内容和视觉无回归。
- 社交图文字无截断、重叠、模糊或异常裁切，安全边距充足。

## 16. 修改文件

源码与配置：

- `package.json`
- `scripts/build-site.mjs`
- `scripts/validate-output.mjs`
- `scripts/audit-seo.mjs`（新增）
- `scripts/preview-site.mjs`（新增）
- `public/images/algodrills-social.svg`（新增原创可编辑源）
- `public/images/algodrills-social.png`（新增生产位图）
- 14 个内容 frontmatter 文件：除 `algorithm-interview-pattern-roadmap.md` 外的其余文章文件（其中两篇原始指南仅 `backtracking-vs-iterative-generation.md` 需要 title 短版）
- `reports/ahrefs-technical-seo-audit-2026-07-22.md`（本报告，新增）

构建产物：

- 20 个正式页面的 `dist/**/index.html`
- `dist/404.html`（新增）
- `dist/images/algodrills-social.svg`（新增受控构建产物）
- `dist/images/algodrills-social.png`（新增受控构建产物）

`dist/sitemap.xml` 与 `dist/robots.txt` URL 结构未改。

## 17. 遗留问题与分类

### 已复现并修复（本地）

- 20 页 Twitter 核心 metadata 缺失。
- 14 页 title >60；通过 15 页去除模板站名和 9 页保守短版处理归零。
- 18 页 description <120；基于现有正文与功能补齐并唯一化。
- 首页/政策页 `og:type` 错用 `article`。
- 生产 soft 404；已新增本地 404 构建与预览行为。
- 长 Wayback URL 导致的移动端全页横向溢出。
- 20 页缺少 OG/Twitter 图片字段；已用原创图完整补齐。

### 无法复现

- sitemap 重复或包含 HTTP/www/query/redirect/404/noindex URL。
- canonical 错主机、非自指或与 `og:url` 不一致。
- broken internal link、指向 redirect 的内部链接、indexable orphan。
- 重复 title、意外 noindex、多 H1、图片 404、缺 alt、JSON-LD 解析错误。
- HTTP www 两跳、redirect chain 或 loop。

### 合理保留

- 原本已合理的 2 条 description 不修改。
- `/square-root/` URL、canonical、H1、正文、公式、代码、索引策略和搜索意图不修改。
- 404 不输出社交图片或 `og:url`。

### 需要人工证据

- 没有 Ahrefs CSV，旧告警逐 URL 对应关系无法证明。
- Cloudflare Pages dashboard 中的实际 build command 不在仓库配置内可见；但这不改变 `dist` 已受控且历史发布持续同步提交的仓库证据。

### 需要后续独立任务

- 经批准后 commit/push/deploy；本轮未执行。
- 部署后复测生产 metadata、社交 PNG、未知路径真实 404 与移动端溢出。
- 部署并复测后再决定是否执行 Ahrefs Validate Fix；本轮禁止执行。

### Cloudflare Single Redirect

不需要。所有测试变体已单跳到目标，path/query 保留正确。

## 18. 后续发布的精确暂存建议

本轮没有执行 `git add`。获准发布时，本次 SEO 变更应包含：

- 14 个已修改的 `boilerplate/content/gold/*.md` frontmatter 文件。
- `package.json`。
- `scripts/build-site.mjs`、`scripts/validate-output.mjs`、`scripts/audit-seo.mjs`、`scripts/preview-site.mjs`。
- `public/images/algodrills-social.svg` 与 `public/images/algodrills-social.png`。
- 受控发布产物 `dist/` 中的 20 个已修改 `index.html`、新增 `404.html`、新增 `images/algodrills-social.svg` 与 `images/algodrills-social.png`。
- `reports/ahrefs-technical-seo-audit-2026-07-22.md`。

应排除：

- `reports/gsc-weekly/2026-07-22-algodrills.com-gsc-weekly-review.md`：这是用户确认的另一项既有 GSC 工作，不属于本次 SEO 整改提交。
- `/tmp` 下的缩略预览和审计临时文件。
- 本轮未变更的 `dist/robots.txt`、`dist/sitemap.xml` 不需要人为触碰；若以目录方式暂存，Git 也不会把无差异文件计入提交。

## 19. 最终 Git 状态

本轮不执行 staging、commit 或清理。现有 GSC 周报继续保留。任务结束前使用 `--untracked-files=all` 展开的完整 `git status --short`：

```text
 M boilerplate/content/gold/backtracking-vs-iterative-generation.md
 M boilerplate/content/gold/bitwise-arithmetic.md
 M boilerplate/content/gold/car-race.md
 M boilerplate/content/gold/celebrities.md
 M boilerplate/content/gold/center-points.md
 M boilerplate/content/gold/insert-interval.md
 M boilerplate/content/gold/keypad.md
 M boilerplate/content/gold/log-every-second.md
 M boilerplate/content/gold/plus-minus-array.md
 M boilerplate/content/gold/power-set.md
 M boilerplate/content/gold/rectangles-store.md
 M boilerplate/content/gold/sort-by-length-then-frequency.md
 M boilerplate/content/gold/square-root.md
 M boilerplate/content/gold/weighted-random.md
 M dist/about/index.html
 M dist/algorithm-interview-pattern-roadmap/index.html
 M dist/backtracking-vs-iterative-generation/index.html
 M dist/bitwise-arithmetic/index.html
 M dist/car-race/index.html
 M dist/celebrities/index.html
 M dist/center-points/index.html
 M dist/contact/index.html
 M dist/index.html
 M dist/insert-interval/index.html
 M dist/keypad/index.html
 M dist/log-every-second/index.html
 M dist/plus-minus-array/index.html
 M dist/power-set/index.html
 M dist/privacy/index.html
 M dist/rectangles-store/index.html
 M dist/sort-by-length-then-frequency/index.html
 M dist/square-root/index.html
 M dist/terms/index.html
 M dist/weighted-random/index.html
 M package.json
 M scripts/build-site.mjs
 M scripts/validate-output.mjs
?? dist/404.html
?? dist/images/algodrills-social.png
?? dist/images/algodrills-social.svg
?? public/images/algodrills-social.png
?? public/images/algodrills-social.svg
?? reports/ahrefs-technical-seo-audit-2026-07-22.md
?? reports/gsc-weekly/2026-07-22-algodrills.com-gsc-weekly-review.md
?? scripts/audit-seo.mjs
?? scripts/preview-site.mjs
```
