# GitHub & LeetCode Heatmap Widget

An embeddable contribution heatmap widget that aggregates daily activity from GitHub and LeetCode, rendering a beautiful calendar-style visualization that can be embedded anywhere via iframe.

## Features

-   🔥 **Aggregated Heatmap** - Combines GitHub commits and LeetCode submissions in one view
-   🎨 **Multiple Themes** - GitHub, Blue, Monochrome, and Sunset color palettes
-   ♿ **Accessible** - Keyboard navigation, ARIA labels, and focus management
-   📱 **Responsive** - Auto-resize support with postMessage API
-   ⚡ **Fast** - Built-in in-memory caching with TTL
-   🔒 **Secure** - Rate limiting and security headers
-   🌙 **Dark Mode** - Full dark mode support

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd github-leetcode-port
npm install
```

### 2. Set Environment Variables

Create a `.env.local` file:

```env
# Required for GitHub contributions
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Required for production deployment
SITE_URL=https://your-domain.com
```

**Getting a GitHub Token:**

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate new token with `read:user` scope
3. Copy the token to your `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Visit:

-   **Embed Generator**: http://localhost:3000/embed-generator
-   **Example Widget**: http://localhost:3000/widget?github=octocat

## Usage

### Generate Embed Code

1. Navigate to `/embed-generator`
2. Enter your GitHub and/or LeetCode username
3. Customize appearance (theme, cell size, layout)
4. Copy the generated iframe code
5. Paste into your website/blog/portfolio

### Example Embed

```html
<iframe
    id="heatmap-widget"
    src="https://your-domain.com/widget?github=octocat&palette=github&cell=12"
    width="900"
    height="200"
    frameborder="0"
    scrolling="no"
    style="border: none; overflow: hidden;"
></iframe>
<script>
    window.addEventListener("message", (event) => {
        if (event.data.type === "dh-height") {
            const iframe = document.getElementById("heatmap-widget");
            if (iframe) {
                iframe.style.height = event.data.height + "px";
            }
        }
    });
</script>
```

## API Endpoints

### `/api/heatmap`

Aggregator endpoint that merges GitHub and LeetCode data.

**Query Parameters:**

| Parameter      | Type     | Required | Default      | Description                     |
| -------------- | -------- | -------- | ------------ | ------------------------------- |
| `github`       | string   | \*       | -            | GitHub username                 |
| `leetcode`     | string   | \*       | -            | LeetCode username               |
| `from`         | ISO date | No       | 365 days ago | Start date (YYYY-MM-DD)         |
| `to`           | ISO date | No       | Today        | End date (YYYY-MM-DD)           |
| `cacheTTL`     | number   | No       | 600          | Cache TTL in seconds            |
| `includeZeros` | 0 or 1   | No       | 0            | Include days with zero activity |

\*At least one username is required

**Example Response:**

```json
{
    "meta": {
        "github": "octocat",
        "leetcode": "user123",
        "from": "2024-12-01",
        "to": "2025-12-01",
        "generatedAt": "2025-12-01T12:00:00.000Z",
        "cacheHit": false,
        "errors": {
            "github": null,
            "leetcode": null
        }
    },
    "days": {
        "2025-11-01": {
            "total": 5,
            "github": 3,
            "leetcode": 2,
            "details": []
        }
    }
}
```

### `/api/github-contrib`

Fetches GitHub contribution calendar data.

**Query Parameters:**

-   `username` (required): GitHub username

### `/api/leetcode-contrib`

Fetches LeetCode submission calendar data.

**Query Parameters:**

-   `username` (required): LeetCode username

## Widget Configuration

### `/widget` Query Parameters

