# Changelog

Changes that ship in the Docker image — new or changed components,
templates, collections, config (`src/`, `next.config.ts`, `package.json`,
`Dockerfile`, …). Anything listed here goes live only after an image
rebuild + redeploy. Content, theme and structure pushes are not tracked.

Add entries under `## Unreleased`; move them into a dated section on
release.

## Unreleased

### Added

- Internationalization, German (default) + English: Payload field-level
  localization (`de`/`en`, `localized: true` on editorial fields of
  `pages`, `posts`, `media` and `structures.data`;
  ids/slugs/paths/dates stay shared), experimental per-locale publish
  status (`experimental.localizeStatus` + `versions.drafts.localizeStatus`),
  admin UI in German and English. Frontend routes moved under
  `app/(frontend)/[lang]` with `next-intl` middleware — every public URL
  carries an explicit `/de` or `/en` prefix (`/` redirects to `/de`) and
  the route locale is passed to every Payload read. Public reads use
  `fallbackLocale: false` (no mixed-language pages); draft previews fall
  back to `de`. UI strings come from `messages/{de,en}.json`; internal
  links are locale-prefixed by the `Link` atom. Per-locale feeds
  (`/de/rss.xml`, `/en/rss.xml`, …) and `sitemap.xml` (per-locale URLs
  with `hreflang` alternates + `x-default`), canonical/hreflang metadata
  on every page. Migration `20261013_211826_i18n` copies existing rows
  into the `de` locale tables before dropping the old columns. See
  `+intent/decisions.md` D08–D11.
- Visitor chat widget: `ChatWidget` client component
  (`app/(frontend)/[lang]/chat-widget.tsx`) rendered by the frontend
  layout when `CHAT_WEBHOOK_URL` is set — fixed bubble → panel, AI
  disclosure shown before first input, `sessionId` persisted in
  `localStorage`. Posts to the new same-origin `POST /api/chat` route
  (`app/(frontend)/api/chat/route.ts`), which validates input, rate-limits
  per session+IP (20/h) and proxies to the n8n chat webhook with
  `Authorization: Bearer ${CHAT_WEBHOOK_SECRET}` — webhook URL and secret
  never reach the browser. Labels via `CHAT_TITLE`, `CHAT_GREETING`,
  `CHAT_DISCLOSURE`. Plan:
  `+wit/development/plans/chat/2026-10-13_plan-website-chat-claudia.md`.
- SEO plumbing: `/robots.txt` (`app/(frontend)/robots.ts` — allows all,
  disallows `/admin`, `/api`, `/preview`, advertises the sitemap),
  `/sitemap.xml` (`app/(frontend)/sitemap.ts` — published `pages` +
  `posts` plus `/blog` author/category/tag archives) and blog feeds —
  RSS 2.0 at `/rss.xml`, `/feed`, `/index.xml`, Atom at `/atom.xml`
  (`src/lib/feed.ts`). The instance base URL resolves per request from
  `SITE_URL` or the proxy's `x-forwarded-*` headers (`src/lib/site.ts`),
  so no domain is baked into the image.

- `posts` collection (`src/collections/Posts.ts`): blog posts synced from
  `<site>/blog/<agent>/*_webtext*.md` via a new `collections` glob map in
  `.arrcontent.yml` (`wit_pytools/payloadtools`). Front matter adds
  `author` (defaults to the `blog/<agent>/` segment), `date`
  (`publishedAt`), `categories`, `tags`, `excerpt` and `cover`
  (sha256-deduped media doc). Same draft review gate, markdown hook and
  access rules as `pages`; `markdownToContent` now resolves the content
  field from the request collection.
- `/blog` frontend routes: index (`blog/page.tsx`, optional intro from a
  `pages` doc at `/blog`), author view `blog/[author]` (profile from the
  `structures` doc `agents`), single post `blog/[author]/[post]`, and
  taxonomy archives `blog/kategorie/[category]` + `blog/tag/[tag]`
  (labels from the optional `structures` doc `taxonomies`). Pagination
  via `?page=N`; `jsxConverters` moved to `src/lib/jsx-converters.tsx`
  for reuse. New `AuthorLine` molecule, `PostList`/`postToCardItem`
  organism built on `CardGrid`.
- `witSpace` rich-text block on the pages editor
  (`src/blocks/wit-space.ts`): markdown tag syntax
  `<witSpace size="600" maxTilt="15" depth="90" />` via `jsx`
  import/export, rendered by the new `WitSpace` organism
  (`src/components/organisms/wit-space.tsx` — the wit logo extruded
  into a pointer-tilting 3D vector space, ported from biti) through a
  `blocks` entry in `jsxConverters`.
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

