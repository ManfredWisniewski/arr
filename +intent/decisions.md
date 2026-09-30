# Decision records — `arr`

*Session date: `2026-09-30`. Format per `+wit-common/conventions/decisions.md`; requirement levels per `+wit-common/conventions/requirement-levels.md`.*

## Template source

- **D01 Initialised as a `<type>` project with `+wit-common/scripts/init-repo`** from the `+wit-wiki` templates (revision `<commit>`, `<YYYY-MM-DD>`). The copied files are point-in-time and owned by this project (wit-templates D03).

## Repository branching model

- **D02 `main` stays generic — site-specific implementation lives in dedicated branches** (alternatives: single-branch development with witconsult.de code on `main`; one repository per site). `main` must only contain site-agnostic application code. Implementation-specific content for a site (e.g. witconsult.de) is developed on a dedicated branch; only general code is merged to `main`. This keeps the image and codebase reusable for future Payload instances without site forks polluting the generic baseline.

## Content sync

- **D03 The content mapping file is named `.arrcontent.yml`, one per site directory inside a content repository** (alternatives: `.witcontent.yml`; a configurable filename or `--config` flag; one config at repository root). A fixed, app-specific name at the site root (`<repo>/<domain>/`) means every site targeting this app is recognised without per-repo filename configuration, and a multi-site vault carries one config per domain. The name ties the mapping contract to the `arr` app rather than the generic `witcontent`/`payloadtools` tool.
  - *2026-09-30 amendment*: routes derive literally from the directory path — no stripping and no override table; the filename is always `webtext*.md` and carries no status. Filename statuses (`locked`/`entwurf`) are unused for this site: every `webtext*.md` syncs as draft and the Payload draft review (D04) is the only gate.

## Review gate

- **D04 External communication passes a human review gate** (WIT convention: external sends need approval — `+wit-common/taxonomies/communication-channels.md`; alternatives: the bot publishes directly; a later `--publish` batch). All synced content arrives as draft via `?draft=true`; only `editor` users may set `_status: 'published'`, enforced server-side, not by convention. Publish state is the only data the content repo does not own.

## Backlog (not decided, parked)

- `<idea discussed but deliberately not decided>`.