| Parameter    | Type     | Default      | Description                                     |
| ------------ | -------- | ------------ | ----------------------------------------------- |
| `github`     | string   | -            | GitHub username                                 |
| `leetcode`   | string   | -            | LeetCode username                               |
| `from`       | ISO date | 365 days ago | Start date                                      |
| `to`         | ISO date | Today        | End date                                        |
| `palette`    | string   | `github`     | Color theme: `github`, `blue`, `mono`, `sunset` |
| `cell`       | number   | `12`         | Cell size in pixels (8-20)                      |
| `showLegend` | 0 or 1   | `1`          | Show/hide legend                                |
| `compact`    | 0 or 1   | `0`          | Compact mode (smaller footprint)                |
| `autoResize` | 0 or 1   | `0`          | Enable auto-resize via postMessage              |

## Caching Strategy

The application uses a multi-layered caching approach:

1. **Provider-level cache** (GitHub/LeetCode endpoints):

    - GitHub: 1 hour TTL
    - LeetCode: 2 hours TTL
    - In-memory fallback

2. **Aggregator cache** (`/api/heatmap`):

    - Default: 10 minutes TTL
    - In-memory storage with automatic cleanup
    - Key format: `heatmap:{github}:{leetcode}:{from}:{to}`

3. **Client-side**:
    - Widget uses `cache: "no-store"` to respect server cache

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables:
    - `GITHUB_TOKEN`
    - `SITE_URL` (auto-populated by Vercel)
4. Deploy

### Other Platforms

Ensure your platform supports:

-   Node.js 18+
-   Environment variables
-   Server-side rendering (Next.js App Router)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Embed Generator UI                  │
│              (/embed-generator/page.tsx)             │
└─────────────────────────────────────────────────────┘
                           │
                           │ generates iframe
                           ▼
┌─────────────────────────────────────────────────────┐
│                   Widget Page                        │
│                (/widget/page.tsx)                    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │        HeatmapGrid Component                │    │
│  │      (components/HeatmapGrid.tsx)           │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                           │
                           │ fetch
                           ▼
┌─────────────────────────────────────────────────────┐
│              /api/heatmap (Aggregator)               │
│           (app/api/heatmap/route.ts)                 │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │ GitHub Provider  │    │ LeetCode Provider│      │
│  │ /api/github-     │    │ /api/leetcode-   │      │
│  │    contrib       │    │    contrib       │      │
│  └──────────────────┘    └──────────────────┘      │
│           │                        │                 │
│           ▼                        ▼                 │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │  GitHub GraphQL  │    │ LeetCode GraphQL │      │
│  │       API        │    │       API        │      │
│  └──────────────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────┘
```

## Known Limitations

-   **LeetCode API Instability**: LeetCode's GraphQL API can be unreliable. The widget handles partial failures gracefully by showing available data.
-   **GitHub Rate Limits**: Without authentication, GitHub API is limited to 60 req/hour. Use `GITHUB_TOKEN` to increase to 5000 req/hour.
-   **Date Range**: Maximum efficient range is ~1 year due to data volume.

## Development

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── github-contrib/route.ts    # GitHub data provider
│   │   ├── leetcode-contrib/route.ts  # LeetCode data provider
│   │   └── heatmap/route.ts          # Aggregator endpoint
│   ├── embed-generator/
│   │   └── page.tsx                   # Embed code generator UI
│   ├── widget/
│   │   └── page.tsx                   # Embeddable widget page
│   └── layout.tsx
├── components/
│   └── HeatmapGrid.tsx               # Heatmap visualization component
├── lib/
│   ├── cache.ts                      # In-memory cache with TTL
│   └── utils.ts                      # Utility functions
└── public/
```

### Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Styling**: Tailwind CSS v4
-   **UI Components**: shadcn/ui patterns
-   **HTTP Client**: Axios
-   **Caching**: In-memory with TTL
-   **Icons**: Lucide React

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use in your projects!

## Support

For issues or questions:

-   Open an issue on GitHub
-   Check existing issues for solutions

## Acknowledgments

-   GitHub GraphQL API for contribution data
-   LeetCode GraphQL API for submission data
-   Next.js team for the amazing framework
