# ADR-6 — Property-test library: fast-check

**Status:** accepted · **Date:** 2026-09-04 (EP-8) · **Implements:** D-QA-001 (engine unit +
property/invariant tests), architecture appendix §2 (replay-equivalence property at EP-11) ·
**Reversibility:** easy (dev dependency; tests are small).

## Context

The engine's determinism and post-T0 immutability guarantees (D-MED-002, D-ARCH-006) are
properties over arbitrary action logs, not examples. The plan names a 1000-action-log
replay-equivalence property for EP-11 and property-based invariant tests generally. The
presumptive library was fast-check; the alternatives in the TypeScript ecosystem
(JSVerify, unmaintained; `@fast-check/vitest` as a thin wrapper) do not change the frame.

## Decision

**fast-check** (4.9.0 at the time of writing, MIT) is the property-testing library, used from
Vitest in `packages/engine` (and in `packages/schema` where invariants warrant it). It is a
**dev dependency** and never ships. The optional `@fast-check/vitest` wrapper is not adopted;
plain `fc.assert(fc.property(...))` inside Vitest `it` blocks is sufficient and keeps one fewer
package in the lockfile.

Conventions:

- Properties run with fast-check's default 100 runs locally and in CI; EP-11's replay property
  uses an explicit `numRuns` and a fixed `seed` in CI so failures are reproducible from the
  reported seed/path.
- Shrunk counter-examples are added as concrete regression cases (an `it(...)` with the
  literal input) beside the property when they reveal a bug.
- Arbitraries for domain objects (action logs, claims) live in `packages/engine/test/arbitraries`
  from EP-11 onward and are shared with the golden harness where useful.

## Evidence at EP-8

The scaffold ships one property test to prove the wiring: the event-sourced `replay` fold in
`packages/engine` satisfies *replay equivalence* — folding a log in one pass equals folding its
prefix and then its suffix, for arbitrary integer logs. It runs in CI on both operating systems.

## Consequences

- `fast-check` 4.9.0 enters the build/dev register (DEPENDENCY-POLICY.md §4).
- The ESLint determinism rule for `packages/engine/src` does not apply to test files, which may
  use fast-check's own PRNG freely.
