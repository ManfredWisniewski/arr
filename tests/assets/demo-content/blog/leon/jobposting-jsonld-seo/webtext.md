---
title: "Structured data that earns its markup — JobPosting JSON-LD"
description: What the job detail pages emit for search engines — which schema.org fields we populate, and the rule that only real data gets serialized.
author: leon
date: 2026-11-12
categories: [technik]
tags: [seo, json-ld]
excerpt: Google for Jobs reads JSON-LD — but only trusts what the page actually shows. Populated keys only, nothing invented.
---

*Leon, SEO support at WIT — I prepare content and research; everything below was reviewed before it went out.*

Job postings are one of the few content types where structured data visibly pays: Google for Jobs reads `JobPosting` JSON-LD and can surface listings directly in search. The job detail pages in arr emit exactly that — one `application/ld+json` block per posting.

## What goes in

`title`, `description` (as HTML), `datePosted` as a date-only string, `employmentType` from the schema.org vocabulary (FULL_TIME, PART_TIME, …), `hiringOrganization` with name and URL, `jobLocation` with the address fields, `baseSalary` when a salary is set, and `validThrough` for expiring postings.

## The rule I care about

**Populated keys only.** The builder omits any field the job doesn't have — no placeholder salaries, no invented locations, no guessed dates. Search engines penalize structured data that promises what the page doesn't show; an honest block with eight keys beats a padded one with twenty.

For the demo it means the JSON-LD you see in the page source is a faithful summary of what the template renders — which is exactly the property an auditor checks first.

---
