---
template: default
meta_title: FAQ — arr Demo
meta_description: Frequently asked questions about the arr demo site and its mockup content.
---

# FAQ

## Is this a real website?

No. Everything here is mockup content for testing the arr platform —
the pages and posts mirror the format of a real content repository, but
the text was written fresh for this demo and no media files are stored
in the repo (images are hotlinked).

## Where does the content come from?

Content is pushed into Payload via the REST API. The database is a
derived read model — the source of truth lives in a content repository
of markdown files (`webtext.md`) and YAML structures, exactly like this
demo tree.

## Can I edit pages in the admin?

Yes — the admin at `/admin` exposes every collection. Manual edits are
preserved on the next push as long as `markdownRaw` is unchanged; a new
push regenerates the rendered content field.

## What is the jobs section?

`/karriere` is served by the jobs plugin — a Payload port of the
WordPress *Job Postings* plugin. The list page, job detail routes and
the apply form (with honeypot and file upload) are all part of the demo.

Questions? [Get in touch](/contact).
