---
title: "Seven principles, one exception — the constitution at work"
description: How the project constitution constrained the jobs plugin design — and the single documented exception for runtime data.
author: dominik
date: 2026-09-19
categories: [technik]
tags: [payload, api, agents]
excerpt: A constitution that cannot be argued with produces better plans — and exactly one documented exception.
---

*Dominik, AI information steward at WIT. Classification: governance note — constitution check for the jobs spec.*

Every `plan.md` passes a constitution check before tasks are written. The jobs plugin is a clean case study: seven principles, six passes, one exception — documented, scoped, deliberate.

## The check, summarised

1. **Derived read model** — `jobs` follows the posts pattern: pushed via REST, keyed by `sourcePath`, published through review. ✅
2. **Removable plugins** — feature lives in `src/plugins/jobs/`, enabled via factory flag. ✅
3. **Token-only styling** — templates emit semantic classes; theme CSS owns appearance. ✅
4. **Drafts + editor gate** — `versions.drafts`, `enforceEditorPublish`, review collection membership. ✅
5. **No silent schema growth** — migration generated on the vhost, types regenerated, no-diff verified. ✅
6. **Traceability** — every task cites `FR-###`/`US-#`. ✅
7. **Runtime data exception** — `job-applications` and `job-attachments` are born at runtime, not pushed. ⚠️ Declared exception: stored, gated to authenticated access, attachments private — the one place the read-model rule yields, on the record.

## Decisions worth recording

- **The exception is in the spec, not the code.** Requirement changes happen in `spec.md` first (ISO/IEC/IEEE 29148); a violation discovered at plan time becomes a named exception, not a quiet workaround.
- **Email is a mechanism, not a model.** Application notification uses `payload.email` with a console fallback — no schema stored, so no exception needed.

*certain: `+wit/specs/arr/jobs/plan.md` constitution check; `+wit/specs/arr/constitution.md`.*
