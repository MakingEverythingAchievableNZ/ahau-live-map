# Āhau, mapped

A snapshot of how [Āhau](https://ahau.io) — a peer-to-peer whakapapa (family tree) app —
is put together under the hood: 61 repositories, how they depend on each other, and how
actively each one is maintained. Captured 20 August 2026.

**Browse the map once Pages is enabled → `https://<your-username>.github.io/ahau-live-map/`**

## What's here

- **`index.html`** — a plain-language, card-based view for non-technical readers. Grouped
  by role (apps, plumbing, translation layer, etc.), each card has a short description and
  a "Learn more" button that opens the repo's own README. Includes a Scuttlebutt explainer
  and the full architecture write-up in-browser.
- **`graph.html`** — the interactive technical dependency graph (Cytoscape.js), for
  exploring how the 61 repos actually connect.
- **`ARCHITECTURE.md`** — the full technical write-up: SSB concepts as used in this
  codebase, every cluster of repos, and the evidence behind its findings.
- **`PLAIN-SUMMARY.md`** — the non-technical one-pager, no jargon, no repo names.

Both HTML pages are fully self-contained (data and docs inlined, no server needed) — open
either one straight from disk in a browser, no build step required.

## Hosting

This repo is set up for GitHub Pages: **Settings → Pages → Deploy from a branch → main →
/(root)**. Once enabled, `index.html` serves at the repo's root URL.

## Status

This is a point-in-time snapshot, not a living system — nothing here auto-regenerates.
