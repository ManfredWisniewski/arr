# Changelog

Changes that ship in the Docker image — new or changed components,
templates, collections, config (`src/`, `next.config.ts`, `package.json`,
`Dockerfile`, …). Anything listed here goes live only after an image
rebuild + redeploy. Content, theme and structure pushes are not tracked.

Add entries under `## Unreleased`; move them into a dated section on
release.

## Unreleased

### Added

- Dev-only theme switcher: in `next dev`, all compiled biti theme variants
  (`arr`/`trurl`/`wit` × light/dark) are injected scoped to
  `[data-theme="<name>"]` and selectable via a fixed widget; the pushed
  `theme` global stays the default (`src/app/(frontend)/theme-variants.ts`,
  `theme-switcher.tsx`, `layout.tsx`)

### Fixed

- Code blocks render on the frontend: JSX converter for the `Code` block
  (`pre`/`code` + `data-language`) was missing
  (`src/app/(frontend)/[[...path]]/converters.tsx`)

### Changed

- `seed-admin` accepts `PAYLOAD_SEED_ADMIN_API_KEY` to provision an API
  key on the seeded user (used by local dev; optional for deployments)
  (`scripts/seed-admin.ts`)
- Header navigation supports `children` sub-items in the `navigation`
  structure doc; entries without `path` render as group labels
  (`src/app/(frontend)/layout.tsx`)
