# EP-23 — Interview modes

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-17 (Interview v1), EP-21 (Phone channel & escalations) · **Blocks:** EP-29
(Case C08), EP-31 (Case C10), EP-32 (Case C11), EP-36 (Accessibility gate hardening); C06 full
interactive play in EP-26 also needs the interpreter mode

## Context

Extends the single-mode structured interview (EP-17, D-SIM-001) with the four authored modes the
R2 roster requires: professional interpreter (D-CONS-002 — requesting the interpreter is the
modeled-correct action; ad-hoc family interpretation modeled lower-reliability), authorized
surrogate (D-CONS-001 — authorization explicit in-case; capacity assessment is authored fact,
never a learner task), degraded historian, and caregiver-by-phone (riding EP-21's availability/
latency machinery). All modes are authored dialogue data over the same engine dialogue module —
no free text (D-MED-004). Canonical spec: [appendices/ux-accessibility.md](appendices/ux-accessibility.md)
(interview surface, mode designs, announcer rules).

## Safety & policy preconditions

- Synthetic-only: all dialogue is authored case content; this EP ships mode machinery + fixtures,
  not case narratives.
- Clinical sign-off (D-EXEC-003): n/a — mode mechanics only; the case content that uses them is
  owner-gated in EP-26/29/31/32.
- Harm language (D-SCOR-003): n/a — no teaching text.
- Leak prevention: n/a — no screenshots this EP.
- Licensing/attribution (D-DATA-006): n/a — no new assets.
- Accessibility (D-UX-004): per-slice DoD below; interpreter turns are programmatic text with
  speaker labels — no audio, no timing dependence.
- Security baseline (D-SEC-001): no new runtime dependencies without the allowlist process.
- Stigma safety (D-GOV-004): mode presentation avoids caricature by construction — interpreter
  and surrogate framing is systems/access-oriented; UI copy passes the plain-language review with
  this lens.

## In scope

1. Interpreter mode: three programmatic turns (Learner → Interpreter → Patient) with text speaker
   labels; authored time cost disclosed in the pre-brief; ad-hoc family option authored as
   faster but lower-confidence claims (reliability modifier), surfaced later in debrief data —
   never blocked (D-SCOR-002 pattern).
2. Surrogate mode: persistent authorization banner naming the documented agent; question menus
   rephrased third-person; higher density of unknown-to-source responses supported (D-MED-001).
3. Degraded-historian mode: authored fatigue events close the bedside channel for a simulated
   interval with the cost disclosed; re-asking may yield different authored answers, both kept in
   the transcript.
4. Caregiver-by-phone mode: interview menus over EP-21 availability windows and callback latency.
5. Transcript log handles all modes: speaker-labeled, searchable, citable claim chips; asked-state
   tracking unchanged (no completeness meter — spoiler rule).
6. Engine fixtures per mode + reliability metadata flowing into the debrief event log (dialogue
   events including the interpreter channel).
7. Per-slice DoD: axe serious/critical = 0 on new surfaces; keyboard-only demo of each mode;
   live-region writes only via the announcer service; plain-language copy review.

## Out of scope

- The cases using these modes — EP-26 (C06), EP-29 (C08), EP-31 (C10), EP-32 (C11).
- Scoring of interpreter/ad-hoc choices — authored in case action sets, owner-gated there.
- Audio, avatars, or spoken-language rendering — parked, final-roadmap.md.

## Owner checkpoints

none — mechanics only; anything that would alter scoring semantics is raised, not built.

## Verification / acceptance

- Engine unit tests: mode transitions, reliability modifiers, fatigue-window closure, re-ask
  duplication behavior; determinism property tests still green.
- Keyboard-only Playwright smoke covering at least the interpreter turn structure.
- axe serious/critical = 0 on new surfaces; CI green on both OSes; `main` runnable.
- Fixture demo per mode reviewed in the handoff *(judgement — executing session)*.

## Handoff

Standard fields + the mode API surface for case EPs (schema fields consumed, fixtures to copy
from), and confirmation that dialogue events for all modes reach the debrief event log.

## Parked → final-roadmap.md

none expected; additional informant types go to the parked list (D-RISK-002).
