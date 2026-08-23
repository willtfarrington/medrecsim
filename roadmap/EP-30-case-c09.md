# EP-30 — Case C09 — ART restart gap

**Size:** L · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-14 (Case C01 exemplar + review), EP-21 (phone & escalations — engine escalation module) · **Blocks:** EP-35 (Roster closure audit)

## Context

Advanced-tier sensitive case (D-CONS-003 ART/HIV restart gap; OQ-2 roster assumption). Canonical
sketch in [appendices/clinical-model.md](appendices/clinical-model.md); summary:

**C09 "Gap in the Fill History".** Patient with HIV on single-tablet
bictegravir/emtricitabine/tenofovir alafenamide, admitted medically; therapy has **lapsed for
~3 months after a prior-authorization failure** — a systems/insurance barrier, never framed as
personal failing. The chart record *and* the prior discharge summary both list the regimen as
active: this is a record-wrong case (counts toward D-CASE-002's ≥2) combining commission (record
lists a medication not being taken), **restart gap** — the roster's phenotype-of-record carrier
for D-TAX-002 — and stale-import error. Detection texture: the community-pharmacy **fill history
is the decisive longitudinal inference** (last fill ~3 months back; no refills since); the
interview corroborates. Irreducible element: the exact stop date is fuzzy — the accepted set
honors a date **range**, not a point (D-MED-005). Expected escalations: the HIV clinic via the
"outpatient prescriber/program office" channel (OQ-3 assumption) and the inpatient pharmacist
(restart considerations, interaction check); restarting unilaterally without clinic coordination
sits in the authored action space per the reference design. Clock interaction: routine latency
only; urgency is prompt-not-immediate — the teaching point is recognizing the gap and escalating,
not emergency dosing.

**Scheduling rule (risk R-1):** do not run this EP back-to-back with the other sensitive
L-cases (EP-29, EP-32).

EP-14 and EP-21 are hard dependencies — C09 plays on the base R1 surfaces (chart, interview,
documents) plus pharmacy history, and its expected escalations exercise the EP-21 engine
escalation module (latency, availability): even the headless engine goldens depend on that
module, not only the phone UI.

## Safety & policy preconditions

- Synthetic-only: fully invented; no identifiable anecdotes; registry names; formulary IDs only.
- Clinical sign-off (D-EXEC-003): action sets, escalation expectations, and teaching notes bind
  only after the owner gate below.
- Harm language (D-SCOR-003): consequences of interruption (resistance risk, rebound) phrased as
  plausible-consequence with ordinal labels, numbers only in cited teaching notes; EP-20 lint
  passes.
- Leak prevention: no screenshots; I-15 pointer rule for any login-gated source.
- Licensing/attribution (D-DATA-006): Tier-A anchors expected from clinicalinfo.hiv.gov / CDC-NIH
  guidance, cited with version + access date; registry rows added.
- Accessibility (D-UX-004): renderText + pill descriptor authored for the single-tablet regimen
  (INV-A11Y-001).
- Stigma safety (D-GOV-004): **heightened.** HIV status handled with strict need-to-know
  narrative texture; no diagnosis-as-identity; adherence lapse framed as prior-auth/systems
  failure; person-first language; no moralizing NPC dialogue; pre-brief sensitive-content note
  depth decided here per integrator resolution I-17.

## In scope

1. Author the C09 bundle: evidence layer (stale import + discharge summary both wrong-active;
   fill history carrying the gap; interview corroboration), reference layer (restart-gap
   discrepancy with five-axis metadata; accepted set = identify gap, escalate to HIV clinic +
   pharmacist, document ranged stop date; unsafe set incl. false certainty on the stop date and
   uncoordinated actions per the canonical sketch, each with mechanism-of-harm), teaching notes,
   citations, review-record stub, changelog.
2. `validate --all` + `coverage` green; INV-DISC-003 confirms the fuzzy stop date is modeled
   irreducible with the ranged/unable-to-verify acceptance; declarations match (INV-META-001).
3. Golden scripts ×3: full-credit (longitudinal-inference path + both escalations + ranged
   documentation), hint path, unsafe path.
4. Clinical self-review checklist (12 sections; citation completeness against current HIV
   guidance) — record dispositions.
5. Stigma-safety checklist with the heightened items above — record dispositions.
6. **STOP at ready-for-review**; present the case with checklist outputs.

## Out of scope

- Phone UI — EP-21. Other cases — EP-26…29, 31, 32. Bulk formulary — EP-33 (add the ART entry
  minimally here with cited flags if absent).
- Any HIV content beyond medication continuity/restart coordination — not in v1 scope.

## Owner checkpoints

**OWNER SIGN-OFF GATE (D-GOV-001, D-EXEC-003).** Not done until a signed, versioned, dated
public review record exists beside the case. Outward copy: "physician-reviewed (single
reviewer)", never "expert-reviewed". Present the I-17 pre-brief-note wording with the review.

## Verification / acceptance

- `validate`, `coverage`, goldens, full CI green on both OSes.
- Both checklists complete with sign-off blocks; review record exists, parses, carries badge
  fields (D-RISK-003).
- *(judgement — owner)* clinical + stigma acceptability, recorded in the review record.

## Handoff

Standard fields + content version, coverage rows (restart-gap primary carrier confirmed), golden
IDs, review-record path. State whether the gate is passed; pending sign-off keeps the EP open.
Remind the scheduler of the R-1 spacing rule for the next sensitive EP.

## Parked → final-roadmap.md

none expected; discovered ideas are parked (D-RISK-002).
