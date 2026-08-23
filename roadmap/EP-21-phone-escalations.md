# EP-21 — Phone channel & escalations

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-18 (Workspace, signature & score views) · **Blocks:** EP-23 (Interview modes),
EP-26 (Cases C02+C06), EP-27 (Cases C03+C05), EP-28 (Cases C04+C07), EP-29 (Case C08),
EP-30 (Case C09), EP-36 (Accessibility gate hardening)

## Context

Implements the four first-class scored escalation actions (D-CLIN-002) and the phone channel that
carries three of them, with authored availability windows and latency modeled as simulated-clock
advance (D-WF-002). EP-9's schema already carries `escalationChannels` (channel, availability
window, latency, response content, unanswered behavior); EP-18 left the workspace, signature, and
score views working. Canonical specs: [appendices/ux-accessibility.md](appendices/ux-accessibility.md)
(phone surface, clock UX, announcer rules) and [appendices/architecture.md](appendices/architecture.md)
(engine escalation module, event log). Per the OQ-3 ruling the channel is labeled
"outpatient prescriber/program office" (still exactly four scored actions, D-CLIN-002).

## Safety & policy preconditions

- Synthetic-only: directory entries use the fictional-universe registry; visibly fictional
  identifiers (555-01XX phones) only.
- Clinical sign-off (D-EXEC-003): n/a — no authored clinical content changes; expected-escalation
  sets remain case-bundle data owned by case EPs.
- Harm language (D-SCOR-003): n/a — no new teaching text; any placeholder copy is neutral.
- Leak prevention: n/a — no screenshots this EP.
- Licensing/attribution (D-DATA-006): n/a — no new assets.
- Accessibility (D-UX-004): per-slice DoD below; no timing-dependent interaction — latency is
  simulated clock, never real time.
- Security baseline (D-SEC-001): no new runtime dependencies without the allowlist process.

## In scope

1. Engine escalation module: initiate call → availability-window check → authored latency applied
   as clock advance → response filed; `unansweredBehavior` honored; all escalation events
   (initiated / latency / received) recorded in the append-only action log and the debrief event
   log contract from EP-12.
2. Phone directory surface: channels listed with availability windows and pre-disclosed time
   costs in each control's visible and accessible name ("advances sim clock ~N min"); clock
   confirms for ≥threshold advances restate consequences before advancing.
3. Call transcript dialogs: speaker-labeled logs, searchable, decomposed into citable claim chips
   consistent with EP-16's chip model.
4. Filed call results appear in the Documents surface with dual timestamps (D-MED-002).
5. Four scored escalation actions — community pharmacy; outpatient prescriber/program office
   (OQ-3 assumption); inpatient pharmacist; senior/attending — reachable from the phone directory
   and row-level from workspace med rows; the engine dedupes the two entry points.
6. Announcer discipline: one polite batched announcement after each clock advance; no new
   assertive uses.
7. Per-slice DoD: axe serious/critical = 0 on all new surfaces; keyboard-only demo of a complete
   call (directory → transcript → filed result); live-region writes only via the announcer
   service; plain-language copy review of all new chrome.

## Out of scope

- Interview modes incl. caregiver-by-phone menus — EP-23.
- Case content exercising escalations — EP-27/28/29/30/31/32.
- Full debrief rendering of escalation latency — EP-24.
- Alert-fatigue interruption (P-002) — parked, final-roadmap.md (OQ-4 assumption: deferred).

## Owner checkpoints

none — if OQ-3 is ruled differently, apply the label change; do not decide it here.

## Verification / acceptance

- Engine unit tests: availability windows, latency determinism, unanswered behavior, entry-point
  dedupe; property tests still green.
- Playwright keyboard-only smoke extended to place a call and file its result.
- axe run on new surfaces: serious/critical = 0. Bundle budget check still green (≤300 KB gz).
- CI green on both OSes; `main` runnable end-to-end with C01.
- *(judgement — executing session)* plain-language review of new copy recorded in the handoff.

## Handoff

Standard fields + engine API additions (for EP-23/24 consumers), the announcer usage inventory,
and confirmation that escalation events appear in the debrief event log.

## Parked → final-roadmap.md

none expected; new channel ideas (e.g., claims-feed callbacks) are parked per D-RISK-002.
