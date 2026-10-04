# Integrate atomic component structure

Adoption of the atomic-design taxonomy (`+wit/design/bestpractices/
atomic-design.md`), informed by github.com/satilpereira/next-atomic
(GPL-3.0) and github.com/Senofy/next-atomic-design (no license) —
**structure and concepts copied, not code** (arr uses semantic classes +
pushed theme CSS instead of Tailwind/shadcn or styled-components).

## Done

### Phase 1 — taxonomy

- [x] `src/components/{atoms,molecules,organisms,templates}` created
- [x] `src/templates/` moved → `src/components/templates/` (default,
      landing, registry; logic unchanged)
- [x] `layout.tsx` slimmed to data fetching + composition
- [x] atoms: `SiteLogo`, `ThemeToggle`, `Button`, `Link`, `Img`,
      `Heading`/`Paragraph`/`Lead`/`Badge` (`text.tsx`), `Icon`, `Input`
- [x] molecules: `NavItem`/`NavList` (+ `mapNavItems`), `Figure`
- [x] organisms: `SiteHeader`, `SiteFooter`, `PageHero`, `Modal`
      (`<dialog>`-based: focus trap, Esc, backdrop click)
- [x] `cx()` helper (`src/lib/cx.ts`)
- [x] Per-layer barrel exports (`components/*/index.ts`); organisms
      compose atoms (`SiteHeader` menu icon, `PageHero`/`SiteLogo`/
      `Figure`/`NavItem` via atoms)

### Phase 2 — ported components (re-implemented in arr's contract)

- [x] ThemeButton → `ThemeToggle` (client select; system/light/dark;
      `arr.theme` localStorage key; matchMedia live updates; pre-paint
      init script in `layout.tsx` — all per `design-tokens.md`)
- [x] Navbar/MobileNavbar → `SiteHeader` mobile nav via `<details>`
      (`.site-nav-toggle`, no JS dependency)
- [x] `cn()` → `cx()` (no clsx/tailwind-merge)
- [x] Senofy atoms → semantic-class versions: `Button`, `Link`, `Img`,
      `Text`→`Heading`/`Lead`/`Badge`, `Input`, `Icon`; `Modal` organism;
      skipped: styled-system prop styling (conflicts with the token
      contract), placeholder components, PageTemplate (= layout.tsx),
      linkWrapper injection (only relevant for `@biti/ui` extraction)
- [x] Dev-only `/components` showcase route — Storybook-equivalent
      without the toolchain; renders all components under the pushed
      theme + variant switcher; `notFound()` in production

### Phase 3 — styles in biti

- [x] `tokens/shell.css`: `.theme-toggle`, `.site-nav-toggle`, `.icon`,
      `.lead`, `.input`, `.modal`/`.modal::backdrop`/`.modal-close`;
      all 6 theme builds regenerated

### Infrastructure

- [x] `biti` added as submodule at `biti/` (`BITI_DIR ?= biti` in
      Makefile, `THEME_VARIANTS_DIR` default updated)
- [x] `biti/` excluded in `tsconfig.json`, `eslint.config.mjs`,
      `.markdownlint-cli2.jsonc` (same as other submodules)
- [x] `site.yml` logo/favicon paths repointed (`../../biti` →
      `../../arr/biti`) in `witconsult.de` + `demo`
- [x] Changelog entries (arr + biti)

## Open issues

- [ ] **`[Button:]` markers don't render as `.btn`.** `rewrite_markers`
      resolves Link and Button identically to plain `[label](target)`.
      Wiring them to `.btn`/`.btn-primary` needs either a lexical link
      feature with a class, a custom markdown syntax that survives
      conversion, or post-processing in `converters.tsx`. The `Button`
      atom exists now — the markdown→lexical path still can't reach it;
      same for `.badge` (only the `/components` showcase exercises them).
- [ ] **Active nav state.** shell.css styles `a[aria-current="page"]`
      but nothing sets it — needs the current pathname at render time
      (client NavLink or a per-path layout).
- [ ] **Old biti checkout.** `P:\git\arr\biti` still exists (was locked,
      could not be moved). Nothing references it — delete when free.
- [ ] **Variant fonts.** Dev theme variants swap token CSS only;
      `@font-face` comes from the pushed theme's `cssLight`. Fonts of
      other families fall back to system fonts unless that theme was
      pushed once.
- [ ] **Templates ↔ Payload coupling.** `pages.template` is a plain
      string; unknown values fall back silently to default. Registry in
      `components/templates/registry.tsx`.
- [ ] **`@biti/ui` backlog.** design spec + `+intent/decisions.md` D07
      amendment point at extracting shared components into a `biti-ui`
      repo/package eventually; the vendored `components/` tree is the
      interim home.
- [ ] **ThemeSwitcher vs ThemeToggle overlap in dev.** Both write
      `data-theme`; last write wins. Consider hiding the production
      toggle in dev or merging widgets.
- [ ] **Demo site coverage.** `/elemente` can't showcase `.btn`/`.badge`
      until the marker issue above is solved.
