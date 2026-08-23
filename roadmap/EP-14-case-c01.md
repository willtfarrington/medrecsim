# EP-14 — Case C01 exemplar + review

**Size:** M · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-12 (Engine scoring, signature, debrief data + golden harness), EP-13 (Formulary wave 1) · **Blocks:** EP-19 (Picker, pre-brief, about + v0.1 release) and every R2 case EP (EP-26–EP-32)

## Context

Authors the R1 vertical-slice case and canonical exemplar: **C01 "Three Lists"** — introductory
tier, adult cellulitis admission from the ED, organized reliable historian, a handwritten
medication list vs a 2-year-stale imported EHR list. Authored discrepancies: stale-import
commission (amlodipine still listed), omission (OTC ibuprofen + calcium/vitamin D), and
wrong-frequency (weekly levothyroxine "holiday" schedule). This is record-is-wrong case #1
(D-CASE-002) and deliberately contains no high-alert medication. Fully authored and
deterministic (D-CASE-001); one directory per case (D-GOV-003); two-layer contract complete
(D-MED-005). Exemplar-first authoring is the schema-churn mitigation (risk R-2 in
[appendices/risk-register.md](appendices/risk-register.md)). Full case spec:
[appendices/clinical-model.md](appendices/clinical-model.md) §2.

## Safety & policy preconditions

- Synthetic-only content: entirely fictional patient/story; identities from the EP-10 registry;
  visibly fictional identifiers; nothing "deidentified from memory."
- Clinical sign-off (D-EXEC-003): accepted/unsafe sets, expected escalations, and teaching
  notes are owner-approved content — **the D-GOV-001 lifecycle gate below is the definition of
  done.**
- Harm language (D-SCOR-003): all consequence text plausible-consequence + ordinal severity; no
  probabilities; numbers only from cited teaching notes (lint-enforced INV-ACT-001).
- Leak prevention: standard rules; the bundle is public by design (reference layer included —
  D-GOV-003).
- Licensing/attribution (D-DATA-006): bundle is CC BY 4.0 with SPDX headers; every clinical
  rule cites ≥1 Tier-A/B source with version + access date (D-GOV-002).
- Accessibility (D-UX-004): artifact `renderText` (handwritten-list transcription) and
  descriptor text authored — nonvisual parity is authored content, not UI garnish.
- Security baseline (D-SEC-001): n/a beyond standing rules.

## In scope

1. Author the full bundle in `content/cases/c01-three-lists/` (case.yaml, evidence.yaml,
   reference.yaml, dialogue in evidence, teaching-notes.md, citations, review-record.md
   placeholder, CHANGELOG.md), consuming EP-13 formulary IDs only.
2. Evidence layer: T0 + ED context; sources for this case (structured interview, handwritten
   list artifact, stale imported list; minimal others as authored); every claim with dual
   timestamps (D-MED-002) and D-MED-001 statuses; dialogue tree per D-SIM-001 with costs and
   reveals.
3. Reference layer per D-MED-005: reference regimen; actual-use state with knowability marks;
   the three discrepancies with full five-axis metadata + detectability paths + ordinals;
   accepted/partiallyAccepted/unsafe action sets, each entry with rationale, each unsafe with
   mechanism-of-harm; expected escalations (introductory-level); three hint grades per
   discrepancy (nudge → directed → reveal-source); pre-brief text with objectives + synthetic
   banner + badge fields (D-PED-001, D-RISK-003).
4. Teaching notes with citations in the EP-6 format.
5. Promote this bundle to the annotated exemplar: replace/retire the EP-9 scaffold; update the
   schema-derived authoring doc's cross-links (D-DATA-005).
6. Re-script the golden harness against real C01 (full-credit, hint-using, unsafe-path) and
   lock snapshots.
7. Run `validate --all`; run both EP-6 checklists in preparation form (agent pre-fills evidence
   for each item; the owner executes and signs them).

## Out of scope

- Any other case → EP-26–EP-32. Escalation-channel UI → EP-21. Interview modes → EP-23.
- Playing the case in the UI → EP-15–EP-19 (engine + golden prove it headlessly here).
- Schema changes discovered while authoring → EP-9's package with a logged decision (batch per
  risk R-2, don't drift).

## Owner checkpoints

- **Owner sign-off gate (explicit, D-GOV-001):** draft → CI validation → clinical self-review
  checklist → stigma-safety checklist → **versioned, dated PUBLIC review record committed
  beside the case** (review-record.md; badge fields; "physician-reviewed (single reviewer)") →
  publish. **Agent work stops at "ready-for-review". This brief is NOT done until the signed
  public review record exists.** *(judgement — owner)*

## Verification / acceptance

- `validate --all` green; golden snapshots for all three scripts locked and green in CI.
- Bundle contains every D-GOV-003 file; INV-DISC/ACT/CIT-presence checks pass; every clinical
  rule carries ≥1 A/B citation.
- Winnability evidence: the full-credit golden script reaches signature within accepted sets
  (the formal INV-ACT-002 solver arrives at EP-20).
- `content/cases/c01-three-lists/review-record.md` exists, signed, dated, disposition
  "approved" *(judgement — owner)*.
- `main` runnable, CI green.

## Handoff

Standard fields, plus: schema friction log (candidate batched changes for the post-EP-19
re-plan); checklist execution notes; **if sign-off is pending, the handoff states
"ready-for-review; awaiting owner sign-off; EP not done"** with the exact review reading list.

## Parked → final-roadmap.md

Adjudication of P-001/P-002 stays with OQ-4 (assumed deferred to v1.x); any new case-mechanic
ideas discovered while authoring go to the parked list.
