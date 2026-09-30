# Tests and acceptance criteria — `arr`

*Format per `+wit-common/conventions/tests.md`. Criteria are numbered `A01`, `A02`, ... and never renumbered.*

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
- The branches and submodules required by `+wit-common/conventions/repo-setup.md` exist.

### A02 Content sync contract

- `POST /api/pages?draft=true` with `markdownRaw` produces a draft whose
  `content` is Lexical JSON (markdown converted server-side).
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

## Not tested

- REST-level publish denial by the bot key — covered by the `beforeChange`
  guard; verify once against the live instance (field-level `_status` access
  remains the documented alternative).
