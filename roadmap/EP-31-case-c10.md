# EP-31 — Case C10 — insulin/surrogate

**Size:** M · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-22 (Artifact viewer & source voices),
EP-23 (Interview modes) · **Blocks:** EP-35 (Roster closure audit)

## Context

Core case; the roster's surrogate case (D-CONS-001 — one surrogate case suffices per
integrator resolution I-13) and its unit/concentration high-alert carrier (D-TAX-002/003).
Canonical sketch in [appendices/clinical-model.md](appendices/clinical-model.md); summary:

**C10 "Units of Insulin".** Patient obtunded in hyperosmolar hyperglycemic state; the daughter is
the **documented health-care agent** — authorization explicit in-case, capacity assessment an
authored fact, never a learner task (D-CONS-001). Home regimen: concentrated **U-500 regular
insulin** plus mealtime U-100 aspart; the record says "insulin regular 60 units TID" — a
wrong-strength/concentration hazard (ISMP U-500 anchor) plus wrong-dose, with authored
informed-self-adjustment texture. Record-wrong case (counts toward D-CASE-002's ≥2). The
**EMS-bagged vials are the decisive artifacts** (EP-22 viewer: labels, concentration, pill/vial
descriptors). Second scored **allergy sub-task** (D-MED-003): chart "sulfa" allergy resolves to a
remote TMP-SMX rash with tolerated glipizide since. Expected escalation: inpatient pharmacist
consult authored **required** before any insulin action; unsafe set anchors on treating U-500
volumes as U-100 units, with mechanism-of-harm. Interview runs in surrogate mode (EP-23):
third-person menus, authorization banner, denser unknown-to-source responses. Clock: urgent
texture around glycemic management, but scoring centers verification-before-action rather than a
timed dose event.

## Safety & policy preconditions

- Synthetic-only: fully invented; registry names; formulary IDs only (U-500/U-100 entries with
  concentration notes and cited high-alert flags must exist — add minimally if absent).
- Clinical sign-off (D-EXEC-003): action sets, required-escalation design, allergy sub-task
  scoring, and teaching notes bind only after the owner gate below.
- Harm language (D-SCOR-003): overdose/underdose consequences phrased plausible-consequence with
  ordinals; no invented statistics; EP-20 lint passes.
- Leak prevention: no screenshots; I-15 pointer rule for login-gated sources (ISMP U-500 material
  may be gated: public bibliographic pointer + private archive).
- Licensing/attribution (D-DATA-006): Tier-A citations (ISMP concentrated-insulin guidance) with
  version + access date; registry rows added.
- Accessibility (D-UX-004): vial artifacts get full structured transcriptions + text descriptors
  (INV-A11Y-001); nothing decisive is image-only.
- Stigma safety (D-GOV-004): surrogate/elder agency items — the daughter is a competent,
  respected informant; informed-self-adjustment framed as engagement, not misbehavior.

## In scope

1. Author the C10 bundle: evidence layer (record's wrong "regular 60 units TID" claim; EMS vial
   artifacts with label claims; surrogate dialogue trees incl. unknown-to-source; allergy
   claims), reference layer (wrong-strength/concentration + wrong-dose + informed-self-adjustment
   discrepancies with five-axis metadata; accepted set = artifact verification + required
   pharmacist consult + correct allergy reclassification; unsafe set = U-500-as-U-100 actions and
   acting without verification, each with mechanism-of-harm), teaching notes, citations,
   review-record stub, changelog.
2. Verify/add formulary entries for U-500 regular and U-100 aspart with concentration notes,
   high-alert flags, and citations (INV-REF-001; bulk growth stays in EP-33).
3. `validate --all` + `coverage` green; declarations match (INV-META-001).
4. Golden scripts ×3: full-credit (artifact-decisive path + pharmacist consult + allergy
   resolution), hint path, unsafe path (concentration error).
5. Clinical self-review checklist (high-alert audit: U-500 handling vs current ISMP guidance;
   ≥2 corroborating sources for the BPMH) — record dispositions.
6. Stigma-safety checklist (surrogate-agency emphasis) — record dispositions.
7. **STOP at ready-for-review**; present the case with checklist outputs.

## Out of scope

- Artifact viewer / surrogate-mode mechanics — EP-22/EP-23. Other cases — EP-26…30, 32.
- Insulin pumps — final-roadmap.md B-8 (D-TAX-003 deferral). Bulk formulary — EP-33.

## Owner checkpoints

**OWNER SIGN-OFF GATE (D-GOV-001, D-EXEC-003).** Not done until a signed, versioned, dated
public review record exists beside the case. Outward copy: "physician-reviewed (single
reviewer)", never "expert-reviewed".

## Verification / acceptance

- `validate`, `coverage`, goldens, full CI green on both OSes.
- Both checklists complete with sign-off blocks; review record exists, parses, carries badge
  fields (D-RISK-003).
- Allergy sub-task appears in coverage as an allergy-discrepancy carrier (with C06).
- *(judgement — owner)* clinical acceptability, recorded in the review record.

## Handoff

Standard fields + content version, coverage rows, golden IDs, formulary entries touched,
review-record path. State whether the gate is passed; pending sign-off keeps the EP open.

## Parked → final-roadmap.md

none expected; discovered ideas are parked (D-RISK-002).
