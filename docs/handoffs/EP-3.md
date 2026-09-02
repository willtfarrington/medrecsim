# EP-3 handoff — Name & identity screening spike

**Status:** complete — all owner decisions ruled 2026-09-02 (see "Owner decisions") ·
**Date:** 2026-09-02 · **Brief:** roadmap/EP-3-name-screen.md · **Commits:** see the roadmap
Done column (docs commit, then the Done-hash follow-up)

## Completed scope IDs

All five in-scope items: (1) `docs/NAME-SCREEN.md` with the six-venue protocol, the L0–L3
collision scale, and the standing "informal screening; not legal advice" notice at head and
foot; (2) the 2026-08-23 preliminary results recorded as Run 1 and every programmatic venue
re-run 2026-09-02 as Run 2 (D-RISK-006 reverify); (3) SP-10 executed as far as a scripted
session can: a programmatic screen against a daily-updated USPTO mirror for the name, two
phonetic variants and the two adjacent stems, with the official manual session recorded as a
**documented blocker plus owner notification** (the brief's explicit alternative); (4) the
response ladder documented (L2 = owner decision; L3 = rename before visibility push; repo
rename auto-redirects); (5) the fictional in-sim name-screening rule stated, with the registry
deferred to EP-10 and per-case execution to the case EPs.

## Changed files

- `docs/NAME-SCREEN.md` — new; the standing screening record described above.
- `docs/handoffs/EP-3.md` — this record.
- `roadmap/README.md` — EP-3 Done column (follow-up commit, EP-0/1/2 pattern, once the owner
  approves the commit).

## Verification results (2026-09-02)

- `docs/NAME-SCREEN.md` exists; all six venues have query method, date, result and L-grade;
  overall verdict present; not-legal-advice disclaimer at head and foot. ✔
- USPTO row is no longer "inconclusive": it carries a provisional L1 from the mirror screen
  (0 hits for `medrecsim`, `med rec sim`, `medreksim`, `medrexim`; adjacent MEDREC / MEDSIM
  families tabulated with status codes) **and** the documented blocker for the official venue
  (tmsearch.uspto.gov is a WAF-challenged SPA with no public API; ODP search 403 without a
  key; TSDR 401). Owner notification: this record, and the decision list below. ✔ (per the
  brief's "or" clause)
- Preliminary results re-verified with fresh dates: GitHub, npm, PyPI, RDAP all still clear
  (L0), plus `.io`/`.app`/`.dev` and the npm scope/hyphen variants added. ✔
- Leak check: the record names only public endpoints, public search results, and the authors
  of one public article; no account details, tokens, or personal data. The session's scratch
  files (fetched HTML/JSON) live in the session scratchpad, not the repo; `git status` shows
  only the two new docs. ✔

## Overall L-grade verdict

**L2.** V1–V4 are L0; V5 (USPTO) is L1 provisional; V6 found **"Med Rec Sim"** — a 2023
Medium-published GPT-4 Streamlit prototype from Virginia Commonwealth University School of
Pharmacy for student pharmacists, with no trademark, repository, domain, app, paper, or
institutional page found and no mention after 2023. Same field, name differs only by spacing
→ L2 under the documented scale (plausible confusion, no live mark, no distributed product).

## May EP-10 proceed with the current name?

**Yes.** The L2 was presented to the owner per the brief ("any collision graded ≥L2 → pause
and present to the owner") and D-EXEC-003; the owner ruled **keep `medrecsim` unchanged**
(decision 1 below). EP-8 may use the name for package manifests and any npm scope.

## Risk R-15 status update

R-15 ("name/trademark collision surfaces late") moves from *open — USPTO outstanding* to
*surfaced early and adjudicated (keep name)*: the collision is a low-footprint academic prototype,
not a trademark, and it was found before any visibility push, which is exactly the outcome
the mitigation was designed for. Residual: the official USPTO session is still owner-side;
until it runs, V5 stays provisional. Recommended R-15 trigger text after this EP: "confusion
report naming VCU's Med Rec Sim; any live USPTO mark found in the owner's manual session".

## Owner decisions (presented interactively 2026-09-02; outcomes recorded)

1. **L2 ruling on "Med Rec Sim" (VCU).** Options offered: (a) keep `medrecsim` unchanged;
   (b) keep and add a one-line README/about disambiguation (a new outward claim needing a
   `docs/CLAIMS.md` row at EP-5); (c) rename now, before any visibility push. Agent
   recommendation was (a): a 2023 prototype with no ongoing footprint; the existing
   non-affiliation banner already does the work; a disambiguation line would give the
   collision more prominence than the evidence warrants. **Owner ruling: (a) keep
   `medrecsim` unchanged.** Recorded in `docs/NAME-SCREEN.md` under "Overall verdict". No
   DECISIONS.md entry is needed (no name change, no new claim). R-15 trigger: a confusion
   report naming the VCU prototype re-opens option (b).
2. **Official USPTO manual session.** Options offered: before EP-19; now, before EP-10;
   accept the mirror result as sufficient. **Owner ruling: run it before EP-19** (the v0.1
   visibility push). V5 stays provisional L1 until "Run 3" is appended; EP-10 is not held.
3. **Commit and push.** **Owner ruling: commit and push** — two commits in the EP-0/1/2
   pattern (docs, then the roadmap Done-hash follow-up), no AI co-author trailer.
4. **OQ-10 (defensive domain).** No new evidence (all six domains unregistered); assumption
   "no" stands. Not put to a vote — surfaced here for completeness only.

## Decisions logged (reversible technical, D-EXEC-003)

- **L0–L3 scale wording** written in `docs/NAME-SCREEN.md` (the appendix named the scale but
  did not define it). Reversible by editing the table; any change to the *response* side of
  the ladder is owner-only.
- **Extra venues added** beyond the brief's minimum: `.io/.app/.dev` RDAP, npm scope and
  hyphen/underscore variants, PyPI hyphen variants, GitHub users/orgs/code search, PubMed.
  Cheap and strictly additive.
- **Third-party USPTO mirror used** (tmsearchapi.com, free tier, no key, screening-only by
  its own terms) as the supplementary V5 source. It is recorded as a mirror, not as the
  official venue, and its results are marked provisional. No dependency; nothing in the
  registry (one-off query, nothing redistributed).
- **Status-code meanings** taken from the USPTO Trademark Applications Daily XML DTD
  documentation (Table 1), fetched 2026-09-02, rather than from a secondary site.
- **Article authors named** in the V6 record because the citation is to a public, licensed
  article; no other personal data recorded.

## Risks / notes for the next session

- The V5 grade is provisional until the owner's official USPTO session (owner-scheduled
  before EP-19). If a live mark surfaces there, re-grade and, if L3, follow the rename
  ladder before the v0.1 push. EP-19's brief should treat "Run 3 appended to
  docs/NAME-SCREEN.md" as a pre-release check.
- EP-5 (claims matrix): no new claim arises from EP-3; the existing "original and fictional
  identity" README claim can cite `docs/NAME-SCREEN.md` as its evidence row.
- EP-10 inherits the fictional in-sim name-screening rule from `docs/NAME-SCREEN.md` (last
  section) and must store a screening note per registry name.

## Next eligible EPs

**EP-4** (threat model — depends on EP-1), **EP-5** (claims matrix — depends on EP-2),
**EP-6** (clinical governance specs), **EP-8** (toolchain) are eligible now. **EP-10** is
unblocked on the EP-3 side and waits only on EP-8.
