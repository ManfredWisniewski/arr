# arr

The Payload CMS application for witconsult.de — a site-agnostic image deployed
through the `wit.docker_apps` Ansible role. Supersedes
`github.com/ManfredWisniewski/docker-payload` as the app-code repository.

Design: `+wit/plans/payload/2026-09-29_plan-payload-website.md` —
intent and boundaries: `+intent/intent.md`.

Before making changes, read the shared WIT development guidance in
`+wit/development/` in this repository. Start with
`+wit/development/README.md` and `+wit/development/AGENTS.md`,
then read the relevant convention or best-practice files. These shared
definitions apply independently of which skill or AI agent is performing the
work.

## AI folders

- `/+intent` — intent, decision records, test strategy
- `/+wit` — shared WIT knowledge base (conventions, templates, repo
  scripts); development guidance lives in `+wit/development/`

## What the app provides

- `pages` collection: `title`, `slug`, `path` (unique route), `markdownRaw`,
  `content` (Lexical richText), `sourcePath` (idempotency key), `sourceRepo`,
  `meta { title, description }`, `template` (renderer name, empty =
  default); drafts enabled.
- `media` collection: upload with `alt`, `caption`, `sourceHash` (sha256
  dedup), `sourcePath`.
- `users` collection: API-key auth (`useAPIKey`) plus a `role` field
  (`editor` / `content-bot`).
- `structures` collection: generic site-layout documents (`name`, `data`
  JSON, `sourcePath`, `sourceRepo`), synced from `<site>/+structure/*.yml` in
  the content repository; drafts enabled. The `navigation` doc drives the
  header menu (`data.items[*].{label, path}`).
- `theme` global: `cssLight`, `cssDark`, `meta { siteName, fontFamily }` —
  per-site styling as data, pushed via `POST /api/globals/theme`.
- markdown → Lexical: the `pages` `beforeValidate` hook converts `markdownRaw`
  server-side; clients send plain markdown and `![media:<id>]()` placeholders.
- D04 review gate: only `editor` may set `_status: 'published'`; the
  `content-bot` can create/update drafts but cannot publish or delete.
- Frontend: a site shell (header with `theme.meta.siteName` + `navigation`
  menu, `main`, footer) wraps `app/(frontend)/[[...path]]`, which renders
  published pages by route; `theme` CSS is injected into `<head>`.

## Requirements

- Docker Engine with Compose
- Node.js 20.9+ for local development, or Docker for the provided development
  workflow
- PostgreSQL for local development or deployment

## Local development

Create a local environment file and set a long random `PAYLOAD_SECRET`:

```sh
cp .env.example .env
```

Start Payload and PostgreSQL:

```sh
make dev            # or: docker compose up
```

`make dev` uses docker compose when Docker is installed; otherwise
`scripts/dev.ps1` sets up a local PostgreSQL via scoop (first run only)
and runs `npm run dev` natively — same `payload_test` credentials and
`DATABASE_URI` as the compose stack.

The local application is available at `http://127.0.0.1:3000`. The health
endpoint is `http://127.0.0.1:3000/api/health`.

On the native path, `make dev` also migrates the schema and seeds a
dev-only user — admin login `local@test.com` / `notapassword` with a
pre-provisioned API key. `make push-local` pushes theme, site config and
content to the local instance and defaults to that seeded key; set
`$env:PAYLOAD_API_KEY` to override.

For design testing, `make demo` pushes the mockup site in
`../obs-seo-witconsult/demo` (all templates + element showcase) instead.
In dev mode a theme switcher (bottom right) toggles between all compiled
biti theme variants — arr/trurl/wit × light/dark — without repushing.

## Production image

The Dockerfile builds a standalone Next.js image from
`node:22.17.0-bookworm-slim`. Debian slim is used instead of Alpine because the
target Docker host cannot load the Alpine Sharp native dependency. The image
runs as UID/GID `1000:1000`, runs Payload migrations through the image
entrypoint before startup, exposes port `3000`, and includes the Payload
configuration and seed script required by the Ansible integration.

Build locally:

```sh
docker build -t arr:test .
```

The deployment image must be published to GHCR with an immutable tag and
digest. Configure the resulting repository, tag, and digest as
`payload_image_repository`, `payload_image_tag`, and `payload_image_digest` in
the Ansible host variables.

## Image tests

Run the Docker image smoke tests before publishing or deploying:

```sh
./scripts/test-image.sh
```

The test builds the production image from the Dockerfile, starts it with
PostgreSQL, verifies that the runtime uses UID/GID 1000, runs the bundled
migrations, checks `/api/health`, and runs the bundled admin seed command
twice to verify idempotence. The temporary Compose stack and PostgreSQL volume
are removed automatically when the test exits.

Use a different local port if port `3011` is already in use:

```sh
PAYLOAD_TEST_PORT=3012 ./scripts/test-image.sh
```

## Publish to GHCR

GitHub Actions (`.github/workflows/build.yml`) builds and pushes the image to
`ghcr.io/manfredwisniewski/arr` on pushes to `main` (`sha-<commit>` tag) and
`v*` tags. Update `payload_image_repository` in the Ansible host vars
accordingly. To publish manually, `scripts/publish-ghcr.sh` builds the image, runs
`scripts/test-image.sh` first, reads the GitHub token without echoing it,
publishes only after the tests pass, and records Ansible-ready values in
`image-digest.yml`:

```sh
./scripts/publish-ghcr.sh test-20260928-1400
```

Use the recorded `sha256:` digest in the Ansible host variables. Do not use
`latest`:

```yaml
payload_image_repository: "ghcr.io/manfredwisniewski/arr"
payload_image_tag: "sha-<commit>"
payload_image_digest: "sha256:<64-hex-character-digest>"
```

The `arr` package is public, so the Docker host pulls anonymously and
`payload_instance_secrets` needs no `registry_username`/`registry_token`. If
the package is ever made private, add those two vault values (a GitHub
username plus a `read:packages` token) and the role logs in before pulling.

## Application contract

The Ansible integration expects:

- `GET /api/health` to return HTTP 200 JSON;
- PostgreSQL through `DATABASE_URI` (`DATABASE_URL` still accepted as a
  fallback);
- media storage at `/app/media`;
- image uploads without Sharp-based resizing on the current test host;
- `seed-admin.js` to create the first admin idempotently;
- `PAYLOAD_SEED_ADMIN_EMAIL` and `PAYLOAD_SEED_ADMIN_PASSWORD` for the seed
  command (`PAYLOAD_SEED_ADMIN_API_KEY` optionally sets an API key); and
- `PAYLOAD_SECRET` to be supplied through the Ansible vault; and
- `PREVIEW_SECRET` for the admin draft-preview link, also through the vault.

The content sync contract (fields, endpoints, draft-only writes) is documented
in `wit_pytools/payloadtools/+intent/INTENT.md`; the content repository holds
`.arrcontent.yml` with the mapping rules.

Do not commit `.env`, generated secrets, image credentials, or production
database credentials.
