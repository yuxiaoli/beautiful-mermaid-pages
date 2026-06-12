# Beautiful Mermaid Renderer

A **fully client-side**, static web app that renders [Mermaid](https://mermaid.js.org/) diagrams to SVG in the browser using [`beautiful-mermaid`](https://www.npmjs.com/package/beautiful-mermaid). Paste Mermaid code, see a live SVG preview, switch themes, export, and share — all with **no backend, no server runtime, no database, and no external rendering API**.

Built with **Vue 3 + Vite + TypeScript** and deployable to **GitHub Pages** as static files only.

## Why `beautiful-mermaid`?

`beautiful-mermaid` renders Mermaid source directly to an SVG string **in TypeScript**, with zero DOM dependencies. Its `renderMermaidSVG` function is fully synchronous and runs entirely in the browser, so there is no need for a headless browser, a Node.js server, the Mermaid CLI, or any rendering API. That makes it a perfect fit for a static, GitHub Pages–hosted app: the entire render pipeline ships to the client.

## Features

- **Editor** — code panel with a built-in sample diagram, auto-render on input (debounced), and clear render errors.
- **SVG preview** — rendered via `renderMermaidSVG`, **sanitized with DOMPurify** before `v-html` injection, with pan (drag) and zoom (scroll).
- **Export** — Copy SVG, Download SVG, Copy source, Download `.mmd` source.
- **Themes** — light, dark, neutral, and colorful themes via `beautiful-mermaid`'s `THEMES`.
- **Persistence & sharing** — last diagram saved in `localStorage`; diagram source encoded into `location.hash`; **Copy share link** button. On load, hash content is preferred over `localStorage`.
- **Responsive UX** — editor/preview split on desktop, stacked on mobile.

## Getting started

Requirements: Node.js 18+ and npm.

```bash
npm install      # install dependencies
npm run dev      # start local dev server (http://localhost:5173)
npm run build    # type-check + produce static site in dist/
npm run preview  # preview the production build locally
```

- Editing Mermaid code updates the SVG preview automatically.
- Invalid Mermaid shows a readable error instead of crashing.
- Reloading restores the last diagram; opening a shared hash URL renders that diagram.

## Render-only endpoint

The app exposes a minimal, editor-less **render-only view** intended for embedding or sharing a fixed diagram. It shows just the rendered SVG plus copy buttons (**Copy SVG**, **Copy source**, **Download SVG**).

Activate it with the `view=render` query param. The Mermaid source is passed as **JSON** in the `data` param, and the theme via an optional `theme` param:

```
?view=render&data=<url-encoded JSON>&theme=<theme-id>
```

- **`data`** — JSON, either:
  - a string, used directly as the Mermaid source, e.g. `data="graph TD\n  A-->B"` (JSON-encoded), or
  - an object: `{"source": "graph TD\n  A-->B", "theme": "dracula"}` (`code` is accepted as an alias for `source`).
- **`theme`** — a theme id (e.g. `github-light`, `github-dark`, `nord`, `dracula`, `tokyo-night`, `catppuccin-mocha`, `solarized-light`). A top-level `theme` param overrides any theme inside `data`.

> **Mermaid syntax note:** `beautiful-mermaid` requires the diagram header (e.g. `graph TD`, `flowchart LR`, `stateDiagram-v2`) to be on its **own line**. The single-line form `graph TD; A-->B` is **not** supported — separate statements with newlines instead.

Example (string form, URL-encoded — note the encoded newline `%5Cn`):

```
https://<user>.github.io/<repo>/?view=render&data=%22graph%20TD%5Cn%20%20A--%3EB%22&theme=dracula
```

The easiest way to generate a valid link is the **Copy render link** button in the editor header, which encodes the current source and theme for you. Because everything is parsed client-side from the query string, this works on static GitHub Pages hosting with no server.

## Deploying to GitHub Pages

This repo ships a GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that builds with `npm ci && npm run build` and publishes the static `dist/` output.

1. Push this project to a GitHub repository (e.g. `beautiful-mermaid-pages`).
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually via **Actions → Deploy to GitHub Pages → Run workflow**).
4. The site will be available at `https://<your-user>.github.io/<repo-name>/`.

### How the base path works

GitHub project pages are served from a subpath (`/<repo-name>/`). The workflow passes the repository name to the build as the `BASE_PATH` environment variable, which [`vite.config.ts`](vite.config.ts) uses for Vite's `base` option so assets resolve correctly. For local development `base` defaults to `/`.

If you deploy to a **user/organization page** (`<user>.github.io`) or a custom domain at the root, no base path is needed — the default `/` is correct.

## Project notes

- Composition API + strict TypeScript throughout.
- No Mermaid CLI, no Playwright/Puppeteer, no Node.js server, no D2, no paid APIs.
- Output is static files only — host it anywhere that serves static assets.

## License

MIT
