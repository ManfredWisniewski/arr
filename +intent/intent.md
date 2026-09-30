# Intent: `arr`

## Purpose

`arr` is the application repository for the witconsult.de website: a
Payload CMS 3.x app on Next.js, built into a site-agnostic Docker image,
published to GHCR, and deployed per instance by `wit.docker_apps`. It
supersedes `github.com/ManfredWisniewski/docker-payload` as the app-code
repository.

Governing design document:
`+wit-wiki/plans/payload/2026-09-29_plan-payload-website.md`. Deployment
requirements: `wit.docker_apps/+intent/app-payload.md`.

State:

- the baseline app exists in `docker-payload` (Users + Media collections,
  Postgres adapter, `/api/health`, `seed-admin`, migrations, Dockerfile with
  UID 1000 and migration entrypoint, `publish-ghcr.sh`, image tests) and is to
  be moved or branched into this repo;
- the content sync tool is already implemented: `wit_pytools/payloadtools`
  (`witcontent` CLI, submodule) — it pushes markdown, media and theme CSS via
  the REST API;
- content lives in `obs-seo-witconsult` (content SSOT incl. `.arrcontent.yml`),
  design tokens in `wit-tokens` (style SSOT, to be created), deployment in
  `wit.docker_apps`.

Why: one site-agnostic image serves N instances. Per-site styling is data (a
`theme` global), content is data (the `pages` collection) — both pushed via the
REST API. The image carries only schema, hooks, access rules, the shared block
library and the health endpoint. The Payload database is a derived read model,
never a source of truth.

## Concepts

- **`pages` collection**: `title`, `slug`, `path` (unique route, e.g.
  `/online-marketing/seo-agentur`), `markdownRaw` (textarea), `content`
  (richText/Lexical), `sourcePath` (unique index, idempotency key),
  `sourceRepo`, `meta { title, description }`; `versions: { drafts: true }`.
- **Markdown → Lexical**: a `beforeValidate` hook converts `markdownRaw` into
  `content` via `convertMarkdownToLexical`; clients send plain markdown and
  media IDs only, no Lexical JSON.
- **`theme` global**: `cssLight`, `cssDark`, `meta { siteName, fontFamily }`;
  compiled CSS variables pushed via `PATCH /api/globals/theme` from `wit-tokens`
  builds; the frontend injects them on `:root` and `[data-theme="dark"]`.
  Read: public; update: `content-bot` + `editor`.
- **`content-bot`**: dedicated user with `useAPIKey` auth
  (`Authorization: users API-Key <key>`); create/update on `pages` + `media`;
  no delete; publishing denied — field-level access on `_status` (fallback:
  `beforeChange` hook, pending smoke test).
- **D04 review gate**: all synced content arrives as draft; a human publishes
  in `/admin`. Publish state is the only data the content repo does not own.
- **`users` collection**: `auth: { useAPIKey: true }`, `role` field
  (`editor` / `content-bot`).

## Scope

- In scope: the Payload app — collections (`pages`, `media`, `users`), the
  `theme` global, the markdown hook, access rules, the frontend route
  `app/(frontend)/[...path]` rendering Lexical + theme vars, the block library
  styled exclusively with `var(--…)`, `/api/health`, `seed-admin`, Dockerfile,
  GitHub Actions → GHCR.
- Out of scope: content and `.arrcontent.yml` (`obs-seo-witconsult`), token
  authoring (`wit-tokens`), Ansible deployment (`wit.docker_apps`), the sync
  CLI (`wit_pytools/payloadtools`).

## Software projects

### Configuration

- Env vars supplied by the role: `DATABASE_URI` (template) vs `DATABASE_URL`
  (app expectation) — drift to reconcile; pick one canonical name.
- `PAYLOAD_SECRET`, DB credentials, SMTP, seed admin: vault-managed env, never
  in the repo.
- Deployed compose template drift to reconcile:
  `payload_authentik_forwardauth_enabled` toggle, `node -e fetch` healthcheck —
  check whether the deployed version is newer than
  `wit.docker_apps/templates/payload-compose.yml.j2`.

### Main workflows

- Code change → PR → GitHub Actions → image in GHCR → pin tag+digest bump in
  `wit.docker_apps` → Ansible redeploy (`payload migrate` on container start,
  seconds of downtime).
- Content change → `witcontent sync` → `POST/PATCH /api/pages?draft=true` →
  human reviews and publishes in `/admin`.
- Theme change → `wit-tokens` build → `witcontent theme` →
  `PATCH /api/globals/theme` → frontend injects CSS vars.
- Style iteration: local `pnpm dev`; optional second instance
  (`staging-payload.*`) to preview images before bumping the prod pin.

### Data and file formats

- `media` collection: `upload: true`, `alt` (required), `caption`,
  `sourceHash` (sha256 dedup key), `sourcePath`.
- Media references in markdown use the `![media:<docId>]()` placeholder, which
  the hook converts into Lexical upload nodes.
- `sourcePath`/`sourceRepo` on every synced document identify the owning
  content-repo file; re-syncs are idempotent.

### Safety and preservation

- `content-bot` cannot set `_status: published` and cannot delete; anonymous
  writes denied. Publish enforcement is server-side, not by convention.
- `/admin` sits behind Authentik forward-auth plus Payload login; `/api/*` is
  publicly routed for anonymous reads.
- Synced collections are bot-owned; admin edits to synced fields are
  overwritten on the next run — acceptable because the DB is a read model.
- Container runs as UID 1000; no published host ports; Postgres private to the
  per-instance compose network.

## Tests and verification

- `GET /api/health` → 200 (required by the `wit.docker_apps` role).
- End-to-end smoke test: `witcontent sync` a `locked` webtext → draft at the
  correct `/a/b/slug` → markdown renders as Lexical in `/admin` → human
  publishes → frontend renders it styled by the `theme` global.
- Re-run is a no-op (`unchanged` on identical `sourcePath` content).
- `content-bot` cannot publish or delete; anonymous writes denied.
- Full acceptance criteria: plan file section "Acceptance criteria";
  `+intent/tests.md`.

## Non-goals and limitations

- No content in this repo; no per-site styling baked into the image.
- Per-site differences are limited to token-expressible styling (color,
  spacing, typography, radii); structural layout changes are image releases.
  Escape hatch (documented, not v1): a separate frontend app consuming the
  same image's headless API.
- Payload admin keeps default styling (v1).
- v1 uses system/web fonts; font-family tokens may later reference files
  served from Media.
- S3 media storage deferred (`@payloadcms/storage-s3`).

## Open items

- Import the `docker-payload` baseline into this repo; verify the working copy
  at `P:\tmp\agents\wit-obs-strategy-melkador\docker-payload` is current.
- Reconcile `DATABASE_URL`/`DATABASE_URI` and the compose-template drift.
- Smoke-test field-level access on `_status`; fall back to `beforeChange`.
- Content-side open questions (marker spec, meta mapping, WordPress URL
  inventory/redirects) are tracked in the plan's "Open questions".
- Unresolved decisions: `decisions.md`, section "Backlog".
