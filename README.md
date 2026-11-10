# vCard - Personal portfolio

![GitHub repo size](https://img.shields.io/github/repo-size/codewithsadee/vcard-personal-portfolio)
![GitHub stars](https://img.shields.io/github/stars/codewithsadee/vcard-personal-portfolio?style=social)
![GitHub forks](https://img.shields.io/github/forks/codewithsadee/vcard-personal-portfolio?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/codewithsadee_?style=social)](https://twitter.com/intent/follow?screen_name=codewithsadee_)
[![YouTube Video Views](https://img.shields.io/youtube/views/SoxmIlgf2zM?style=social)](https://youtu.be/SoxmIlgf2zM)

vCard is a fully responsive personal portfolio website, responsive for all devices, built using HTML, CSS, and JavaScript.

## Demo

![vCard Desktop Demo](./website-demo-image/desktop.png "Desktop Demo")
![vCard Mobile Demo](./website-demo-image/mobile.png "Mobile Demo")

## 部署与 URL 约定（Sky 线上站）

线上地址：`https://www.zhtlovelp.space`（裸域 `zhtlovelp.space` 由 Vercel 308 到 `www`）。

| URL | 状态 | 说明 |
|---|---|---|
| `/` | 308 → `/zh` | 由 `vercel.json` 的 `redirects` 配置 |
| `/index.html` | 200 + meta refresh → `/zh` | 仅作兜底，带 canonical 归一到 `/zh` |
| `/zh`、`/en` | 200 | **唯一权威 URL**，页面内已声明 canonical + hreflang |
| `/zh/`、`/zh/index.html`、`/en/`、`/en/index.html` | 200 同内容 | 同内容别名，依赖 canonical 收敛，不进 sitemap |

约定：

- canonical 与 `hreflang`（`zh-Hans` / `en` / `x-default`）写在 `zh/index.html`、`en/index.html`、`index.html` 的 `<head>` 中。
- 站内语言切换链接使用不带尾斜杠的 `/zh`、`/en`，与重定向目标、canonical、sitemap 保持同一种 URL 形态。
- `sitemap.xml` 只提交 `/zh`、`/en` 两个 URL；`robots.txt` 指向该 sitemap。
- 本站是纯静态站，**不接入 Sky SSO**；`sky-sso` 中没有本站的 client 注册。

## Prerequisites

Before you begin, ensure you have met the following requirements:

* [Git](https://git-scm.com/downloads "Download Git") must be installed on your operating system.

## Installing vCard

To install **vCard**, follow these steps:

Linux and macOS:

```bash
sudo git clone https://github.com/codewithsadee/vcard-personal-portfolio.git
```

Windows:

```bash
git clone https://github.com/codewithsadee/vcard-personal-portfolio.git
```

## Contact

If you want to contact me you can reach me at [Twitter](https://www.x.com/codewithsadee_).

## License

MIT
