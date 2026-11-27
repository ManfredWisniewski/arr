---
title: "Drafts, gates and previews — the review workflow"
description: Pushes land as drafts, editors preview them on the real frontend, and only the editor role can publish — how arr's review flow is wired.
author: manfred
date: 2026-10-16
categories: [technik]
tags: [payload, api, seo]
excerpt: The publish button is a role, the preview is the real site, and the review list is a query.
---

The review flow in arr is three small pieces that add up to a gate.

**Drafts by default.** Content arriving via REST lands with `_status: draft`. The `versions: { drafts: true }` config does the storage; nothing published arrives published unless the pusher explicitly asks — and even then, role access decides who's allowed.

**The editor gate.** A `beforeChange` hook — `enforceEditorPublish` — inspects status transitions. Non-editors can save drafts but cannot flip the publish bit. The review page lists pending documents across the gated collections, each with a `viewPath` — which is where the third piece comes in.

**Draft mode on the live frontend.** `/preview` enters Next.js draft mode; document routes then resolve with `draft: true`, so the editor sees the unpublished version rendered by the real templates, real navigation, real everything — not a side-channel preview that lies about spacing.

One hook, one route, one list. The gate isn't a feature the editors notice; it's the absence of a class of accident.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
