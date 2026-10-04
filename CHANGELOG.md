# Changelog

Changes that ship in the Docker image — new or changed components,
templates, collections, config (`src/`, `next.config.ts`, `package.json`,
`Dockerfile`, …). Anything listed here goes live only after an image
rebuild + redeploy. Content, theme and structure pushes are not tracked.

Add entries under `## Unreleased`; move them into a dated section on
release.

## Unreleased

### Added

- Components reorganised by atomic design (`+wit/design` spec):
  `src/components/{atoms,molecules,organisms,templates}` — header/footer/
  hero/nav/figure extracted from `layout.tsx` + `src/templates/` (moved to
  `components/templates`)
- `ThemeToggle` atom: production light/dark select (system/light/dark,
  `arr.theme` storage key, pre-paint init script) per
  `+wit/design/design-tokens.md`
- Mobile navigation in `SiteHeader`: `.site-nav` collapses into a
  `<details>` menu (`.site-nav-toggle`) below the 48rem breakpoint;
  styles are new shell.css contract classes
- Dev-only theme switcher: in `next dev`, all compiled biti theme variants
  (`arr`/`trurl`/`wit` × light/dark) are injected scoped to
  `[data-theme="<name>"]` and selectable via a fixed widget; the pushed
  `theme` global stays the default (`src/app/(frontend)/theme-variants.ts`,
  `theme-switcher.tsx`, `layout.tsx`)
- New atoms (semantic-class wrappers, concepts from
  Senofy/next-atomic-design re-implemented in the arr contract):
  `Button` (.btn/.btn-primary/.btn-secondary, link variant), `Link`
  (internal next/link vs external anchor), `Img`, `Heading`/`Paragraph`/
  `Lead`/`Badge` (.badge), `Icon` (inline SVG registry: menu/close/
  external/check), `Input` (.input)
- New organism: `Modal` — `<dialog>`-based (focus trap, Esc, backdrop
  click), `.modal`/`.modal-close` contract classes
- Per-layer barrel exports (`components/*/index.ts`); organisms now
  compose atoms (`SiteHeader` menu icon, `PageHero`/`SiteLogo`/`Figure`
  via `Heading`/`Lead`/`Img`/`Link`)
- Dev-only `/components` showcase route — renders all components with
  fixture props under the pushed theme; `notFound()` in production
  (shadows a hypothetical content page at that path)

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
