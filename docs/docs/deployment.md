---
sidebar_position: 5
---

# Deployment

## Pipeline

```text
code change → PR → GitHub Actions (lint, typecheck, image build)
→ GHCR tag + digest → pin bump in wit.docker_apps → Ansible redeploy
→ container start runs payload migrate (seconds of downtime)
```

- The image is site-agnostic and multi-arch (`linux/amd64`,
  `linux/arm64`), built by `.github/workflows/build.yml` on `main` pushes
  and `v*` tags.
- The container runs as UID/GID 1000; the entrypoint runs
  `payload migrate` then `node server.js` (Next standalone).
- `GET /api/health` → 200 is the deployment contract required by the
  `wit.docker_apps` role.

## Environment

Per-instance environment is supplied by the Ansible role and vault-managed:
`DATABASE_URI`/`DATABASE_URL`, `PAYLOAD_SECRET`, DB credentials, SMTP,
seed admin — never in the repository. Optional `GSC_*` vars enable
sitemap resubmission after publishes (setup: `README_setup.md`).

## Docs site

This documentation is built during the image build (Docker `docs-builder`
stage) into `public/docs/` and served statically at `/docs/` on every
instance — content always matches the deployed version. To run it locally:
`npm run docs:dev`.

## Verification after deploy

```sh
./scripts/test-image.sh   # boots the production image, checks health + seed
```

Then confirm `https://<instance>/api/health` and `/docs/` return 200.
