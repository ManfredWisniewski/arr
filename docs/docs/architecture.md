---
sidebar_position: 3
---

# Architecture

## Shape

```text
content repos ──witcontent sync──► Payload REST API ──► Postgres (read model)
biti tokens ──theme push────────► theme global ───────► <head> CSS vars
                                                          │
image build: src/ + docs export ─► Docker image ─► GHCR ─► wit.docker_apps
                                                          │
                                    anonymous + editor requests
```

## Collections and globals

- **`pages`** — `title`, `slug`, `path` (unique route), `markdownRaw`,
  `content` (Lexical richText), `sourcePath` (idempotency key, unique),
  `sourceRepo`, `meta { title, description }`, `template`; drafts enabled.
- **`posts`** — blog content; drafts enabled.
- **`structures`** — generic site-layout documents (`name`, `data` JSON,
  `sourcePath`, `sourceRepo`); the `navigation` doc drives the header menu.
- **`media`** — uploads with `alt`, `caption`, `sourceHash` (sha256 dedup),
  `sourcePath`; named `imageSizes` per display context.
- **`users`** — API-key auth (`useAPIKey`) plus `role`
  (`editor` / `content-bot`).
- **`theme` global** — `cssLight`, `cssDark`,
  `meta { siteName, fontFamily }`; injected as CSS vars on `:root` and
  `[data-theme="dark"]`.

## Markdown → Lexical

The `pages` `beforeValidate` hook converts `markdownRaw` into `content`
server-side via `convertMarkdownToLexical`. Clients send plain markdown and
media placeholders only — never Lexical JSON.

- `## Title {#some-id}` → heading node with `id` (stable fragment links).
- `[text](url){target="_blank"}` → explicit link target, overriding the
  URL-based rule (D08).
- `[text](path){preview}` → `fields.preview` on the link node; the
  frontend wraps the link in a `RichTooltip` and resolves the preview
  server-side (`#fragment` → the `{#anchor}` heading's section, else the
  doc's meta description/post excerpt). `{preview="…"}` sets literal text.
- `![media:<docId>]()` → Lexical upload node referencing a media document.

## Frontend

`app/(frontend)/[[...path]]` renders published documents by `path`,
wrapped in a site shell (header with `theme.meta.siteName` + `navigation`,
`main`, footer). Components style **exclusively** via `var(--…)` theme
variables — no hard-coded values.

## Access model

| Actor | Reads | Writes | Publish |
|---|---|---|---|
| anonymous | published content, `/api/*`, `/docs` | — | — |
| `content-bot` (API key) | drafts | create/update drafts, media | denied — enforced server-side |
| `editor` (session) | everything | everything | allowed |

`/admin` sits behind Authentik forward-auth plus the Payload login.
