# EP-27 — Cases C03 + C05

**Size:** M · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-21 (Phone channel & escalations) ·
**Blocks:** EP-35 (Roster closure audit)

## Context

Two core-tier cases (OQ-2 assumption: roster = 11). Canonical sketches in
[appendices/clinical-model.md](appendices/clinical-model.md); summary:

- **C03 "Pillbox and the OR" (core).** Atrial fibrillation on apixaban, admitted with hip
  fracture, surgery scheduled next morning; wife manages a weekly pillbox. Planted phenotypes:
  wrong dose (pillbox loaded 5 mg BID vs the documented dose reduction to 2.5 mg), omission (OTC
  naproxen), status discrepancy (old warfarin bottle at home — stopped-by-clinician). The
  periprocedural hold/bridge question is **escalation-only** (D-TAX-003): the accepted set routes
  it to senior/attending + inpatient pharmacist; any learner-authored bridging plan sits in the
  unsafe set with mechanism-of-harm text. Clock interaction: U3 urgency — last-dose timing versus
  surgery makes the anticoagulant question decision-relevant before the next dose window.
  Sources right/wrong: pillbox (artifact) is the decisive physical evidence; the wife is a
  reliable informant for administration, not for the dose-change rationale.
- **C05 "Held, Not Stopped" (core).** Polymyalgia rheumatica on chronic prednisone, admitted with
  pneumonia. An urgent-care note wrongly says "steroids stopped"; the ED-imported list omits
  prednisone entirely. Planted phenotypes: omission, restart gap with adrenal-suppression risk
  (D-TAX-003 corticosteroid restart), status discrepancy (held vs stopped). The PCP callback is
  authored **definitive and required** — the expected-escalation set includes the outpatient
  prescriber office call, with EP-21 latency riding the clock. Clock interaction: U3 — the
  evening prednisone decision arrives before an unhurried learner would otherwise resolve it.
  Record-wrong texture: the written record is wrong, the patient's account is right.

EP-14 established the bundle shape, checklists, and golden harness; EP-21 provides the phone
machinery both cases score against.

## Safety & policy preconditions

- Synthetic-only: fully invented; fictional-universe registry names; formulary IDs only.
- Clinical sign-off (D-EXEC-003): accepted/unsafe sets, escalations, and teaching notes bind only
  after the owner gate below.
- Harm language (D-SCOR-003): plausible-consequence + ordinal labels; EP-20 lint passes;
  adrenal-suppression and anticoagulation consequences phrased without invented statistics.
- Leak prevention: no screenshots; private archives of login-gated sources with public pointers
  (I-15).
- Licensing/attribution (D-DATA-006): citations with version/access dates; registry rows for new
  reference material.
- Accessibility (D-UX-004): renderText + pill descriptors authored for the pillbox and bottle
  artifacts (INV-A11Y-001).
- Stigma safety (D-GOV-004): standard checklist both cases; caregiver (wife) agency item applies
  to C03.

## In scope

1. Author the C03 bundle (evidence + reference layers, teaching notes, citations ≥1 Tier-A/B per
   scored rule, review-record stub, changelog), including the escalation-only anticoagulation
   design: bridging appears **nowhere** in accepted or partially-accepted sets.
2. `validate --all` + `coverage` green; coverage declarations match (INV-META-001).
3. Golden scripts ×3 for C03 (full-credit / hint / unsafe — the unsafe path exercises a
   learner-bridging action and its mechanism card).
4. **Validator proof for C03:** demonstrate mechanically (validator query or dedicated test) that
   every bridging-related action entry exists only in the expected-escalation or unsafe sets —
   commit the proof as a test so regressions fail CI.
5. Run the clinical self-review checklist (incl. its high-alert audit item confirming
   anticoag-as-escalation) and the stigma-safety checklist for C03.
6. Repeat 1–3 and 5 for C05, with the required PCP-callback escalation and the restart-gap
   teaching notes; golden full-credit path includes placing the call and acting on the result.
7. **STOP at ready-for-review**; present both cases with checklist outputs.

## Out of scope

- Phone UI changes — EP-21 owns mechanics; author content only.
- Other cases — EP-26/28…32. Bulk formulary — EP-33.
- Any learner-managed bridging pathway — permanently out (D-TAX-003), not parked.

## Owner checkpoints

**OWNER SIGN-OFF GATE ×2 (D-GOV-001, D-EXEC-003).** Not done until a signed, versioned, dated
public review record exists beside each case. Outward copy: "physician-reviewed (single
reviewer)", never "expert-reviewed".

## Verification / acceptance

- `validate`, `coverage`, goldens, bridging-proof test, and full CI green on both OSes.
- Both checklists complete per case with sign-off blocks; review records exist and parse, with
  badge fields (D-RISK-003).
- *(judgement — owner)* clinical acceptability, recorded in the review records.

## Handoff

Standard fields + content versions, coverage rows, golden IDs, the bridging-proof test path, and
review-record paths. State explicitly whether the gate is passed; pending sign-off keeps the EP
open regardless of green CI. The two case bundles may be authored in two sittings under this
same brief (one case per sitting) without violating the one-EP-per-session rule; the handoff
records which case is complete.

## Parked → final-roadmap.md

none expected; ideas discovered while authoring are parked (D-RISK-002).
