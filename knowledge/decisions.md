# Decision records — `arr`

*Session date: `2026-09-30`. Format per `+wit-common/conventions/decisions.md`; requirement levels per `+wit-common/conventions/requirement-levels.md`.*

## Template source

- **D01 Initialised as a `<type>` project with `+wit-common/scripts/init-repo`** from the `+wit-wiki` templates (revision `<commit>`, `<YYYY-MM-DD>`). The copied files are point-in-time and owned by this project (wit-templates D03).

## Repository branching model

- **D02 `main` stays generic — site-specific implementation lives in dedicated branches** (alternatives: single-branch development with witconsult.de code on `main`; one repository per site). `main` must only contain site-agnostic application code. Implementation-specific content for a site (e.g. witconsult.de) is developed on a dedicated branch; only general code is merged to `main`. This keeps the image and codebase reusable for future Payload instances without site forks polluting the generic baseline.

## Content sync

- **D03 The content mapping file is named `.arrcontent.yml`, one per site directory inside a content repository** (alternatives: `.witcontent.yml`; a configurable filename or `--config` flag; one config at repository root). A fixed, app-specific name at the site root (`<repo>/<domain>/`) means every site targeting this app is recognised without per-repo filename configuration, and a multi-site vault carries one config per domain. The name ties the mapping contract to the `arr` app rather than the generic `witcontent`/`payloadtools` tool.
  - *2026-09-30 amendment*: routes derive literally from the directory path — no stripping and no override table; the filename is always `webtext*.md` and carries no status. Filename statuses (`locked`/`entwurf`) are unused for this site: every `webtext*.md` syncs as draft and the Payload draft review (D04) is the only gate.

## Review gate

- **D04 External communication passes a human review gate** (WIT convention: external sends need approval — `+wit-common/taxonomies/communication-channels.md`; alternatives: the bot publishes directly; a later `--publish` batch). All synced content arrives as draft via `?draft=true`; only `editor` users may set `_status: 'published'`, enforced server-side, not by convention. Publish state is the only data the content repo does not own.

## Site structure

- **D05 Site layout data lives in YAML files under `<site>/+structure/`, synced into a generic `structures` collection** (alternatives: a `navigation` global; hardcoded menu markup in the image; one collection per structure type). The filename stem becomes the document `name`; the parsed YAML lands verbatim in a `data` JSON field; upserts key on `name` (unique — file moves update `sourcePath` in place) and obey the same draft-only rules as pages (D04). New document kinds (`menu`, `navigation`, `footer`, `header`, …) need no schema or code changes — consumers interpret `data` per `name`. The frontend renders the header menu from `structures` doc `navigation` as `data.items[*].{label, path}`.

## Templates

- **D07 Page templates are data-selected, code-implemented** (alternatives: template composition as structure YAML; separate collections per page type). `pages.template` is a plain text field synced from content front matter / `Template:` lines via meta extraction; the frontend resolves the name against a renderer registry (default = the article layout). Implementations come from `biti-ui` (D06) once published — until then the registry holds the single default renderer and `data-template` on `<article>` is the theme-CSS hook.

## Theme delivery

- **D06 Theme CSS is built in a separate repository and pushed manually via `payloadtools theme`** (alternatives: theme repo as a submodule of the content repository; a published/deployable package; CI pushing directly to the instance). A separate clone keeps build tooling out of the content vault and the image site-agnostic; the manual push is reproducible and can later be replaced by CI without changing the `theme` global contract.
  - *2026-09-30 amendment*: theme/design assets live in the `biti-<slug>` repository family, shared by WIT Next.js applications (arr, einring). `biti-tokens` uses **Terrazzo** (DTCG-native, light/dark as token modes) producing `build/css/{light,dark}.css` — the exact artifacts pushed to `theme.cssLight`/`cssDark`. A sibling `biti-ui` repo holds shared React template/section components (npm package): consumers pin it at build time, so component updates ride the normal image release while token/CSS updates deploy via push without any rebuild.

## Content markup

*Session 2026-11-06.*

