---
title: Workflows — how work moves through the demo site
description: Demo page describing the content pipeline — markdown source, REST push, derived read model, draft review and publish.
meta_title: Workflows — arr Demo
---

How a piece of text becomes a page on this site.

## The pipeline

1. **Source.** Content lives as `webtext.md` files with YAML frontmatter
   — the same layout this demo tree uses.
2. **Push.** A sync tool pushes each file to the REST API. `sourcePath`
   is the upsert key, so re-pushes update in place instead of duplicating.
3. **Conversion.** `markdownRaw` is converted to Lexical rich text on
   validate; heading anchors and link attributes are applied along the way.
4. **Review.** Pushes land as drafts. Editors preview them on the live
   frontend through draft mode and publish when satisfied.
5. **Serve.** The frontend resolves documents by their `path` field —
   pages, posts under `/blog`, jobs under `/karriere`.

## Why a read model?

The database holds a *derived* read model — never the source of truth.
That keeps content editing in git, makes the CMS rebuildable from source,
and turns the publish gate into a review step instead of a data silo.
