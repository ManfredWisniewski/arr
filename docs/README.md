# arr documentation site (docs-as-code)

The documentation for `arr` — a [Docusaurus](https://docusaurus.io) site
whose static export is baked into the arr Docker image and served at
`/docs/` on every running instance. Spec:
`+wit/specs/arr/docusaurus/`.

## Layout

| Path | Contents |
|---|---|
| `docs/` | Developer/operator docs → `/docs/dev/` |
| `docs-editor/` | Editor docs → `/docs/editor/` |
| `blog/` | Release notes → `/docs/blog` |
| `i18n/de/` | German translations |
| `src/css/custom.css` | Infima → biti token mapping |
| `src/css/tokens/` | vendored biti token snapshot (committed — refresh below) |

## Commands

Run from the **repository root**:

```sh
npm run docs:dev     # dev server with hot reload
npm run docs:build   # build export → public/docs/
```

Branding comes from the **vendored** biti token snapshot in
`src/css/tokens/` — committed, so neither local builds nor the image
build need the biti submodule. Refresh it when biti tokens change
(requires the `biti` submodule locally):

```sh
git submodule update --init biti
npm --prefix docs run tokens     # rebuilds biti/tokens, copies the CSS
# commit src/css/tokens/ if the files changed
```

## Versioning

Releases are cut automatically on every `main` push
(`.github/workflows/version-bump.yml` — conventional-commit level:
`feat` → minor, `BREAKING`/`!` → major, else patch). Doc snapshots are
cut **manually on minor/major releases** (decision in
`+wit/specs/arr/docusaurus/plan.md`) — patch releases don't need a docs
version:

```sh
cd docs
npm run docusaurus docs:version 0.2.7   # the docs version = the release tag, without the v prefix
```

This snapshots the developer docs into `versioned_docs/` and adds the
version to `versions.json` — commit both with the release. The in-repo
sources always represent the "Next" (unreleased) version. First snapshot:
the release that ships this feature.

## Linting

English sources (`docs/`, `blog/`, `docs-editor/`) are linted with
[Vale](https://vale.sh) using the Microsoft + write-good style packs
(config: `/.vale.ini`); German prose is covered by the repo's
markdownlint. Locally:

```sh
vale sync
vale docs/docs docs/blog docs/docs-editor
```
