# EP-11 — Engine core

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-9 (Content schema v0 + validator core) · **Blocks:** EP-12 (Engine scoring, signature, debrief data + golden harness), EP-17 (Interview v1)

## Context

Builds the pure, headless simulation engine (D-ARCH-006: zero DOM dependencies): case loading,
simulated clock (D-WF-002), evidence resolution, structured dialogue (D-SIM-001), action
recording, and versioned serialization. Event-sourced design — state is a fold over an
append-only action log; determinism is a hard property (golden tests at EP-12 depend on it).
Post-T0 actions can never overwrite reconstructed pre-admission state (D-MED-002). Resume
behavior implements D-ARCH-005 with integrator resolution I-4 (discard local state on **any**
contentVersion bump). Module map and API seam:
[appendices/architecture.md](appendices/architecture.md) §2 (engine design). Scoring, signature,
and debrief-data generation are deliberately EP-12.

## Safety & policy preconditions

- Synthetic-only content: engine consumes only schema-validated synthetic bundles; test
  fixtures follow the `# SYNTHETIC` convention.
- Clinical sign-off (D-EXEC-003): n/a — no clinical content authored; fixtures reuse the EP-9
  placeholder scaffold.
- Harm language (D-SCOR-003): n/a here (scoring text is EP-12+; engine carries data only).
- Leak prevention: n/a beyond standard rules.
- Licensing/attribution (D-DATA-006): any new dependency (e.g., fast-check already in
  allowlist) checked against the EP-8 allowlist.
- Accessibility (D-UX-004): n/a — headless package; the API seam must expose everything the UI
  needs so accessibility is never bolted on around the engine.
- Security baseline (D-SEC-001): no runtime network calls anywhere in the engine (D-ARCH-001);
  lint-enforced.

## In scope

1. `@medrecsim/engine` modules: case-loader (compiled JSON bundles); clock; evidence projection
   (learner view — **never exposes the reference layer**); dialogue (authored menus, asked
   tracking, reveal wiring); actions (append-only log = source of truth); session (reducer +
   versioned serialize). State = `fold(reduce, initial, actionLog)`.
2. Determinism fence: no `Date.now`/`Math.random`/async in the reducer — ESLint rule (the EP-8
   placeholder made real) + property test (fast-check): same log ⇒ identical state across ≥1000
   generated logs.
3. Post-T0 immutability: reducer rejects any mutation of pre-T0 reconstructed state with a
   **typed error** (D-MED-002); unit + property coverage.
4. Clock semantics: authored action costs advance sim time; authored threshold events fire
   deterministically on crossings (the levodopa-class mechanism, exercised fully in R2).
5. Persistence adapter (engine-owned): serialize the **action log**, not derived state, in an
   envelope `{appVersion, schemaMajor.minor, caseId, caseContentVersion, engineStateVersion}`;
   any mismatch → polite discard (I-4); clear-all enumerates the namespace prefix; every storage
   access wrapped try/catch (UI wiring is EP-15/EP-18).
6. API seam: `createSession(...)` → `{getState, getView, dispatch, canSign, sign, getDebrief,
   serialize}` — `canSign`/`sign`/`getDebrief` may stub pending EP-12, but the seam signature
   lands now; pre-signature view types cannot reference reference-layer types (compile-level).
7. Dialogue + escalation primitives sufficient for C01 (full four-channel escalation UX and
   latency-as-clock behavior mature at EP-21).

## Out of scope

- Scoring, signature validation, debrief-data generation, golden harness → EP-12.
- UI of any kind → EP-15+. Escalation channel UX → EP-21. Replay mode (OQ-7) → EP-24.
- Interview mode variants (interpreter/surrogate/degraded/caregiver-by-phone) → EP-23.

## Owner checkpoints

none — purely technical; all semantics implemented here are already decided (D-WF-002,
D-MED-002, D-ARCH-005/006).

## Verification / acceptance

- Engine package has zero DOM/browser-global dependencies (lint rule + a node-only test run).
- Determinism property test green (≥1000 logs); post-T0 typed-error test green;
  resume-discard-on-mismatch test green.
- Evidence-projection test: no reference-layer field reachable from any pre-signature view
  (type-level fixture + runtime spot check).
- `main` runnable, CI green on both OSes.

## Handoff

Standard fields, plus: the API seam signature as landed; any schema friction discovered
(feeds the post-EP-19 re-plan; schema changes go through EP-9's package, not ad-hoc); stub
status of `canSign`/`sign`/`getDebrief` for EP-12.

## Parked → final-roadmap.md

none
