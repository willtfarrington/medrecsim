# ADR-7 — Content schema v0.1: the six schema tensions and the claim-status vocabulary

**Status:** accepted · **Date:** 2026-09-04 (EP-9) · **Implements:** D-MED-001/002/003/005,
D-DATA-002/003/004, D-GOV-003, D-TAX-001 (verbatim EP-7 enums), D-SCOR-003, D-RISK-004; integrator
resolutions I-6 and I-9; the OQ-3 relabel · **Reversibility:** each tension below is a reversible
technical call (D-EXEC-003) until the first reviewed case ships at EP-14; afterwards a reversal is
a schema minor (additive) or major (codemod, EP-34) bump. Token or vocabulary changes are
clinical-semantics changes and stay owner-only.

## Context

`roadmap/appendices/architecture.md` §3 outlines the content files and names six tensions
(T-1…T-6) for the schema EP to decide and record. D-MED-001 delegates refinement of the
claim-status vocabulary to the same EP. This record fixes those decisions for schema `0.1`;
the shapes themselves live in `medrecsim/packages/schema/src` and the field guide in
`medrecsim/content/AUTHORING.md`.

## Decisions

| Tension | Decision | Rationale (one line each) |
|---|---|---|
| **T-1** relative vs absolute time | **Author relative, compile absolute.** `SimTime` is `T0` plus signed offsets (`T0-2y`, `T0-3d-4h`, `T0+30m`); an absolute ISO-8601 with offset is accepted for fixed-calendar facts. `compile` resolves every SimTime to an absolute UTC instant; years/months use UTC calendar arithmetic. | Authors think in "two years before admission"; the engine and the knowable-when timeline need instants; one deterministic resolver (`resolveSimTime`) serves both and INV-TIME-001 compares resolved values. |
| **T-2** unresolved-label escape hatch vs D-DATA-004 | **Ratified as a sanctioned, explicit flag.** A medication is `formularyId` **xor** `unresolvedLabel: {text, sanctioned: true, reason}` with a closed reason enum (`patient-description-only`, `illegible-or-partial-label`, `non-formulary-product`, `informant-cannot-name`). INV-REF-001 enforces the xor and resolution. | D-DATA-004 holds for anything the formulary can name; "the little white pill" is pedagogically real (C04, C08) and must be authorable, but every escape stays visible and countable (EP-20 coverage can report them). |
| **T-3** claim-reveal granularity | **The claim is the reveal atom; no partial-field reveals.** A source asserting two distinct things authors two claims; `visibility: with-source \| on-reveal` controls whether a dialogue node, artifact, or escalation response reveals it. | The debrief's earliest-knowable/accessed/logged triple is per claim; per-field knowability has no v1 consumer; adding an optional `fields` list later is an additive minor bump. Parked as P-004. |
| **T-4** detectability AND/OR encoding | **Disjunctive normal form.** `detectabilityPaths[]` is an OR over paths; each path `{detectability, requires[]}` is an AND over evidence references (`kind:id`). | DNF is the plainest encoding an author can read, mirrors the taxonomy's "≥1 path" rule directly (INV-DISC-001), and gives EP-20's reachability check (INV-DISC-002) a graph to walk without a boolean-expression parser. |
| **T-5** shared vs per-case rationale menus | **Per-case menus** in `reference.yaml` (`actionSets.rationaleMenu[]`); entries reference a key or carry inline text; both are linted. | Each bundle has its own content version and owner sign-off (D-GOV-003, D-EXEC-003); a shared menu would couple every case's review to one file. A shared registry in the universe package can be added additively if EP-26–32 show heavy duplication. Parked as P-005. |
| **T-6** hint-text location | **Reference layer, one record per target with all three grades** (`hints[]: {targetDiscrepancyId, nudge, directed, revealSource{text, sourceRef}}`), refining I-6. | Hints are keyed to discrepancy ids, which the evidence layer may not name (INV-TRUTH-001); one record per target makes INV-HINT-001 (EP-20) a shape check; the reference layer is public by design so nothing is hidden by the placement. |

**Claim-status vocabulary (D-MED-001).** The eleven tokens are adopted verbatim for schema 0.1
(`prescribed · dispensed · taking-as-directed · taking-differently · held-by-clinician ·
self-discontinued · stopped-by-clinician · course-completed · restarted · never-started ·
unknown-to-source`). Operational meanings are stated in AUTHORING.md §4 as *what the token says
about the source's assertion*, not as clinical definitions; `taking-differently` requires
`howTakingDifferently` (INV-SHAPE-001). The reference layer's actual-use status reuses the set
minus `unknown-to-source` (author uncertainty is expressed by knowability marks instead,
D-MED-005). Refinement against AHRQ/ISMP definitions is deferred to the owner's review of the
first reviewed case (EP-14): if the wording of any token should change, that is an owner
decision and a schema minor bump with a re-stamp.

**Other shape decisions recorded here (reversible):**

- Dialogue trees live inside `evidence.yaml` (`dialogueTrees[]`) at 0.1; the separate
  `dialogue.yaml` in architecture §1 is not used. Splitting later is additive.
- `reviewStatus: draft-unreviewed | reviewed` on `case.yaml` makes the review linkage explicit:
  drafts carry no record or badge and validate with a warning; directories starting with `_`
  and drafts are excluded from `compile` unless `--include-drafts`.
- `schemaVersion` stamps must **equal** `SCHEMA_VERSION` exactly (major and minor): a minor bump
  re-stamps every bundle in the same change (trivial because minors are additive), which keeps
  INV-VERS-001 a one-line check.
- Version ranges for the shared packages are `{min, maxExclusive?}` objects, not npm range
  strings (no parser to maintain).
- Citation records use the policy's exact ten keys with no additions; the `source` key must have a
  registry and policy row (INV-REG-001).
- Package-local invariant ids outside the 17-entry catalogue: `INV-SHAPE-001` (co-requirements and
  intra-bundle referential integrity), `INV-SPDX-001`, `INV-REG-001`.

## Consequences

- EP-11 consumes compiled JSON with absolute times only; the engine never sees `T0±` syntax.
- EP-13 authors formulary entries against `FormularyEntry`; any real brand name anywhere in
  content fails INV-SCOPE-001's denylist, so coinages must be original.
- EP-14's exemplar starts from `content/cases/_exemplar/` and flips `reviewStatus` only when the
  public review record exists.
- EP-20 lands the deferred invariants on these shapes without schema changes (the fields they
  need already exist).
- Reversing T-2, T-3 or T-5 is additive; reversing T-1 or T-4 is a codemod.
