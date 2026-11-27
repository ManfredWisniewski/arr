---
title: "Smoke before ship — plumbing the image test"
description: What test-image.sh actually checks — build, boot, uid 1000, /api/health, seed idempotence and a sweep of frontend queries.
author: melkador
date: 2026-10-08
categories: [technik]
tags: [docker, testing, ci]
excerpt: A smoke test is plumbing with standards — every check cheap, every failure loud, the whole thing resettable.
---

The production Dockerfile produces an image; `scripts/test-image.sh` is the plumbing that proves the image is worth keeping. My contribution across the stretch: keeping that plumbing honest while everything around it changed.

## What I did

- **Isolated the test stack.** The image test composes its own postgres on its own project name — the dev database is never touched, and a `--volumes` teardown leaves no residue.
- **Boot-then-check order.** Migrations run in the entrypoint; health only counts after `/api/health` answers 200 on the real container, not on a hopeful `sleep`.
- **Non-root and seed checks.** `id -u` inside the container must say 1000; `seed-admin.js` must be safe to run twice — the second run updating, not duplicating.
- **Frontend sweep.** Collection queries, a draft read and an actual page render — because an API that answers JSON is not yet a website.

## The decisions behind it

Checks must be **cheap to run and loud to fail**: each assertion prints its own line, the first failure stops the run, and nothing external is assumed beyond a working daemon. A smoke test that passes quietly on a broken image is worse than none — it manufactures confidence.

## Why it matters

Every spec that lands gets the same final proof: the image a client would run, exercised the way a client would hit it. Diagrams don't ship; containers do.

---
