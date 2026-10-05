# Figma → arr/biti design workflow

Figma is the design source of truth (tokens, components, page layouts).
biti translates Figma output into build artifacts (DTCG tokens → Terrazzo
→ CSS). arr renders them (vendored templates + `theme` global). The
Payload database stays a derived read model.

Unlike the generic Figma→Payload pattern (Figma block → Payload block
schema → React block), this stack does NOT use editor-composed Payload
blocks. Pages are markdown + `template:` front matter + structure
documents. Figma designs therefore map to **token values, template
components, and template names** — not to collection schemas.

Naming contract (single source of mapping, keep in this doc):

| Figma                     | biti/arr                        | Runtime                |
|---------------------------|---------------------------------|------------------------|
| Variable `theme.bg`       | token id `theme.bg`             | `--theme-bg` CSS var   |
| Variable mode `arr`       | resolver context `arr`          | `arr.css`              |
| Variable mode `arr-dark`  | resolver context `arr-dark`     | `arr-dark.css`         |
| Component `Template/X`    | `src/components/templates/x.tsx`           | `template: x`          |
| Component `Section/Y`     | `.y-*` classes in `shell.css`   | styled markup          |

## Step by step

### Phase 0 — Figma library setup (one-time)

1. Create a team library file (e.g. `WIT Design`).
2. Create a variable collection `tokens` with two modes named exactly
   `arr` and `arr-dark`. Define variables matching the existing DTCG
   ids (`color.brand.500`, `theme.bg`, `spacing.*`, …). Seed once from
   biti: `python tokens/scripts/dtcg_to_figma.py` writes
   `tokens/build/figma/*.json` (one file per collection — import
   `primitives` first, then `theme.arr`/`theme.arr-dark` as two modes
   of a `theme` collection). After the seed, Figma owns the values.

   Figma import flow:
   - Create a Design file (`figma.com/design/...`)
   - `Ctrl+P` → **Toggle variables** → create collection
   - Import the JSON file (drag into the panel or right-click → Import;
     on free plans one mode per collection — use separate
     `theme-arr`/`theme-arr-dark` collections if modes are locked)
3. Create text/effect styles for typography and elevation.
4. Create components under `Section/` (Hero, CardGrid, …) and page
   frames under `Template/` (`Template/Landing`, …) composed from those
   sections. Layouts must use only library components — no freeform
   frames — so each layout maps to one template name.

### Phase 1 — Token export (Figma → biti)

1. Export variables from Figma. On a free plan use a plugin (Tokens
   Studio, "Design Tokens" exporter); the REST Variables API requires
   Enterprise — skip it.
2. Transform the export into `tokens/src/theme.arr.tokens.json` /
   `theme.arr-dark.tokens.json` (DTCG). Write a converter
   `tokens/scripts/figma_to_dtcg.*` that maps variable names to token
   ids and Figma color formats to the existing `$value` shapes
   (srgb objects / `{color.*}` refs). Manual diff-review on each import.
3. `npm run tokens:build` in `biti` → `npm run tokens:test`.
4. Push to the site:

   ```bat
   python -m wit_pytools.payloadtools theme ^
     --css-light biti\tokens\build\css\arr.css ^
     --css-dark  biti\tokens\build\css\arr-dark.css
   ```

   Token changes go live with no image rebuild.

### Phase 2 — Components (Figma → arr/biti)

1. Design/iterate a `Section/*` component in Figma. Bind colors/numbers
   to `theme`/`primitives` variables — no hard values.
2. Handoff is visual: the `.fig` file is not machine-readable. Export
   each `Section/*`/`Template/*` frame as PNG (right-click → Export →
   PNG 1x/2x) into `biti/design/figma/`. I port from the images plus
   the variable values. Dev Mode inspect / MCP are optional upgrades
   once a paid seat exists.
3. Port to `arr/src/components/templates/` (or `@biti/ui` once extracted):
   semantic classes + `var(--token-id)` only — no hard-coded values.
   Add structural rules to `tokens/shell.css` under the section's
   class prefix; push styles via `payloadtools theme`.
4. Register every component in `biti/COMPONENTS.md` (Figma name → code
   path → CSS prefix) — that file is the source for the naming table
   above.
5. Components ship in the image — needs commit → CI build → redeploy.

### Phase 3 — Page layouts (Figma → template names)

1. A `Template/X` frame = one `template: x` value. The name is the
   contract between designer and developer.
2. Markdown maps into the template's slots by documented convention
   (today: first `![]()` = landing hero media; `meta_description` =
   hero lead). Each template's convention goes in `biti/BITI-DOC.md`.
3. New template = new entry in `src/components/templates/registry.tsx` → rebuild.

### Phase 4 — Change loop (steady state)

- Token change: Figma edit → export → transform → `tokens:build` →
  `payloadtools theme`. Minutes, no deploy.
- Component/layout change: Figma edit → port to template code →
  commit → image rebuild → Ansible redeploy.
- Keep the naming table above current; it is the integration contract.

## Already in place

- DTCG token pipeline: `tokens/src/*.tokens.json` → Terrazzo →
  `tokens/build/css/arr*.css` (+ `shell.css` append, `preview.html`).
- `payloadtools theme` / `site` push commands; hash-deduped media
  upload; `theme` global (cssLight/cssDark/logo/favicon/siteName).
- Template seam: `src/components/templates/registry.tsx` with `default` and
  `landing` (hero convention proven end-to-end).
- Styling contract: semantic classes + token variables, no Tailwind,
  no hard-coded values.
- Vendoring precedent: landing hero ported from the biti template app.
- Docs: `biti/BITI-DOC.md` (markup/component conventions).
- Backlog item: `@biti/ui` private package (GitHub Packages) to replace
  vendoring and share components across WIT apps.

## Still needed

- Figma library (file + `tokens` collection with `arr`/`arr-dark`
  modes + components + `Template/` frames) — does not exist yet.
- One-time seed of Figma variables from `tokens/src/theme.arr*.tokens.json`.
- Export tooling decision (plugin: Tokens Studio vs. Design Tokens
  exporter) — test on free plan.
- `tokens/scripts/figma_to_dtcg.*` converter + a test fixture.
- `Section/` and `Template/` component inventory (what does the site
  actually need beyond hero — card grid, CTA band, feature list?).
- `@biti/ui` package extraction (backlog) so components stop being
  vendored per app.
- Optional automation: Figma MCP server + AI scaffolding for component
  stubs (needs Dev Mode/paid seat — defer until plan tier exists).
- Governance note in `+intent/decisions.md`: Figma owns token values;
  biti owns token ids/format (ids remain the published API — add or
  deprecate, never rename in place).

## Resources

- Webfonts (WOFF2 downloads, Google Fonts mirror):
  https://gwfh.mranftl.com/fonts/ — download font files, place them under
  `biti/public/fonts/`, then `make publish` picks them up via `--font` args.

## Research appendix

Raw notes that informed this plan (generic Figma→Payload workflow):
Figma component → Payload block mapping, Dev Mode inspection, MCP
scaffolding, plugin landscape. Sources: figma.com (Mazda case study),
reddit r/PayloadCMS workflow thread, bradfarleigh.com, Medium
(Figma+Payload end-to-end vision). The block-schema parts of that
research are intentionally not adopted — see intro.
