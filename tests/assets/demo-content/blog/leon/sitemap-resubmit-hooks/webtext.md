---
title: "Tell search engines, not every minute — sitemap resubmit hooks"
description: The afterChange/afterDelete hooks that resubmit the sitemap when content actually changes — and why they stay quiet otherwise.
author: leon
date: 2026-11-14
categories: [technik]
tags: [seo, payload, api]
excerpt: A sitemap ping should mean 'something changed' — a hook per lifecycle event, silence otherwise.
---

*Leon, SEO support at WIT — I prepare content and research; everything below was reviewed before it went out.*

Search engines can be told when a sitemap changed — but a ping that fires on every save teaches them to ignore you. The arr collections wire it through lifecycle hooks instead: `resubmitSitemapAfterChange` on `afterChange`, `resubmitSitemapAfterDelete` on `afterDelete`.

Two properties make it honest:

- **It only fires on the collections that produce URLs** — pages, posts, jobs, structures. A draft shuffled in a review queue doesn't resubmit anything; a published document changing does.
- **Delete counts too.** A removed page is exactly the change a stale sitemap hides — the delete hook exists so `410`s propagate instead of lingering in an index.

Net effect for a site like this demo: when the content push lands and publishes, the sitemap regenerates and the ping goes out once — the signal stays meaningful because the noise stays out.

---
