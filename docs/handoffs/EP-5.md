# EP-5 handoff — Claims matrix, release criteria, changelog

**Status:** complete — all owner decisions ruled 2026-09-02 (see "Owner decisions") · **Date:** 2026-09-02 ·
**Brief:** roadmap/EP-5-claims-criteria.md · **Commits:** `f3a1e28` (docs, README/PR-template
edits, handoff), plus the Done-hash follow-up

## Completed scope IDs

All five in-scope items: (1) `docs/CLAIMS.md` with the 11 seed rows C1–C11, each with a
claim cell, an evidence-or-softening cell, and a dated status cell (Evidenced / Softened /
Deferred → EP-N), plus the definition of "outward copy", the two D-QA-002 rules, and the
owner-only "adding a row" procedure; (2) the standing-disclaimers canonical block in
CLAIMS.md, byte-identical to the README's copy and to the approved appendix text, with a
sentence-by-sentence "rests on" table; (3) `docs/RELEASE-CRITERIA.md` with the twelve v1.0.0
gates G1–G12 (pass condition, evidence artifact, result column), the 0.x conventions, and a
ten-step per-tag checklist that carries the runnable copy-rule grep and disclaimer diff;
(4) `CHANGELOG.md` in Keep a Changelog 1.1.0 format with the custom **Content** category and
an `[Unreleased]` section seeded with the R0 governance work to date; (5) the README sweep
(mapping below) — no orphan sentence; one stale parenthetical fixed.

## Changed files

- `docs/CLAIMS.md`, `docs/RELEASE-CRITERIA.md`, `CHANGELOG.md` — new.
- `README.md` — one outward-text edit in "Limitations and disclaimers": the parenthetical
  "(arrives with the next governance step; the link is intentionally forward)" removed, since
  `docs/CLAIMS.md` now exists, and a pointer to `docs/RELEASE-CRITERIA.md` added in the same
  sentence. The disclaimer block is untouched (owner decision 2).
- `.github/PULL_REQUEST_TEMPLATE.md` — the copy-rule checkbox rewrapped so that the word
  "never" and the forbidden phrase sit on one line; wording otherwise unchanged. Needed so the
  per-tag grep in RELEASE-CRITERIA.md can distinguish rule statements from uses mechanically
  (owner decision 2).
- `docs/handoffs/EP-5.md` — this record. `roadmap/README.md` — EP-5 Done column (follow-up
  commit, EP-0…EP-4 pattern).

## Verification results (2026-09-02)

- **Three files exist; CLAIMS.md has 11 rows each with an evidence-or-softening cell:**
  `grep -c '^| \*\*C[0-9]' docs/CLAIMS.md` → 11; every row's third cell names at least one
  artifact or the softening wording, and its fourth cell names the supplying EP where
  deferred. ✔
- **Copy rule:** the RELEASE-CRITERIA per-tag grep (outward copy = README, CONTRIBUTING,
  SECURITY, SUPPORT, CoC, THIRD-PARTY, CITATION.cff, CHANGELOG, LICENSE-CONTENT, `.github/`,
  `docs/` minus handoffs, `source material/`; lines carrying "never" excluded) → **no
  output**. The only raw hits are the three rule statements (PR template line 44, CLAIMS.md
  row C3, and the grep command itself in RELEASE-CRITERIA.md), each on a line with "never".
  DECISIONS.md (D-PROD-006) and the charter keep their historical "expert-reviewed" and are
  exempt by the brief. ✔
- **Disclaimer block byte-identical:** the sed-extracted block from `docs/CLAIMS.md` diffs
  empty against `README.md` **and** against the approved seed in
  `roadmap/appendices/governance-security.md` §6 (seven lines each). ✔
- **README sweep:** 31 sentence groups mapped (table below); zero orphans. ✔
- **Links:** every relative link in the three new files and the README resolves (scripted
  check, 0 broken). ✔
- **Encoding / EOL:** all new and changed files UTF-8 without BOM, LF only. ✔
- **Pre-commit hook dry run** on the staged set: gitleaks "no leaks found"; tripwire layer 2
  passed. ✔
