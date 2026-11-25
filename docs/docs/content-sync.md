---
sidebar_position: 4
---

# Content sync contract

Content and theme are **pushed** into an instance via the REST API by
`witcontent` (`wit_pytools/payloadtools`). The database is a derived read
model — re-syncs are idempotent and the DB can always be rebuilt.

## Pages

`POST /api/pages?draft=true` with `markdownRaw` produces a draft whose
`content` is Lexical JSON — the markdown is converted server-side.

- `sourcePath` is the idempotency key and unique: re-syncing unchanged
  content is a no-op (`unchanged`).
- `## Title {#some-id}` produces a heading node with an `id` key; the
  frontend renders it as the element id. Headings without `{#id}` get
  none (explicit ids only — no slugger fallback).
- `[t](u){target="_blank|_self|_parent|_top"}` stamps `fields.target` on
  the link node and strips the markup; invalid values stay literal.
- `[t](u){preview}` / `{preview="…"}` stamps `fields.preview` (`true` or
  the literal text) for the frontend hover card; `{preview=}` and other
  malformed values stay literal.

## Media

`POST /api/media` deduplicates on `sourceHash` (sha256). In markdown,
`![media:<id>]()` becomes a Lexical upload node. Components never serve
`doc.url` directly — they resolve a named `imageSizes` variant via
`mediaUrl()`/`getMediaUrl()`.

## Theme

`PATCH /api/globals/theme` accepts `cssLight`/`cssDark` for `editor` and
`content-bot` users. The values are compiled from `biti/tokens` (Terrazzo
build) and injected on `:root` / `[data-theme="dark"]`.

## Structures

`structures` documents (`data` JSON synced from `<site>/+structure/*.yml`)
drive layout concerns like the `navigation` header menu.

## Publish gate

- `content-bot` cannot set `_status: 'published'` and cannot delete.
- Anonymous writes are denied; an `editor` publishes in `/admin` or via
  the frontend review flow (`/review`, draft banner).
- Admin edits to synced fields are overwritten on the next sync —
  acceptable because the DB is a read model.
