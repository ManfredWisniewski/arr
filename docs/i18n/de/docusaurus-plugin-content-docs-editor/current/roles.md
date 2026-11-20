---
sidebar_position: 4
---

# Rollen

## `editor`

Ein menschliches Konto. Kann:

- Entwürfe und veröffentlichte Inhalte sehen
- Entwürfe über das Banner und `/review` prüfen
- Dokumente veröffentlichen — die einzige Rolle, die eine Seite live
  setzen darf
- die `/admin`-Oberfläche vollständig nutzen

## `content-bot`

Ein Maschinenkonto (API-Schlüssel) der Synchronisations-Pipeline. Kann:

- **Entwürfe** und Medien anlegen und aktualisieren

Kann nicht:

- etwas veröffentlichen — Veröffentlichungsrechte sind serverseitig
  verweigert
- Dokumente löschen

## Anonyme Besucher

Sehen nur veröffentlichte Inhalte. Sie sehen niemals Entwürfe, das Banner,
`/review` oder irgendwelches Review-Markup.
