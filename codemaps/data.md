<!-- Generated: 2026-08-21 | Files scanned: 1035 | Token estimate: ~550 -->
# Data

No relational database. The system of record is an SSB (Secure Scuttlebutt) log: a
per-device, append-only, hash-linked, feed-based message log (`ssb-db`), replicated
peer-to-peer rather than migrated/schema-managed in the SQL sense.

## Storage layers

- **SSB log** (`ssb-db`) — append-only messages, each signed by the author's feed key.
  No UPDATE/DELETE; mutation is modeled as new messages linked via `ssb-crut`'s CRUT
  pattern (Create/Read/Update/**Tombstone** — tombstone replaces delete).
- **Indexes**: `ssb-backlinks` (reverse-reference index), `ssb-query` (JSON-based query
  over the log) — both read-side, rebuilt from the log rather than authoritative.
- **Blobs**: `ssb-blobs`/`ssb-serve-blobs` (content-addressed blob store, hash-keyed) for
  smaller attachments; `ssb-hyper-blobs` + `packages/artefact-store`
  (hyperdrive-based) for larger/streamed/encrypted artefacts, served over HTTP by
  `packages/artefact-server`.
- **Keys**: `packages/ssb-keyring` manages the feed keypair(s) per device.
- **Local app state**: browser/Electron-local only — Vuex store (frontend), not
  persisted server-side beyond what's cached by Apollo.

## Record shape (via ssb-crut)

Each domain type is declared as a spec: `{ type: '<domain>', props: { field:
TangleStrategy } }`, where a `TangleStrategy` (from `@tangle/*` packages, e.g.
`Overwrite()`, `SimpleSet()`) defines how concurrent edits to that field merge. Example
from `ssb-crut`'s README:

```js
const spec = {
  type: 'gathering',
  props: { title: Overwrite(), description: Overwrite(), attendees: SimpleSet() }
}
const crut = new Crut(ssb, spec)
crut.create({ title: '...', recps: ['%groupId.cloaked'] }, (err, id) => {})
```

`recps` (recipients) on create marks a record private/group-encrypted; omitting it
leaves the record public on the feed.

## Domain record types (one ssb-crut spec per plugin, roughly)

`profile` (person/tribe profiles — `ssb-profile`), `story` (`ssb-story`), `artefact`
(`ssb-artefact`), `whakapapa` (relationship links — `ssb-whakapapa`), `submissions`
(`ssb-submissions`), `settings` (`ssb-settings`), plus pataka-specific records in
`ssb-pataka`. `ssb-crut-authors` wraps the same pattern with author/permission checks
baked in for types that need author-scoped write access.

## Migrations

`packages/ssb-migrate` — handles log-format/plugin-version migrations for existing SSB
databases (not SQL schema migrations); run at plugin startup against a user's existing
log when the on-disk format is older than the plugin expects.

## Access control

`ssb-recps-guard` (mounted last in both apps' plugin chains) enforces that reads/writes
respect a message's `recps` — the primary privacy boundary in the system.
