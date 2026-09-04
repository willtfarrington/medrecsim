<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# content/formulary

Versioned synthetic formulary package (D-DATA-001, D-DATA-004): real generic names, original
descriptions, fictional brand coinages only, no bundled external terminology; pill appearance
as text (D-UX-004). `formulary.yaml` is the package manifest (`formularyVersion`); each entry is
one file under `entries/` named by its id (`rx-<generic>.yaml`); `citations.yaml` holds the
records that entry flags and monitoring notes cite (CITATION-POLICY.md §4).

At schema v0.1 (EP-9) the package holds two `placeholder: true` scaffold entries so the exemplar
bundle has ids to resolve; they are never compiled into the app without `--include-drafts`.
Wave 1 (EP-13) replaces them and starts `formularyVersion` 0.1.0. Content here is licensed
CC BY 4.0 (see `../../../LICENSE-CONTENT.md`).
