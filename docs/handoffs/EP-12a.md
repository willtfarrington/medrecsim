# EP-12a handoff — Signature gate, hint recording and the scoring rulings

**Status:** complete — eleven owner decisions ruled 2026-11-27 (see "Owner decisions"); the push
of `main` is the owner's · **Date:** 2026-11-27 · **Brief:** roadmap/EP-12a-signature-gate-hints.md
(the EP-12 brief, renamed and re-scoped at the split) · **Commits:** `8314aef` (the EP-12a
commit; the roadmap row's done hash) and the done-hash commit, which records the hosted run below.

## Completed scope

1. **The split.** EP-12 (one M row) proved two to three sessions of work at pickup and became
   EP-12a (this), EP-12b (the five subscores) and EP-12c (debrief data + golden harness), the
   owner's choice under D-ROAD-004. The original brief's items for 12b and 12c sit verbatim in
   their brief notes in `roadmap/README.md`; EP-14, EP-18 and EP-24 now depend on EP-12c.
2. **Signature gate (D-WF-004; the owner's reading D-WF-005)** in
   `packages/engine/src/core/signature.ts`, an evidence-only module. `canSign()` returns
   structured reasons, one each: `medication-without-status` (a medication the learner has seen
   with no admission-action line; every action kind counts, `unable-to-verify` and
   `defer-with-plan` included), `discrepancy-unresolved` (a log entry still open),
   `escalation-not-initiated` (an entry marked escalated to a channel with no attempt; any
   outcome counts), `already-signed`. Order: medications in first-appearance order, then entries
   in log order. The reducer applies the gate to every `sign`, through `session.sign()` and in a
   replay, so `restoreSession` discards a stored log signed early (`corrupt-log`). Signing
   freezes the three artifacts: every later action is refused `session-signed`.
3. **Hint recording (D-PED-001)** in `packages/engine/src/core/hints.ts`: the fourteenth action,
   `request-hint {hintId, tier}`; grades in order nudge → directed → reveal-source, each once
   per hint; no simulated time; recorded in `state.hints` as `{hintId, tier, atMinutes, seq}`
   (`seq` = the action's 0-based log index). The view projects nothing about hints (EP-25).
4. **The owner's rulings on clinical-model §4's open points**, recorded as **D-SCOR-004** and
   **D-WF-005** in DECISIONS.md, a pointer addendum under clinical-model.md §4, and EP-12b's
   brief note.
5. **`ENGINE_STATE_VERSION` 2**, per ADR-9's rule for a vocabulary or state-shape change; ADR-9
   gained a dated addendum.

## The seam after EP-12a

```ts
session.canSign(): SignatureCheck
  // { ready: boolean, blocking: SignatureBlock[] }
  // SignatureBlock = { code: 'already-signed', message }
  //   | { code: 'medication-without-status', message, medKey }
  //   | { code: 'discrepancy-unresolved', message, entryId, medKey }
  //   | { code: 'escalation-not-initiated', message, entryId, medKey, channelId }
session.sign(): Result<SessionState>
  // 'session-signed' once signed; 'signature-blocked' with details {blocking: 'a,b', count}
session.dispatch({ type: 'request-hint', hintId, tier })   // 'nudge' | 'directed' | 'reveal-source'
  // errors: 'unknown-hint', 'invalid-entry' (unknown grade), 'hint-tier-out-of-order'
  //         (details.expected names the next grade), 'hint-already-shown', 'session-signed'
session.getDebrief()  // still { available: false, reason: 'not-signed' | 'not-implemented' }
```

New exports: `checkSignature`, `SIGNATURE_BLOCK_CODES`, `SignatureBlockCode`, `HINT_TIERS`,
`HintTier`, `HintRecord`, `shownTiers`, `visibleMedications`. Error codes: `signature-blocked`,
`unknown-hint`, `hint-tier-out-of-order`, `hint-already-shown` added; `not-implemented` removed
(nothing returned it once `sign()` had a real gate). `ReduceContext` gained `hintIds`.

## Owner decisions (presented interactively 2026-11-27 in four rounds; outcomes recorded)

| # | Decision | Owner's answer | Outcome |
|---|---|---|---|
| 1 | How to cut EP-12, which proved larger than one M | Three rows 12a / 12b / 12c (recommended; not two rows with the scoring now, not two rows with the scoring later) | Rows and brief notes in the roadmap; two extra briefs |
| 2 | The (urgency, severity) → display-tier table, authored nowhere | Higher of the two axes: critical if U4 or S3–S4, elevated if U3 or S2, else standard (recommended; not a stricter table, not a per-case authored one) | D-SCOR-004 (1) |
| 3 | Reveal-source hint partial vs "hints never subtract" | Keep §4's partial; scope the property test (recommended; not "met with a support note") | D-SCOR-004 (2) |
| 4 | Information-seeking items | Three tallies — coverage, sufficiency, prioritization (recommended) | D-SCOR-004 (3) |
| 5 | Action-safety items | One per action-list line (recommended; not one per authored target) | D-SCOR-004 (4) |
| 6 | Uncertainty & escalation items | Three item kinds (recommended; not unlogged discrepancies counted again, not "continue" as false certainty) | D-SCOR-004 (5) |
| 7 | Documentation-quality items | Completeness + both rationale kinds (recommended; not action lines only) | D-SCOR-004 (6) |
| 8 | Should an "escalated" entry block signature without an attempt? | Yes, require the escalation (recommended) | D-WF-005; `escalation-not-initiated` |
| 9 | CHANGELOG wording (shown in full) | Intro clause + one Added bullet (recommended) | Added |
| 10 | Hosted CI before the owner's push | Push the commit to `scratch/ep-12a`, read back, delete (recommended) | See "Hosted CI" below |
| 11 | Where to park IN-2 (site screenshots, delivered mid-session from prime) | EP-38's brief notes, the v1.0 release (recommended; not EP-19, not declined) | R3 brief note with D-UX-006's screening added; IN-2 ticked with its disposition |

Commits run under the autopilot (crw D-22); the push of `main` is the owner's.

## Decisions logged (reversible technical, D-EXEC-003)

- **The gate lives in the reducer's `sign` path**, not only in `session.sign()`, so replay
  enforces it and a tampered or early-signed envelope is discarded rather than restored signed.
  A direct `dispatch({type:'sign'})` is still refused (`sign-via-seam`, EP-11's choice).
- **"Every medication" = every medication with at least one revealed claim**
  (`visibleMedications`, now shared by the gate and the view's medication list). An empty
  session can be signed at once: D-WF-004 forces no minimum work and no time-out; the subscores
  will show what was left unexamined.
- **Hints:** graduated order and once-per-grade enforced with typed errors (D-PED-001's
  "graduated"); zero simulated minutes (so a hint can never move another action's timing, which
  makes D-SCOR-004 (2)'s property provable); `seq` is the log index, which orders a hint against
  a same-minute find.
- **No hint text crosses the seam yet.** The reducer sees hint ids as opaque strings; the state
  holds ids, never text. EP-25 decides the learner-facing projection (the rationale-menu
  crossing was an owner ruling at EP-11; the hint texts are the same kind of question).
- **`ENGINE_STATE_VERSION` 1 → 2** (ADR-9's rule). Old logs would still replay, but the ADR
  ties the version to the vocabulary and state shape; no stored session exists outside tests.
- **Structured block types as a discriminated union** (code + the ids the UI needs), replacing
  EP-11's `{code, message}`; existing readers of `code`/`message` keep working.
- **The arbitraries generate `request-hint`** (real and bogus ids and grades), so the
  determinism, purity and post-T0 properties now cover hint actions.

## Verification results (2026-11-27 — Windows 11, Node 26.13.1, pnpm 11.25.0)

| Check | Result |
|---|---|
| `pnpm verify` (lint, format, typecheck, tests, content stage, build, checks) | passes: 23 files, 239 tests; validate 0 errors (3 warnings, as before); 35/35 negative fixtures; schema export current; 15,281 B gz = 5.0 %; no-network, SPDX (174 files), asset hygiene, claims, action pins (7), layer separation all PASS |
| Engine tests | 12 files, 97 tests (22 new: 12 gate, 10 hints), including the 1000-log determinism property with hint actions |
| Gate property (300 logs) | `sign()` succeeds exactly when `canSign().ready`; a success restores identically from its envelope; a failure reports the same codes |
| Hint property (300 logs) | stripping every `request-hint` from an accepted log leaves the rest of the state byte-identical |
| Replay guard | a stored `[open-source, sign]` log on a workspace with a seen medication and no status is discarded `corrupt-log` (`signature-blocked`) |
| Layer separation | `signature.ts` and `hints.ts` compile in the evidence-only project; `check:layers` passes |

## Hosted CI

On the owner's word (decision 10), `8314aef` was pushed to `scratch/ep-12a` (CI runs on
`scratch/**` pushes) and `main` was not pushed. Run **46039675864** at `8314aef`, conclusion
success:

| Job | Result |
|---|---|
| `build-test (ubuntu-latest)` | success, 25 steps: Node 26.13.1 from `.nvmrc`; pnpm 11.25.0 downloaded, SHA-512 matching `packageManager`, first on PATH; 23 files, 239 tests; 35 negative fixtures rejected by name; 15,281 B gz = 5.0 %; layer separation PASS |
| `build-test (windows-latest)` | success, 25 steps: the same lines |
| `dco`, `dependency-review` | skipped by design (pull-request events only) |

The remote branch was deleted afterwards (`git ls-remote` shows no `scratch/ep-12a`). The
owner's push of `main` runs Pages on the same tree, expected green as here.

## Changed files

**New:** `medrecsim/packages/engine/src/core/{signature, hints}.ts` and their tests;
`docs/handoffs/EP-12a.md`.

**Inbox:** `roadmap/inbox.md` — IN-2 (delivered by crw during the session) ticked with its
disposition; parked as EP-38's brief note in `roadmap/README.md`.

**Renamed and re-scoped:** `roadmap/EP-12-engine-scoring.md` → `roadmap/EP-12a-signature-gate-hints.md`.

**Modified:** engine `core/{actions, context, errors, reduce, state, view, serialize}.ts`,
`session.ts`, `index.ts`, `case-loader.ts` (comment), tests `core/{clock, persistence, post-t0,
reduce}.test.ts`, `determinism.test.ts`, `headless.test.ts`, `session.test.ts`,
`test-support/arbitraries.ts`; `DECISIONS.md` (D-WF-005, D-SCOR-004);
`roadmap/README.md` (dated note, rows, Depends-on cells, brief notes, critical path);
`roadmap/appendices/clinical-model.md` (§4 addendum); `docs/adr/ADR-9-engine-core.md`
(addendum) and `docs/adr/README.md`; `CHANGELOG.md`; `medrecsim/README.md`;
`medrecsim/tests/golden/README.md`; `.github/workflows/ci.yml` (a comment).

Untouched by design: the schema sources, the content bundles, `docs/clinical/**`,
`docs/CLAIMS.md`, the other briefs, `docs/manual-changes.md` (nothing a user sees or does
changed: no app surface consumes the seam yet).

## Found along the way (for EP-12b and the post-EP-19 re-plan)

1. **A learner cannot log an allergy-record discrepancy.** `DiscrepancyEntry` needs a medication
   key, and the engine's medication index is built from medication claims only; R2's allergy
   sub-tasks (C06, C10) need an allergy-keyed entry or a widened key.
2. **The reducer accepts workspace writes about a medication the learner has not seen**
   (claims may be empty; EP-11 checks that the medication exists in the evidence, not that it is
   visible). The UI will offer visible medications only; the gate and D-SCOR-004 count visible
   medications. A tightening would be a vocabulary-level change (another version bump).
3. **A (medication, action) authored in two bands** is resolved by D-SCOR-004 (4) to the more
   cautious band; INV-ACT-002 or a new invariant at EP-20 should forbid it.

## Risks / notes for the next session

- EP-12b computes the subscores in a module that may read the reference layer (outside the
  evidence-only project, like `session.ts`); `getDebrief()` is the place they surface.
- The scoring of a find "after a reveal-source hint" compares the hint's `seq` with the first
  `discrepancy/set` for that medication; a learner who logs, removes and re-logs is an edge case
  for EP-12b to settle in its brief.
- `ENGINE_STATE_VERSION` will bump again if EP-12b/12c change the vocabulary or state shape.

## Parked → final-roadmap.md

none.

## Next eligible EPs

**EP-12b** (the five subscores — depends on EP-12a), then **EP-12c**. EP-13, EP-15 and EP-20
remain eligible by their dependency cells (the table order still puts EP-12b next).
