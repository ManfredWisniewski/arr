---
sidebar_position: 5
---

# Deployment

## Pipeline

```text
Code-Änderung → PR → GitHub Actions (Lint, Typecheck, Image-Build)
→ GHCR-Tag + Digest → Pin-Bump in wit.docker_apps → Ansible-Redeploy
→ Containerstart führt payload migrate aus (Sekunden Downtime)
```

- Das Image ist site-agnostisch und Multi-Arch (`linux/amd64`,
  `linux/arm64`), gebaut von `.github/workflows/build.yml` bei
  `main`-Pushes und `v*`-Tags.
- Der Container läuft als UID/GID 1000; der Entrypoint führt
  `payload migrate` aus und dann `node server.js` (Next standalone).
- `GET /api/health` → 200 ist der Deployment-Vertrag, den die Rolle
  `wit.docker_apps` verlangt.

## Umgebung

Die Instanz-Umgebung kommt von der Ansible-Rolle und ist
vault-verwaltet: `DATABASE_URI`/`DATABASE_URL`, `PAYLOAD_SECRET`,
DB-Zugangsdaten, SMTP, Seed-Admin — niemals im Repository. Optionale
`GSC_*`-Variablen aktivieren die Sitemap-Neueinreichung nach
Veröffentlichungen (Setup: `README_setup.md`).

## Doku-Site

Diese Dokumentation wird beim Image-Build (Docker-`docs-builder`-Stage)
nach `public/docs/` gebaut und auf jeder Instanz statisch unter
`/docs/` ausgeliefert — Inhalt passt immer zur deployten Version.
Lokal starten: `npm run docs:dev`.

## Verifizierung nach dem Deploy

```sh
./scripts/test-image.sh   # startet das Produktions-Image, prüft Health + Seed
```

Danach prüfen, dass `https://<instanz>/api/health` und `/docs/` 200
liefern.
