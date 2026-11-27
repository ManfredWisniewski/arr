# Tests and acceptance criteria — `arr`

*Format per `+wit/development/tests.md`. Criteria are numbered `A01`, `A02`, ... and never renumbered.*

## Commands

```text
test:   npm run test:int && npm run test:e2e  (needs PostgreSQL; docker compose up)
        ./scripts/test-image.sh               (builds + boots the production image)
lint:   npm run lint && npx markdownlint-cli2 "**/*.md"
types:  npx payload generate:types && npx tsc
```

## Acceptance criteria

### A01 Repository structure

- `README.md`, `AGENTS.md`, `TASKS.md`, `+intent/{intent,decisions,tests}.md`, `.gitignore` and `.markdownlint-cli2.jsonc` exist at the root.
- The branches and submodules required by `+wit/common/conventions/repo-setup.md` exist.

### A02 Content sync contract

- `POST /api/pages?draft=true` with `markdownRaw` produces a draft whose
  `content` is Lexical JSON (markdown converted server-side).
- `## Title {#some-id}` in `markdownRaw` produces a heading node with an
  `id` key and the suffix stripped from its text; the frontend renders it
  as the element `id` (fragment links). Headings without `{#id}` get none.
- `[t](u){target="_blank|_self|_parent|_top"}` stamps `fields.target` on
  the link node and strips the markup; the frontend uses it over the
  URL-based target rule (D08). Invalid values stay literal.
