# Amir Shetaia — SSH Portfolio (TUI)

A terminal portfolio you can browse over SSH:

```
ssh ssh.amirshetaia.com
```

It's a read-only [Bubble Tea](https://github.com/charmbracelet/bubbletea) app served by
[Charm `wish`](https://github.com/charmbracelet/wish). Every connection runs **only** this TUI —
there is no shell, no auth, nothing to exec — so it's safe to expose publicly.

```
┌ Amir Shetaia · Senior Software Engineer ─────────────── Home ┐
│ PORTFOLIO        │  █████  ███████                            │
│                  │ ██   ██ ██       AMIR SHETAIA              │
│  1  Home         │ ███████ ███████  Senior Software Engineer  │
│  2  About        │ ...                                        │
│  6  Games        │ // READOUT                                 │
└ ↑/↓ scroll · ⇥ section · 1–7 jump · q quit ······· ▂▅▇▆▃▁ ───┘
```

## Controls

| Key | Action |
| --- | --- |
| `Tab` / `→` / `l` · `Shift+Tab` / `←` / `h` | Next / previous section |
| `1`–`7` | Jump to a section |
| `↑/↓` or `j/k` | Scroll |
| `PgUp/PgDn`, `g`/`G` | Page / top / bottom |
| `q` / `Ctrl+C` | Quit |

## Run locally

```bash
cd ssh
go mod tidy        # populate go.sum + requires
go run .           # listens on :2222
# in another terminal:
ssh -p 2222 localhost
```

Config via env: `HOST` (default `0.0.0.0`), `PORT` (default `2222`).

## Deploy (Fly.io)

Vercel can't host a long-lived SSH listener, so the TUI runs on a tiny always-on box.

```bash
cd ssh
fly launch --no-deploy            # creates the app from fly.toml (don't deploy yet)
fly volume create term_data --size 1   # persists the SSH host key across deploys
fly deploy
```

This binds the app to public **port 22**. Then point DNS:

- Add an `A`/`AAAA` record for `ssh.amirshetaia.com` → the Fly app's IPs
  (`fly ips list`), **or** `fly certs`/`fly ips allocate` as needed.

Connect:

```bash
ssh ssh.amirshetaia.com
```

> Any cheap always-on host works (a $4 VPS, Railway, etc.) — just run the container and
> expose port 22 → 2222. The host key lives in `.ssh/` (mounted as a volume on Fly).

## Layout

| File | Purpose |
| --- | --- |
| `main.go` | `wish` SSH server + Bubble Tea handler |
| `model.go` | TUI state, update loop, layout/render |
| `views.go` | Per-section content rendering |
| `content.go` | Portfolio data (mirrors `../data/profile.ts`) |
| `styles.go` | Brand gradient, lipgloss styles, helpers |

Keep `content.go` in sync with the website's `data/profile.ts` and `data/games.json`.
