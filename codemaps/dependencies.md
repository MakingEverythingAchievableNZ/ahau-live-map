<!-- Generated: 2026-08-21 | Files scanned: 1035 | Token estimate: ~500 -->
# Dependencies

## Runtime platform

- **Electron** (`ahau/desktop` 26.4.1, `pataka` — same major line) — both apps ship as
  desktop binaries via `electron-builder`; `electron-updater` handles auto-update.
- **Cordova** — `apps/ahau/mobile` wraps the same `ui` build for Android/iOS; not an npm
  workspace member, has its own `node_modules`/lockfile.
- **Node** — version pinned via root `.nvmrc`.

## External SSB ecosystem packages (not vendored — ordinary npm deps)

`ssb-ahoy` (secret-stack + Electron bootstrapper), `ssb-db`, `ssb-query`,
`ssb-backlinks`, `ssb-conn`, `ssb-lan`, `ssb-replicate`, `ssb-friends`, `ssb-blobs`,
`ssb-serve-blobs`, `ssb-invite`, `ssb-tribes` (private groups, ahau only), `secret-stack`.
These stay external per README: "Genuine upstream dependencies ... stay external as
ordinary npm dependencies — nothing outside the Āhau ecosystem itself was vendored in."

## GraphQL stack

`@apollo/subgraph`, `@apollo/client` (frontend), `graphql-yoga` (server), `graphql-upload`
(file upload middleware), `express`, `cors`. `apollo-server-express`/`apollo-federation`
appear as legacy deps in places but the live server path is Yoga + `@apollo/subgraph`.

## Frontend stack

Vue 2 (`^2.6`–`^2.7` across packages — not yet unified), Vuetify 2, `vuetify-loader`,
`vuetify-media-player`, Vue Router (ahau: history mode; pataka: separate flat router),
Vuex. Bundlers: Vite (`apps/ahau/ui`), webpack via `vue.config.js` (`apps/pataka/ui`).
Testing: Vitest/Jest-style `.test.mjs` co-located with `src/lib` helpers; Playwright for
E2E (`apps/ahau/ui/e2e`, `playwright.config.js`) — new as of the 2026-08-21 commit.

## Third-party integrations

- **`@atala/apollo` / `@atala/prism-wallet-sdk`** (via `ssb-atala-prism`) — digital
  credential/wallet SDK, ahau-only. Pinned to `1.2.10` via root `package.json`
  `overrides` to fix "GraphQL server never starting" (see recent commit
  `a4f53d26c`). This dependency is also the cause of `dev:ahau`'s startup crash (see
  `architecture.md` known gaps) — the pin fixed server startup but the wallet SDK
  integration itself is still broken.
- **Crowdin** (`apps/ahau/crowdin.yml`) — translation management for `ui/src/translations`.
- **hyperdrive** — underlying storage engine for `artefact-store`/`ssb-hyper-blobs`.
- **`@tangle/*`** (e.g. `@tangle/overwrite`, `@tangle/simple-set`) — CRDT-style merge
  strategies consumed by `ssb-crut` specs.

## Shared internal packages (consumed by both apps)

`ahau-env` (env/config), `ahau-graphql-client` (Apollo Client factory),
`ahau-graphql-server` (GraphQL host), `ssb-crut`/`ssb-crut-authors` (data layer),
`graphql-custom-field`, `graphql-edtf` (EDTF — Extended Date/Time Format — GraphQL
scalar, used for uncertain/partial historical dates in whakapapa records).

## Known dependency risks

- `@atala/apollo` pin is a workaround, not a fix — the wallet SDK integration remains
  broken for `ahau` desktop.
- `apps/ahau/desktop`'s stale `ssb-ahau@^16.4.1` pin (vs. workspace `17.0.0`) is an
  unresolved version-drift risk with no test coverage to validate a bump.
- Vue version drift (`^2.6` vs `^2.7`) across packages/apps — not unified.
- `edtf` pinned to exact `4.4.2` in `apps/ahau/ui` (not a range) because newer versions'
  syntax breaks under Vite — fragile if bumped without re-verifying.
