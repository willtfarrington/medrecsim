---
ep: 12a
title: "Signature gate, hint recording and the scoring rulings (EP-12 split at pickup)"
size: M
model: claude-opus-5-5
effort: max
status: done
---

# EP-12a — Signature gate, hint recording and the scoring rulings

**Size:** M · **Type:** implementation + owner rulings · **Core/Stretch:** core ·
**Depends on:** EP-11 (Engine core) · **Blocks:** EP-12b (the five subscores), EP-12c (debrief
data + golden harness), and through them EP-14, EP-18, EP-24

## Context

EP-12 was written as one M row: the five transparent subscores (D-SCOR-001), the signature gate
(D-WF-004), non-punitive hint recording (D-PED-001), the debrief data contract (D-PED-002) and
the golden-case regression harness (D-QA-001), all inside the headless engine, following
[appendices/clinical-model.md](appendices/clinical-model.md) §4 (scoring/debrief spec) and
[appendices/architecture.md](appendices/architecture.md) §6 (harness mechanics). Scoring compares
only against authored accepted-alternative sets — never a hidden single answer where uncertainty
is authored irreducible (D-MED-005). It assumes OQ-6 (bulk-cite seeding is allowed and
scoring-neutral) and OQ-8 (golden updates guarded by a PR-template flag + owner review), both
ruled at roadmap approval. At pickup it proved two to three sessions of work and was split into
three rows, the owner's choice (decision 1 below): this brief is the first.

**Session start (2026-11-27, 11:03 EST).** Launched from clauderoadmapwrangler into VS Code with
claude-opus-5-5 at max (as launched; the panel's own setting is not readable from inside the
session). Read first: CLAUDE.md, DECISIONS.md, the roadmap (EP-12 the first unchecked row, no
brief notes), EP-11b's completion note, the EP-11 handoff (the seam and the three stubs EP-12
replaces), clinical-model.md §1–§4, architecture.md §2–§7, TAXONOMY.md §0–§8;
`roadmap/owner-tasks.md` and `roadmap/inbox.md` hold nothing open. The tree is clean at
`a64979e`.

**Survey (2026-11-27).**

- **The seam (EP-11).** `canSign()` always blocks (`signature-validation-not-implemented`),
  `sign()` refuses `not-implemented`, `getDebrief()` answers `not-implemented`; the reducer
  already applies `{type:'sign'}` through the seam or a replay and freezes the session after it.
  The action vocabulary has 13 actions and **no hint action**; the state has no hint record.
- **What the reference layer authors for scoring.** `evidenceYield[]` (optional:
  critical / corroborating / low-yield per evidence unit); per discrepancy the five axes,
  `detectabilityPaths[]` in DNF (each path an AND-set of evidence units — the sufficiency sets of
  §4.1, TAXONOMY §7.5), `acceptedClassifications[]`, urgency and severity, `resolutionExpectation`
  and a D-RISK-004 `scoring` state; `actionSets` (accepted / partially accepted / unsafe with a
  mechanism of harm, a `defaultBandForUnlisted`, the rationale menu); `expectedEscalations[]`
  (`required`, optional `byTime`); `hints[]` (nudge, directed, reveal-source per target
  discrepancy). The exemplar scaffold authors all of these with placeholder text.
- **Gaps §4 leaves to the owner (scoring semantics, D-EXEC-003).** The (urgency, severity) →
  standard / elevated / critical lookup of §4.2 is authored nowhere (searched: schema, taxonomy,
  clinical docs, exemplar). The items of each subscore are unspecified. The brief's property test
  "using hints never lowers any subscore" contradicts §4.2's "found only after a reveal-tier hint
  = partial". The §4.4 failure "an unresolved discrepancy carried to signature without an
  escalation or documented rationale" cannot reach scoring once the D-WF-004 gate refuses open
  entries.
- **Friction for later rows (not blocking).** A learner cannot log an allergy-record discrepancy:
  `DiscrepancyEntry` requires a medication key, and the engine's medication index is built from
  medication claims only (R2 allergy sub-tasks, C06 and C10). Recorded in the handoff for the
  post-EP-19 re-plan.

