# EP-25 — Hints UI

**Size:** S · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-18 (Workspace, signature & score views) · **Blocks:** EP-36 (Accessibility
gate hardening)

## Context

Implements the graduated, non-punitive hint system (D-PED-001): nudge → directed → reveal-source,
authored per case, requested from a consistent header slot (WCAG 3.2.6 consistent help). Hint use
is recorded by the engine (tier, target, sim-time, sequence) and shown neutrally in the debrief —
never score-subtracting. Hint texts live in the reference layer (integrator resolution I-6:
spoiler-adjacent by design, since reference layers are public — D-GOV-003 declares summative
integrity a non-goal). Schema fields (INV-HINT-001: three grades) exist since EP-9/EP-20.
Canonical spec: [appendices/ux-accessibility.md](appendices/ux-accessibility.md) (hints slot,
announcer rules); scoring interaction ("partially met — found with support" after reveal-tier)
is EP-12 engine semantics — this EP only displays it.

## Safety & policy preconditions

- Synthetic-only: hint content is authored case data; this EP ships machinery + fixtures.
- Clinical sign-off (D-EXEC-003): n/a — hint *texts* are case-bundle content, owner-gated in case
  EPs; changing how hints affect subscores is owner-only and not done here.
- Harm language (D-SCOR-003): n/a — chrome copy only.
- Leak prevention: n/a.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): per-slice DoD below; hints slot position consistent across surfaces.
- Security baseline (D-SEC-001): no new runtime dependencies without the allowlist process.

## In scope

1. Hint control in the persistent header slot: request next tier for the current context;
   pre-request disclosure of what a tier does ("reveal which source to check") in plain language.
2. Tier progression UI honoring authored nudge/directed/reveal-source texts; no skipping authored
   order; re-reading already-granted hints is free.
3. Engine wiring: every grant recorded (tier, target, sim-time, sequence) in the action log and
   debrief event log; no score subtraction anywhere.
4. Neutral presentation rules enforced in component styling: no negative color/icon for hint
   state, in-sim or in the score/debrief summaries EP-18/EP-24 render.
5. Settings integration: hint preferences surface (from EP-15 settings) honored.
6. Per-slice DoD: axe serious/critical = 0 on new surfaces; keyboard-only demo (request all three
   tiers); live-region writes only via the announcer service (polite); plain-language copy review.

## Out of scope

- Debrief support-summary panel rendering — EP-24.
- Hint authoring content for cases — EP-26…EP-32.
- Any adaptive/dynamic hinting — final-roadmap.md (would breach D-CASE-001 determinism).

## Owner checkpoints

none — display semantics only; anything touching how hint use appears in subscores is raised to
the owner, not changed.

## Verification / acceptance

- Component tests: tier progression, disclosure copy, neutral styling tokens.
- Engine assertion: golden hint-path script (EP-12/EP-14) renders identically through the new UI;
  snapshots unchanged.
- Keyboard-only Playwright smoke extended: request a hint at each tier.
- axe serious/critical = 0 on new surfaces; CI green on both OSes; `main` runnable.

## Handoff

Standard fields + confirmation that hint events round-trip action log → debrief event log, and
the settings keys consumed.

## Parked → final-roadmap.md

none expected (D-RISK-002 applies to any discovered ideas).
