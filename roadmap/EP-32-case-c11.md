# EP-32 — Case C11 — clozapine

**Size:** L · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-23 (Interview modes) · **Blocks:** EP-35
(Roster closure audit)

## Context

Advanced-tier sensitive case — the psychiatric high-alert carrier (D-CONS-003; roster approved
per OQ-2). **Clozapine confirmed by the OQ-1 ruling** (the canonical sketch documents a drop-in
lithium variant only as a future option — do not author both). Canonical sketch in
[appendices/clinical-model.md](appendices/clinical-model.md); summary:

**C11 "Four Days".** Patient stable on clozapine, admitted medically after a **four-day
medication lapse** caused by a pharmacy transfer / REMS logistics snag — a supply-interruption
systems framing, never patient blame. The record lists the full home dose as active. Teaching
core: clozapine interruption **≥48 hours requires retitration** — so the reflexive "continue
home meds at full dose" order is the **unsafe-set anchor**, with mechanism-of-harm; the accepted
set centers recognizing the lapse, escalating (outpatient prescriber/program office per OQ-3
assumption + inpatient pharmacist), and retitration-per-label handled as escalation-supported
action, not learner-invented dosing. Planted phenotypes: restart gap (≥48 h threshold),
status-discrepancy (record wrong about actual use). Sources right/wrong: record wrong; the
patient plus an authored, **consented community mental-health nurse collateral** (by phone —
EP-23 machinery) establish the lapse timeline. Irreducible texture: exact last-dose timing may
carry a range; the accepted set honors it. Clock interaction: the next scheduled dose decision
arrives during the case — deciding *before* verification is the trap.

**Scheduling rule (risk R-1):** do not run this EP back-to-back with the other sensitive
L-cases (EP-29, EP-30).

## Safety & policy preconditions

- Synthetic-only: fully invented; registry names; formulary IDs only (clozapine entry with cited
  high-alert flag — add minimally if absent).
- Clinical sign-off (D-EXEC-003): the retitration threshold rule, action sets, and teaching notes
  bind only after the owner gate below.
- Harm language (D-SCOR-003): consequences (hypotension/sedation risk on full-dose rechallenge,
  destabilization risk of interruption) phrased plausible-consequence with ordinals; EP-20 lint
  passes.
- Leak prevention: no screenshots; I-15 pointer rule for any login-gated source.
- Licensing/attribution (D-DATA-006): SP-1 sources (current label/REMS program state) cited
  Tier-A with version + access date; registry rows added.
- Accessibility (D-UX-004): renderText + pill descriptors authored (INV-A11Y-001).
- Stigma safety (D-GOV-004): **heightened.** Serious mental illness written with person-first,
  bias-free language (checklist anchors); patient is a credible historian; no
  diagnosis-as-identity, no dangerousness tropes, no clinician-cynicism NPC dialogue; the nurse
  collateral is explicitly consented in-case; pre-brief sensitive-content note depth decided here
  per integrator resolution I-17.

## In scope

1. **SP-1 spike first:** verify the current clozapine REMS program status (post-2023 changes) and
   the exact interruption-retitration threshold wording from the current label/REMS materials;
   record cited rule text with access dates. C11's unsafe/accepted sets are authored **against
   the spike result**, not from memory.
2. Author the C11 bundle: evidence layer (record wrong-active claim; interview; consented
   MH-nurse phone collateral with availability/latency; pharmacy-transfer fill texture),
   reference layer (restart-gap discrepancy with five-axis metadata; accepted set = lapse
   recognized, escalations placed, retitration path via escalation; unsafe anchor = continue
   home meds full dose, with mechanism-of-harm; ranged last-dose acceptance), teaching notes,
   citations, review-record stub, changelog.
3. `validate --all` + `coverage` green; declarations match (INV-META-001); INV-DISC-003 honors
   any irreducible range.
4. Golden scripts ×3: full-credit (collateral verification + escalation + retitration-supported
   plan), hint path, unsafe path (full-dose continuation and its mechanism card).
5. Clinical self-review checklist (high-alert audit against SP-1's cited threshold; escalation
   realism for the MH-nurse channel) — record dispositions.
6. Stigma-safety checklist with the heightened items above — record dispositions.
7. **STOP at ready-for-review**; present the case, SP-1 record, and checklist outputs.

## Out of scope

- Interview-mode/phone mechanics — EP-23/EP-21. Other cases — EP-26…31.
- ANC/monitoring workflow simulation beyond authored teaching notes — not in v1 scope.
- Lithium variant authoring — only on an OQ-1 ruling for lithium (then this brief re-scopes).

## Owner checkpoints

- Confirm OQ-1 standing (clozapine) **before authoring begins**; a lithium ruling re-scopes the EP.
- **OWNER SIGN-OFF GATE (D-GOV-001, D-EXEC-003).** Not done until a signed, versioned, dated
  public review record exists beside the case. Outward copy: "physician-reviewed (single
  reviewer)", never "expert-reviewed". Present the I-17 pre-brief-note wording with the review.

## Verification / acceptance

- SP-1 record committed with citations before authoring steps complete.
- `validate`, `coverage`, goldens, full CI green on both OSes.
- Both checklists complete with sign-off blocks; review record exists, parses, carries badge
  fields (D-RISK-003).
- *(judgement — owner)* clinical + stigma acceptability, recorded in the review record.

## Handoff

Standard fields + SP-1 citation record, content version, coverage rows, golden IDs, review-record
path. State whether the gate is passed; pending sign-off keeps the EP open. Remind the scheduler
of the R-1 spacing rule.

## Parked → final-roadmap.md

none expected; discovered ideas are parked (D-RISK-002).
