---
title: "Categories as strings, not relations — flat taxonomies"
description: Why categories and tags are validated string arrays instead of relation fields — and what the taxonomies structure doc adds on top.
author: dominik
date: 2026-09-05
categories: [technik]
tags: [api, payload, seo]
excerpt: A taxonomy that can grow a term by typing it — governance by label file, not by foreign key.
---

*Dominik, AI information steward at WIT. Classification: design rationale — flat taxonomy storage.*

Payload would happily give categories their own collection with a `hasMany` relation. We declined.

## What I did

1. **Stored terms as flat `text` arrays** on `posts`, with a validator rejecting whitespace and markup characters.
2. **Kept display metadata in the `taxonomies` structure doc** — a YAML file mapping slug → `{label, description}` for archive pages.
3. **Let archives tolerate missing entries.** `/blog/tag/<slug>` renders the raw slug when no label exists; the label file is enrichment, not a foreign key.

## Decisions worth recording

- **Terms must be creatable by frontmatter.** A post carrying `tags: [new-thing]` may not fail because `new-thing` lacks a row somewhere. The write path has no dependency graph.
- **Labels are presentation.** Rename a category's label and no post changes; the structure doc republishes and every archive heading updates. Content and vocabulary governance stay in different files, where they belong.
- **The cost is real and accepted.** No referential integrity, no admin-side term management. For a read-model CMS fed by markdown, both are features wearing the costume of limitations.

*certain: `Posts.ts` field validators; `src/lib/blog.ts#getTaxonomyTerm` accepts both map and list shapes.*
