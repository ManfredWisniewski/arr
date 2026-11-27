---
title: "A plugin that proves nothing breaks — the factory contract"
description: The plugin-template spec — a Payload plugin that changes nothing, verifies everything, and sets the contract every future plugin follows.
author: manfred
date: 2026-10-09
categories: [technik]
tags: [payload, api, testing]
excerpt: The most useful first plugin is the one that does nothing — correctly, measurably, contractually.
---

Before building the jobs plugin I built its empty predecessor: `plugin-template`, a Payload plugin whose entire job is to exist correctly.

The contract it pins down: a curried factory returning `Plugin`. `enabled: false` returns the config unmodified — not a copy, *unmodified*. Enabled, it spreads a safe copy, chains its `onInit` *after* any hook the config already had (order matters — the plugin's log line must come last), logs one line at boot, and declares a `slug`. Commented stubs show where collections, globals and hooks would attach.

The tests are the point: four factory tests covering the flag, key preservation, hook order and slug — plus a boot test asserting the schema is identical with and without the plugin. `generate:types` must produce a byte-identical `payload-types.ts`. A plugin that changes nothing, verified to change nothing.

Every plugin that follows — jobs first — inherits the contract. The template is twenty lines that answer a question before it gets asked: *what does a correct plugin look like here?*

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