- **Leak screen:** the new docs name only public repository paths, public decision IDs, and
  the public repository slug (in the CHANGELOG compare link, already present in CITATION.cff);
  no local paths, usernames, or emails. ✔

## README sweep — sentence → claims row (required by the brief)

"SD-n" = sentence n of the standing-disclaimer block (numbered in CLAIMS.md). "Claim-free" =
a description of a file, a process, or a plan that is verifiable by the repository's own
contents and asserts nothing about what the project is or has been shown to do.

| # | README location | Sentence (abridged) | Row(s) |
|---|---|---|---|
| 1 | Tagline, lines 3–5 | "A fully synthetic, client-only … simulation for junior residents and senior medical students: reconstruct a BPMH …, find and resolve the discrepancies, and learn from the debrief." | C2 (synthetic), C7 (client-only), C4 (audience and "learn from" = designed-to-teach framing), C11 (the described loop is not built yet) |
| 2 | Status line, line 7 | "pre-release; under active construction; nothing here is validated" | C11 (self-evidencing) |
| 3 | What this is, bullet 1 | Training simulation; ED admission at a fictional US hospital; seven source kinds; build history, log discrepancies, decide, sign. | C11 (present-tense design description per D-PROD-004, D-WF-001, D-MED-004, D-WF-004; each part evidenced by the working app at G9); "fictional US hospital" also C1 |
| 4 | What this is, bullet 2 | Fictional, vendor-neutral, EHR-like interface with an original visual identity; fragmentation deliberate, friction not. | C1 (original identity; deferred to EP-10 originality records); second sentence claim-free design principle (D-UX-002) under C11 |
| 5 | What this is, bullet 3 | Evidence-timeline debrief: what was knowable when; learner path vs a reviewed reference; cited teaching notes. | C11 (debrief lands EP-24), C3 ("reviewed reference"), C5 ("cited teaching notes") |
| 6 | What this is, bullet 4 | Five separate subscores, no composite; reference answers and scoring rules public by design. | C10 |
| 7 | What this is, bullet 5 | Client-only on Pages; no accounts, backend, telemetry, runtime network calls, runtime language model; nothing leaves your machine. | C7 |
| 8 | What this is not, bullet 1 | Not medical advice, not clinical decision support, never connected to a live EHR. | SD-1 via C4 (educational only); "never connected" via C7 |
| 9 | What this is not, bullet 2 | Not validated, not a certification, no safety-improvement claim; designed to teach, not proven to teach. | C4 |
| 10 | What this is not, bullet 3 | Not affiliated with any employer, hospital, EHR vendor, pharmacy, or payer. | SD-5 (owner statement of fact; self-evidencing) |
| 11 | What this is not, bullet 4 | Not a source of real data; everything synthetic and fictional; no real patient information, employer material, or restricted dataset anywhere. | C2 |
| 12 | What this is not, bullet 5 | Not summative or high-stakes; answers not hidden; no anti-cheating design. | C10 (public reference layer, D-GOV-003) |
| 13 | Screenshot | Placeholder; screenshots will come from Pages and be leak-screened; no mock-ups. | Claim-free (process statement; enforced by gate G7) |
| 14 | Quickstart | Placeholder; toolchain not bootstrapped; Windows-native Node LTS, no containers. | Claim-free (process statement); the toolchain description is a design commitment (D-ARCH-003) under C11 |
| 15 | Design principles 1 | Fragmentation is fidelity; controls modern, consistent, accessible. | Claim-free principle (D-UX-002); "accessible" is gate wording under C6 |
| 16 | Design principles 2 | Two-layer truth; scoring only against accepted alternatives, never a hidden single answer where uncertainty is irreducible. | C10 |
| 17 | Design principles 3 | Unsafe actions never blocked; surfaced in the debrief with mechanism of harm. | C10 |
| 18 | Design principles 4 | Time simulated; authored clock costs; no real-time pressure; no timing-dependent interaction. | C10 (deterministic engine); "no timing-dependent interaction" is also C6 gate wording |
| 19 | Design principles 5 | "Unable to verify" and "deferred" are legitimate outcomes; escalation is a scored skill. | C10 (scoring semantics, D-WF-004, D-CLIN-002) |
| 20 | Design principles 6 | Harm language: plausible-consequence phrasing, ordinal severity, no invented probabilities or statistics. | C5 (numbers only from cited notes, D-SCOR-003) with C4 honesty framing; checked by the EP-6 review checklist and the harm-language lint (traceability appendix) |
| 21 | Design principles 7 | Every clinical rule cites an authoritative source with version and access date; every case ships with a public, dated review record. | C5 (first clause), C3 (second clause) |
| 22 | Design principles 8 | Accessible by design; WCAG 2.2 AA is a release gate: keyboard-operable, screen-reader tested, no color-only information, reduced motion. | C6 (gate wording, not a conformance claim; see owner decision 4 on "screen-reader tested") |
| 23 | Design principles 9 | Complete at rest: no services, recurring costs, or scheduled obligations beyond annual re-review; review badges make staleness self-evident. | C7 (no services), C3 (dated badges); the obligation statement is the owner's D-RISK-005 commitment |
| 24 | Limitations, lines 77–78 | Clinical content is physician-reviewed (single reviewer); dual review is a named future upgrade, not something that has happened. | C3 (exact wording + the softening) |
| 25 | Limitations, lines 79–82 | Pointer to docs/CLAIMS.md and docs/RELEASE-CRITERIA.md; "reproduced unmodified everywhere the project speaks". | Claim-free (both files exist as of this EP — the stale "arrives with the next governance step" parenthetical was removed); the "unmodified" promise is enforced by the per-tag diff |
| 26 | Limitations, block | The standing disclaimer. | SD-1…SD-6, byte-identical to CLAIMS.md (diff-checked) |
| 27 | Non-affiliation | Personal project; no affiliation, sponsorship, or endorsement; fictional institution names and visual identity original; resemblance unintended. | SD-5 (owner statement); C1 (originality) |
| 28 | License | MIT for code, CC BY 4.0 for content, `MIT AND CC-BY-4.0`, names and identity not licensed, THIRD-PARTY and registry pointers. | C8 |
| 29 | Contributing, security, support | Descriptions of CONTRIBUTING, SECURITY, SUPPORT, CODE_OF_CONDUCT, the clinical-concern template, and the freeze procedure. | Claim-free (each named file and procedure exists: verified this session; the freeze procedure is INCIDENT-PROCEDURE.md §B) |
| 30 | Roadmap | Plan location, no calendar dates by design, release skeleton R0–R3, 0.x until criteria pass. | Claim-free (process; the 0.x rule is RELEASE-CRITERIA.md §2). "One complete introductory case" describes R1's plan, not a count (C9 stays "no count stated") |
| 31 | Citing | CITATION.cff pointer. | Claim-free (file exists) |

