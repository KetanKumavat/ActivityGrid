# Activity Grid

Generate beautiful contribution heatmaps from GitHub and LeetCode. Customize the appearance and embed them directly into your portfolio.

## ✨ Features

-   Unified GitHub + LeetCode activity visualization
-   Multiple themes (GitHub, Blue, Mono, Sunset)
-   Fast with built-in caching

## 🚀 Quick Start

```bash
git clone https://github.com/KetanKumavat/ActivityGrid.git
cd ActivityGrid
npm install
npm run dev
```

Visit **http://localhost:3000** to generate your heatmap.

## 🔑 Setup (Optional)

Create `.env.local` for GitHub data:

```env
GITHUB_TOKEN=your_github_token_here
```

> Get a token at [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens) with `read:user` scope.

## 📦 Embedding

1. Open the app and enter your usernames
2. Customize appearance (theme, size, etc.)
3. Copy the generated iframe code
4. Paste into your website

**Example:**

```html
<iframe
    src="https://activity-grid.vercel.app/widget?github=ketankumavat&palette=github"
    width="900"
    height="200"
    frameborder="0"
></iframe>
```

## 🛠️ Tech Stack

-   Next.js 16 (App Router)
-   Tailwind CSS v4
-   TypeScript
-   GitHub & LeetCode APIs

## 📄 License

MIT - Use it freely in your projects!

## 🤝 Contributing

Contributions welcome! Open an issue or submit a PR.
