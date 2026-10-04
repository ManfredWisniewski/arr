# Changelog

Changes that ship in the Docker image — new or changed components,
templates, collections, config (`src/`, `next.config.ts`, `package.json`,
`Dockerfile`, …). Anything listed here goes live only after an image
rebuild + redeploy. Content, theme and structure pushes are not tracked.

Add entries under `## Unreleased`; move them into a dated section on
release.

## Unreleased

### Changed

- `seed-admin` accepts `PAYLOAD_SEED_ADMIN_API_KEY` to provision an API
  key on the seeded user (used by local dev; optional for deployments)
  (`scripts/seed-admin.ts`)
- Header navigation supports `children` sub-items in the `navigation`
  structure doc; entries without `path` render as group labels
  (`src/app/(frontend)/layout.tsx`)
