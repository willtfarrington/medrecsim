# EP-17 — Interview v1

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-15 (App shell & accessibility skeleton), EP-11 (Engine core) · **Blocks:** EP-18 (Workspace, signature & score views), EP-23 (Interview modes), EP-36 (Accessibility gate hardening)

## Context

Builds the structured bedside interview: authored question menus with tracked
information-seeking cost and order, authored responses keyed to the case's source-claim model
(D-SIM-001); clock costs are authored and disclosed, never real-time pressure (D-WF-002). This
EP ships the **single-mode** interview (reliable bedside historian — all C01 needs); interpreter,
surrogate, degraded-historian, and caregiver-by-phone modes are EP-23. Interaction spec:
[appendices/ux-accessibility.md](appendices/ux-accessibility.md) §2 (surface S-06) and the
interview section, §6 (menus, transcript, asked-state). Engine dialogue APIs come from EP-11;
asked-tracking feeds the information-seeking subscore (EP-12).

## Safety & policy preconditions

- Synthetic-only content: renders authored dialogue only; no free-text learner input anywhere
  (D-MED-004 — menus are the input).
- Clinical sign-off (D-EXEC-003): n/a — no clinical content authored here.
- Harm language (D-SCOR-003): n/a — authored content rendered verbatim.
- Leak prevention: no screenshots this EP.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): menus are nested button lists (APG-patterned); asked-state is not
  `aria-pressed`; transcript is a `role="log"` owned by the announcer service; time costs in
  visible + accessible names; no timing dependence.
- Security baseline (D-SEC-001): no runtime network calls.

## In scope

1. Interview surface: left question menu (grouped disclosures) + right transcript log
   (speaker-labeled, searchable, `role="log"`); transcript answers are citable claim chips
   (EP-16 component + cite popover).
2. Nine authored categories rendered from the dialogue tree: open question; walk-through of
   medications; recent changes; how it's actually taken; access & cost; allergies;
   OTC/supplements; clarify-a-claim (contextual, launched from a workspace row — API stub until
   EP-18); closing. Follow-ups nest where authored; re-asking is allowed and both answers are
   kept in the transcript (authored variation is a data feature, not UI randomness).
3. Asked-state: visible checkmark + visually-hidden "(asked)" suffix; **not** `aria-pressed`;
   focus stays on the menu after asking; category counters count *visible* questions only; **no
   overall completeness meter** (it would spoil discoverable content).
4. Clock integration: each question's authored cost in the control's visible and accessible
   name ("advances sim clock ~N min"); costs ≥ the authored threshold get a confirm dialog
   restating consequences; one polite batched announcement after each advance (EP-15 announcer).
5. Engine wiring: dispatch dialogue actions to the EP-11 engine; asked-tracking and reveal
   effects recorded in the action log (feeds the EP-12 info-seeking subscore); revealed claims
   appear as chips citable like any other evidence.

## Out of scope

- Interpreter / surrogate / degraded-historian / caregiver-by-phone modes → EP-23.
- Phone channel & escalation calls → EP-21. Workspace rows and clarify-a-claim launch → EP-18.
- Hint UI → EP-25 (engine records hints from EP-12 onward).

## Owner checkpoints

none — technical rendering of authored content.

## Verification / acceptance

- Playwright keyboard-only spec: open interview → expand a category → ask → read transcript →
  cite an answer into the (stub) workspace target → re-ask shows both answers.
- Component tests: focus retention on menu after ask; asked-state markup (no `aria-pressed`);
  counter counts visible questions only; confirm dialog on ≥threshold costs.
- Announcer discipline: transcript updates write only through the `role="log"`; clock advance =
  one polite batched announcement (assertion in tests).
- axe: zero serious/critical on interview states (matrix updated).
- `main` runnable, CI green both OSes; bundle within budget.

## Handoff

Standard fields, plus: dialogue-rendering API notes for EP-23 (modes must slot in without
re-architecture — speaker-label channel support left open); clarify-a-claim stub contract for
EP-18.

## Parked → final-roadmap.md

none
