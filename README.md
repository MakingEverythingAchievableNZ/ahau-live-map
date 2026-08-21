# Āhau, mapped

A snapshot of how [Āhau](https://ahau.io) — a peer-to-peer whakapapa (family tree) app —
is put together under the hood: 2 apps and ~34 shared packages in a single monorepo
(consolidated 19 August 2026 from 61 formerly-separate repositories), and how they
depend on each other. Captured 21 August 2026 from a codemap scan of the monorepo —
see `codemaps/`.

**Browse the map once Pages is enabled → `https://<your-username>.github.io/ahau-live-map/`**

## What's here

- **`index.html`** — a plain-language, card-based view for non-technical readers. Grouped
  by role (apps, domain plugins, core data & storage, GraphQL layer), each card has a
  short description and a "Learn more" button that opens the package's own README.
  Includes a step-by-step "how it works" flow diagram, a Scuttlebutt explainer, and the
  full architecture write-up in-browser.
- **`graph.html`** — the interactive technical dependency graph (Cytoscape.js), for
  exploring how the packages actually connect. Node border shows whether a package is
  shared, Āhau-only, or Pātaka-only.
- **`ARCHITECTURE.md`** — the full technical write-up: SSB concepts as used in this
  codebase, every cluster of packages, the request data-flow, and known risks.
- **`PLAIN-SUMMARY.md`** — the non-technical one-pager, no jargon, no package names.
- **`codemaps/`** — the source-of-truth codemap scan of the monorepo (architecture,
  backend, frontend, data, dependencies) that `ARCHITECTURE.md`, `PLAIN-SUMMARY.md`, and
  the data in `index.html`/`graph.html` are derived from. Regenerate this first when the
  monorepo changes, then update the derived files to match.
- **`readmes/`** — a plain-language rewrite of each package's own README (one file per
  package, path mirrors the monorepo id, e.g. `readmes/packages/ssb-crut.md`), shown in
  `index.html`'s "Learn more" modal.

Both HTML pages are fully self-contained (data and docs inlined, no server needed) — open
either one straight from disk in a browser, no build step required.

## Editing the map's data

- **Node/cluster/dependency data** (the cards, the dependency graph, colors, clusters):
  edit the `NODES`/`CLUSTERS` arrays in `scripts/build-data.js`, then run
  `node scripts/build-data.js`. It also re-inlines `ARCHITECTURE.md` and
  `PLAIN-SUMMARY.md` into both HTML pages, so edit those `.md` files directly for prose
  changes.
- **A "Learn more" README**: edit the relevant file under `readmes/`, then run
  `node scripts/sync-readmes.js` to bake it back into `index.html`.

Both scripts have no dependencies (plain Node `fs`), so no `npm install` is needed.

## Hosting

This repo is set up for GitHub Pages: **Settings → Pages → Deploy from a branch → main →
/(root)**. Once enabled, `index.html` serves at the repo's root URL.

## Status

This is a point-in-time snapshot, not a living system — nothing here auto-regenerates.
