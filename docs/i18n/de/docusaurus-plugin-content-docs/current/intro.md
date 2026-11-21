---
sidebar_position: 1
---

# ARR — Überblick

`arr` ist die Payload-CMS-Anwendung für witconsult.de: eine
site-agnostische Next.js-+-Payload-App, die als einzelnes Docker-Image
gebaut, auf GHCR veröffentlicht und pro Instanz durch die Ansible-Rolle
`wit.docker_apps` deployt wird. Ein Image bedient N Site-Instanzen —
site-spezifisches Styling und Inhalte sind **Daten**, nicht Code.

## Kernideen

- **Site-agnostisches Image.** Das Image enthält nur Schema, Hooks,
  Zugriffsregeln, die gemeinsame Block-Bibliothek und den
  Health-Endpunkt. Site-spezifische Unterschiede kommen über die REST
  API.
- **Abgeleitetes Read-Modell.** Die Payload-Datenbank ist niemals die
  Quelle der Wahrheit. Inhalte leben in den Content-Repositories,
  Design-Tokens in `biti`; beides wird in die Instanz gepusht und kann
  jederzeit neu gepusht werden.
- **Menschlicher Publish-Gate (D04).** Alle synchronisierten Inhalte
  kommen als Entwurf an. Nur `editor`-Benutzer dürfen veröffentlichen —
  serverseitig erzwungen, niemals nur konventionell.
- **Docs-as-Code.** Diese Dokumentation ist Markdown im selben
  Repository, wird ins Image gebaut und auf jeder Instanz unter `/docs`
  ausgeliefert — die Doku passt damit immer zur deployten Version.

## Wo was liegt

| Thema | Ort |
|---|---|
| App-Code (Collections, Hooks, Frontend) | `src/` |
| Inhaltsquelle (Source of Truth) | die Site-Content-Repositories (z. B. `obs-seo-witconsult`) |
| Design-Tokens / Styling-Quelle | `biti/tokens` (Terrazzo → CSS) |
| Sync-CLI (`witcontent`) | `wit_pytools/payloadtools` |
| Deployment | `wit.docker_apps` (Ansible) |
| Diese Dokumentation | `docs/` — siehe [Setup](./setup.md) für den lokalen Betrieb |

## Leseführer

- **Betreiber / Entwickler** — beginne mit [Lokales Setup](./setup.md),
  dann [Architektur](./architecture.md) und den
  [Content-Sync-Vertrag](./content-sync.md).
- **Redakteure** — siehe die [Redaktions-Dokumentation](/editor/).
- **Release Notes** — im [Blog](/blog).
