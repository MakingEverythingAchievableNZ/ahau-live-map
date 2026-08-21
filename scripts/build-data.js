#!/usr/bin/env node
// Regenerates the embedded DATA / ARCHITECTURE_MD / PLAIN_SUMMARY_MD constants in
// index.html and graph.html from a single source of truth (this file's NODES/
// CLUSTERS arrays) plus the root ARCHITECTURE.md and PLAIN-SUMMARY.md files.
//
//   node scripts/build-data.js
//
// Run scripts/sync-readmes.js separately afterwards to refresh index.html's
// README_MAP from readmes/**/*.md. No dependencies - plain Node fs only.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

const CLUSTERS = [
  {
    name: 'Apps',
    friendlyTitle: 'The apps people actually use',
    colorLight: '#2a78d6',
    colorDark: '#3987e5',
    shape: 'ellipse',
    plainSummary: "The actual apps people use — the family-tree app on a phone or computer, plus a helper service that keeps backups running even when you're offline.",
    technicalSummary: "The two shipped products: Āhau's Electron desktop app (also built for Cordova mobile) and Pātaka, an Electron 'pub' server. Both are thin shells over the shared packages/* workspace — an Electron main process that boots an ssb-server plugin chain, plus a Vue 2 SPA talking to that server's local GraphQL endpoint.",
  },
  {
    name: 'Domain SSB plugins',
    friendlyTitle: 'The parts that know what a family tree is',
    colorLight: '#1baf7a',
    colorDark: '#199e70',
    shape: 'diamond',
    plainSummary: "The parts of the system that know what a family tree, a person's profile, or a story actually is.",
    technicalSummary: 'secret-stack plugins that add domain-specific record types on top of ssb-crut — profiles, whakapapa relationship links, stories, artefacts, submissions, settings — plus two composition-root plugins (ssb-ahau, ssb-pataka) that each wire the full GraphQL layer for their app.',
  },
  {
    name: 'Core data & storage layer',
    friendlyTitle: 'The foundational plumbing',
    colorLight: '#eb6834',
    colorDark: '#d95926',
    shape: 'rectangle',
    plainSummary: 'The foundational plumbing that makes any kind of record-keeping possible on this peer-to-peer network — storing files, managing edit history, handling encryption keys, and enforcing who can see what.',
    technicalSummary: 'Generic, content-agnostic building blocks with no knowledge of whakapapa, profiles, or any Āhau-specific concept: the tangle-based CRUT framework (ssb-crut), blob storage (artefact-store/artefact-server, ssb-hyper-blobs), key handling, migrations, and the recps-based privacy enforcement point (ssb-recps-guard). Would be reusable in an unrelated SSB app.',
  },
  {
    name: 'GraphQL layer',
    friendlyTitle: 'The translation layer',
    colorLight: '#eda100',
    colorDark: '#c98500',
    shape: 'triangle',
    plainSummary: 'The translation layer that lets the app’s screens ask questions like "show me this person’s family tree" and get an answer back.',
    technicalSummary: 'Translates the domain plugins’ Node callback APIs into a GraphQL schema served over Apollo — one client library, one generic server host (ahau-graphql-server), and a resolver package per domain plugin, composing through ssb-graphql-main for shared identity/date/upload primitives.',
  },
];

