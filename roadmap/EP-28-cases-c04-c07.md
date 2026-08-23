# EP-28 — Cases C04 + C07

**Size:** M · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-21 (Phone channel & escalations) ·
**Blocks:** EP-35 (Roster closure audit)

## Context

Two core-tier cases (OQ-2 assumption: roster = 11). Canonical sketches in
[appendices/clinical-model.md](appendices/clinical-model.md); summary:

- **C04 "Stretching the Refills" (core).** Admission for rule-out ACS. An insurance-coverage
  lapse led the patient to stretch supplies: glimepiride taken every other day and the statin
  self-discontinued — the roster's affordability/access-driven prescribed-vs-actual case
  (D-TAX-002), framed as a cost-access systems barrier, never personal failing. Planted
  phenotypes: prescribed-vs-actual mismatch ×2 (cost-driven), LASA hazard (a
  glipizide/glimepiride transcription error in an outpatient note), commission (ezetimibe
  prescribed, never started). Detection texture: the community-pharmacy fill history is the
  decisive **longitudinal inference** — gap patterns, not any single claim. Irreducible element:
  the exact stretching pattern is approximable only; the accepted set honors a ranged/
  unable-to-verify answer (D-MED-005). Expected escalation: inpatient pharmacist (assistance
  programs). Clock: routine; pharmacy latency only.
- **C07 "On Time, Every Time" (core).** Parkinson disease admitted with urosepsis; home regimen
  is five custom-timed carbidopa-levodopa doses daily, but the record says "TID". The roster's
  **time-critical clock case** (D-TAX-003; ISMP ±30-minute anchor). Planted phenotypes:
  wrong-frequency/schedule, wrong formulation (IR vs CR), omission (entacapone). The patient is a
  reliable, precise historian — the deliberate contrast case; the record is wrong. Clock
  interaction: U4 — a deterministic authored delay→symptom event fires if the next levodopa dose
  window is missed, surfaced in the debrief timeline (D-WF-002; pressure is a planning problem,
  no real-time element).

EP-14 established bundle shape, checklists, and goldens; EP-21 provides pharmacy-call latency.

## Safety & policy preconditions

- Synthetic-only: fully invented; registry names; formulary IDs only (LASA pair flags must exist
  in the formulary — add/verify with cited flags).
- Clinical sign-off (D-EXEC-003): action sets, escalations, the delay-event authoring, and
  teaching notes bind only after the owner gate below.
- Harm language (D-SCOR-003): the C07 delay event is authored plausible-consequence with ordinal
  severity — not an invented statistic; EP-20 lint passes.
- Leak prevention: no screenshots; I-15 pointer rule for any login-gated source.
- Licensing/attribution (D-DATA-006): citations with version/access dates (ISMP time-critical and
  LASA lists are expected Tier-A anchors); registry rows added.
- Accessibility (D-UX-004): renderText + pill descriptors authored; the delay event's status-card
  text is authored here for the EP-15/EP-24 announcer machinery (INV-A11Y-001).
- Stigma safety (D-GOV-004): C04 is the checklist's systems-framing stress test — cost-access
  language verified item-by-item; no "non-compliant" vocabulary anywhere.

## In scope

1. Author the C04 bundle (evidence + reference layers, teaching notes, citations ≥1 Tier-A/B per
   scored rule, review-record stub, changelog), including the fill-history gap data that makes
   the longitudinal inference work and the irreducible ranged answer in the accepted set.
2. `validate --all` + `coverage` green; declarations match (INV-META-001); INV-REF-002 confirms
   the LASA pair is bidirectional in the formulary.
3. Golden scripts ×3 for C04 (full-credit / hint / unsafe).
4. Clinical self-review checklist + stigma-safety checklist for C04 (systems-framing emphasis).
5. Author the C07 bundle, including the five custom dose times, the deterministic delay→symptom
   trigger with its clock threshold, and IR/CR formulation data.
6. `validate --all` + `coverage` green for C07; golden scripts ×3 **plus the delay-branch
   golden**: a fourth script that lets the dose window lapse and snapshots the fired event and
   its debrief representation.
7. Clinical self-review checklist (high-alert audit: levodopa ±30-minute rule against current
   ISMP guidance, cited) + stigma-safety checklist for C07.
8. **STOP at ready-for-review**; present both cases with checklist outputs.

## Out of scope

- Clock/announcer UI mechanics — EP-15/EP-21/EP-24 own them; author content only.
- Other cases — EP-26/27/29…32. Bulk formulary — EP-33.
- P-002 pharmacy-flag interruption — parked (OQ-4 assumption: v1.x).

## Owner checkpoints

**OWNER SIGN-OFF GATE ×2 (D-GOV-001, D-EXEC-003).** Not done until a signed, versioned, dated
public review record exists beside each case. Outward copy: "physician-reviewed (single
reviewer)", never "expert-reviewed".

## Verification / acceptance

- `validate`, `coverage`, goldens (incl. the C07 delay-branch golden), and full CI green on both
  OSes.
- Both checklists complete per case; review records exist, parse, and carry badge fields
  (D-RISK-003).
- *(judgement — owner)* clinical acceptability, recorded in the review records.

## Handoff

Standard fields + content versions, coverage rows, golden IDs (naming the delay-branch snapshot),
formulary entries touched, and review-record paths. State whether the gate is passed; pending
sign-off keeps the EP open regardless of green CI. The two case bundles may be authored in two
sittings under this same brief (one case per sitting) without violating the one-EP-per-session
rule; the handoff records which case is complete.

## Parked → final-roadmap.md

none expected; discovered ideas are parked (D-RISK-002).
