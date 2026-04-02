# Portfolio — Amir Shetaia

Personal portfolio website built with Next.js 16, TypeScript, and Tailwind CSS.

> Senior Software Engineer at AMD working on GPU drivers for the ROCm platform.

<!-- ![Screenshot](https://your-domain.com/og-image.png) -->

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, `tailwindcss-animate`
- **Animation:** Framer Motion
- **UI Primitives:** Radix UI, shadcn/ui, cmdk
- **Email:** Resend
- **Analytics:** Vercel Analytics & Speed Insights

## Features

- Interactive terminal hero with typing animation
- Command palette (`⌘K`) for quick navigation
- Spotify "Now Playing" integration
- GitHub activity feed
- Contact form with email delivery via Resend
- Dark / light mode with system preference detection
- Respects `prefers-reduced-motion`
- SEO optimized with sitemap generation
- Scroll progress bar and section connectors
- Easter eggs

## Getting Started

```bash
# Clone
git clone https://github.com/NightBaRron1412/portfolio.git
cd portfolio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start dev server
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Required | Description |
| --- | --- | --- |
| `SITE_URL` | Yes | Canonical site URL (used for SEO/sitemap) |
| `RESEND_API_KEY` | No | [Resend](https://resend.com) API key for the contact form |
| `GITHUB_TOKEN` | No | GitHub personal access token (raises API rate limit) |
| `SPOTIFY_CLIENT_ID` | No | Spotify OAuth client ID |
| `SPOTIFY_CLIENT_SECRET` | No | Spotify OAuth client secret |
| `SPOTIFY_REFRESH_TOKEN` | No | Spotify refresh token for "Now Playing" |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | No | Enable Vercel Analytics (`true` / `false`) |
| `NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS` | No | Enable Vercel Speed Insights (`true` / `false`) |

The site works without any optional variables — features degrade gracefully.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run tests with Vitest |

## License

[MIT](LICENSE)
