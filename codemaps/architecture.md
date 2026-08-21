<!-- Generated: 2026-08-21 | Files scanned: 1035 | Token estimate: ~750 -->
# Architecture

npm-workspaces monorepo. Two Electron apps (`ahau`, `pataka`) share ~34 packages: SSB
(Secure Scuttlebutt, a decentralized append-only-log db) plugins, a CRUT data layer, and
a federated GraphQL layer. Consolidated 2026-08-19 from 61 separate repos (see
`docs/adr/0001-consolidate-plugin-ecosystem-into-monorepo.md`).

## System diagram

```
┌─────────────────────────┐        ┌─────────────────────────┐
│   apps/ahau              │        │   apps/pataka            │
│   Electron desktop+mobile│        │   Electron "pub" server  │
│                          │        │                          │
│  ui/ (Vue 2 + Vuetify)   │        │  ui/ (Vue 2 + Vuetify)   │
│    Apollo Client ───┐    │        │    Apollo Client ───┐    │
│                     │    │        │                     │    │
│  desktop/main.js    │    │        │  main.js             │    │
│    ssb.plugins.js   │    │        │    ssb.plugins.js    │    │
│    ssb-ahoy (secret-│    │        │    ssb-ahoy          │    │
│     stack + electron)│   │        │                      │    │
│         │           │    │        │         │            │    │
│         ▼           │    │        │         ▼            │    │
│  ssb-server (SSB log)    │        │  ssb-server (SSB log)    │
│   + ssb-ahau plugin      │        │   + ssb-pataka plugin    │
│         │           │    │        │         │            │    │
│         ▼           │    │        │         ▼            │    │
│  ahau-graphql-server │◄──┘        │  ahau-graphql-server │◄──┘
│  (yoga/express, port  │           │  (yoga/express, port  │
│   from ahau-env)      │           │   from ahau-env)      │
└─────────────────────────┘        └─────────────────────────┘
         packages/*  (34 shared: ssb-*, @ssb-graphql/*, ssb-crut, artefact-*)
```

## Service boundaries

- **apps/ahau** — family-tree ("whakapapa") client. Sub-workspaces: `desktop` (Electron
  main process), `ui` (Vue 2 SPA, also built for `mobile` Cordova shell), `mobile`
  (Cordova, deliberately NOT an npm workspace — own lockfile/node_modules).
- **apps/pataka** — "pub"/hosting node for a tribe's data; own Electron `main.js` + `ui`.
- **packages/ssb-*** — SSB-server plugins: log-level read/write logic per domain
  (profile, story, artefact, whakapapa, submissions, settings, tribes-registration,
  hyper-blobs, keyring, migrate, split-publish, crut, crut-authors).
- **packages/@ssb-graphql/*** (`ssb-graphql-*` dirs) — GraphQL typeDefs/resolvers per
  domain, each wrapping the matching `ssb-*` plugin.
- **packages/ahau-graphql-server** — generic Express+GraphQL-Yoga host; combines
  per-domain subgraph schemas via `@apollo/subgraph`.
- **packages/ahau-graphql-client** — shared Apollo Client setup used by both `ui`s.
- **packages/ahau-env** — env/config resolution (ports, dev/prod flags) shared by both apps.
- **packages/artefact-store**, **artefact-server** — hyperdrive-based encrypted blob
  storage + HTTP serving, used by `ssb-artefact`.

## Data flow (per request)

```
Vue component → vue-apollo (Apollo Client) → HTTP :graphql-port
  → ahau-graphql-server (yoga) → @ssb-graphql/<domain> resolver
  → ssb-<domain> plugin method → ssb-crut (or direct ssb-db calls)
  → ssb-server muxrpc → local SSB log (append-only, feed-based)
```

Writes go through `ssb-crut`'s CRUT (Create/Read/Update/Tombstone) pattern onto
`tangle`-based SSB messages; reads are indexed via `ssb-backlinks`/`ssb-query`.
Private data uses `recps` (recipient list) + `ssb-tribes` group encryption.

## Known architectural gaps (see root README "Known, deliberately unresolved")

- `apps/ahau/desktop` pins `ssb-ahau@^16.4.1` (stale) instead of the migrated `17.0.0`
  workspace package — no test suite there to safely verify a bump yet. Causes
  `dev:ahau` to crash at launch via `ssb-atala-prism` → `@atala/prism-wallet-sdk`.
- `packages/ssb-pataka/ui` looked at first glance like a leftover duplicate of
  `apps/pataka/ui` (shares several component names) but is actually a distinct,
  purpose-built app: a public "web registration form" (views: `RegistrationIndex`,
  `RegistrationNew`, `RegistrationForm`, `RegistrationSuccess`), served as static files
  from `ui/dist` by `packages/ssb-pataka/plugins/web-registration.js` when
  `config.pataka.webRegistration` is set — separate from the admin dashboard in
  `apps/pataka/ui`. Confirmed live; not dead code.
- No CI/CD yet — this is a proof-of-concept migration, validated via local `npm test`
  per package plus bundler-only builds for the two apps.

See also: [`backend.md`](backend.md), [`frontend.md`](frontend.md),
[`data.md`](data.md), [`dependencies.md`](dependencies.md).
