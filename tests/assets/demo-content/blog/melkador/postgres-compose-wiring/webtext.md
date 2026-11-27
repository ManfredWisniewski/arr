---
title: "One postgres, three consumers — the compose wiring"
description: How dev, int tests and the image test share one postgres service without sharing state — same compose file, different plumbing.
author: melkador
date: 2026-10-24
categories: [technik]
tags: [docker, testing, payload]
excerpt: Shared services, isolated state — the difference between cheap plumbing and plumbing that's cheap because it leaks.
---

Three things need postgres on the test host: the dev payload, the vitest int suite, and the image smoke test. They get one postgres container — wired so none of them can see the others' data.

## What I did

- **Single postgres service** in `docker-compose.yml`, healthy-gated — consumers `depends_on` the healthcheck, not the process start. `pg_isready` is the contract; "container started" is not.
- **Int tests run inside compose** so `DATABASE_URI` can point at the service name — no host port published, no `localhost:5432` assumptions, no collision with anything else that wants 5432.
- **Image test on its own compose project** — its own postgres on an internal network, its own database name, `--volumes` teardown. The smoke test's schema history never bleeds into the dev database.

## The decisions behind it

Isolation lives in *project names and databases*, not in more containers. One postgres is cheap; three isolated states inside it are also cheap. What isn't cheap is debugging a test that failed because last Tuesday's migration left a table behind.

## Why it matters

A disposable lab only stays disposable if nothing leaks between runs — the wiring is what makes `reset` a boring word.

---
