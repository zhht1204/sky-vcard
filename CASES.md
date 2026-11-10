# sky-vcard 案例库

> 调查案例库（现象→复现→调查→根因→修复→验证→教训）。格式与分类参考 `sky-acg/.github/skills/case-study/SKILL.md`，本仓库案例单独编号、单独维护。

## 分类标签

| 标签 | 含义 |
|---|---|
| `seo-canonical` | URL 形态 / canonical / hreflang / sitemap 等抓取与索引信号问题。 |
| `redirect-chain` | 多级 308 跳转、meta refresh、尾斜杠别名导致的 URL 分裂。 |

---

## Case #001 — GSC 报「Page with redirect / Duplicate without user-selected canonical」

- **Date**: 2026-11-11
- **Status**: Fixed
- **Severity**: Low（仅影响搜索引擎收录与规范化，站点功能与访问完全正常）
- **Category**: `seo-canonical`
- **Surfaces**: `https://zhtlovelp.space/`、`https://www.zhtlovelp.space/`、`/index.html`、`/zh`、`/zh/`、`/zh/index.html`、`/en`、`/en/`、`/en/index.html`
- **Files touched**: `zh/index.html`、`en/index.html`、`index.html`、`README.md`、`robots.txt`（新增）、`sitemap.xml`（新增）
- **Related cases**: none

### 现象 (Symptom)

用户收到 Google Search Console 邮件（WNC-20237597），提示站点有页面因「Page with redirect」与「Duplicate without user-selected canonical」未被索引。用户的第一反应是「线上 SSO 出了问题」，并把这封 GSC 邮件当成疑似证据贴过来。

### 复现 (Reproduction)

线上实测（`curl -s -o NUL -D -`）：

```
GET https://zhtlovelp.space/              → 308  Location: https://www.zhtlovelp.space/
GET https://www.zhtlovelp.space/          → 308  Location: /zh
GET https://www.zhtlovelp.space/index.html→ 200  <meta http-equiv="refresh" content="0; url=/zh">
GET https://www.zhtlovelp.space/zh        → 200
GET https://www.zhtlovelp.space/zh/       → 200   （与 /zh 同内容）
GET https://www.zhtlovelp.space/zh/index.html → 200（与 /zh 同内容）
GET https://www.zhtlovelp.space/en        → 200
GET https://www.zhtlovelp.space/en/       → 200   （与 /en 同内容）
GET https://www.zhtlovelp.space/en/index.html → 200（与 /en 同内容）
```

三个页面 `<head>` 中没有任何 `<link rel="canonical">` 与 `hreflang`。

### 调查 (Investigation)

- **先证伪「SSO 有问题」这条假设**：
  - `sky-vcard` 仓库内没有任何 SSO/OIDC 代码（`grep -i "sso|oauth|authorize|client_id|redirect_uri|token"` 全仓 0 命中），是纯静态站点，页面里也没有登录入口。
  - `sky-sso` 仓库内搜 `vcard` 无命中，`.docs/FIRST_PARTY_CLIENTS.md` 的一方客户端只有 sky-acg / sky-life / sky-qiwen，**本站不是 SSO client**。
  - 生产 SSO 实测健康：`/.well-known/openid-configuration` 200、`/oauth/jwks` 200、`/login` 200（渲染出用户名/密码表单）、`/clients` 匿名 307→`/login`、`/oauth/end_session` 302→`/login`、`/oauth/authorize` 用不存在的 client 返回 400。
  - 一方应用端到端跳转正常：`acg-api` / `life` / `qiwen` 的 `/auth/sso/login` 均 302 到 `https://sso.zhtlovelp.space/oauth/authorize`，带 `code_challenge_method=S256`、`nonce`、`state`；life 还正确下发了 `HttpOnly; Secure; SameSite=Lax` 的 state cookie。
  - → 结论：GSC 报告与 SSO 无关。
- **回到 GSC 报告本身**：GSC 的两条原因都属于「抓取与索引信号」，只与 URL 形态、canonical、hreflang 相关，与登录态/会话/SSO 无关。逐条对照线上响应即可一一映射：
  - 「Page with redirect」← 裸域→www（Vercel 域名配置）+ `/`→`/zh`（`vercel.json`）+ `/index.html` 的 meta refresh；
  - 「Duplicate without user-selected canonical」← `/zh`、`/zh/`、`/zh/index.html` 三种写法返回同一份 HTML，而页面没有声明 canonical，Google 无法判定权威 URL。

