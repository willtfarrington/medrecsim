# ADR-9 — Engine core: event-sourced session, learner action vocabulary, seam boundary and persistence envelope

**Status:** accepted · **Date:** 2026-09-04 (EP-11) · **Implements:** D-ARCH-006 (pure headless
engine), D-ARCH-005 (local convenience state, polite discard), D-WF-002 (simulated clock),
D-SIM-001 (structured dialogue), D-MED-002 (post-T0 immutability), D-MED-004 (three learner
artifacts, no free text), D-MED-005 (two-layer contract at the seam), D-CLIN-002 (escalation
channels), D-DATA-002 (one schema major), OQ-6 (bulk-cite); integrator resolution I-4 ·
**Reversibility:** reversible technical choices (D-EXEC-003). The action vocabulary and state
shape are versioned by `engineStateVersion`; changing either bumps it and discards stored
sessions (I-4), which is the documented cost of reversal. Scoring semantics, signature rules and
debrief content stay owner-only and are not decided here (EP-12).

## Context

`roadmap/appendices/architecture.md` §2 fixes the design frame: modules, event sourcing,
determinism guarantees, the persistence envelope and the API seam. EP-11 lands the learner-side
half of that frame — case loading, clock, evidence projection, dialogue, escalation primitives,
the action log and reducer, the three workspace artifacts, versioned serialization — and leaves
scoring, signature validation and debrief data to EP-12. Several concrete choices were open and
are recorded here.

## Decisions

1. **State is a fold over an append-only log of thirteen learner actions.**
   `open-source`, `examine-artifact`, `ask`, `escalate`, `await-escalation`, `history/set`,
   `history/remove`, `history/seed-from-source` (OQ-6), `discrepancy/set`,
   `discrepancy/remove`, `action-list/set`, `action-list/remove`, `sign`. No action carries
   free text: medications are named by key (`rx:<formularyId>` or `label:<unresolved text>`,
   and only medications the evidence layer names), claims by visible id, justifications by
   authored rationale key, classifications by taxonomy token. The reducer never throws: a
   rejected action returns a typed `Result` with a closed `EngineErrorCode` and is not
   appended. *Alternatives:* free-form patch actions (rejected: they would let the UI invent
   state the debrief cannot explain); thrown exceptions (rejected: the UI branches on codes,
   and a stored log that no longer replays must discard politely rather than crash).
2. **The clock is integer simulated minutes since T0; the engine parses time without `Date`.**
   Compiled bundles carry absolute UTC instants (ADR-3); `core/time.ts` converts them with
   integer calendar arithmetic (days-from-civil), so parsing, formatting and weekday lookup
   are identical on every machine and locale, and the lint fence can forbid `Date` outright.
   Authored threshold events (a time-gated source becoming available, an escalation response
   arriving, a retry becoming sensible, a window opening) are scheduled as the fold learns of
   them and fire in `(atMinutes, seq)` order the first time the clock crosses their instant;
   fired events form the learner-facing timeline. This is the generic crossing mechanism the
   levodopa-class case needs; the *authored timed event* it will also need is a schema
   addition (handoff, schema friction). *Alternatives:* `Date`-based arithmetic behind a
   wrapper (rejected: the lint rule would need exceptions and the wrapper is fifty lines).
3. **The case-local UTC offset is derived at compile time from the authored T0.** Escalation
   windows are authored as local `HH:MM` and weekdays; compiled instants are UTC. `compile`
   now writes `caseLocalUtcOffsetMinutes` beside `compiledFrom` in every case chunk, and the
   loader refuses a chunk without it. One fixed offset per case (cases span hours). Evaluating
   windows on UTC would misread the exemplar's pharmacy as closed at admission; the test
   `clock.test.ts` proves that. *Alternatives:* an explicit `locale`/offset field in
   `evidence.yaml` (deferred to the post-EP-19 re-plan through EP-9's package — the authored
   T0 already carries the information, so no schema change was needed to ship the engine).
4. **Visibility is earned and recorded.** A claim is visible iff a reveal record exists:
   opening a source reveals its `with-source` claims; a dialogue node, artifact or escalation
   response reveals what it names; the first reveal wins and records when and via what — the
   "what-was-knowable-when" datum D-PED-002's debrief needs. Allergy claims have no
   `visibility` field in schema 0.1, so the engine treats an allergy claim wired to any reveal
   as `on-reveal` and every other one as `with-source` (schema friction, handoff).
