# EP-3 — Name & identity screening spike

**Size:** S · **Type:** spike · **Core/Stretch:** core ·
**Depends on:** none · **Blocks:** EP-10 (Visual identity & originality pack)

## Context

Executes D-OSS-004: screen "medrecsim" and the fictional-identity naming convention for
collisions before the v1 visibility push. A preliminary screen was run at planning time
(2026-08-23): GitHub shows only this repo; npm and PyPI names free; medrecsim.com/.net/.org
unregistered; web search found no exact match (nearest = L1: a "MedRecs" records-management
product and a MedSim/MedSimAI simulation cluster); **USPTO was inconclusive** — a manual search
session is required (spike SP-10 in [appendices/spikes.md](appendices/spikes.md)). Results and
criteria detail: [appendices/governance-security.md](appendices/governance-security.md) §8.
Assumes OQ-10 (**no defensive domain purchase**) per
[appendices/open-questions.md](appendices/open-questions.md).

## Safety & policy preconditions

- Synthetic-only content: n/a — no clinical content.
- Clinical sign-off (D-EXEC-003): n/a.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: record only public search results; no account details or personal data in
  `docs/NAME-SCREEN.md`.
- Licensing/attribution (D-DATA-006): naming/legal responses are owner-only (D-EXEC-003); this
  spike documents evidence, it never renames anything.
- Accessibility (D-UX-004): n/a.
- Security baseline (D-SEC-001): n/a (docs-only; EP-0 hooks already active).

## In scope

1. `docs/NAME-SCREEN.md`: the six-venue protocol (GitHub, npm registry, PyPI, RDAP domain
   lookup, USPTO, general web + app stores), collision criteria L0–L3, and the standing footer
   "informal screening; not legal advice" on every record.
2. Record the preliminary 2026-08-23 results (dated) and re-run the programmatic venues to
   confirm they still hold (D-RISK-006 reverify).
3. SP-10: manual USPTO trademark search — classes 9/41/42/44 plus phonetic variants of
   "medrecsim". Record queries, dates, and a verdict per the L0–L3 scale.
4. Document the response ladder: L2+ = owner decision; L3 = rename before the visibility push
   (note: GitHub repo rename auto-redirects).
5. State the fictional in-sim name-screening rule (institutions/providers/pharmacies screened
   against real orgs and notable persons **before first case publish**) — the registry that
   operationalizes it is EP-10; per-case execution happens in case EPs.

## Out of scope

- Fictional-identity registry implementation → EP-10.
- Any rename, trademark filing, or domain registration → owner-only; domain question is closed
  as "no" unless the owner overrules OQ-10.
- npm scope/package publication decisions → EP-8 (blocked on this verdict for the name only).

## Owner checkpoints

- Any collision graded ≥L2 → pause and present to the owner with the evidence (naming is
  owner-only, D-EXEC-003).
- OQ-10 (defensive domain): assumed **no**; surface only if new evidence changes the picture.

## Verification / acceptance

- `docs/NAME-SCREEN.md` exists with: all six venues, each with query method, date, result, and
  L-grade; an overall verdict; the not-legal-advice disclaimer.
- The USPTO row is no longer "inconclusive" — it has a manual-search result (or a documented
  blocker plus an explicit owner notification recorded in the handoff).
- Preliminary results re-verified with fresh dates.

## Handoff

Standard fields, plus: the overall L-grade verdict; whether EP-10 may proceed with the current
name; risk R-15 status update (name/trademark collision surfacing late).

## Parked → final-roadmap.md

none