- **D08 Link target policy — absolute `http(s)` URLs open in a new tab, everything else (relative paths, fragments, other schemes) stays in the same tab** (alternatives: all links in the same tab; every link decided individually via the editor's `newTab` flag; all external domains except own-domain absolutes). A single predictable rule keeps content free of per-link markup noise; it is implemented once in the `Link` atom (`^https?://` → `target="_blank" rel="noopener noreferrer"`, otherwise `next/link`). Authors may override per link with `{target="…"}` directly after the link (`_blank`, `_self`, `_parent`, `_top` — see D09).
- **D09 Kramdown/Pandoc attribute syntax for markdown extensions: `## T {#id}` for heading anchors, `[t](u){target="…"}` for link target overrides** (alternatives: HTML in markdown; custom shortcodes; auto-slugged heading ids). Explicit ids stay stable when heading text is edited (umlauts, „und", punctuation) — a slugger's output would not; one attribute idiom keeps authored links readable and learnable. The `markdownToContent` hook stamps anchors as `id` on heading nodes and targets as `fields.target` on link nodes; the JSX converters render them. Only `{target="_blank|_self|_parent|_top"}` is consumed — invalid values stay visible so typos surface in the draft preview.

## SEO

*Session 2026-11-10.*

- **D10 Publish events resubmit the sitemap via the Search Console API `sitemaps.submit`** (alternatives: robots.txt `Sitemap:` + `<lastmod>` alone — already the baseline, but silent and on Google's cadence; the retired unauthenticated ping endpoint, dead since 2023). A service account registered as a user on the SC property PUTs `<base>/sitemap.xml`, debounced on writes that touch a document which is or was published; env-gated (`GSC_*`) so the image stays site-agnostic (D02). Reason: owner decision — faster pickup of published changes on the arr sites, and the submission makes the sitemap visible in the GSC report.

## Analytics & tracking

- **D11 Analytics ids are site config on the `theme` global (`tracking` group), pushed from `site.yml` `tracking:`** (alternatives: a dedicated `site` global — duplicates the site-config role `theme` already serves for siteName/logo/favicon; a `structures` doc — works but bypasses the established site.yml → theme contract; env vars — would bake per-site ids into deployment config). The frontend injects `gtag.js` only when `tracking.google` validates as a tag id; a consent layer (TDDDG/DSGVO) is deliberately not part of the mechanism — whether and when tracking loads is a per-site owner decision. Reason: owner decision — one config channel for all per-site ids, extensible to further providers as `tracking.<vendor>` keys.
- **D12 Consent gating uses `vanilla-cookieconsent` v3 with a hard opt-in gate** (alternatives: Klaro — SCSS-compile-time theming, slower maintenance; tarteaucitron — strong iframe placeholders and service catalog but script-tag-era integration and CSS-file theming; Google Consent Mode v2 — the tag transmits before consent, contested under TDDDG). The banner renders only when at least one consent-gated service is configured (`tracking.google` in v1); "Cookie-Einstellungen" is auto-appended to the footer; texts ship bundled `de`/`en` in the image (per-site `consent.texts.*` overrides deferred); `cc_cookie` keeps the 182-day default at root path; withdrawing consent reloads the page. Config rides the `site.yml` `consent:` → `theme.consent` pipeline like `tracking:` (D11); a server-side consent record is deliberately parked until legally required. Reason: owner decision 2026-11-10 — vanilla config object plus CSS-variable theming matches the contract-class/token model, and the hard gate is the defensible TDDDG reading. Plan: `+wit/development/plans/consent/2026-11-10_plan-cookie-consent.md`.

## Internationalisation

- **D13 Field-level localization `de` (default) + `en` on editorial fields only** (alternatives: one document per locale; localizing identifiers/slugs). `localization.locales: [{de}, {en}]`, `defaultLocale: 'de'`. Localized: `pages`/`posts` `title`, `markdownRaw`, `content`, `meta.{title,description}` (+ `posts.excerpt`), `media.{alt,caption}`, `structures.data`. Kept locale-independent: `slug`, `path`, `sourcePath`, `sourceRepo`, `template`, `publishedAt`, `author`, `categories`, `tags`, `cover`, media upload internals, `theme` CSS/logo/favicon/siteName (brand config, not per-locale copy). Scope is the `arr` image only — `biti`'s own `payload.config.ts` lives in a separate repository with its own `+intent`. The Payload admin UI offers `de`/`en` for editors.
- **D14 Locale-prefixed routing — `/de/*` + `/en/*` via a `[lang]` App Router segment; `/` redirects to `/de`** (alternatives: default locale unprefixed + middleware rewrite — rejected because both locales prefixed makes `[lang]` the simpler single-tree structure; catch-all locale detection — rejected, locale resolution must not depend on the optional `[[...path]]` pages catch-all). The site is new, so prefixing German needs no legacy redirects. `pages.path`/`posts.path` stay locale-independent; lookups strip the `[lang]` segment. The archive segment `blog/kategorie/` is renamed `blog/category/` so one route tree serves both locales (`tag` was already neutral). Feeds are per-locale (`/de/rss.xml`, `/en/atom.xml`, …); `robots.txt`/`sitemap.xml` stay locale-agnostic and list every locale variant with `hreflang`/`x-default` alternates.
- **D15 Per-locale publish status via `experimental.localizeStatus`** (alternatives: document-level `_status` — publishing would release all locales together; waiting for the feature to stabilize). Required so a page can go live in `de` while its `en` translation is still a draft under the D04 review gate. `versions.drafts.localizeStatus: true` on `pages`, `posts`, `structures`; `localization.defaultLocalePublishOption: 'active'` so the default Publish button affects only the edited locale. The `enforceEditorPublish` hook inspects the localized `_status` in every locale. Experimental — flagged as an upgrade-risk in `tests.md`.
- **D16 No implicit locale fallback; config `fallback: false`** (alternatives: fall back to `de` during rollout; per-field fallback). Public reads return untranslated fields empty instead of silently serving German — mixed-language output is impossible and missing translations are visible. Draft previews may still pass `fallbackLocale: 'de'` explicitly so editors see partial pages.
- **D17 UI strings via `next-intl` dictionaries** (alternatives: `react-i18next` per `+wit/development/bestpractices/i18n.md`; a hand-rolled `t()` helper). Deviates from the written bestpractice: the frontend is almost entirely React Server Components and the locale comes from the URL, not a stored device preference, so client-side i18n plumbing buys nothing. The dictionary contract still follows the convention — one JSON per language (`messages/{de,en}.json`), nested keys, `en` as fallback, every key present in both files.

## Backlog (not decided, parked)

- Localized slugs/paths (e.g. `/en/seo-agency` vs `/de/seo-agentur`): deferred per the i18n handover; requires redirect + canonical handling before implementation.
- Translation-completeness reporting (admin view or script listing localized fields empty per locale): handover recommends monitoring; no mechanism decided yet.


