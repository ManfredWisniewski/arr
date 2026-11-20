# Backlog

Unassigned future work — human-owned parking lot (`common/conventions/tasks.md`). Tasks here carry `#task` but no `#persona/<name>` tag; assigning one moves the task into `+team/+tasks/<persona>.md`.

## Open

- [ ] #task payloadtools sync: design + implement cleanup for deleted/moved webtext files — pages/posts/structures docs are never removed, so orphans stay live at their old route (media/ already mirrors with a delete pass; mirror per-collection by comparing local relpaths vs remote sourcePath + sourceRepo) ⏳ 2026-10-24
- [ ] #task Evaluate porting biti's Payload layout-builder surface to arr if a block/heros model is ever introduced (needs architecture decision — arr renders markdown+templates, not blocks): `ArchiveBlock`, `Banner`, `CallToAction`, `Code`, `Content`, `Form` block (incl. `Checkbox`, `Country`, `Email`, `Error`, `Message`, `Number`, `Select`, `State`, `Text`, `Textarea`, `Width` field components), `MediaBlock`, `RelatedPosts`, `WitSpace` block, heros `HighImpact`/`LowImpact`/`MediumImpact`/`PostHero`/`RenderHero`, `CollectionArchive`, `CMSLink`, `Media` (`ImageMedia`/`VideoMedia`), `PageRange`, `Pagination` (archive), `PayloadRedirects`, `RichText`, `AdminBar`, `LivePreviewListener`, `Logo`, `BeforeDashboard`/`SeedButton`, `BeforeLogin`, post `Card` ⏳ 2026-10-25
