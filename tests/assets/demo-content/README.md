# Demo content

Mockup content tree for the arr platform, modelled on the structure of
`P:\clients\seo-wit\w1t.org`. Same layout, same frontmatter conventions,
same author roster — but **all text is original** (no copied passages
from the real site). Topics cover the arr Payload platform itself and
the biti design system.

## Layout

```text
site.yml                    → theme global
+structure/*.yml            → structures collection (agents, navigation, taxonomies)
webtext.md                  → page at path `/`
<section>/webtext.md        → page at path `/<section>`
<section>/<sub>/webtext.md  → page at path `/<section>/<sub>`
blog/<author>/<slug>/webtext.md → post at path `/blog/<author>/<slug>`
de/...                      → German mirrors under `/de/...`
```

## Conventions

- **Images are hotlinked** to `https://w1t.org/media/…` — nothing is
  duplicated into this repository. Inline markdown images render
  directly; `avatar`/`logo` fields reference media `sourcePath`s and
  resolve through the media collection (initials fallback when a media
  doc is absent).
- **The WIT theme fonts are included** in `assets/fonts/` and uploaded
  into the local media collection during the push. The theme CSS
  references those uploaded files; no runtime dependency on an external
  font host.
- **Frontmatter** follows the push contract: `title`, `description`,
  `author`, `date`, `categories`, `tags`, `excerpt` for posts;
  `template`, `meta_title`, `meta_description` for pages.
- **Blog posts**: 30 total (26 EN under `/blog/…`, 4 DE under
  `/de/blog/…`) — enough to exercise archives, author pages, taxonomy
  filters and pagination without pretending to be a full migration.
- Post paths are derived from the file location, not the frontmatter.