Orphans: **none.** Two readings were put to the owner rather than decided silently
(decisions 3 and 4 below).

## Claims whose evidence is deferred (named EP)

| Row | Deferred part | Supplied by |
|---|---|---|
| C1 | Trade-dress originality records; per-case fictional-name screens | EP-10; each case EP |
| C3 | Self-review checklist; public review records; in-app badge | EP-6; EP-14 + case EPs; EP-19 |
| C5 | Citation spec; INV-CIT-001 warn-level; strict; rendered citations | EP-6; EP-9; EP-20; EP-24 |
| C6 | Audit artifacts (axe, keyboard, NVDA, zoom, exceptions doc, conformance statement) | EP-36 (claimable at EP-38) |
| C7 | CSP on Pages; CI no-network invariant; first verification | EP-8; EP-15; EP-19 |
| C8 | SPDX headers + CI check; the `packages/**` / `content/**` paths | EP-8 / EP-9 |
| C9 | First live count | EP-19; roster closure EP-35 |
| C10 | Engine + golden harness; first public reference layer | EP-11 / EP-12; EP-14 |
| C11 | Removal of the status line | EP-38 |

C2 and C4 are fully evidenced/softened today and carry no deferral.

## Owner decisions (presented interactively 2026-09-02; outcomes recorded)