5. **The engine core is an evidence-only TypeScript project.** `packages/engine/src/core/**`
   (state, reducer, clock, dialogue, escalation, workspace, projection, persistence) compiles
   in a composite project whose file list is the core plus the schema's evidence, common,
   vocab and version modules, with `paths` mapping every `@medrecsim/schema` entry point to
   the schema *sources* — so any import that reaches `src/reference/` is a file outside the
   list and fails with TS6307. A layer fixture that imports a reference type must fail exactly
   so; `scripts/check-layer-separation.mjs` now proves both the schema (EP-9) and the engine
   (EP-11) boundaries in CI. Only `case-loader.ts` and `session.ts` hold the reference layer
   (for EP-12), behind the seam. *Alternatives:* ESLint only (kept as the editor signal, but
   it is advisory); a separate npm package for the view (rejected: a package for one folder).
6. **One sanctioned crossing: the rationale menu.** D-MED-004 makes justifications a choice
   from authored menus, and ADR-7 (T-5) put the menu in `reference.yaml`. The session copies
   the menu's `{key, text}` pairs into `LearnerMenus`, a view-local type, so the projection
   never names a reference type; the runtime spot check allows `rat-` keys under
   `view.workspace` only and forbids every other reference id or top-level key anywhere in
   the view. Whether the menu should move to a learner-facing section of the bundle is a
   schema question for the post-EP-19 re-plan (handoff).
7. **The D-MED-002 fence is structural plus a typed error plus a property.** The working
   history (reconstruction) and the admission action list (post-T0 decisions) are separate
   arrays written by separate handlers; no admission handler can reach the history. A history
   write stamped after T0, or carrying an admission decision as its status, is rejected with
   `post-t0-mutation`. A property test replays random accepted logs with every admission
   action removed and asserts the history is byte-identical.
8. **Persistence stores the log in a five-field envelope and discards on any mismatch.**
   `{appVersion, schemaVersion, caseId, caseContentVersion, engineStateVersion, log}`. The
   adapter takes a `StorageLike` the app passes in (never a global), wraps every access in
   try/catch, removes a discarded item, and enumerates the `medrecsim:` prefix for "clear all
   local data". Derived state is never stored. `restoreSession` also discards a log that no
   longer replays.
9. **The seam as landed:** `createSession({case, appVersion, log?})` →
   `{getState, getView, getLog, dispatch, canSign, sign, getDebrief, serialize, subscribe}`.
   `getLog` and `subscribe` are additive (ADR-5: the app wires a framework store over the
   engine). `canSign` returns `{ready: false, blocking: [signature-validation-not-implemented]}`,
   `sign` refuses with `not-implemented`, `getDebrief` reports `not-signed` / `not-implemented`
   — fail-closed until EP-12, with the final signatures. A direct `dispatch({type: 'sign'})`
   is refused (`sign-via-seam`); the reducer accepts `sign` only through the seam or replay.
10. **The determinism lint is real.** Beyond the EP-8 placeholder it forbids `Promise`, `Intl`,
    `globalThis`, `process`, `console`, storage and DOM globals, `import.meta`, `for await`,
    `toLocale*`, `localeCompare`, comparator-less `sort()`, value imports of `zod`, `yaml`,
    `fast-check` and the content tools, and (in `core/**`) any import of the schema root,
    reference or documents entry points. Tests and test support are exempt. The runtime half
    is a 1000-log fast-check property (same log ⇒ identical state and identical stable
    serialization), replay equivalence, and deep-frozen inputs.

## Consequences

- EP-12 adds scoring, signature validation and debrief data behind `canSign`/`sign`/
  `getDebrief` without changing the log or the state shape; the golden harness hashes
  `stableStringify(state)` and the log.
- EP-15/EP-18 wire `localStorage` into `createPersistenceAdapter` and a store over
  `subscribe`; EP-17 renders `view.dialogue`; EP-21 matures escalation UX on the same records.
- Any change to the action vocabulary or state shape bumps `ENGINE_STATE_VERSION` and is a
  polite-discard event for stored sessions (I-4) — cheap now, to be weighed after v0.1.
- The engine package links `@medrecsim/schema` (types, vocab, version) and
  `@medrecsim/content-tools` (test fixtures only) as workspace devDependencies; the production
  bundle still contains exactly one third-party package (`svelte`).
