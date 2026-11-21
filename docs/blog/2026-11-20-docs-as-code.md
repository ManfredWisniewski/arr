---
slug: docs-as-code
title: Documentation is now docs-as-code
authors: [trurl]
tags: [release, docs]
---

The ARR documentation now ships with the code. It is written as Markdown
in the repository, built into the Docker image and served at `/docs` on
every instance — so the docs you read always match the version you are
running.

{/*truncate*/}

What is included:

- **Developer/operator docs** — setup, architecture, the content-sync
  contract and deployment.
- **Editor docs** — publishing, the `/review` flow and roles, available in
  English and German.
- **This blog** — release notes and project news, with RSS/Atom feeds.
- **Search** — a full-text index built at image build time; no external
  service.
- **Versioned docs** — snapshots per release, so operators can read the
  docs matching their deployed image tag.

Doc changes go through the same review and CI gates as code — prose is
linted and the site must build cleanly before an image is produced.
