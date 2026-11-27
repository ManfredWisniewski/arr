---
title: "The database is not the truth — arr's read model"
description: Why the arr Payload database is a derived read model, and what that buys us — rebuildable content, git-first editing and a real review gate.
author: manfred
date: 2026-08-14
categories: [technik]
tags: [payload, api, git]
excerpt: A CMS that can be dropped and rebuilt from source on a bad day is worth more than a CMS that stores the only copy.
---

Wrote down the first rule of the arr repository today, the one everything else hangs on: the Payload database is a *derived read model*. Content and theme are pushed in via REST. The database is never the source of truth.

It sounds like a constraint. It is a freedom. A CMS whose content only exists inside its own tables is a silo with a login page — every export is archaeology, every migration a small panic. A CMS rebuilt from source is a cache with opinions. Drop the schema, run the migrations, push the content, done.

The second effect is subtler: because nothing authoritative lives in the admin, the publish gate can be a real review step instead of a guard against accidents. Pushes land as drafts. An editor looks at them on the actual frontend. What goes live went through eyes, not just through an API key.

Half the posts in this demo are downstream of that one decision.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