1. **Canonical copy checkpoint (brief: owner reads the block and the 11 rows before merge).**
   Options offered: approve as written (recommended); approve with edits; hold for a later
   read. **Owner ruling: approve as written.** The standing-disclaimer block in
   `docs/CLAIMS.md` and rows C1–C11 are the project's canonical outward copy from this
   commit (D-EXEC-003 outward-claim sign-off satisfied for the seed rows). No DECISIONS.md
   entry is needed: nothing beyond the already-approved seed was claimed.
2. **Outward-text edits** (README parenthetical removed + RELEASE-CRITERIA pointer; PR-template
   checkbox rewrapped). Options: keep both (recommended); keep README edit only; revert both.
   **Owner ruling: keep both.**
3. **Present-tense design descriptions in the README.** Options: accept the C11 softening
   reading (recommended); reword to future tense. **Owner ruling: accept the C11 reading.**
   README text unchanged; C11's evidence cell documents the reading; gate G9 closes it at
   v1.0.
4. **"screen-reader tested" in design principle 8.** Options: keep as gate wording
   (recommended); tweak to "screen-reader pass required". **Owner ruling: keep as gate
   wording.** Sweep row 22 stands under C6.
5. **Commit and push.** Options: commit and push, two commits (recommended); commit locally
   only; hold. **Owner ruling: commit and push**, two commits in the EP-0…EP-4 pattern, no AI
   co-author trailer.

## Decisions logged (reversible technical, D-EXEC-003)

- **Status vocabulary** (Evidenced / Softened / Deferred → EP-N / Withdrawn) and the rule
  that rows are appended and never renumbered or deleted are this EP's structure; the
  appendix specified only the rows. Reversible by editing.
- **Definition of "outward copy"** written into CLAIMS.md so the grep has a fixed path list;
  handoff records are excluded because they are verification records that legitimately quote
  the check. `content/` and `packages/` are pre-listed for EP-8/EP-9 to include.
- **Copy-rule grep convention:** a rule statement may mention the forbidden phrase only on a
  line that also carries "never"; the per-tag command filters on that word. Chosen over a
  hand-maintained allowlist of line numbers, which would rot.
- **Gate applicability split** (§1 of RELEASE-CRITERIA.md): six gates are v1.0.0-only, six
  apply in proportion at every 0.x tag. The appendix listed the twelve gates for v1.0 and the
  per-tag items separately; the split makes explicit which gates EP-19 must run for `v0.1.0`.
- **Name-screen Run 3 added to the per-tag checklist** (item 7) as a `v0.1.0` pre-condition,
  carrying forward the EP-3 owner ruling ("run it before EP-19") so EP-19 cannot miss it.
- **PR-template rule folded into the per-tag checklist** (item 2, "PR-template rule honored"),
  as the EP-2 handoff asked.
- **CHANGELOG `[Unreleased]` seeded with the R0 pack at coarse grain** (one bullet per EP
  group), not per file: the handoffs hold the detail, and Keep a Changelog is for readers, not
  auditors. The compare link points at the `main` commit list until a first tag exists.
- **CLAIMS.md sentence-level "rests on" table** for the disclaimer block: additive; lets the
  README sweep cite disclaimer sentences (SD-n) without duplicating text.

## Risks / notes for the next session

- **EP-19 runs the per-tag checklist for the first time** and must flip C7 (after EP-8/EP-15),
  C9 (first live count), and C10 (after EP-12) — and must confirm NAME-SCREEN.md Run 3 exists
  before tagging.
- **EP-15 and EP-19 must consume the disclaimer block from CLAIMS.md unmodified** (banner and
  pre-brief); the app's own test should assert string equality with the block so the per-tag
  diff has a second consumer to check.
- **EP-8** should add `content/` and `packages/` to the grep path list in RELEASE-CRITERIA.md
  once those trees exist, and wire the copy-rule grep and disclaimer diff into CI if cheap.
- The README's present-tense design descriptions lean on C11 until each feature lands; at
  EP-38 (G9) every one of them must be true of the shipped app, or be reworded, before the
  status line is removed.

## Next eligible EPs

**EP-6** (clinical governance specs — supplies C3's checklist and C5's citation spec),
**EP-8** (toolchain — supplies C7's enforcement and C8's SPDX check) are eligible now. EP-5
blocks nothing; its documents are executed at EP-19 and EP-38.
