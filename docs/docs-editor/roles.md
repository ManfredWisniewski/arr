---
sidebar_position: 4
---

# Roles

## `editor`

A human account. Can:

- see draft and published content
- review drafts via the banner and `/review`
- publish documents — the only role allowed to set a page live
- use the `/admin` interface for everything

## `content-bot`

A machine account (API key) used by the sync pipeline. Can:

- create and update **drafts** and media

Cannot:

- publish anything — publish rights are denied server-side
- delete documents

## Anonymous visitors

Can only see published content. They never see drafts, the banner,
`/review`, or any review-related markup.