**Decided at pickup (the owner, 2026-11-27, through `AskUserQuestion`).**

1. **The split:** three rows. EP-12a (this brief): the signature gate, hint recording and the
   owner's rulings on the §4 gaps. EP-12b (M): the five subscores per those rulings, with the
   band, property and no-composite tests. EP-12c (M): the debrief data contract and the golden
   harness with its snapshot-break demo and the EP-14 readiness note. Two extra briefs, about 30
   minutes of overhead.
2. **Detection display tiers (§4.2):** the higher of the two axes — `critical` if U4 or S3–S4;
   `elevated` if U3 or S2; otherwise `standard`. A tier labels an item; no arithmetic.
3. **Reveal-source hints (§4.2 vs D-PED-001):** §4's partial is kept — a find after a
   reveal-source hint for that discrepancy is "partially met — found with support"; the property
   test proves that every other hint use changes nothing and that a reveal-before-find changes
   only that one item. Hints cost no simulated time.
4. **Information seeking (§4.1):** three tallies, never summed — coverage (one item per
   critical-tagged unit), sufficiency (one item per scored discrepancy: met, partial for a begun
   path, not met), prioritization (one item per U3/U4 discrepancy: its critical units before any
   low-yield unit). "Accessed" = source opened, claim revealed, question asked, artifact
   examined, escalation answered. The "extra evidence never lowers" property appends the extra
   access before signature.
