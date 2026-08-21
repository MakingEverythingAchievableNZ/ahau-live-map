<!-- Generated: 2026-08-21 | Files scanned: 1035 | Token estimate: ~850 -->
# Backend

Two Electron main-process backends, each an `ssb-server` (via `ssb-ahoy`/`secret-stack`)
with a plugin list, plus a GraphQL API served alongside it. No REST routes — GraphQL is
the only API surface.

## Entry points

- `apps/ahau/desktop/main.js` → `ssb-ahoy(url, { config, plugins })` using
  `apps/ahau/desktop/ssb.plugins.js` and `ssb.config.js`. After start: `karakia()`
  (startup banner/log) then `startAtalaPrism(ssb)` (`atala-prism.js`, digital wallet).
- `apps/pataka/main.js` → same `ssb-ahoy` pattern with `apps/pataka/ssb.plugins.js`.

## SSB plugin chain (mounted in order, both apps)

```
ssb-db → ssb-query → ssb-backlinks → ssb-conn → ssb-lan → ssb-replicate → ssb-friends
  → ssb-blobs → ssb-serve-blobs → ssb-hyper-blobs → ssb-invite
  → [ahau only: ssb-tribes, ssb-tribes-registration]
  → ssb-profile → ssb-settings → ssb-story → ssb-artefact → ssb-whakapapa → ssb-submissions
  → [ahau: ssb-ahau, ssb-atala-prism] / [pataka: ssb-pataka]
  → ssb-recps-guard
```

`ssb-recps-guard` enforces private-data (`recps`) access control across all plugins.

## GraphQL wiring

- **ahau**: `packages/ssb-ahau/src/graphql/index.js` — `graphqlServer(ssb)` builds
  per-domain resolvers (`Main, Tribes, Profile, Artefact, Story, Whakapapa, Invite,
  Submissions, Settings, AtalaPrism` from `@ssb-graphql/*` + `ssb-atala-prism/graphql`,
  plus local `./author`, `./group-init`, `./backup`, `./stats`), then calls
  `ahau-graphql-server({ schemas, context, port })`. Port from `ssb.config.graphql.port`
  or `ahau-env`.
- **pataka**: `packages/ssb-pataka/plugins/graphql.js` — same pattern, resolvers:
  `Main, Profile, Artefact, Story, Whakapapa, Submissions, Invite, Pataka, Stats`.
- **Host**: `packages/ahau-graphql-server/index.js` — Express + `graphql-yoga`, mounts
  at `/graphql`, `graphql-upload` middleware (5MB/10-file cap), schema built via
  `@apollo/subgraph.buildSubgraphSchema(schemas)`. CORS is origin-checked against
  `allowedOrigins`, GraphiQL origin, and dev-server origin; strict in production.

## Key domain packages (plugin ↔ resolver ↔ GraphQL package)

| Domain | ssb-server plugin | GraphQL package |
|---|---|---|
| profile | `packages/ssb-profile` | `packages/ssb-graphql-profile` (`@ssb-graphql/profile`) |
| story | `packages/ssb-story` | `packages/ssb-graphql-story` |
| artefact | `packages/ssb-artefact` (uses `artefact-store`/`artefact-server`) | `packages/ssb-graphql-artefact` |
| whakapapa (relationships) | `packages/ssb-whakapapa` | `packages/ssb-graphql-whakapapa` |
| submissions | `packages/ssb-submissions` | `packages/ssb-graphql-submissions` |
| settings | `packages/ssb-settings` | `packages/ssb-graphql-settings` |
| invites | (ssb-invite, external) | `packages/ssb-graphql-invite` |
| tribes (private groups) | (ssb-tribes, external) + `ssb-tribes-registration` | `packages/ssb-graphql-tribes` |
| pataka-specific | `packages/ssb-pataka` | `packages/ssb-graphql-pataka` |
| stats | — | `packages/graphql-stats` (`@ssb-graphql/stats`) |
| main/root schema | — | `packages/ssb-graphql-main` (`@ssb-graphql/main`) — also owns `loadContext` |

## Core data-access packages

- `packages/ssb-crut` — generic CRUT (Create/Read/Update/Tombstone) minting for SSB
  record types; spec-driven (`{ type, props: { field: TangleStrategy } }`), used by most
  domain plugins to define their record shape.
- `packages/ssb-crut-authors` — `ssb-crut` + baked-in author/permission checks.
- `packages/artefact-store` — hyperdrive-based encrypted/streamed blob store.
- `packages/artefact-server` — serves `artefact-store` contents over HTTP.
- `packages/ssb-hyper-blobs` — hyperdrive blob plugin, local HTTP serving.
- `packages/ssb-split-publish` — splits oversized content across multiple SSB messages.
- `packages/ssb-migrate` — SSB database migrations.
- `packages/ssb-keyring` — key management.

## Notable pataka-only plugins (`packages/ssb-pataka/plugins/`)

`graphql.js` (above), `tribes-lite.js` (encryption-only tribes support, no full tribes
management), `web-registration.js` (registration flow), `logging.js`.

## Dev/build scripts

- `npm run dev:ahau` / `dev:pataka` (root) → `concurrently` runs `ui` dev server +
  backend (`wait-on` gates backend start on the ui port).
- `apps/*/bundle.mjs` — esbuild-based bundler producing `main.bundle.js` for Electron.
- CI-style checks live in `apps/ahau/scripts/ci-*.sh` (no actual CI wiring yet).
