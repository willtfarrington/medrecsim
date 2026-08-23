# EP-37 — Usability evaluation & remediation

**Size:** S · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-36 (Accessibility gate hardening) · **Blocks:** EP-38 (v1.0 release audit &
sign-off)

## Context

The v1 usability evidence decided in D-UX-005: a heuristic evaluation plus informal think-aloud
sessions with 3–5 clinician colleagues — **no data retention, no learning-outcome claims**; the
formal usability study remains a v1.x gate (final-roadmap.md B-9). The protocol is canonical in
[appendices/ux-accessibility.md](appendices/ux-accessibility.md): heuristics = Nielsen's 10 plus
the seven project-specific heuristics CS-1…CS-7 (fidelity-without-friction; ≤2-activation
evidence traceability; honest uncertainty; non-punitive safety; no cross-pane memory tax;
simulation-boundary clarity; clock transparency); think-aloud tasks T1–T7 (orient → seed list →
interview cite → bottle discrepancy → pharmacy call → action list + sign → debrief readback).
Runs against the Pages deployment after EP-36 hardening.

## Safety & policy preconditions

- Synthetic-only: participants see only reviewed synthetic cases; nothing they say becomes case
  content without the owning case's lifecycle.
- Clinical sign-off (D-EXEC-003): n/a — no clinical content changes here; clinical *disagreements*
  raised by colleagues are routed to the D-RISK-004 intake, never adjudicated in this EP.
- Harm language (D-SCOR-003): n/a.
- Leak prevention & participant privacy — the protocol's no-data-retention rules apply
  **verbatim**: verbal preamble including **no recording**; handwritten, anonymized notes only,
  **destroyed after synthesis**; verbal assent; no participant names/emails/identifiers in the
  repo, ever; findings committed only in anonymized, aggregated form.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): ≥1 think-aloud session is keyboard-only; facilitator runs an NVDA
  self-session before participant sessions; remediation must not regress the EP-36 gate.
- Security baseline (D-SEC-001): n/a — no new dependencies expected.

## In scope

1. Heuristic evaluation: owner + 1–2 colleagues evaluate independently against Nielsen 10 +
   CS-1…CS-7, severity 0–4, then merge into a single findings list.
2. Think-aloud sessions: 3–5 clinician colleagues, ~50 minutes each, tasks T1–T7, neutral
   prompts, 60-second struggle rule, note template (code/task/surface/observation/breakdown/
   severity/heuristic); ≥1 keyboard-only session; facilitator NVDA self-session first.
3. Synthesize: merged, anonymized findings list with severity ratings committed publicly;
   source notes destroyed per protocol.
4. Remediate: fix severity-3/4 findings (or obtain explicit owner acceptance per finding);
   severity-1/2 fixes at session discretion or parked.
5. Re-verify after fixes: axe + keyboard smoke + the affected EP-36 script steps still pass;
   golden snapshots unchanged (no scoring drift).
6. Record the usability-pass row for the release criteria (gate 8) with dates and disposition
   counts.

## Out of scope

- Formal usability study / learner pilot — final-roadmap.md B-9 / B-5 (consent/IRB-gated).
- Scoring or content changes — owning lifecycles, owner-only.
- Facilitated/group mode ideas — final-roadmap.md B-3.

## Owner checkpoints

Owner explicitly accepts (in writing, in the findings doc) any severity-3/4 finding left
unresolved — the release gate requires **resolved or owner-accepted**, nothing silently open.

## Verification / acceptance

- Findings doc committed: anonymized, severity-rated, each sev-3/4 row marked resolved (with
  commit ref) or owner-accepted (with dated note) *(mechanical scan for unresolved rows)*.
- Protocol-compliance statement in the doc: no recordings made, notes destroyed, verbal assent
  obtained, no retained personal data *(judgement — owner confirms)*.
- CI green on both OSes after remediation; EP-36 gate artifacts still valid (re-run affected
  steps).

## Handoff

Standard fields + findings-doc path, disposition tally (found/fixed/accepted), any EP-36 steps
re-executed, and confirmation the gate-8 release row is ready.

## Parked → final-roadmap.md

Severity-1/2 polish items not fixed here are parked with their finding IDs (D-RISK-002).
