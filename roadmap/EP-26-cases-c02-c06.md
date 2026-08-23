# EP-26 — Cases C02 + C06

**Size:** M · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-21 (phone & escalations — engine escalation module) · **Blocks:** EP-35 (Roster closure audit)

## Context

Two cases from the 11-case roster (OQ-2 assumption: roster = 11, tiers 2/6/3). Full sketches,
coverage assignments, and source layouts are canonical in
[appendices/clinical-model.md](appendices/clinical-model.md); summary:

- **C02 "Twice the Same Medicine" (introductory).** Older adult admitted after syncope; two
  pharmacies and two prescribers have fragmented the regimen. Planted phenotypes: brand/generic
  duplication (metoprolol succinate as generic and under a fictional brand label — real brand
  names are schema-banned, INV-SCOPE-001/D-DATA-001), therapeutic duplication (omeprazole +
  pantoprazole), commission (hydrochlorothiazide prescribed, never started). Right/wrong sources:
  each dispensing history is individually accurate but incomplete; only cross-source comparison
  and interview reveal the duplications. Expected escalations: community pharmacy + outpatient
  prescriber office. No irreducible elements; clock interaction limited to authored access costs
  and pharmacy latency.
- **C06 "In Her Own Words" (core).** Spanish-preferring grandmother admitted with heart-failure
  exacerbation. Requesting the professional interpreter is the modeled-correct action; the
  grandson's ad-hoc interpretation is authored faster but lower-reliability (D-CONS-002,
  systems/access framing). Planted phenotypes: wrong frequency (furosemide taken once daily vs
  prescribed twice daily after English-only instructions), omission (herbal tea + potassium
  supplement), and the roster's first scored allergy sub-task (chart says "penicillin
  anaphylaxis"; the accurate history is childhood nausea plus recently tolerated amoxicillin —
  D-MED-003). Record-wrong case (patient correct, chart wrong — counts toward D-CASE-002's ≥2).
  Clock: interpreter turns carry disclosed authored costs; no time-critical medications.

EP-14 established the exemplar bundle shape, both checklists, and the golden harness. Engine
goldens for C06 run headless; full interactive play of C06 needs EP-23's interpreter mode — note
this in the handoff if EP-23 has not landed.

## Safety & policy preconditions

- Synthetic-only: both cases fully invented; no deidentified-from-memory material; fictional
  institutions/pharmacies from the shared registry; formulary IDs only, never free-text drug names.
- Clinical sign-off (D-EXEC-003): accepted/partially-accepted/unsafe sets, expected escalations,
  scoring-relevant metadata, and teaching notes are drafted here but **bind only after owner
  sign-off** — the explicit gate below.
- Harm language (D-SCOR-003): plausible-consequence phrasing with ordinal labels; the EP-20 lint
  must pass; numbers only inside cited teaching notes.
- Leak prevention: no screenshots; archived login-gated sources stay private with a public
  bibliographic pointer (integrator resolution I-15).
- Licensing/attribution (D-DATA-006): every citation row carries source/version/access date;
  registry updated for any new reference material.
- Accessibility (D-UX-004): authored renderText, nonvisual pill descriptors, and interpreter
  dialogue as text (INV-A11Y-001).
- Stigma safety (D-GOV-004): C06 carries emphasis — language-access framed as a systems barrier;
  interpreter/elder agency items of the checklist decisive; pre-brief sensitive-content note depth
  decided here per integrator resolution I-17.

## In scope

1. Author the C02 bundle: evidence layer (sources, claims, dialogue, escalation channels) +
   reference layer (reference regimen, actual-use state, five-axis discrepancy metadata,
   accepted/partial/unsafe action sets with rationales, expected escalations, three-grade hints)
   + teaching notes + citations (≥1 Tier-A/B per scored rule, D-GOV-002) + review-record stub +
   changelog.
2. `validate --all` + `coverage` green; C02's declared coverage rows match (INV-META-001).
3. Golden scripts ×3 for C02 — full-credit, hint-using, unsafe path — snapshotted.
4. Run the clinical self-review checklist (12 sections) for C02; record dispositions.
5. Run the stigma-safety checklist for C02.
6. Repeat steps 1–5 for C06, adding the interpreter/ad-hoc dialogue trees, the allergy sub-task
   claims, and heightened attention to the stigma checklist's interpreter, elder-agency, and
   systems-framing items.
7. **STOP at ready-for-review.** Present both cases with checklist outputs; make no further
   content edits except those the owner review directs.

## Out of scope

- Interpreter-mode UI mechanics — EP-23. Any other case — EP-27…EP-32.
- Formulary additions beyond entries these cases need (add minimally, cite flags) — bulk is EP-33.
- Scoring-engine changes — owner-gated via EP-12 goldens (OQ-8).

## Owner checkpoints

**OWNER SIGN-OFF GATE ×2 (D-GOV-001, D-EXEC-003).** This brief is not done until a signed,
versioned, dated **public review record** exists beside each case bundle. Outward copy says
"physician-reviewed (single reviewer)" — never "expert-reviewed".

## Verification / acceptance

- `validate`, `coverage`, golden snapshots, and full CI green on both OSes.
- Both checklists completed per case with sign-off blocks filled.
- Public review records exist, parse (INV-META-001), and carry the pre-brief badge fields
  (D-RISK-003).
- *(judgement — owner)* clinical acceptability of both cases, recorded in the review records.

## Handoff

Standard fields + case content versions, coverage rows contributed, golden snapshot IDs, checklist
versions used, and the review-record paths. State explicitly whether the gate is passed; if
sign-off is pending, the EP remains open regardless of green CI. Note the EP-23 dependency for
C06 interactive play. The two case bundles may be authored in two sittings under this same brief
(one case per sitting) without violating the one-EP-per-session rule; the handoff records which
case is complete.

## Parked → final-roadmap.md

none expected; new case ideas discovered while authoring are parked (D-RISK-002).