// dependsOn lists only internal monorepo packages/apps (ids below) - external npm
// deps (ssb-db, ssb-tribes, @apollo/client, etc.) are described in prose, not edges.
const NODES = [
  // --- Apps ---
  {
    id: 'apps/ahau', label: 'Āhau', cluster: 'Apps',
    plainSummary: "The family-tree app whanau actually open on a phone or computer to record whakapapa, stories, and artefacts.",
    dependsOn: ['packages/ssb-ahau', 'packages/ssb-profile', 'packages/ssb-story', 'packages/ssb-artefact', 'packages/ssb-whakapapa', 'packages/ssb-submissions', 'packages/ssb-settings', 'packages/ssb-tribes-registration', 'packages/ssb-atala-prism', 'packages/ahau-graphql-client'],
  },
  {
    id: 'apps/pataka', label: 'Pātaka', cluster: 'Apps',
    plainSummary: "An always-on 'pub' server a tribe runs to keep backups and replication going even when personal devices are offline.",
    dependsOn: ['packages/ssb-pataka', 'packages/ssb-profile', 'packages/ssb-story', 'packages/ssb-artefact', 'packages/ssb-whakapapa', 'packages/ssb-submissions', 'packages/ssb-settings', 'packages/ahau-graphql-client'],
  },

  // --- Domain SSB plugins ---
  {
    id: 'packages/ssb-profile', label: 'ssb-profile', cluster: 'Domain SSB plugins',
    plainSummary: 'Knows what a person or tribe profile is — names, avatars, and basic identity records.',
    dependsOn: ['packages/ssb-crut'],
  },
  {
    id: 'packages/ssb-story', label: 'ssb-story', cluster: 'Domain SSB plugins',
    plainSummary: 'Stores the written, audio, and photo stories whanau attach to people, places, and events.',
    dependsOn: ['packages/ssb-crut'],
  },
  {
    id: 'packages/ssb-artefact', label: 'ssb-artefact', cluster: 'Domain SSB plugins',
    plainSummary: 'Stores artefacts — photos and documents attached to a person or story, backed by encrypted blob storage.',
    dependsOn: ['packages/ssb-crut', 'packages/ssb-hyper-blobs'],
  },
  {
    id: 'packages/ssb-whakapapa', label: 'ssb-whakapapa', cluster: 'Domain SSB plugins',
    plainSummary: 'The core of the family tree: records who is related to whom, and turns those links into a whakapapa you can explore.',
    dependsOn: ['packages/ssb-crut'],
  },
  {
    id: 'packages/ssb-submissions', label: 'ssb-submissions', cluster: 'Domain SSB plugins',
    plainSummary: "Handles content submitted for review before it's published to a tribe's record.",
    dependsOn: ['packages/ssb-crut'],
  },
  {
    id: 'packages/ssb-settings', label: 'ssb-settings', cluster: 'Domain SSB plugins',
    plainSummary: 'Per-tribe and per-person settings and preferences.',
    dependsOn: ['packages/ssb-crut'],
  },
  {
    id: 'packages/ssb-pataka', label: 'ssb-pataka', cluster: 'Domain SSB plugins', scope: 'pataka',
    plainSummary: "Pātaka-specific plugin: composes the plugin chain and GraphQL schema for the Pātaka server, plus its own record types and a standalone public registration form.",
    dependsOn: ['packages/ssb-graphql-profile', 'packages/ssb-graphql-story', 'packages/ssb-graphql-artefact', 'packages/ssb-graphql-whakapapa', 'packages/ssb-graphql-submissions', 'packages/ssb-graphql-invite', 'packages/ssb-graphql-pataka', 'packages/graphql-stats', 'packages/ssb-graphql-main', 'packages/ahau-graphql-server'],
  },
  {
    id: 'packages/ssb-tribes-registration', label: 'ssb-tribes-registration', cluster: 'Domain SSB plugins', scope: 'ahau',
    plainSummary: 'Handles the request-to-join flow for private tribes (groups) — Āhau app only.',
    dependsOn: [],
  },
  {
    id: 'packages/ssb-ahau', label: 'ssb-ahau', cluster: 'Domain SSB plugins', scope: 'ahau',
    plainSummary: "The composition-root plugin for the Āhau app: wires every domain plugin's GraphQL resolver into one schema and starts the GraphQL server.",
    dependsOn: ['packages/ssb-graphql-profile', 'packages/ssb-graphql-story', 'packages/ssb-graphql-artefact', 'packages/ssb-graphql-whakapapa', 'packages/ssb-graphql-invite', 'packages/ssb-graphql-submissions', 'packages/ssb-graphql-settings', 'packages/ssb-graphql-tribes', 'packages/ssb-graphql-main', 'packages/ahau-graphql-server', 'packages/ssb-atala-prism'],
  },
  {
    id: 'packages/ssb-atala-prism', label: 'ssb-atala-prism', cluster: 'Domain SSB plugins', scope: 'ahau',
    plainSummary: 'Wraps the Atala PRISM digital-wallet/credential SDK — Āhau-only, and currently broken at runtime despite a dependency pin that fixed a related server-startup crash.',
    dependsOn: [],
  },

  // --- Core data & storage layer ---
  {
    id: 'packages/ssb-crut', label: 'ssb-crut', cluster: 'Core data & storage layer',
    plainSummary: 'The generic Create/Read/Update/Tombstone framework every domain plugin builds its record type on — defines how concurrent edits to a field merge.',
    dependsOn: [],
  },
  {
    id: 'packages/ssb-crut-authors', label: 'ssb-crut-authors', cluster: 'Core data & storage layer',
    plainSummary: 'The same CRUT pattern with author/permission checks baked in, for record types that need author-scoped write access.',
    dependsOn: ['packages/ssb-crut'],
  },
  {
    id: 'packages/artefact-store', label: 'artefact-store', cluster: 'Core data & storage layer',
    plainSummary: 'Hyperdrive-based encrypted, streamed storage for larger artefact files.',
    dependsOn: [],
  },
  {
    id: 'packages/artefact-server', label: 'artefact-server', cluster: 'Core data & storage layer',
    plainSummary: "Serves artefact-store's contents over HTTP.",
    dependsOn: ['packages/artefact-store'],
  },
  {
    id: 'packages/ssb-hyper-blobs', label: 'ssb-hyper-blobs', cluster: 'Core data & storage layer',
    plainSummary: 'Hyperdrive-based blob plugin providing local HTTP serving for large files, on top of artefact-store.',
    dependsOn: ['packages/artefact-store'],
  },
  {
    id: 'packages/ssb-split-publish', label: 'ssb-split-publish', cluster: 'Core data & storage layer',
    plainSummary: "Splits oversized content across multiple SSB messages so it fits the log's per-message size limits.",
    dependsOn: [],
  },
  {
    id: 'packages/ssb-migrate', label: 'ssb-migrate', cluster: 'Core data & storage layer',
    plainSummary: "Runs log-format and plugin-version migrations against a user's existing SSB database at startup.",
    dependsOn: [],
  },
  {
    id: 'packages/ssb-keyring', label: 'ssb-keyring', cluster: 'Core data & storage layer',
    plainSummary: 'Manages the feed keypair(s) for each device.',
    dependsOn: [],
  },
  {
    id: 'packages/ssb-recps-guard', label: 'ssb-recps-guard', cluster: 'Core data & storage layer',
    plainSummary: "Mounted last in both apps' plugin chains — enforces that every read and write respects a message's recps (recipient list), the system's core privacy boundary.",
    dependsOn: [],
  },

  // --- GraphQL layer ---
  {
    id: 'packages/ssb-graphql-profile', label: 'ssb-graphql-profile', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for profiles — wraps ssb-profile.',
    dependsOn: ['packages/ssb-profile'],
  },
  {
    id: 'packages/ssb-graphql-story', label: 'ssb-graphql-story', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for stories — wraps ssb-story.',
    dependsOn: ['packages/ssb-story'],
  },
  {
    id: 'packages/ssb-graphql-artefact', label: 'ssb-graphql-artefact', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for artefacts — wraps ssb-artefact.',
    dependsOn: ['packages/ssb-artefact'],
  },
  {
    id: 'packages/ssb-graphql-whakapapa', label: 'ssb-graphql-whakapapa', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for whakapapa relationship links — wraps ssb-whakapapa, using the EDTF scalar for uncertain historical dates.',
    dependsOn: ['packages/ssb-whakapapa', 'packages/graphql-edtf'],
  },
  {
    id: 'packages/ssb-graphql-submissions', label: 'ssb-graphql-submissions', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for the submissions review flow — wraps ssb-submissions.',
    dependsOn: ['packages/ssb-submissions'],
  },
  {
    id: 'packages/ssb-graphql-settings', label: 'ssb-graphql-settings', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for settings — wraps ssb-settings.',
    dependsOn: ['packages/ssb-settings'],
  },
  {
    id: 'packages/ssb-graphql-invite', label: 'ssb-graphql-invite', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL typeDefs/resolvers for invites.',
    dependsOn: [],
  },
  {
    id: 'packages/ssb-graphql-tribes', label: 'ssb-graphql-tribes', cluster: 'GraphQL layer', scope: 'ahau',
    plainSummary: 'GraphQL typeDefs/resolvers for private tribes (groups) and the registration flow — Āhau only.',
    dependsOn: ['packages/ssb-tribes-registration'],
  },
  {
    id: 'packages/ssb-graphql-pataka', label: 'ssb-graphql-pataka', cluster: 'GraphQL layer', scope: 'pataka',
    plainSummary: 'GraphQL typeDefs/resolvers for Pātaka-specific record types — Pātaka only.',
    dependsOn: ['packages/ssb-pataka'],
  },
  {
    id: 'packages/graphql-stats', label: 'graphql-stats', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL resolvers exposing usage/storage stats.',
    dependsOn: [],
  },
  {
    id: 'packages/ssb-graphql-main', label: 'ssb-graphql-main', cluster: 'GraphQL layer',
    plainSummary: 'The root/main GraphQL schema — owns shared identity/date/upload primitives and loadContext, composed into both apps’ schemas.',
    dependsOn: [],
  },
  {
    id: 'packages/graphql-custom-field', label: 'graphql-custom-field', cluster: 'GraphQL layer',
    plainSummary: 'Shared GraphQL scalar/type for custom per-tribe fields.',
    dependsOn: [],
  },
  {
    id: 'packages/graphql-edtf', label: 'graphql-edtf', cluster: 'GraphQL layer',
    plainSummary: 'GraphQL scalar for EDTF (Extended Date/Time Format) — represents uncertain or partial historical dates in whakapapa records.',
    dependsOn: [],
  },
  {
    id: 'packages/ahau-graphql-server', label: 'ahau-graphql-server', cluster: 'GraphQL layer',
    plainSummary: 'The generic Express + GraphQL-Yoga host: combines per-domain subgraph schemas via @apollo/subgraph, handles file uploads and CORS.',
    dependsOn: [],
  },
  {
    id: 'packages/ahau-graphql-client', label: 'ahau-graphql-client', cluster: 'GraphQL layer',
    plainSummary: "Shared Apollo Client factory — centralizes upload-link/http-link/cache setup for both apps' vue-apollo plugin.",
    dependsOn: [],
  },
];