### 根因 (Root Cause)

站点同时存在「多级跳转」与「同内容多 URL 形态」，而所有可达页面都**没有声明 `<link rel="canonical">`**，导致 Google 既把跳转页判为「Page with redirect」，又把同内容的多个 URL 判为「Duplicate without user-selected canonical」——两者的共同根因是**缺少唯一权威 URL 信号**。

### 修复 (Fix)

- `zh/index.html`、`en/index.html`：`<head>` 中新增 `<link rel="canonical">`（分别指向 `https://www.zhtlovelp.space/zh` 与 `https://www.zhtlovelp.space/en`）以及三条 `hreflang`（`zh-Hans` / `en` / `x-default`→`zh`）。
- `index.html`（meta refresh 兜底页）：同样补 canonical 与 hreflang，让任何残留入口都归一到 `/zh`。
- 站内语言切换链接由 `/en/`、`/zh/` 改为 `/en`、`/zh`：**内部链接、重定向目标、canonical、sitemap 四者统一为同一种 URL 形态**（无尾斜杠）。
- 新增 `robots.txt`（`Allow: /` + `Sitemap:` 指向）与 `sitemap.xml`（只列 `/zh`、`/en` 两个权威 URL，并用 `xhtml:link` 互相声明语言版本）。
- `vercel.json` 开启 `"cleanUrls": true` + `"trailingSlash": false`，把 `/zh/`、`/zh/index.html`、`/en/`、`/en/index.html` 在 **HTTP 层**直接 308 到权威 URL，而不是只靠 canonical 收敛（改动前实测这些路径均返回 200 同内容）。
- `README.md` 增补「部署与 URL 约定」小节，把 URL 形态与 canonical 规则固化下来，并写明本站不接入 Sky SSO。

### 验证 (Verification)

已提交（`9bf3d11`）并推送 `origin/master`，Vercel 自动部署后线上实测：

```
GET https://zhtlovelp.space/                 → 308  Location: https://www.zhtlovelp.space/
GET https://www.zhtlovelp.space/             → 308  Location: /zh
GET https://www.zhtlovelp.space/zh           → 200
GET https://www.zhtlovelp.space/zh/          → 308  Location: /zh
GET https://www.zhtlovelp.space/zh/index.html → 308  Location: /zh
GET https://www.zhtlovelp.space/en           → 200
GET https://www.zhtlovelp.space/en/          → 308  Location: /en
GET https://www.zhtlovelp.space/en/index.html → 308  Location: /en
GET https://www.zhtlovelp.space/index.html   → 308  Location: /     （跟随后最终落在 /zh，200）
GET https://www.zhtlovelp.space/robots.txt   → 200
GET https://www.zhtlovelp.space/sitemap.xml  → 200  Content-Type: application/xml
```

- `/zh` 与 `/en` 线上 `<head>` 已含 `canonical` 与三条 `hreflang`（zh-Hans / en / x-default），自指正确。
- 站内语言切换链接线上为 `/en` 与 `/zh`（无尾斜杠），与 308 目标、canonical、sitemap 四者一致。
- `sitemap.xml` 线上可解析，只含 `/zh`、`/en` 两个 URL 且带 `xhtml:link` 互链；`robots.txt` 线上已指向该 sitemap。
- 剩余动作（需账号操作）：在 GSC「网址检查」对 `https://www.zhtlovelp.space/zh` 提交「请求索引」，报告条目通常在 1–2 个抓取周期后消失。

### 教训 (Lesson / Reusable Conclusion)

- **搜索引擎报告只反映抓取/索引信号**（收录、重复页、canonical、安全站点），**永远不可能解释登录/会话/SSO 类故障**。看到「线上有问题 + 搜索引擎报错」同时出现时，先用代码事实证伪怀疑对象，再按报告分类去查，不要把两类问题绑在一起。
- **有裸域→www→子目录多级跳转的静态站，必须显式声明唯一 canonical**，并让「站内链接 / 重定向目标 / canonical / sitemap」四者收敛到同一个 URL 形态（含尾斜杠），否则 Google 必然报「Duplicate without user-selected canonical」。
- **同一个仓库要区分「谁是权威站」**：本站是纯静态站，不在 `sky-sso` 的 client 列表里，判断「是否与 SSO 相关」的第一步是查 client 注册与前端是否存在 OIDC 调用，而不是看报错文案。
