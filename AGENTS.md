# Instructions for AI agents

This repository is `arr`, the Payload CMS application for witconsult.de. Read `+wit/development/README.md`, `+wit/development/AGENTS.md` and `+intent/` before making changes.

## Rules

The shared rules in `+wit/AGENTS.md` apply. Additionally:

- The Payload database is a derived read model — never treat it as a source of truth; content and theme are pushed via the REST API.
- Do not store credentials, customer data, conversation logs or runtime state.
- `CHANGELOG.md` tracks changes that ship in the image (`src/`, config, schema). If a change requires an image rebuild + redeploy to go live, add an entry under `## Unreleased`.

## Commands

```text
build:  npm run build          (Next.js standalone; Dockerfile builds the image)
test:   npm run test:int       (vitest, needs PostgreSQL via docker compose up)
        npm run test:e2e       (playwright)
        ./scripts/test-image.sh (production image smoke test)
lint:   npm run lint && npx markdownlint-cli2 "**/*.md"
types:  npx payload generate:types
```
