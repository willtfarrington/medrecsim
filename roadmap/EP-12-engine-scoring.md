# EP-12 — Engine scoring, signature, debrief data + golden harness

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-11 (Engine core) · **Blocks:** EP-14 (Case C01 exemplar + review), EP-18 (Workspace, signature & score views), EP-24 (Evidence-timeline debrief)

## Context

Implements the five transparent subscores (D-SCOR-001), the signature gate (D-WF-004),
non-punitive hint recording (D-PED-001), the debrief data contract (D-PED-002), and the
golden-case regression harness (D-QA-001) — all inside the headless engine. The subscore
computation follows the already-integrated clinical scoring spec:
[appendices/clinical-model.md](appendices/clinical-model.md) §4 (scoring/debrief spec);
harness mechanics: [appendices/architecture.md](appendices/architecture.md) §6. Scoring compares
only against authored accepted-alternative sets — never a hidden single answer where uncertainty
is authored irreducible (D-MED-005). Assumes OQ-6 (bulk-cite seeding is allowed and
scoring-neutral) and OQ-8 (golden updates guarded by a PR-template flag + owner review) per
[appendices/open-questions.md](appendices/open-questions.md).

## Safety & policy preconditions

- Synthetic-only content: fixtures/scripts run against the synthetic exemplar scaffold.
- Clinical sign-off (D-EXEC-003): **scoring semantics are owner-only.** This EP implements the
  approved spec mechanically; any deviation forced by implementation reality pauses for an owner
  ruling (checkpoint below). Golden `--update` is documented as a scoring-semantics change
  requiring owner review (OQ-8).
- Harm language (D-SCOR-003): score/debrief data carries ordinal labels and authored rationale
  text only — the engine emits no generated harm prose and no numbers without a citation ref.
- Leak prevention: snapshots are committed test artifacts — synthetic only.
- Licensing/attribution (D-DATA-006): n/a beyond allowlist discipline.
- Accessibility (D-UX-004): n/a — headless; debrief data must include everything the dual-view
  timeline needs so EP-24 never reaches around the seam.
- Security baseline (D-SEC-001): n/a beyond standing CI rules.

## In scope

1. Five subscores as transparent per-item tallies (met/partial/not-met, x-of-y + per-item
   rationale, ordinal display tiers — **no composite number anywhere, no cross-tier
   arithmetic**):
   a. Information seeking & prioritization: yield tags (critical/corroborating/low-yield),
      per-case sufficiency sets, coverage = critical units accessed pre-signature;
      prioritization = U3/U4-critical evidence before low-yield in sim-time order;
      **thoroughness never penalized**.
   b. Discrepancy detection: accepted-classification set per discrepancy; (urgency, severity)
      → standard/elevated/critical display-tier lookup; full = logged + accepted class
      pre-signature; partial = misclassified or post-reveal-hint; miss = absent.
   c. Action safety: pattern-match vs accepted/partiallyAccepted/unsafe sets; **unsafe never
      blocked in-sim** (D-SCOR-002), surfaced in debrief data with mechanism-of-harm; authored
      default band for unlisted actions.
   d. Uncertainty & escalation: required escalations met; **unnecessary escalation never
      penalized**; scored failures = false certainty on an irreducible item, or an unresolved
      discrepancy with neither escalation nor rationale; deferred-with-plan on a resolvable
      item = partial + pointer.
   e. Documentation quality: required-field completeness + rationale-menu match.
2. Signature gate: `canSign` returns structured blocking reasons (every med has a status incl.
   first-class unable-to-verify / deferred-with-plan; unresolved discrepancies need escalation
   or documented rationale — D-WF-004); `sign` freezes the three artifacts.
3. Hint recording: (tier, target, sim-time, sequence); reveal-tier finds score "partially met —
   found with support"; hint use is **never score-subtracting** (D-PED-001).
4. Debrief data contract (engine-derived event log, golden-locked): evidence-access events,
   dialogue (incl. channel), escalations (initiated/latency/received), artifact edits
   (before/after), clock events + fired triggers, hints, terminal signature + frozen artifact
   snapshots; knowable-when derivation — the (earliest-knowable, accessed, logged) triple per
   discrepancy that becomes the EP-24 overlay spine.
5. Golden harness: ≥3 authored action scripts against the exemplar scaffold (full-credit,
   hint-using, unsafe-path) → stable-serialized snapshots {artifacts, five subscores, debrief
   data, log hash} in `tests/golden/`; `--update` flag wired into the PR template as an
   owner-review item (OQ-8); demonstrate a snapshot break on a branch (change a scoring rule,
   CI fails, revert).

## Out of scope

- Score/debrief UI → EP-18/EP-24. Real C01 scripts/snapshots → EP-14 (re-scripted there).
- Full escalation latency behavior → EP-21. Replay (OQ-7) → EP-24.
- Coverage tool + remaining invariants → EP-20.

## Owner checkpoints

- Any implementation-forced deviation from the clinical-model.md §4 computation rules →
  pause, present options, owner decides (scoring semantics, D-EXEC-003).

## Verification / acceptance

- Golden CI stage green; snapshot-break demo recorded in the handoff.
- Property tests: adding an unnecessary escalation never lowers any subscore; using hints never
  lowers any subscore; extra evidence access never lowers the info-seeking score.
- Unit tests per subscore band (met/partial/not-met) and per signature blocking reason.
- No composite score derivable from the public API (test asserts absence).
- `main` runnable, CI green on both OSes.

## Handoff

Standard fields, plus: exact snapshot format + serializer notes; the PR-template golden-flag
wording as landed; OQ-6/OQ-8 assumptions restated; readiness note for EP-14 (what a case bundle
must author for scoring to run).

## Parked → final-roadmap.md

none
