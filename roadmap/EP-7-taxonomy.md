# EP-7 — Discrepancy taxonomy v1

**Size:** M · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** EP-6 (Clinical governance specs) · **Blocks:** EP-9 (Content schema v0 + validator core), EP-13 (Formulary wave 1)

## Context

Drafts the five-axis discrepancy metadata value-sets (type × causal mechanism × detectability ×
urgency × harm class) against AHRQ/ISMP/WHO/TJC sources, cited and dated (D-TAX-001); maps the
D-TAX-002 must-cover phenotypes onto them; and defines the ordinal scales the scoring system
reads (D-SCOR-001/003). **These enums become the schema source of truth verbatim at EP-9** —
changes after that freeze cost a codemod migration (D-DATA-002; risk noted in
[appendices/risk-register.md](appendices/risk-register.md) R-2). Allergies use the same
machinery (D-MED-003). Full drafted value-sets with source discussion:
[appendices/clinical-model.md](appendices/clinical-model.md) §1. Citations follow the EP-6
format and tiers.

## Safety & policy preconditions

- Synthetic-only content: n/a — no case content; value-sets are abstractions.
- Clinical sign-off (D-EXEC-003): ordinal anchors and value-sets shape scoring semantics — owner
  approval before the EP-9 enum freeze is an explicit checkpoint below.
- Harm language (D-SCOR-003): harm-class ordinals must be defined as *potential worst-credible
  outcome* labels — no probabilities, no invented statistics.
- Leak prevention: n/a beyond standard rules; login-gated sources per EP-6/I-15.
- Licensing/attribution (D-DATA-006): sources cited with version/access date; no redistributed
  source text beyond short attributed quotes.
- Accessibility (D-UX-004): n/a — docs.
- Security baseline (D-SEC-001): n/a.

## In scope

1. Taxonomy doc under `docs/clinical/` (beside the EP-6 instruments; log the exact path).
2. TYPE axis (13 values): omission; commission; wrong-dose; wrong-frequency-schedule;
   wrong-route (marked optional — decide keep/drop and log); wrong-formulation;
   wrong-strength-concentration; therapeutic-duplication; brand-generic-duplication;
   wrong-drug-lasa; restart-gap; status-discrepancy; allergy-record-discrepancy. Notes:
   prescribed-vs-actual is a mechanism family, stale import is a mechanism — the coverage matrix
   tracks charter *phenotypes*, not raw enums.
3. MECHANISM axis, grouped by intent stratum (literature's unintentional /
   undocumented-intentional split preserved as grouping): system/record
   (stale-record-propagation, transcription-error, lasa-confusion,
   transition-communication-gap, data-fragmentation, auto-population-default-error);
   undocumented intentional (prescriber-change-undocumented, hold-not-documented);
   patient/agent-side, systems-framed (cost-access-barrier, supply-interruption,
   regimen-complexity-misunderstanding, informed-self-adjustment, language-access-barrier);
   epistemic (informant-knowledge-limit). Mark the axis as a design construct grounded in
   MARQUIS/MATCH.
4. DETECTABILITY axis (7): single-source-explicit; cross-source-conflict; interview-elicited;
   artifact-dependent; escalation-dependent; longitudinal-inference; irreducible.
5. URGENCY ordinal U1 routine / U2 prompt (this shift) / U3 urgent (before next dose decision) /
   U4 immediate-time-critical (ISMP/CMS ±30-min anchor). HARM ordinals: severity S0–S4 anchored
   to NCC MERP Index 2022 as **potential** worst-credible outcome (adaptation explicitly
   stated); reversibility (3-level); time-to-harm (4-level: immediate / hours-day / days /
   weeks+). Document that urgency ≠ time-to-harm (workflow vs physiologic).
6. Phenotype mapping table: every D-TAX-002 must-cover phenotype → its primary enum value(s),
   so the coverage matrix (EP-20) can derive mechanically.
7. Divergence/disagreement notes vs sources: restart-gap is a pedagogic promotion; allergies
   included per D-MED-003; mapping to MedTax (Almanasreh 2019) and the 2016 review; TJC NPSG
   citation per the EP-6/SP-3 policy (cite-both with transition note).
8. Every value carries ≥1 citation in the EP-6 format with version + access date.

## Out of scope

- Schema encoding, TypeScript enums, validators → EP-9 (imports these values verbatim).
- Coverage-matrix CLI → EP-20. Case assignments of metadata → case EPs (EP-14, EP-26–32).
- Per-discrepancy freezability mechanics (D-RISK-004) → EP-9 schema requirement.

## Owner checkpoints

- Owner approves the value-sets, ordinal anchors, and the wrong-route keep/drop call **before
  EP-9 freezes them as schema enums** *(judgement — owner)*. Post-freeze changes require a
  D-DATA-002 codemod, so this checkpoint is the cheap moment to disagree.

## Verification / acceptance

- The doc exists; all five axes present, each a closed enumerated value-set with citations.
- The phenotype table covers every D-TAX-002 row (mechanical check: list-vs-list).
- Ordinal scales define every level with an anchor source; the severity scale states the NCC
  MERP adaptation; no probabilities anywhere.
- Divergence notes present for every departure from a cited source.

## Handoff

Standard fields, plus: the wrong-route decision + rationale; owner approval recorded (date);
exact enum spellings EP-9 must import; any source-access failures (risk R-6) and how cited.

## Parked → final-roadmap.md

none