- Site header rebuilt to the current shell.css navbar contract: the
  styled bar is now `.navbar` inside the unstyled `.site-header`
  wrapper, nav items render `.nav-item` cells under `ul.primary-nav`
  with a `.nav-caret` submenu trigger (`.is-open` toggle for
  non-hover), and submenu bands start with a `.nav-brand--spacer`
  aligning them under `.site-nav`; `.site-nav-toggle` and the theme
  select sit in flush-right `.nav-actions`. The previous markup
  matched a retired contract and rendered unstyled
- Dev theme picker conflict: the variant switcher and `ThemeToggle`
  both wrote `data-theme` — the toggle's mount effect clobbered the
  picked variant. Variants are now re-scoped to a separate
  `data-variant` attribute (styles injected last, so a set variant
  always wins), `data-theme` stays the pushed-theme light/dark channel,
  the pre-paint init script restores both attributes, and choosing a
  mode in `ThemeToggle` clears the variant and resets the switcher
  (`arr:theme-mode` event)
- Code blocks render on the frontend: JSX converter for the `Code` block
  (`pre`/`code` + `data-language`) was missing
  (`src/app/(frontend)/[[...path]]/converters.tsx`)

### Changed

- **Breaking URL scheme**: all public URLs are locale-prefixed —
  `/blog/kategorie/<c>` became `/{de,en}/blog/category/<c>`, feeds live
  at `/{de,en}/{rss.xml,feed,index.xml,atom.xml}`, and the Payload admin
  preview links target `/<locale><path>` via the `/preview` handler.
  Content writes must send `?locale=<de|en>` (`fallback-locale=none` for
  strict reads) — `wit_pytools/payloadtools` needs a follow-up to emit
  localized writes
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
- Rich-text `link`/`autolink` nodes render through the `Link` atom:
  external URLs open in a new tab (`target="_blank" rel="noopener
  noreferrer"`) by default, internal doc links resolve to the document
  `path` via `next/link` (`src/lib/jsx-converters.tsx`)
- `SiteFooter` renders the full `navigation` structure as an expanded
  list (group labels as text, no hover); copyright line and `links`/
  `siteName`/`text` props removed
  (`src/components/organisms/site-footer.tsx`)
- Frontend UI strings switched to English (site default language):
  `Weiterlesen`→`Continue`, `Keine Beiträge gefunden.`→`No posts
  found.`, `Kategorie:`→`Category:`, `Zurück`/`Weiter` pagination →
  `Back`/`Next`, 404 text, and `formatDate` now uses `en-GB`
  (`11 October 2026`)
- Post cards show an author byline in the header — avatar (`lg`) left
  of the title with the author name as a linked subtitle targeting
  `/blog/<author>` — via new `lead`/`subtitle` slots on `Card`/
  `CardHeader` (`meta` slot remains for footer content);
  `getAgentMap` resolves names + avatar URLs for the listed authors
  (`src/components/{organisms,molecules}/{card,post-list,card-section}.tsx`,
  `src/lib/blog.ts`)
- `WitSpace` updated to the current biti version: vertex hover halos
  with 2D overlay twins (fixes 3D occlusion), red pulse, face labels,
  and author cards — a new `authors` array field on the `witSpace`
  block pins agent slugs to logo vertices (`slug@vert[:face]` in the
  markdown tag); `WitSpaceScene` resolves them against the `agents`
  structure doc (name/role/avatar, links to `/blog/<slug>`). Only
  authored vertices are hoverable now.
- Media display URLs route through `/_next/image` (`optimizeMediaUrl`,
  `src/lib/media.ts`) as the fallback, and `Media` now generates
  `imageSizes` at upload covering every render path: `logo` (256px,
  header/footer marks), `avatar` (128×128 centre crop, sm/lg bylines and
  wit-space cards), `card` (640px, post-card covers), `content` (960px,
  figures and onboarding steps), `hero` (1920px, page/lead heroes).
  `mediaUrl(doc, size)` resolves the sized URL; `getMediaUrl` takes the
  same names for sourcePath lookups. `sharp` wired into
  `payload.config.ts` (was already a dep). Migrations
  `20261013_192611_add_media_image_sizes` +
  `20261013_192901_extend_media_image_sizes`; sizes only exist for media
  uploaded after deploy — re-push media docs to generate them.
