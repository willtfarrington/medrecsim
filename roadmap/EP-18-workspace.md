# EP-18 — Workspace, signature & score views

**Size:** L · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-16 (Chart surfaces v1), EP-17 (Interview v1), EP-12 (Engine scoring, signature, debrief data + golden harness) · **Blocks:** EP-19 (Picker, pre-brief, about + v0.1 release), EP-21 (Phone channel & escalations), EP-24 (Evidence-timeline debrief), EP-25 (Hints UI), EP-36 (Accessibility gate hardening)

## Context

Completes the R1 learner loop: the persistent workspace pane with the three linked artifacts
(D-MED-004), the signature flow (D-WF-004), and the five-subscore view (D-SCOR-001) — making a
case completable keyboard-only end-to-end. Rationale comes from authored menus; **no free text
anywhere in v1** (D-MED-004). The keyboard-only Playwright end-to-end smoke (D-QA-001) lands in
CI here. Surface specs: [appendices/ux-accessibility.md](appendices/ux-accessibility.md) §2
(S-07 workspace, S-08 signature, S-09 score) and §3 (chip round-trips). The engine's `canSign`
structured blocking reasons (EP-12) drive the signature UI directly — the UI invents no
validation logic.

## Safety & policy preconditions

- Synthetic-only content: fixture bundles until EP-14's C01 is signed; the smoke may run against
  the exemplar-scaffold fixture.
- Clinical sign-off (D-EXEC-003): n/a — renders authored/engine content; scoring semantics live
  in EP-12; any UI copy that could read as clinical advice is limited to the CLAIMS.md
  disclaimer language.
- Harm language (D-SCOR-003): score view shows ordinal tiers + authored rationale verbatim; the
  UI generates no harm prose and no numbers.
- Leak prevention: no screenshots this EP.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): signature errors as links to the offending item (WCAG 3.3.1/3.3.3);
  cite-not-retype (3.3.7); tables/rows follow EP-16 semantics; assertive announcement only for
  signature validation failure (one of the two allowed events); works within the EP-15 reflow
  design (workspace as overlay drawer at 200%).
- Security baseline (D-SEC-001): no runtime network calls.

## In scope

1. Working medication history: rows drug / dose / status (D-MED-001 + first-class
   unable-to-verify and deferred-with-plan) / confidence / claim chips; rows created via
   cite-forward (EP-16), bulk-cite seed (unverified rows), or add-from-formulary picker; row
   chips navigate back to sources (cite backward).
2. Discrepancy log: classification via taxonomy-enum menus (EP-7 values through the schema);
   each entry resolved-with-rationale (authored menu) or escalated (escalation targets stub to
   the four channels; full channel UX is EP-21); links to its evidence chips.
3. Admission action list: per-med continue / hold / needs-decision / escalate + justification
   from authored rationale menus; unsafe choices are selectable and **never blocked** in-sim
   (D-SCOR-002).
4. Workspace pane behavior: persistent, collapsible, never loses data, never steals focus;
   clarify-a-claim launch into the interview (EP-17 contract).
5. Signature flow: gap list from `canSign` blocking reasons, each a link focusing the offending
   item; attest step; confirm step; reversible until final confirm; on final sign, artifacts
   freeze and the app navigates to Score.
6. Score view: five panels, per-item tallies (x-of-y, met/partial/not-met with rationale),
   display tiers as text + icon, **no composite number anywhere**; hint use shown neutrally
   ("found with support"); a plain-language "what these scores are / are not" block sourced
   from CLAIMS.md wording.
7. Playwright keyboard-only end-to-end smoke in CI: launch shell → gather evidence (chart +
   interview) → build all three artifacts → attempt sign with gaps (error links work) → resolve
   → sign → score view renders five panels. Runs on the ubuntu PR lane (I-5; windows-nightly
   e2e arrives with EP-36).
8. Extend the axe state matrix: workspace states, signature-with-errors, score view.

## Out of scope

- Phone/escalation channel UX → EP-21. Debrief timeline → EP-24 (minimal summary → EP-19).
- Hints UI → EP-25. Picker/pre-brief → EP-19. Interview modes → EP-23.

## Owner checkpoints

none — renders decided semantics; deviations in scoring display (anything resembling a
composite) are prohibited outright, not negotiable.

## Verification / acceptance

- Keyboard-only Playwright smoke green in CI (named job); axe zero serious/critical on new
  states.
- Component tests: signature gap-links focus the right item; unsafe action selectable and
  recorded; no free-text input present (DOM audit assertion: no textarea/free text input
  outside search fields).
- Score view test: five panels, absence of any summed/averaged total.
- `main` runnable, CI green both OSes; bundle within the 300 KB budget.

## Handoff

Standard fields, plus: the smoke-test script path (EP-19 re-points it at real C01);
escalation-stub contract for EP-21; any reflow adjustments made within the EP-15 design.

## Parked → final-roadmap.md

Session-summary export ideas (B-4) or history dashboards stay parked (D-ARCH-005 — v1 has none).
