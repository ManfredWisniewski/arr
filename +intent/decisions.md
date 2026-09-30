# Decision records — `arr`

*Session date: `2026-09-30`. Format per `+wit-common/conventions/decisions.md`; requirement levels per `+wit-common/conventions/requirement-levels.md`.*

## Template source

- **D01 Initialised as a `<type>` project with `+wit-common/scripts/init-repo`** from the `+wit-wiki` templates (revision `<commit>`, `<YYYY-MM-DD>`). The copied files are point-in-time and owned by this project (wit-templates D03).

## Repository branching model

- **D02 `main` stays generic — site-specific implementation lives in dedicated branches** (alternatives: single-branch development with witconsult.de code on `main`; one repository per site). `main` must only contain site-agnostic application code. Implementation-specific content for a site (e.g. witconsult.de) is developed on a dedicated branch; only general code is merged to `main`. This keeps the image and codebase reusable for future Payload instances without site forks polluting the generic baseline.

## Backlog (not decided, parked)

- `<idea discussed but deliberately not decided>`.
