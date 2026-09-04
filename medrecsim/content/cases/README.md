<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# content/cases

One directory per case bundle (D-GOV-003): `case.yaml`, `evidence.yaml`, `reference.yaml`,
`citations.yaml`, `teaching-notes.md`, `CHANGELOG.md`, and — once reviewed — `review-record.yaml`
(REVIEW-RECORD-TEMPLATE.md). Dialogue trees live inside `evidence.yaml` at schema v0.1.
Every bundle is fully synthetic and carries a public, dated review record before publication
(D-GOV-001). Content here is licensed CC BY 4.0 and every file carries the SPDX header.

- [`_exemplar/`](_exemplar/README.md) — the structure-complete scaffold (all clinical text
  `PLACEHOLDER — not reviewed`); copy it to start a bundle. Directories starting with `_` are
  drafts: validated, never compiled unless `--include-drafts`.
- The real annotated exemplar (C01 "Three Lists") arrives with EP-14.

Field guide: [`../AUTHORING.md`](../AUTHORING.md). Validate: `pnpm content:validate`
(from `medrecsim/`).
