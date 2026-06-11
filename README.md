# Amir Shetaia — Portfolio

The personal portfolio of **Amir Shetaia**, Senior Software Engineer at AMD (GPU drivers / ROCm).
Built around a custom **"Instrument"** design system — telemetry/HUD detailing, frosted‑glass
panels, a live WebGL plasma backdrop, and a dotted world map.

🔗 **Live:** https://amirshetaia.com

---

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack) · React 18 · TypeScript (strict)
- **Styling:** Tailwind CSS v3 + design tokens (CSS variables, per‑theme)
- **Animation:** Framer Motion + composited CSS (scroll‑linked timelines, reveals)
- **Graphics:** WebGL plasma shader, 2D‑canvas constellation field, CSS‑mask dotted map
- **Integrations:** Spotify (now‑playing), GitHub (activity), Resend (contact email)
- **Hosting/analytics:** Vercel · Vercel Analytics & Speed Insights
- **Testing:** Vitest (unit) · Playwright (e2e) · axe‑core (a11y)

## Highlights

- **Hero** — live status card (local clock, location), plasma shader backdrop, decoder/typed text
- **About** — 3D‑tilt portrait framed as a live instrument readout
- **Selected Work** — tilt + border‑beam project cards with per‑project accents
- **Experience** — a choreographed career‑journey timeline: gradient progress rail with a
  scroll‑tracking comet, glowing active nodes, and an Egypt → Canada relocation beat
- **Education** — animated radial GPA gauges
- **Live Signals** — real GitHub contribution activity
- **Off the Clock** — a console‑style games shelf (covers + metadata pulled from Steam)
- **Contact** — validated form delivering email via Resend
- **Frosted‑glass panels**, film‑grain texture, light/dark themes, and a user **reduce‑motion** toggle
- **Easter egg:** the Konami code (`↑↑↓↓←→←→ B A`) flips the site into a retro **CRT arcade mode**
  and starts the menu music
- **Accessible:** WCAG AA (axe: 0 violations, both themes), keyboard skip‑link, honors
  `prefers-reduced-motion`

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End‑to‑end tests (Playwright) |

### Asset generators (run after editing source data)

```bash
node scripts/gen-icons.mjs      # favicon.ico, icon.svg, apple-icon, PWA icons
node scripts/gen-og.mjs         # public/og-image.png (social card)
node scripts/gen-games.mjs      # game covers + metadata from data/games.json (Steam, keyless)
node scripts/gen-worldmap.mjs   # dotted world map + pins
```

## Environment variables

Set these in `.env.local` (dev) and on Vercel (prod). All are optional — features degrade gracefully if unset.

| Variable | Used for |
| --- | --- |
| `SITE_URL` | Canonical/OG/sitemap base URL (e.g. `https://amirshetaia.com`) |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REFRESH_TOKEN` | Now‑playing widget |
| `RESEND_API_KEY` | Contact‑form email delivery |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | Contact recipient / verified sender |
| `GITHUB_TOKEN` | Optional — higher rate limits for the GitHub activity feed |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` / `NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS` | Toggle Vercel Analytics / Speed Insights |

> Background music lives at `public/audio/menu.mp3`. Use a track you have the rights to.

## Deployment

Auto‑deploys to **Vercel** on push to `main`. Set the environment variables above in the Vercel
project settings.

---

© Amir Shetaia. Code is MIT‑licensed; brand assets, copy, and the résumé are not.
