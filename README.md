# Delta V — Website

Public site for **[Delta V](https://deltav.cc)**: sovereign AI engineering, Web3, and OpSec.

**Live (GitHub Pages):** [deltavgit.github.io/website-private](https://deltavgit.github.io/website-private/)  
**Repository:** [github.com/deltaVgit/website-private](https://github.com/deltaVgit/website-private)

> **Name note:** The GitHub repo and Pages project slug are still `website-private` for historical reasons. The product is **public** (MIT). A rename + `basePath` migration is planned when the site moves fully to the custom domain.

Open source under [MIT](./LICENSE). Third-party media credits: [ATTRIBUTION.md](./ATTRIBUTION.md).

---

## Stack

| Piece | Choice |
|--------|--------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fonts | Geist |
| Package manager | **pnpm 9** (only — see `packageManager` in `package.json`) |
| Deploy shape | **Static export** (`output: 'export'`) |
| Current base path | `/website-private` (GitHub Pages project site) |

No analytics. No third-party trackers. Security headers in [`_headers`](./_headers) for static hosts (e.g. Cloudflare Pages).

Deploy constants (`basePath`, public site URL) live in [`site.config.json`](./site.config.json) — use [`lib/site.ts`](./lib/site.ts) in app code and [`scripts/_site_config.py`](./scripts/_site_config.py) in Python.

---

## Quick start

**Requirements:** Node.js 20+, [pnpm](https://pnpm.io) 9, Python 3 for data/RSS scripts.

```bash
pnpm install
pnpm dev
```

Open:

```
http://localhost:3000/website-private/
```

> The app is configured with `basePath` from `site.config.json` (currently `/website-private`). Routes always include that prefix in local and production builds.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Copy data → generate IntelHub RSS → static export → basePath patch |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript (`tsc --noEmit`) |
| `pnpm check` | lint + typecheck |
| `git diff --check` | Whitespace check before commit |

---

## Project layout

```
app/                 App Router pages and route-local UI
  ai/ web3/ forge/ opsec/ tutorials/ blog/ intelhub/ contact/
  components/        Shared chrome (nav, heroes, cards, booking)
  data/              Content registry (content-index.ts)
components/          Shared reading layout (BlogPostLayout, TOC, progress)
lib/                 Shared TS helpers (site.ts deploy constants)
public/              Static assets, brand, images, JSON data, RSS feeds
scripts/             Data copy, RSS generation, basePath helpers (see scripts/README.md)
docs/                Ops notes (see docs/ops-crons.md for IntelHub Hermes crons)
workers/             Cloudflare Worker(s) — CORS proxy (see docs/proxy.md)
wrangler.toml        Worker deploy config (proxy.hub.deltav.cc)
site.config.json     basePath / siteUrl / repoUrl single source of truth
DESIGN_SYSTEM.md     Canonical visual and content conventions
_headers             Security headers for static hosting
```

### Highlights

- **Homepage / pillars** — AI, Web3, Forge, OpSec
- **SOTA Operator Stack** — `/opsec/sota-stack/` (DeFi treasury + key management blueprint)
- **Top-tier pointers** — Taurus (institutional custody), Opsek (HNW security)
- **Tutorials** — local AI stacks, optional x402 reference
- **IntelHub** — static data dashboards + feeds (how crons refresh JSON: [`docs/ops-crons.md`](./docs/ops-crons.md))

### Shared UI contracts

Reuse the existing shared components before adding page-specific markup:

- `PageShell` and `PageHero` for the common page background and pillar hero.
- `CapabilityCard` for homepage and Forge capability cards.
- `BlogPostLayout` for blog, tutorial and course reading pages.
- `BookingCalendar` for the contact booking flow.

The visual source of truth is [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). It defines
the color tokens, typography, spacing, card surfaces, accents and motion rules.
New pages should use those tokens and contracts instead of introducing one-off
backgrounds, opacity values or hover treatments.

### Content workflow

Blog posts and tutorials are route-based static pages. To add one:

1. Create a route under `app/blog/<slug>/` or `app/tutorials/<slug>/` (copy an existing page and adapt).
2. Register the page in [`app/data/content-index.ts`](./app/data/content-index.ts) — add a `ContentEntry` so listings, search, and nav filters can find it. Match existing `domain` / `type` / `format` enum values used by the indexes.
3. Follow `BlogPostLayout` structure and `DESIGN_SYSTEM.md` reading-page conventions.
4. Run `pnpm check` (or at least `pnpm lint` + `pnpm typecheck`) before committing.

The contact page uses a native date calendar and loads availability in the
selected-date modal. Provider failures fall back to the official Cal.com link;
no Cal.com secret is required in the browser bundle.

### Data and IntelHub

`public/data/` and `public/intelhub/feed/` are produced by the Python scripts under `scripts/` and are **also committed** so a plain clone builds without external workspaces.

| Mode | What happens |
|------|----------------|
| Clone-only | `copy-data.py` skips missing sibling paths; build uses committed snapshots |
| Full refresh | Optional workspaces (`wiki/signals`, `DeltaV-persistent-workspace/intel`) + `fetch-*` / ops scripts regenerate JSON |

Do not hand-edit generated JSON/RSS to fix UI. Prefer script regeneration. See [`scripts/README.md`](./scripts/README.md).

IntelHub client hooks may load some feeds via the production CORS proxy (`proxy.hub.deltav.cc`). See [`docs/proxy.md`](./docs/proxy.md).

---

## Configuration notes

- **Static only:** no server APIs in page routes; client fetches use the configured `basePath` for public JSON (via `lib/site.ts`).
- **Windows + Turbopack:** avoid multi-byte box-drawing characters in source comments (can crash the codeframe highlighter). Prefer ASCII in comments.
- **Install env:** do not mix WSL and Windows `pnpm install` on the same `node_modules` tree (permission / native binary issues). Use **pnpm only** — do not commit an npm `package-lock.json`.

Migrating off GitHub Pages to `deltav.cc` on Cloudflare: set `basePath` (and `siteUrl`) in `site.config.json` to the production values (often `basePath: ""`), then rebuild.

---

## Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the full guide (pnpm-only, required checks, content vs code).

Summary:

1. Fork or branch from `main`
2. Keep marketing copy changes intentional — prefer structure, a11y, and polish unless content is requested
3. Run `pnpm check` before opening a PR
4. Respect [ATTRIBUTION.md](./ATTRIBUTION.md) for third-party assets
5. Security reports: [SECURITY.md](./SECURITY.md)

Issues and PRs welcome. Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## License & credits

- **Code:** [MIT](./LICENSE) © 2026 Delta V  
- **Third-party assets:** [ATTRIBUTION.md](./ATTRIBUTION.md) — includes lotus GIF credit: [Aaron Rolston](https://www.aaronrolston.com/) for [Amaranth Foundation](https://amaranth.foundation/)

Contact: [contact@deltav.cc](mailto:contact@deltav.cc)
