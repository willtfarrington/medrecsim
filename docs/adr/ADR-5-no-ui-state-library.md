# ADR-5 — No UI state library; the engine owns state

**Status:** accepted · **Date:** 2026-09-04 (EP-8) · **Implements:** D-ARCH-006 (pure headless
engine owns all state), D-ARCH-005 (localStorage envelope holds the action log only) ·
**Reversibility:** easy at any time (additive if ever reversed).

## Context

The simulation engine is a pure, event-sourced TypeScript package: state is
`fold(reduce, initial, actionLog)`, the action log is the single source of truth, and every view
is a derivation exposed through `createSession(...)` → `{ getState, getView, dispatch, canSign,
sign, getDebrief, serialize }` (architecture appendix §2). Introducing a UI state container
(Redux, Zustand, XState, MobX, Svelte-store-based domain stores, or similar) would create a
second owner of state, invite duplication of engine logic into the UI, and add a runtime
dependency to the allowlist (owner-only, D-EXEC-003).

## Decision

- **No UI state library.** The engine session object is the only state holder for simulation
  data. `packages/app` keeps only ephemeral, presentational state (which tab is focused, whether
  a dialog is open, form-in-progress selections that have not been dispatched) in ordinary
  Svelte component state.
- **Adapter pattern (Svelte 5, per ADR-1):** one thin module in `packages/app` wraps a session
  in a `$state`-backed view (`session.subscribe(view => …)` or an equivalent
  `createSubscriber`-style bridge) so components read `view.*` reactively and call
  `session.dispatch(action)`; nothing in the UI mutates simulation state directly. The adapter
  is a few dozen lines and is the *only* place the UI touches the engine's subscription API.
- **Persistence stays in the engine's envelope** (`{appVersion, schemaMajor.minor, caseId,
  caseContentVersion, engineStateVersion, actionLog}`), written by a storage module that the
  adapter calls after each dispatch; try/catch-guarded; polite discard on any version mismatch
  (I-4). The UI never persists derived state.
- Framework-level primitives that merely *bridge* an external store (Svelte's `$state`,
  `createSubscriber`, or React's `useSyncExternalStore` had React been chosen) are not "state
  libraries" for the purpose of this decision.

## Consequences

- The determinism guarantees (no `Date.now`, `Math.random`, or async in the reducer; ESLint
  determinism rule scoped to `packages/engine/src`, hardened at EP-11) remain enforceable because
  all simulation state changes pass through one reducer.
- Golden-case snapshots (EP-12) are the regression surface for state; component tests assert
  rendering of views, not state transitions.
- If a future surface (for example the evidence-timeline debrief, EP-24) needs derived data
  that is expensive to recompute, the derivation is added to the engine's `getView` /
  `getDebrief` selectors, never to a UI-side cache of engine state.
- ADR-6 (property-test library) is recorded separately rather than folded in here.