5. **Action safety (§4.3):** one item per admission-action line at signature, matched on
   (medication, action): accepted = met, partially accepted = partial (its shortfall text),
   unsafe = not met (its mechanism-of-harm card), unmatched = the case's default band. The
   rationale is scored under documentation. A (medication, action) in two bands takes the more
   cautious band (EP-20's validator should forbid it). A medication without a line was never seen
   (the gate requires a line for every visible medication) and counts under detection and
   information seeking.
6. **Uncertainty & escalation (§4.4):** three item kinds — required escalations (one per expected
   escalation marked `required`: met when initiated before signature and by its `byTime` if
   authored, partial when late, not met when never; any attempt counts; optional and unlisted
   escalations are never items); false certainty (one per medication whose actual use is authored
   irreducibly uncertain: not met when the working history marks it `verified`); resolvable
   logged discrepancies (met, or partial with a pointer to the missed path when the medication's
   action is `defer-with-plan`). A discrepancy never logged counts under detection only.
7. **Documentation quality (§4.5):** completeness — one item per visible medication (met: a
   history line citing at least one claim; partial: a line citing none; not met: no line) and one
   per discrepancy-log entry (met: classified and citing a claim; partial: one missing; not met:
   both); rationale match — one item per action line matched to an accepted or partially accepted
   entry with a rationale key (met when that key was chosen), and one per logged discrepancy
   resolved with a rationale (met when the key is one the accepted entries naming that
   discrepancy carry).
8. **The signature gate's escalated entries (D-WF-004):** a log entry marked escalated to a
   channel blocks signature (`escalation-not-initiated`) when no escalation was initiated on that
   channel; any attempt counts (answered, voicemail, busy or closed).

## Safety & policy preconditions

- **Synthetic-only content:** tests run against the synthetic exemplar scaffold; no content file
  changes.
- **Clinical sign-off (D-EXEC-003):** scoring semantics are owner-only. This brief implements no
  subscore; it records the owner's rulings, each put through `AskUserQuestion`.
- **Harm language (D-SCOR-003):** the gate and the hint records carry codes and ids only; no
  generated prose.
- **Leak prevention:** the brief and the handoff carry counts, ids and hashes; scratch work stays
  in the session's scratchpad; new and changed files are screened for paths, usernames and
  e-mail addresses before commit.
- **Licensing (D-DATA-006):** no package added.
- **Accessibility (D-UX-004):** n/a — headless; no learner-visible surface changes.
- **Security baseline (D-SEC-001):** no new `uses:`; standing CI rules.

## In scope

1. **Signature gate (D-WF-004).** `canSign()` returns structured blocking reasons: one per visible
   medication without an admission-action line (every medication carries a status, including the
   first-class `unable-to-verify` and `defer-with-plan`); one per discrepancy-log entry left
   open (an unresolved discrepancy needs an escalation or a documented rationale); one per entry
   marked escalated to a channel no escalation was initiated on (decision 8); and
   `already-signed`. `sign()` applies the same gate inside the reducer's sign path, so a stored
   log whose `sign` entry fails the gate no longer replays and is discarded at restore. Signing
   freezes the three artifacts: the reducer refuses every action after it.
2. **Hint recording (D-PED-001).** A `request-hint` action `{hintId, tier}`; tiers in their
   graduated order (nudge → directed → reveal-source), each once per hint; no simulated time
   spent; recorded in the state as (hint id → target discrepancy, tier, simulated minute, log
   sequence). Hints never touch the clock or the workspace. The view's projection of hint texts
   belongs to EP-25.
3. **The owner's rulings on the §4 gaps** (scoring semantics): recorded as a dated entry
   D-SCOR-004 in DECISIONS.md, a dated addendum under clinical-model.md §4, and EP-12b's brief
   note.
4. **The roadmap:** rows EP-12a, EP-12b and EP-12c in place of EP-12, brief notes for EP-12b and
   EP-12c carrying the original brief's items verbatim, a dated note; the Depends-on cells of
   EP-14, EP-18 and EP-24 point at EP-12c.
5. **Records:** this brief's completion note; `docs/handoffs/EP-12a.md`; an ADR-9 addendum (the
   vocabulary and state shape change, so `ENGINE_STATE_VERSION` goes to 2 by ADR-9's own rule);
   a CHANGELOG line if the owner approves its wording.
6. **Inbox (added mid-session):** IN-2 (from the owner via prime, delivered during this session)
   triaged by house-style rule 1 — not EP-12a work, so parked in a later row's brief notes on the
   owner's choice.

## Out of scope

- **The five subscores** → EP-12b. **The debrief data contract and the golden harness** → EP-12c.
- Score and debrief UI → EP-18 / EP-24; the hints UI and the view's hint texts → EP-25.
- Full escalation latency behaviour → EP-21. Replay (OQ-7) → EP-24. Coverage tool and the
  remaining invariants → EP-20.

## Owner checkpoints

- Any implementation-forced deviation from the clinical-model.md §4 computation rules → pause,
  present options, owner decides (scoring semantics, D-EXEC-003).
- The split of EP-12 (house style: a row that proves larger at pickup is split there).
- Outward text and any push: the owner's.

## Verification / acceptance

- Unit tests per signature blocking reason and for the ready path; `sign()` freezes the session;
  a stored log whose `sign` entry precedes a complete workspace is discarded at restore.
- Hint tests: graduated order, repeats, unknown ids, after signature; no clock movement; the
  recorded fields.
- The determinism properties (1000 generated logs) pass with hint actions in the generators.
- `pnpm verify` green under Node 26.13.1; hosted CI green on both operating systems.

**Residual risk.** No user surface consumes the seam yet, so the gate's reasons have met tests
only, never a learner: EP-18 shows them, and its session may find that a reason needs more than
a medication key or an entry id to point at. The gate trusts the evidence index's notion of a
medication (claims only), so an allergy record can never block or unblock a signature — right
for D-WF-004 as written, and the allergy-discrepancy gap is recorded for the re-plan. The
reducer still accepts workspace writes about medications the learner has not seen (EP-11's
check is existence, not visibility); the UI will not offer them, and the gate and D-SCOR-004
count seen medications only. The rulings in D-SCOR-004 were made in the abstract, on the
exemplar's placeholder content; EP-12b's implementation and EP-14's first real case are where an
implementation-forced deviation would surface, and the brief's checkpoint sends it back to the
owner. Each of these fails loudly (a test, a typed error or a missing reason), not silently.

## Handoff

`docs/handoffs/EP-12a.md`: the split, the seam after EP-12a (block types, error codes, the hint
action), the owner decisions, the routine choices, the verification table and the hosted run,
the changed files, and what EP-12b inherits.

## Parked → final-roadmap.md

none.

> **Completion note (2026-11-27; claude-opus-5-5/max, as launched — the VS Code panel's own
> setting is not readable from inside the session; about 70 minutes of working time, 11:03 to
> the done-hash commit at about 12:14 EST, the owner's four rounds of answers and the hosted run
> included).**
>
> **What was done.** EP-12 proved two to three sessions of work at pickup and was split into
> EP-12a, EP-12b and EP-12c on the owner's word; this brief is the renamed EP-12 brief, re-scoped
> to the first part. The engine now has the D-WF-004 signature gate (`core/signature.ts`:
> `medication-without-status`, `discrepancy-unresolved`, `escalation-not-initiated`,
> `already-signed`), applied by the reducer to every `sign`, replays included, so an early-signed
> stored log is discarded; signing freezes the artifacts. Hints are recorded (`core/hints.ts`:
> `request-hint`, graduated, once per grade, no simulated time, `state.hints` with the log
> sequence). `ENGINE_STATE_VERSION` is 2 (ADR-9's rule; ADR-9 addendum). The owner's rulings on
> clinical-model §4's open points are D-SCOR-004 and D-WF-005, with a pointer addendum in §4 and
> EP-12b's brief note; EP-12b and EP-12c carry the original brief's items verbatim. `pnpm verify`
> passes under Node 26.13.1 (23 files, 239 tests — 22 new, two 300-log properties among them —
> 35 negative fixtures, 15,281 B gz, all checks), and hosted CI on the scratch branch (run
> 46039675864 at `8314aef`) is green on both lanes: Node 26.13.1, pnpm 11.25.0 hash-checked, 239
> tests, 35 fixtures, 15,281 B gz. IN-2, delivered mid-session, is parked under EP-38. Full
> record: [docs/handoffs/EP-12a.md](../docs/handoffs/EP-12a.md).
>
> **Owner decisions.**
>
> | # | Decision | Owner's answer | Outcome |
> |---|---|---|---|
> | 1 | How to cut EP-12 | Three rows 12a / 12b / 12c (recommended) | Rows, brief notes, dated note |
> | 2 | The (urgency, severity) → display-tier table | Higher of the two axes (recommended) | D-SCOR-004 (1) |
> | 3 | Reveal-source hint partial vs D-PED-001 | Keep §4's partial; scope the property (recommended) | D-SCOR-004 (2) |
> | 4 | Information-seeking items | Three tallies (recommended) | D-SCOR-004 (3) |
> | 5 | Action-safety items | One per action-list line (recommended) | D-SCOR-004 (4) |
> | 6 | Uncertainty & escalation items | Three item kinds (recommended) | D-SCOR-004 (5) |
> | 7 | Documentation-quality items | Completeness + both rationale kinds (recommended) | D-SCOR-004 (6) |
> | 8 | "Escalated" entries without an attempt | Block signature (recommended) | D-WF-005, `escalation-not-initiated` |
> | 9 | CHANGELOG wording (shown in full) | Intro clause + one Added bullet (recommended) | Added |
> | 10 | Hosted CI before the owner's push | Push the commit to `scratch/ep-12a` (recommended) | run 46039675864 at `8314aef`: `build-test` ubuntu and windows green (25 steps each); the branch deleted |
> | 11 | Where IN-2 (site screenshots) is parked | EP-38's brief notes (recommended) | R3 brief note; IN-2 ticked |
>
> Commits run under the autopilot (crw D-22): the EP-12a commit `8314aef` (the roadmap row's
> done hash), then the done-hash commit; the push of `main` is the owner's.
>
> **Routine choices** (logged in the handoff): the gate inside the reducer's `sign` path; "every
> medication" = every medication with a revealed claim, so an empty session can be signed;
> graduated hint order enforced, zero minutes, `seq` = log index; no hint text in the view until
> EP-25; the structured blocks as a discriminated union; `not-implemented` error code removed;
> `request-hint` in the property generators.
>
> **For later sessions.** EP-12b's note carries the rulings' entry points (D-SCOR-004) and the
> facts it inherits; three frictions are recorded in the handoff (allergy discrepancies cannot be
> logged; workspace writes on unseen medications are accepted; a (medication, action) in two
> bands should be forbidden at EP-20).