// --- Derived data ---
const nodeById = {};
NODES.forEach(n => { nodeById[n.id] = n; });

const usedByMap = {};
NODES.forEach(n => { usedByMap[n.id] = []; });
NODES.forEach(n => {
  n.dependsOn.forEach(depId => {
    if (!usedByMap[depId]) throw new Error(`Unknown dependency id "${depId}" referenced by "${n.id}"`);
    usedByMap[depId].push(n.id);
  });
});

function refList(ids) {
  return ids.map(id => ({ id, label: nodeById[id].label }));
}

// --- index.html DATA: clusters + nodes (dependsOn/usedBy as {id,label} refs) ---
const indexData = {
  clusters: CLUSTERS.map(({ name, friendlyTitle, colorLight, colorDark, plainSummary }) => ({ name, friendlyTitle, colorLight, colorDark, plainSummary })),
  nodes: NODES.map(n => ({
    id: n.id,
    label: n.label,
    cluster: n.cluster,
    plainSummary: n.plainSummary,
    hasSummary: true,
    hasReadme: true,
    dependsOn: refList(n.dependsOn),
    usedBy: refList(usedByMap[n.id]),
  })),
};

// --- graph.html DATA: clusters (+shape/technicalSummary) + nodes (+scope/degree) + edges ---
const edges = [];
NODES.forEach(n => { n.dependsOn.forEach(depId => edges.push({ source: n.id, target: depId, type: 'depends-on' })); });