- `[t](u){preview}` stamps `fields.preview: true` and `{preview="…"}` the
  literal string; the frontend renders the link inside a `RichTooltip`,
  resolving `true` server-side from the linked page/post (`#fragment` →
  the `{#anchor}` heading's section, else meta description/excerpt).
  Malformed values (`{preview=}`) stay literal.
- Re-sync of an unchanged `sourcePath` is a no-op; `sourcePath` is unique.
- `POST /api/media` deduplicates on `sourceHash`; `![media:<id>]()` in markdown
  becomes a Lexical upload node.
- `PATCH /api/globals/theme` accepts `cssLight`/`cssDark` for `editor` and
  `content-bot` users.

### A03 Publish gate (D04)

- `content-bot` cannot set `_status: 'published'` and cannot delete documents;
  anonymous writes are denied.
- An `editor` can publish via the admin UI.

### A04 Frontend

- `GET /` renders the published page whose `path` is `/`; unknown routes 404.
- The instance's `theme` CSS vars appear in `<head>`; components style
  exclusively via `var(--…)`.

### A05 Deployment contract

- `GET /api/health` returns 200; image runs as UID/GID 1000; the entrypoint
  runs `payload migrate`; `seed-admin.js` is idempotent (`test-image.sh`).

### A06 Media image sizes

- `Media.upload.imageSizes` defines a named variant for every display
  context (`logo`, `avatar`, `card`, `content`, `hero`); no render path
  serves `doc.url` directly — components resolve via `mediaUrl()` /
  `getMediaUrl()` with `/_next/image` then original as fallback.
- Adding a display context means adding an `imageSizes` entry plus a
  migration, not serving the original.

### A07 Consent gating (D12)

- With no gated service configured (no `tracking.google`): no consent
  banner, no `cc_cookie`, no third-party script in the SSR HTML.
- With `tracking.google` set and no prior consent: no gtag.js tag or
  request to `googletagmanager.com` is emitted.
- Accepting `analytics` in the banner injects gtag without reload; a
  fresh page load serves it directly (SSR reads `cc_cookie`).
- "Cookie-Einstellungen" in the footer reopens the preferences modal;
  deselecting `analytics` reloads the page and the tag cookies are gone.
- Banner renders the bundled German texts; the modal passes WCAG 2.2
  spot checks (focus trap, keyboard operability, contrast in light and
  dark theme).

### A08 Preview-confirm flow (spec `+wit/specs/arr/preview-confirm/`)

- An `editor` session sees the draft banner on any page/post whose latest
  version is a draft; publishing there promotes only that document — the
  next anonymous request serves the new published version with no banner.
- `/review` lists exactly the docs whose latest version is a draft across
  `pages`, `posts` and `structures`; publishing removes the entry.
- `POST` to the publish route without a session returns 401/403; with a
  `content-bot` key 403; anonymous page HTML contains no review markup.
- After confirming a document from the review flow the next pending
  document (or `/review` when none remain) is reached; outside that flow
  the published page itself is shown.
- A frontend publish fires the same `afterChange` effects as an admin
  publish (sitemap resubmit when `GSC_*` is configured).

### A09 Docs site served (spec `+wit/specs/arr/docusaurus/`)

- Anonymous `GET /docs/` returns the documentation site (HTTP 200) on a
  running instance; no authentication or session is required.

### A10 Docs content areas (spec `+wit/specs/arr/docusaurus/`)

- The docs site has three areas with seed content: developer/operator docs
  (setup, architecture, content-sync contract, deployment), editor docs
  (publish and `/review` flow, roles), and a blog with at least one post.

### A11 Docs search (spec `+wit/specs/arr/docusaurus/`)

- Searching a term that appears in a document returns that document with a
  working link; during browsing and searching no request leaves the
  instance (search index and all assets are self-hosted).

### A12 Docs i18n (spec `+wit/specs/arr/docusaurus/`)

- The site is available in English (default at `/docs/`) and German
  (`/docs/de/`); a page without a German translation falls back to English.

### A13 Docs versioning (spec `+wit/specs/arr/docusaurus/`)

- With at least one released docs version, the version selector lists every
  released version plus "Next"; a selected version shows only that
  snapshot's docs.

### A14 Docs quality gate (spec `+wit/specs/arr/docusaurus/`)

- A Vale style violation in an English doc source or a doc source that
  fails to build makes the CI docs check fail; a broken internal link fails
  the build (`onBrokenLinks`).

### A15 Docs-in-image version parity (spec `+wit/specs/arr/docusaurus/`)

- The `/docs` content of a deployed image corresponds to the repository
  state at that image's tag — docs are built inside the image build.

### A16 Docs theme (spec `+wit/specs/arr/docusaurus/`)

- The docs theme renders biti token branding in light and dark mode — no
  unbranded default values.

### A17 Plugin builds and boots (spec `+wit/specs/arr/plugin-template/`)

- `npm run build` succeeds with `pluginTemplate` registered in
  `plugins[]`; a booted instance answers `/api/health` and serves existing
  routes unchanged.

### A18 Plugin enabled flag (spec `+wit/specs/arr/plugin-template/`)

- With `enabled: false` the factory returns the incoming config
  unmodified; with `enabled: true` every incoming config key is preserved
  and a pre-existing `onInit` is invoked before the plugin's init code.

### A19 Plugin schema no-diff (spec `+wit/specs/arr/plugin-template/`)

- `payload generate:types` output and the collection schema are identical
  to the pre-plugin baseline — no additional collections, globals, fields,
  endpoints or migrations.

### A20 Plugin skeleton completeness (spec `+wit/specs/arr/plugin-template/`)

- The module under `src/plugins/plugin-template/` demonstrates all
  documented extension points (options typing, collection/global/hook
  extension, `onInit` chaining) such that copying it into a second plugin
  requires only renaming and registering.

### A21 Plugin changelog entry (spec `+wit/specs/arr/plugin-template/`)

- The merged change includes an `Unreleased` entry in `CHANGELOG.md`.

### A22 Job push contract (spec `+wit/specs/arr/jobs/`)

- A job pushed to `/api/jobs` is stored with `sourcePath` as upsert key and
  a unique `path`; a second push with the same `sourcePath` updates the
  same document; drafts are invisible to anonymous reads and appear after
  publish. (SC-001, SC-006)

### A23 Job list and filters (spec `+wit/specs/arr/jobs/`)

- The list route renders every published job with title, employment type,
  location and date; `q` plus the `category`/`employmentType`/`location`
  filters each narrow the result set; an empty result renders a defined
  empty state. (SC-002)

### A24 Job detail and JSON-LD (spec `+wit/specs/arr/jobs/`)

- A published job resolves at its `path` and renders every populated
  section; a draft route answers 404 anonymously; the page embeds
  schema.org `JobPosting` JSON-LD containing all populated fields and no
  empty keys. (SC-003)

### A25 Apply endpoint (spec `+wit/specs/arr/jobs/`)

- A valid multipart submission stores one application linked to the job,
  one attachment, and triggers one `payload.email` call to the job
  recipient; a filled honeypot stores nothing and returns success; missing
  fields or disallowed file types are rejected; a missing email adapter
  does not fail the request. (SC-004)

### A26 Repository verification (spec `+wit/specs/arr/jobs/`)

- `npm run build`, `npm run lint`, `generate:types` and the full
  `test:int` suite pass; `./scripts/test-vhost.sh` including the image
  smoke test is green. (SC-005)

### A27 Jobs lifecycle parity (spec `+wit/specs/arr/jobs/`)

- `jobs` behaves like posts for the pipeline: upsert on `sourcePath`,
  draft→publish lifecycle, sitemap-resubmit and preview hooks wired.
  (SC-006)

## Not tested

- REST-level publish denial by the bot key — covered by the `beforeChange`
  guard; verify once against the live instance (field-level `_status` access
  remains the documented alternative).
