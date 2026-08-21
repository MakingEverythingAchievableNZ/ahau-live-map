<!-- Generated: 2026-08-21 | Files scanned: 1035 | Token estimate: ~700 -->
# Frontend

Both UIs are Vue 2 + Vuetify 2 SPAs using vue-apollo against their app's local GraphQL
server. `apps/ahau/ui` also builds for a Cordova mobile shell (`apps/ahau/mobile`).

## apps/ahau/ui (Vue 2, Vite)

Entry: `src/main.js` → mounts `App.vue`, installs plugins from `src/plugins/`
(`vue-apollo.js`, `vuetify.js`, `i18n.js`, `cordova-back-button.js`,
`cordova-nodejs-client.js`).

Routing: `src/router/index.js` (Vue Router, `history` mode) composes
`src/router/modules/views.js` (page routes) — `dialogs.js` module exists but is
currently commented out.

```
/login                          → views/Login.vue
/tribe                          → views/Discovery.vue
/tribe/:tribeId
  /community/:profileId         → views/ProfileShow.vue
    /person                     → views/PersonIndex.vue
    (shared sub-routes for whakapapa/archive/collection/story per profile)
```
Other top-level views: `WhakapapaIndex.vue`, `WhakapapaShow.vue`, `CollectionShow.vue`.

State: `src/store/` — Vuex, `index.js` + `root.mjs` compose modules from
`store/modules/*`: `alerts, analytics, archive, collection, community, credentials,
dialog, error, loading, notifications, pataka, person, profile, settings, story,
submissions, subtribe, table, tree, tribe, whakapapa`. `module.template.js` is the
scaffold for new modules.

Components (`src/components/`): domain-grouped dirs — `archive/, artefact/, community/,
csvImport/, dialog/, menu/, profile/, settings/, story/, submission/, table/, tree/,
wallet/, whakapapa/` — plus shared leaves (`Avatar.vue`, `AvatarGroup.vue`,
`SkeletonLoader.vue`, `Spinner.vue`, pickers).

Business logic lives outside components in `src/lib/*.mjs` (pure helpers, each with a
co-located `.test.mjs`): `person-helpers`, `date-helpers`, `csv`, `custom-field-helpers`,
`link-helpers`, `find-successor`, `svg-export`, `tribes-application-helpers`,
`artefact-helpers`, `story-helpers`, `community-helpers`, `calculate-age`, `colours`,
`constants`, `hyper-file-stream`. Cross-cutting Vue behavior in `src/mixins/`
(`artefact-mixins`, `profile-mixins`, `story-mixins`, `upload-file`, `upload-hyper-file`,
`vue-i18n-mixin`).

i18n: `src/translations/` — `en_NZ, en_US, es_ES, mi_NZ, nl_NL, pt_BR`, indexed via
`translations/index.mjs`; `crowdin.yml` at app root drives translation sync;
`scripts/check-hardcoded-translations.mjs` is a custom CI-style linter for missed
strings.

E2E: `apps/ahau/ui/e2e/login.spec.js` — Playwright scaffold (added 2026-08-21, single
login smoke test), config at `apps/ahau/ui/playwright.config.js`.

## apps/pataka/ui (Vue 2, webpack via vue.config.js)

Entry: `src/main.js`. Plugins: `plugins/vue-apollo.js`, `plugins/vuetify.js`.
Routing: `src/router.js` (flat, not a `modules/` split) → `views/Login.vue`,
`views/Dashboard.vue`, `views/PortFowarding.vue`.
State: `src/store/` with only `modules/analytics` (much smaller surface than ahau).
Components: flat under `src/components/` — `AppBar, AvatarEditDialog, AvatarGroup,
Avatar, DialogTitleBanner, Dialog, GenerateInviteDialog, ImagePicker, Meter,
NewNodeDialog, ProfileForm, SendInviteDialog, Snackbar, StorageGraph`.
Helpers: `src/lib/avatar-helpers.js`, `file-helpers.js`.
`src/schemaQuery.js` — local GraphQL schema introspection query used for Apollo setup.

## packages/ssb-pataka/ui (Vue 2, separate public "web registration form" app)

Not a duplicate of `apps/pataka/ui` despite sharing component names — a standalone
public-facing app for tribe registration, built and served from `ui/dist` by
`packages/ssb-pataka/plugins/web-registration.js` (static file server + HTTPS proxy,
gated behind `config.pataka.webRegistration`). Own router (`src/router.js`) and views:
`views/RegistrationIndex.vue`, `RegistrationNew.vue`, `RegistrationSuccess.vue`, plus
`components/RegistrationForm.vue`. See `packages/ssb-pataka/web-registration-form.md`
for local dev setup.

## Shared frontend package

`packages/ahau-graphql-client` — Apollo Client factory consumed by both `plugins/vue-apollo.js` files; centralizes upload-link/http-link/cache setup.
