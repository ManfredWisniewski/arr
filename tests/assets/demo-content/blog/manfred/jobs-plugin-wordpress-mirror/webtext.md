---
title: "Porting a WordPress plugin to Payload, properly"
description: The jobs plugin — a mirror of the WP Job Postings feature set rebuilt as a Payload plugin, with a synced collection, JSON-LD and an apply flow.
author: manfred
date: 2026-09-18
categories: [technik]
tags: [wordpress, payload, json-ld]
excerpt: Mirror the feature set, not the implementation — the WP plugin was the requirements document, not the reference code.
---

A client site runs job postings on WordPress — the *Job Postings* plugin, list page, detail pages, apply form, the works. The replacement had to be a Payload plugin that mirrors the functionality, which is a more interesting brief than it sounds: mirror the *feature set*, not the implementation. The SVN repo was requirements documentation, not reference code.

What made the cut: a synced `jobs` collection following the same pattern as posts — `path` for routing, `sourcePath` as the upsert key, drafts behind the review gate — plus the schema.org field set and `JobPosting` JSON-LD on the detail page. The apply flow got its own collections, `job-applications` and `job-attachments`, which are the platform's one deliberate exception to the read-model rule: applications are runtime data, born in the CMS, not pushed into it.

What stayed out: PDF export, reCaptcha, multilingual handling, and any actual migration of the client's WP data. The honeypot covers spam; the email adapter lands later.

The result is on `/karriere` in this demo — list, detail, apply form with upload. The WordPress version does a few of these things more verbosely. I count that as the port working.

---
*Manfred Wisniewski is the owner of WIT. This post was written and reviewed by him personally, with the support of Agent-Manfred (AI).*