const graphData = {
  clusters: CLUSTERS.map(({ name, colorLight, colorDark, shape, technicalSummary, plainSummary }) => ({ name, colorLight, colorDark, shape, technicalSummary, plainSummary })),
  nodes: NODES.map(n => ({
    id: n.id,
    label: n.label,
    cluster: n.cluster,
    scope: n.scope || 'both',
    description: n.plainSummary,
    inDegree: usedByMap[n.id].length,
    outDegree: n.dependsOn.length,
  })),
  edges,
};

// --- Read docs to inline ---
const architectureMd = fs.readFileSync(path.join(repoRoot, 'ARCHITECTURE.md'), 'utf8');
const plainSummaryMd = fs.readFileSync(path.join(repoRoot, 'PLAIN-SUMMARY.md'), 'utf8');

function replaceConst(html, constName, value, file) {
  const re = new RegExp(`const ${constName} = .*?;\\n`, 's');
  if (!re.test(html)) throw new Error(`Could not find "const ${constName} = ...;" in ${file}`);
  return html.replace(re, `const ${constName} = ${JSON.stringify(value)};\n`);
}

// --- index.html ---
const indexPath = path.join(repoRoot, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = replaceConst(indexHtml, 'DATA', indexData, 'index.html');
indexHtml = replaceConst(indexHtml, 'ARCHITECTURE_MD', architectureMd, 'index.html');
indexHtml = replaceConst(indexHtml, 'PLAIN_SUMMARY_MD', plainSummaryMd, 'index.html');
fs.writeFileSync(indexPath, indexHtml);

// --- graph.html ---
const graphPath = path.join(repoRoot, 'graph.html');
let graphHtml = fs.readFileSync(graphPath, 'utf8');
graphHtml = replaceConst(graphHtml, 'DATA', graphData, 'graph.html');
graphHtml = replaceConst(graphHtml, 'ARCHITECTURE_MD', architectureMd, 'graph.html');
fs.writeFileSync(graphPath, graphHtml);

console.log(`Synced ${NODES.length} nodes / ${edges.length} edges / ${CLUSTERS.length} clusters into index.html and graph.html.`);
console.log('Run scripts/sync-readmes.js next to refresh README_MAP from readmes/**/*.md.');
