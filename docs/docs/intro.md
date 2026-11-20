---
sidebar_position: 1
---

# arr — overview

`arr` is the Payload CMS application for witconsult.de: a site-agnostic
Next.js + Payload app built into a single Docker image, published to GHCR
and deployed per instance by the `wit.docker_apps` Ansible role. One image
serves N site instances — per-site styling and content are **data**, not
code.

## Core ideas

- **Site-agnostic image.** The image carries only schema, hooks, access
  rules, the shared block library and the health endpoint. Per-site
  differences arrive via the REST API.
- **Derived read model.** The Payload database is never a source of truth.
  Content lives in the content repositories, design tokens in `biti`; both
  are pushed into the instance and can be re-pushed at any time.
- **Human publish gate (D04).** All synced content arrives as draft. Only
  `editor` users may publish — enforced server-side, never by convention.
- **Docs-as-code.** This documentation is Markdown in the same repository,
  built into the image and served at `/docs` on every instance, so the
  docs always match the deployed version.

## Where things live

| Concern | Location |
|---|---|
| App code (collections, hooks, frontend) | `src/` |
| Content source of truth | the site content repositories (for example `obs-seo-witconsult`) |
| Design tokens / styling source | `biti/tokens` (Terrazzo → CSS) |
| Sync CLI (`witcontent`) | `wit_pytools/payloadtools` |
| Deployment | `wit.docker_apps` (Ansible) |
| This documentation | `docs/` — see [setup](./setup.md) to run it locally |

## Reading guide

- **Operators / developers** — start with [Local setup](./setup.md), then
  [Architecture](./architecture.md) and the
  [content-sync contract](./content-sync.md).
- **Editors** — see the [Editor documentation](/editor/).
- **Release notes** — in the [Blog](/blog).