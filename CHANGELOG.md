# Changelog

Changes that ship in the Docker image — new or changed components,
templates, collections, config (`src/`, `next.config.ts`, `package.json`,
`Dockerfile`, …). Anything listed here goes live only after an image
rebuild + redeploy. Content, theme and structure pushes are not tracked.

Add entries under `## Unreleased`; move them into a dated section on
release.

## Unreleased

### Changed

- Header navigation supports `children` sub-items in the `navigation`
  structure doc; entries without `path` render as group labels
  (`src/app/(frontend)/layout.tsx`)
