---
sidebar_position: 3
---

# Architektur

## Form

```text
Content-Repos ──witcontent sync──► Payload REST API ──► Postgres (Read-Modell)
biti-Tokens ──theme push────────► theme global ───────► <head> CSS-Variablen
                                                           │
Image-Build: src/ + Docs-Export ─► Docker-Image ─► GHCR ─► wit.docker_apps
                                                           │
                                    anonyme + editor-Requests
```

## Collections und Globals

- **`pages`** — `title`, `slug`, `path` (eindeutige Route),
  `markdownRaw`, `content` (Lexical richText), `sourcePath`
  (Idempotenz-Schlüssel, eindeutig), `sourceRepo`,
  `meta { title, description }`, `template`; Entwürfe aktiviert.
- **`posts`** — Blog-Inhalte; Entwürfe aktiviert.
- **`structures`** — generische Site-Layout-Dokumente (`name`, `data`
  JSON, `sourcePath`, `sourceRepo`); das `navigation`-Dokument steuert
  das Header-Menü.
- **`media`** — Uploads mit `alt`, `caption`, `sourceHash`
  (sha256-Dedup), `sourcePath`; benannte `imageSizes` pro
  Anzeigekontext.
- **`users`** — API-Key-Auth (`useAPIKey`) plus `role`
  (`editor` / `content-bot`).
- **`theme` global** — `cssLight`, `cssDark`,
  `meta { siteName, fontFamily }`; als CSS-Variablen auf `:root` und
  `[data-theme="dark"]` injiziert.

## Markdown → Lexical

Der `beforeValidate`-Hook von `pages` konvertiert `markdownRaw`
serverseitig via `convertMarkdownToLexical` nach `content`. Clients
senden nur Markdown und Medien-Platzhalter — niemals Lexical-JSON.

- `## Title {#some-id}` → Heading-Node mit `id` (stabile
  Fragment-Links).
- `[text](url){target="_blank"}` → explizites Link-Target, überstimmt
  die URL-Regel (D08).
- `[text](pfad){preview}` → `fields.preview` am Link-Node; das Frontend
  hüllt den Link in ein `RichTooltip` und löst die Vorschau serverseitig
  auf (`#fragment` → die Sektion der `{#anchor}`-Überschrift, sonst die
  Meta-Description bzw. der Post-Excerpt). `{preview="…"}` setzt einen
  literalen Text.
- `![media:<docId>]()` → Lexical-Upload-Node mit Verweis auf ein
  Medien-Dokument.

## Frontend

`app/(frontend)/[[...path]]` rendert veröffentlichte Dokumente nach
`path`, eingebettet in eine Site-Shell (Header mit
`theme.meta.siteName` + `navigation`, `main`, Footer). Komponenten
stylen **ausschließlich** über `var(--…)`-Theme-Variablen — keine
hartcodierten Werte.

## Zugriffsmodell

| Akteur | Lesen | Schreiben | Veröffentlichen |
|---|---|---|---|
| anonym | veröffentlichte Inhalte, `/api/*`, `/docs` | — | — |
| `content-bot` (API-Key) | Entwürfe | Entwürfe anlegen/ändern, Medien | verweigert — serverseitig erzwungen |
| `editor` (Session) | alles | alles | erlaubt |

`/admin` liegt hinter Authentik-Forward-Auth plus dem Payload-Login.
