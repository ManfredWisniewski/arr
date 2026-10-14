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

### A07 Localization (D08–D12)

- `GET /de/<path>` and `GET /en/<path>` render the page in that locale;
  `<html lang>` follows the route; `GET /` redirects to `/de`.
- Localized fields (`title`, `content`, `meta.*`, media `alt`/`caption`,
  `structures.data`) return per-locale values; `slug`, `path`,
  `sourcePath`, `author`, `categories` stay identical across locales.
- Public reads never mix languages: an untranslated field is empty rather
  than German (`fallbackLocale: false`); draft preview may pass
  `fallbackLocale=de`.
- `de` can be `published` while `en` is still `draft` and vice versa
  (`localizeStatus`); `content-bot` still cannot publish in any locale.
- Page metadata carries `alternates.languages` (`de`, `en`, `x-default`)
  and a per-locale canonical; `/sitemap.xml` lists `/de/*` + `/en/*`
  variants.
- Feeds exist per locale (`/de/rss.xml`, `/en/atom.xml`, …) with matching
  `xml:lang`/`language`; `robots.txt` is locale-agnostic.
- `messages/de.json` and `messages/en.json` contain the same key set;
  UI chrome strings render in the route locale.
- REST: `GET /api/pages?locale=en&fallback-locale=none` returns `en`
  values; `PATCH …&locale=de` writes only the `de` variant.

## Not tested

- REST-level publish denial by the bot key — covered by the `beforeChange`
  guard; verify once against the live instance (field-level `_status` access
  remains the documented alternative).
