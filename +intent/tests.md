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

## Not tested

- REST-level publish denial by the bot key — covered by the `beforeChange`
  guard; verify once against the live instance (field-level `_status` access
  remains the documented alternative).
