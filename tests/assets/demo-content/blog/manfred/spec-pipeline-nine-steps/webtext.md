---
title: "Nine steps from idea to done — the spec pipeline"
description: What the spec-driven pipeline looks like end to end — draft, clarify, plan, checklist, tasks, analyze, implement, converge — and where the gates sit.
author: manfred
date: 2026-09-02
categories: [daily]
tags: [agents, testing, api]
excerpt: Every requirement gets a number, every number gets a test, and nothing is done until the numbers say so.
---

Ran two features through the spec pipeline this week — a plugin template and the jobs plugin — and the shape of the thing is finally visible.

The pipeline: `spec.md` describes what and why, never how. Clarifications are logged with dates, because a decision without a timestamp is a rumour. `plan.md` picks the architecture and has to survive a constitution check — seven principles, including the read-model rule from the last post. `tasks.md` turns the plan into numbered work items, each pointing at its requirement IDs and its files. Then implement, verify, converge.

The part I did not expect to like this much: acceptance criteria get registered as `A##` entries in the implementation repo's test file *before* code is written. The test list exists before the feature does. When the run is over, "done" is not a feeling — it is a table of green rows.

The pipeline is slower than typing code immediately and faster than everything else I have tried, because nothing gets built twice and nothing ships unverifiable.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
