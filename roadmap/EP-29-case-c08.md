# EP-29 — Case C08 — methadone/OUD

**Size:** L · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-21 (Phone channel & escalations), EP-23
(Interview modes) · **Blocks:** EP-35 (Roster closure audit)

## Context

Advanced-tier sensitive case (D-CONS-003 opioid-use-disorder therapy; OQ-2 roster assumption).
Canonical sketch in [appendices/clinical-model.md](appendices/clinical-model.md); summary:

**C08 "Continuity".** Patient stable on methadone maintenance through an opioid treatment
program (OTP), admitted with cholecystitis. Methadone is **absent from every electronic source**
— the teaching core is absence-as-evidence and data fragmentation: OTP dispensing does not flow
to community-pharmacy history or the imported list. Planted phenotypes: omission via
data-fragmentation, wrong-dose **risk** (the patient's stated dose is correct, but federal
practice requires OTP dose verification before continuation — trust and verify), and
unknown-to-source responses. Sources right/wrong: the patient is accurate; all electronic
sources are silently incomplete. Escalations: the OTP call rides the "outpatient
prescriber/program office" channel (OQ-3 assumption); the OTP **opens at 06:00** — an authored
availability window. Irreducible element and clock interaction: overnight, verification is
impossible; "deferred, with follow-up plan" is the scored-correct terminal status (D-WF-004) —
false certainty is the scored failure. Interview uses standard mode; EP-23 machinery supports
the unknown-to-source density and any authored collateral by phone.

**Scheduling rule (risk R-1):** do not run this EP back-to-back with the other sensitive
L-cases (EP-30, EP-32) — owner review bandwidth is the roster's critical path.

## Safety & policy preconditions

- Synthetic-only: fully invented; no identifiable anecdotes; registry names; formulary IDs only.
- Clinical sign-off (D-EXEC-003): all action sets, the verification/deferral scoring design, and
  teaching notes bind only after the owner gate below.
- Harm language (D-SCOR-003): consequences of unverified continuation vs missed dosing phrased as
  plausible-consequence with ordinals; EP-20 lint passes.
- Leak prevention: no screenshots; I-15 pointer rule for any login-gated source.
- Licensing/attribution (D-DATA-006): SP-2 sources (SAMHSA/42 CFR Part 8) cited Tier-A with
  version + access date; registry rows added.
- Accessibility (D-UX-004): renderText and any artifact descriptors authored (INV-A11Y-001).
- Stigma safety (D-GOV-004): **heightened.** Person-first language throughout (NIDA "Words
  Matter" anchors the checklist); no clean/dirty/non-compliant vocabulary; OUD treatment framed
  as continuity of evidence-based care; no clinician-cynicism tropes in NPC dialogue; pre-brief
  sensitive-content note depth decided here per integrator resolution I-17.

## In scope

1. **SP-2 spike first:** verify current SAMHSA 42 CFR Part 8 text — OTP dose-verification and
   interim-dosing ("72-hour") rules — and record cited rule summaries with access dates. C08's
   escalation latency, availability window, and accepted sets are authored **against the spike
   result**, not from memory.
2. Author the C08 bundle: evidence layer (sources engineered so methadone appears in none;
   interview and OTP call carry the truth), reference layer (accepted set centers verify-then-
   continue and deferred-with-plan; unsafe set includes unverified continuation and abrupt
   discontinuation, each with mechanism-of-harm), teaching notes, citations, review-record stub,
   changelog.
3. `validate --all` + `coverage` green; INV-DISC-003 confirms the irreducible-overnight element
   carries no complete detectability path and the accepted set includes the deferral.
4. Golden scripts ×3: full-credit (verification call at opening + deferred plan), hint path, and
   unsafe path (false-certainty continuation).
5. Clinical self-review checklist (escalation-realism item: OTP hours/latency defensible per
   SP-2) and stigma-safety checklist with the heightened items above; record dispositions.
6. **STOP at ready-for-review**; present the case, SP-2 record, and checklist outputs.

## Out of scope

- Phone/interview machinery — EP-21/EP-23. Other cases — EP-26…28, 30…32.
- Any OUD content beyond medication continuity (counseling, tapers) — not in v1 scope.
- Bulk formulary — EP-33 (add methadone entry minimally here with cited flags if absent).

## Owner checkpoints

**OWNER SIGN-OFF GATE (D-GOV-001, D-EXEC-003).** Not done until a signed, versioned, dated
public review record exists beside the case. Outward copy: "physician-reviewed (single
reviewer)", never "expert-reviewed". Present the I-17 pre-brief-note wording for approval with
the review.

## Verification / acceptance

- SP-2 record committed with citations before authoring steps complete.
- `validate`, `coverage`, goldens, full CI green on both OSes.
- Both checklists complete with sign-off blocks; review record exists, parses, carries badge
  fields (D-RISK-003).
- *(judgement — owner)* clinical + stigma acceptability, recorded in the review record.

## Handoff

Standard fields + SP-2 citation record, content version, coverage rows, golden IDs, review-record
path. State whether the gate is passed; pending sign-off keeps the EP open. Remind the scheduler:
next sensitive EP (EP-30/EP-32) should not be the immediately following session (R-1).

## Parked → final-roadmap.md

none expected; discovered ideas are parked (D-RISK-002).
