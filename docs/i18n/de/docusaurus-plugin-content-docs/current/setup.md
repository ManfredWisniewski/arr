---
sidebar_position: 2
---

# Lokales Setup

## Voraussetzungen

- Node.js 20.9+ (CI und das Image nutzen Node 22)
- Docker Engine mit Compose (PostgreSQL für die lokale Entwicklung)
- Git-Submodules: `wit_pytools` und `biti` — nötig für
  Theme-/Content-Pushes; `+wit` liefert die gemeinsamen Specs und
  Konventionen

```sh
git submodule update --init --recursive
# oder pro Submodule: scripts/submodules.ps1 -Command pull
```

## Umgebung

```sh
cp .env.example .env
```

Setze ein langes, zufälliges `PAYLOAD_SECRET`. Datenbank-Zugangsdaten
und alle anderen Secrets sind vault-verwaltet und liegen nie im
Repository.

## Starten

```sh
docker compose up     # PostgreSQL
npm install
npm run dev           # Payload + Next.js Dev-Server
```

`npm run devsafe` löscht vorher `.next`, wenn sich der Dev-Server
querstellt.

## Änderungen verifizieren

```text
build:  npm run build           (Next.js standalone; Dockerfile baut das Image)
test:   npm run test:int        (vitest, braucht PostgreSQL via docker compose up)
        npm run test:e2e        (playwright)
        ./scripts/test-image.sh (Smoke-Test des Produktions-Images)
lint:   npm run lint && npx markdownlint-cli2 "**/*.md"
types:  npx payload generate:types && npx tsc
```

## An dieser Dokumentation arbeiten

Die Doku-Site liegt in `docs/` mit eigenem Dependency-Tree:

```sh
npm run docs:dev      # Docusaurus Dev-Server (Hot Reload)
npm run docs:build    # baut den statischen Export nach public/docs/
```

Der Export wird in Produktion von der App unter `/docs/` ausgeliefert —
siehe [Deployment](./deployment.md#doku-site).
