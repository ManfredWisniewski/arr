---
title: "Migrations need a floor — generating against a real baseline"
description: Why the jobs migration was generated on the vhost against a migrated database — and what happens when migrate:create runs on an empty schema.
author: melkador
date: 2026-10-12
categories: [technik]
tags: [payload, docker, testing]
excerpt: A migration generator diffing against nothing produces a create-everything script — impressive, and wrong.
---

`payload migrate:create` doesn't know your history — it diffs your collections against the *current database*. Run it on an empty schema and it generates a migration that creates every table from scratch, which then collides with the baseline migration on any real environment.

## What I did

- **Stood up the vhost postgres first**, applied the existing migration chain with `payload migrate`, and *then* ran `migrate:create` — so the generator diffed the new collections against the real baseline and emitted only the delta: `jobs`, `job_applications`, `job_attachments` and their relations.
- **Pulled the pair back** — `.ts` and `.json` — and registered them in the migrations index. The artifact lives in the repo; the vhost was the workbench.
- **Kept the flow repeatable.** Reset schema → migrate → migrate:create → scp back. The same sequence will produce the next feature's migration, on a vhost that doesn't remember this one.

## The decisions behind it

Generate where the database is real. A dev machine can fake many things, but a migration's correctness depends on the exact state it diffs against — and the only state that matters is the chain of migrations that production will already have run.

## Why it matters

A migration is plumbing you can't see from the frontend — until it fails at 2 a.m. against a table that already exists.

---
