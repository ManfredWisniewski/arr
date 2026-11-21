---
sidebar_position: 2
---

# Local setup

## Requirements

- Node.js 20.9+ (CI and the image use Node 22)
- Docker Engine with Compose (PostgreSQL for local development)
- Git submodules: `wit_pytools` and `biti` — needed for theme/content
  pushes; `+wit` provides the shared specs and conventions

```sh
git submodule update --init --recursive
# or per-submodule: scripts/submodules.ps1 -Command pull
```

## Environment

```sh
cp .env.example .env
```

Set a long random `PAYLOAD_SECRET`. Database credentials and all other
secrets are vault-managed and never live in the repository.

## Run

```sh
docker compose up     # PostgreSQL
npm install
npm run dev           # Payload + Next.js dev server
```

`npm run devsafe` clears `.next` first when the dev server misbehaves.

## Verifying changes

```text
build:  npm run build           (Next.js standalone; Dockerfile builds the image)
test:   npm run test:int        (vitest, needs PostgreSQL via docker compose up)
        npm run test:e2e        (playwright)
        ./scripts/test-image.sh (production image smoke test)
lint:   npm run lint && npx markdownlint-cli2 "**/*.md"
types:  npx payload generate:types && npx tsc
```

## Working on this documentation

The docs site lives in `docs/` with its own dependency tree:

```sh
npm run docs:dev      # docusaurus dev server (hot reload)
npm run docs:build    # build the static export into public/docs/
```

The export is served by the app at `/docs/` in production — see
[Deployment](./deployment.md#docs-site).
