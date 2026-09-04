<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# `_exemplar` — case-bundle scaffold (EP-9)

A structure-complete case bundle whose every clinical string is `PLACEHOLDER — not reviewed`.
It exists so that the schema, the validator, the negative-fixture suite, and the compile step
have a real bundle to run against before any clinical content exists. The annotated exemplar
with real content (C01 "Three Lists") is authored and owner-reviewed at EP-14 and replaces
nothing here: this directory stays as the copy-me template.

| File                 | Layer              | Notes                                                                                                          |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `case.yaml`          | metadata           | identity, versions, tier, coverage declarations, review linkage, pre-brief                                     |
| `evidence.yaml`      | learner-observable | patient, T0, seven sources, claims, allergy claims, dialogue, artifacts, escalation channels                   |
| `reference.yaml`     | author-only        | regimen, actual use with knowability marks, discrepancies, action sets, escalations, hints, teaching-note refs |
| `citations.yaml`     | both               | ten-key citation records referenced by id                                                                      |
| `teaching-notes.md`  | author-only        | prose notes; anchors match `teachingNoteRefs`                                                                  |
| `CHANGELOG.md`       | governance         | bundle changelog (D-GOV-003)                                                                                   |
| `review-record.yaml` | governance         | absent here: the scaffold is `draft-unreviewed`; see REVIEW-RECORD-TEMPLATE.md                                 |

Field-by-field guidance: [`../../AUTHORING.md`](../../AUTHORING.md). Validate with
`pnpm content:validate`; the directory name starts with `_`, so `compile` skips it unless
`--include-drafts` is passed.
