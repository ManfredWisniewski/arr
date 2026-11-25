---
sidebar_position: 4
---

# Content-Sync-Vertrag

Inhalte und Theme werden von `witcontent`
(`wit_pytools/payloadtools`) über die REST API in eine Instanz
**gepusht**. Die Datenbank ist ein abgeleitetes Read-Modell — Syncs sind
idempotent und die DB kann jederzeit neu aufgebaut werden.

## Pages

`POST /api/pages?draft=true` mit `markdownRaw` erzeugt einen Entwurf,
dessen `content` Lexical-JSON ist — das Markdown wird serverseitig
konvertiert.

- `sourcePath` ist der Idempotenz-Schlüssel und eindeutig: ein
  erneuter Sync unveränderter Inhalte ist ein No-Op (`unchanged`).
- `## Title {#some-id}` erzeugt einen Heading-Node mit `id`; das
  Frontend rendert ihn als Element-ID. Überschriften ohne `{#id}`
  bekommen keine (nur explizite IDs — kein Slugger-Fallback).
- `[t](u){target="_blank|_self|_parent|_top"}` setzt `fields.target` am
  Link-Node und entfernt das Markup; ungültige Werte bleiben literal
  stehen.
- `[t](u){preview}` / `{preview="…"}` setzt `fields.preview` (`true` oder
  den literalen Text) für die Hover-Vorschau; `{preview=}` und andere
  fehlerhafte Werte bleiben literal stehen.

## Medien

`POST /api/media` dedupliziert über `sourceHash` (sha256). Im Markdown
wird `![media:<id>]()` zum Lexical-Upload-Node. Komponenten liefern
niemals `doc.url` direkt aus — sie lösen eine benannte
`imageSizes`-Variante über `mediaUrl()`/`getMediaUrl()` auf.

## Theme

`PATCH /api/globals/theme` akzeptiert `cssLight`/`cssDark` für
`editor`- und `content-bot`-Benutzer. Die Werte werden aus
`biti/tokens` kompiliert (Terrazzo-Build) und auf `:root` /
`[data-theme="dark"]` injiziert.

## Structures

`structures`-Dokumente (`data`-JSON, synchronisiert aus
`<site>/+structure/*.yml`) steuern Layout-Belange wie das
`navigation`-Header-Menü.

## Publish-Gate

- `content-bot` kann `_status: 'published'` nicht setzen und nichts
  löschen.
- Anonyme Schreibzugriffe werden verweigert; ein `editor`
  veröffentlicht in `/admin` oder über den Review-Flow im Frontend
  (`/review`, Draft-Banner).
- Admin-Änderungen an synchronisierten Feldern werden beim nächsten
  Sync überschrieben — akzeptabel, weil die DB ein Read-Modell ist.
