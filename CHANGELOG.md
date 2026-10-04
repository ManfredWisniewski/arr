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
- `InfoText` molecule: icon left + text right callout line (`.info-text`
  contract class); `info` glyph added to the `Icon` registry
- `Toggle` molecule: on/off switch — checkbox input (`role="switch"`) +
  track/thumb markup (`.toggle*` contract classes), controlled or
  uncontrolled, form-compatible via `name`
- `Checkbox` molecule: native input + styled box with `Icon` check glyph
  (`.checkbox*` contract classes), controlled or uncontrolled,
  `name`/`value` for forms
- `IconBox` molecule: icon inside a box for visual emphasis
  (`.icon-box` + `.icon-box-soft`/`.icon-box-outline` variants)
- `Pill` molecule: tag/category element with optional icon and link
  variant (`.pill` contract class; `a.pill` hover state)
- `IconButton` molecule: `.btn` + icon/label composition
  (`.btn-icon` contract class), `iconPosition` left/right, same
  variant/href behavior as the `Button` atom
- `TextBlock` molecule: text arrangement — eyebrow label + heading +
  lead + body stack (`.text-block*` contract classes), optional
  `align="center"` for section intros
- `FormField` organism: label + `Input` + hint/error message
  (`.form-field*` contract classes), `aria-describedby`/`aria-invalid`
  wiring, required marker, error state wins over hint
- `ItemList`/`ListItem` organism: rich list entries — optional
  `IconBox` + title/description + trailing action slot
  (`.item-list`/`.list-item*` contract classes); `href` links the title
- `BadgeGroup` organism: labeled cluster of badge/pill items for tag
  clouds and category lists (`.badge-group*` contract classes);
  `items` prop renders `Pill`s, `children` slot for custom content
- `LeadSection` organism: multi-purpose intro block composing
  `BadgeGroup` + `TextBlock` + action buttons + optional media
  (`.lead-section*` contract classes), `align="center"` variant —
  for section intros, CTAs and content-level heroes
- `Tooltip` organism: CSS-only hover/focus reveal of a real
  `role="tooltip"` node (`.tooltip*` contract classes), top/bottom
  positioning, keyboard-reachable via `tabIndex`
- `Card`/`CardGrid` organism: feature cards (IconBox + title +
  description + link) in an auto-fit grid (`.card`/`.card-grid`
  contract classes)
- New templates in the registry: `showcase` (component gallery via the
  shared `ComponentShowcase`, also used by the dev `/components`
  route), `features` (LeadSection + CardGrid fed by the `features`
  structure doc), `contact` (TextBlock + demo form layout,
  `.contact-form` contract class)
- Full `integrate-atomic.md` catalog fill — new atoms: `Textarea`,
  `Select`, `Label` (required marker), `Avatar` (initials fallback,
  sm/lg), `Divider` (`<hr>`), `Spacer` (sm/md/lg), `Progress`
  (`<progress>`), `Spinner`, `Skeleton` (+ `lines`), `ColorSwatch`,
  `TypePreview`
- New molecules: `Radio`, `CheckboxGroup`/`RadioGroup` (fieldset +
  shared label/hint), `SearchField`, `InputGroup` (prefix/suffix
  addons), `ButtonGroup`, `TagInput` (Pills + Enter-add/×-remove +
  hidden input), `CardHeader`/`CardBody`/`CardFooter`/`CardMedia`
  (card sections), `MediaObject`, `Alert` (4 tones, dismissible),
  `Toast` (fixed, auto-dismiss), `Pagination`, `Breadcrumb`, `Tabs`
  (tablist/tab/tabpanel), `Accordion` (`<details>`), `Dropdown`
  (`<details>`), `UserMenu` (Avatar + name/role + Badge → Dropdown)
- New organisms: `DataTable`, `Sidebar` (grouped nav sections),
  `DashboardWidget`, `ChatBubble` (+ `actions` slot, `own` variant —
  also covers comment list item), `Drawer` (`<dialog>` right-anchored),
  `NotificationList`, `FilterBar` (SearchField + Selects +
  ButtonGroup), `OnboardingStep` (Progress + TextBlock + media +
  actions), `PricingCard`, `Timeline` (done/current/upcoming),
  `FormSection`, `LoginForm`
- All of the above are exercised in the shared `ComponentShowcase`
  (dev `/components` route + demo `showcase` template); every catalog
  row in `integrate-atomic.md` now maps to an implementation
- Three layout templates: `pricing` (LeadSection + PricingCard grid +
  FAQ Accordion, fed by the `pricing` structure doc), `dashboard`
  (TextBlock + FilterBar + DashboardWidget grid + DataTable +
  NotificationList + Timeline, fed by the `dashboard` structure doc),
  `docs` (Breadcrumb built from `page.path` + `.layout-sidebar` grid
  with the `navigation` structure in a Sidebar + Tabs around the
  markdown body + Pagination)

### Fixed

- Code blocks render on the frontend: JSX converter for the `Code` block
  (`pre`/`code` + `data-language`) was missing
  (`src/app/(frontend)/[[...path]]/converters.tsx`)

### Changed

- `Button` atom: `ghost` variant, `size="sm|lg"`, `loading` (spinner +
  no interaction) and `disabled` per the catalog spec
- `Modal` organism: `title` renders `.modal-header` (Heading + close),
  `actions` renders a `.modal-footer` ButtonGroup
- `Card` organism rebuilt on the card-section molecules; new `mediaSrc`/
  `mediaAlt` (product-card media header) and `badge` props
- `FormField`: renders through the `Label` atom; `as` prop selects the
  control (`input`/`textarea`/`select` + `options`), `control` slot
  overrides entirely
- `SiteFooter`: `links` prop renders a footer link nav; `ListItem`
  gains `meta`; `ChatBubble` gains `actions`
- `seed-admin` accepts `PAYLOAD_SEED_ADMIN_API_KEY` to provision an API
  key on the seeded user (used by local dev; optional for deployments)
  (`scripts/seed-admin.ts`)
- Header navigation supports `children` sub-items in the `navigation`
  structure doc; entries without `path` render as group labels
  (`src/app/(frontend)/layout.tsx`)
