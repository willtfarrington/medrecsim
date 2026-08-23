# EP-5 — Claims matrix, release criteria, changelog

**Size:** S · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** EP-2 (Community & governance pack) · **Blocks:** none (executed at every release; instantiated docs are gates at EP-19 and EP-38)

## Context

Implements D-QA-002 (public claim–evidence matrix checked at every release) and the D-OSS-003
release conventions (0.x semver, tagged releases, Keep-a-Changelog). The 11-row claims seed and
the 12-gate v1.0 checklist are specified in
[appendices/governance-security.md](appendices/governance-security.md) §6 and §7. EP-2's README
rewrite must exist first because this EP's exit test is mapping every outward README sentence to
a claims row or marking it claim-free.

## Safety & policy preconditions

- Synthetic-only content: claim C2 ("synthetic-only" as a hard guarantee, never softened) is
  authored here — treat its wording as load-bearing.
- Clinical sign-off (D-EXEC-003): new outward claims are owner-only; this EP instantiates the
  already-approved seed rows, nothing beyond them.
- Harm language (D-SCOR-003): n/a — no clinical content; claim C4 encodes the related honesty
  rule ("designed to teach", never "proven to teach").
- Leak prevention: n/a beyond standard rules — docs-only.
- Licensing/attribution (D-DATA-006): claim C8 maps license statements to the license files.
- Accessibility (D-UX-004): claim C6 — WCAG conformance is claimed only after the v1 gate; until
  then wording is "designed to meet".
- Security baseline (D-SEC-001): n/a (EP-0/EP-1 done).

## In scope

1. `docs/CLAIMS.md` with the 11 seed rows, each mapping claim → evidence-or-softening:
   C1 original/fictional (← trade-dress + name-screen records); C2 synthetic-only (hard
   guarantee); C3 **"physician-reviewed (single reviewer)"** — never "expert-reviewed" (← public
   review records); C4 designed-to-teach never proven-to-teach; C5 every clinical rule cited
   (← CI invariant; warn-level until EP-9); C6 WCAG claimed only post-v1-gate; C7
   offline/no-telemetry (← architecture + CI no-network test + CSP); C8 licenses (← files); C9
   case counts stated as live numbers until v1; C10 deterministic engine / five subscores, no
   composite (← golden tests); C11 status line self-evidencing.
2. Standing-disclaimers canonical block in CLAIMS.md (educational only; all synthetic/fictional;
   not validated, no competence certification, no safety-improvement claim; single-clinician
   review; personal project, no affiliation, not "HIPAA compliant" because no real health
   information is processed; drug info may become outdated — per-case review date). README,
   banner, and pre-brief consume this copy verbatim.
3. `docs/RELEASE-CRITERIA.md`: the 12-gate v1.0 checklist (coverage matrix; public review
   records + badges; WCAG audit; claims clean; security re-verified; licenses/registry/SPDX;
   leak-screened screenshots; usability pass; README accurate + clean-machine quickstart; full
   pyramid green both OS with budgets; governance current; owner sign-off in DECISIONS.md), plus
   0.x conventions (minor = feature slice — v0.1 = R1; patch = fixes/content) and the per-tag
   checklist (CLAIMS check + CITATION.cff bump on every tag).
4. `CHANGELOG.md`: Keep-a-Changelog format plus a custom "Content" category; Unreleased section
   seeded.
5. README sweep: map every outward sentence to a claims row or verify it claim-free; fix
   orphans; record the mapping in the handoff.

## Out of scope

- Executing any release → EP-19 (v0.1), EP-38 (v1.0). Screenshots → EP-19.
- CI enforcement of citation/no-network invariants → EP-8/EP-9/EP-20.
- New claims of any kind → owner-only, via a new CLAIMS row (D-QA-002).

## Owner checkpoints

- Owner reads the standing-disclaimers block and the 11 rows once before merge — this text
  becomes canonical outward copy *(judgement)*.

## Verification / acceptance

- The three files exist; CLAIMS.md has 11 rows each with an evidence-or-softening cell.
- `git grep -n "expert-reviewed"` — zero hits in outward copy (README, docs/, templates);
  DECISIONS.md/charter historical text exempt.
- README sweep documented: sentence → row (or claim-free) list in the handoff; no orphans left.
- Disclaimers block matches README's copy verbatim (diff-checked).

## Handoff

Standard fields, plus: the README sentence→row mapping; any claim whose evidence is deferred
(named EP that will supply it); note that every future tag checklist starts from
RELEASE-CRITERIA.md.

## Parked → final-roadmap.md

none
