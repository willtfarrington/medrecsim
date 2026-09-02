# EP-4 handoff — Threat model, procedures & MIMIC gate

**Status:** complete — all owner decisions ruled 2026-09-02 (see "Owner decisions") ·
**Date:** 2026-09-02 · **Brief:** roadmap/EP-4-threat-model.md · **Commits:** `0773abd` (docs +
handoff), plus the Done-hash follow-up

## Completed scope IDs

All four in-scope items: (1) `docs/THREAT-MODEL.md` with the six assets, seven actors, trust
boundaries B1–B7 with landed/pending status, a named-scenario table, documented non-threats,
accepted risks, and revisit triggers; (2) `docs/DEPENDENCY-POLICY.md` with the minimal-deps
presumption, dependency classes, an **empty runtime allowlist section reserved for EP-8**,
frozen-lockfile and `ignore-scripts` rules, the ten-point new-dependency checklist, Actions and
tool-binary rules, the weekly reviewed-not-auto-merged cadence, and the annual audit aligned to
the content re-review; (3) `docs/INCIDENT-PROCEDURE.md` with (a) the pre-authorized
sensitive-commit runbook as a copy-pasteable ordered command sequence A1–A13 (rotate first →
discovery → mirror-clone rewrite with git-filter-repo → temporary ruleset disable → force-push
→ re-protect and drift-check → GitHub Support purge → local cleanup → Pages redeploy → dated
public record with the honest fork caveat → detection rule → close), (b) the D-RISK-004
content-error path with written credibility criteria and anti-weaponization guards, (c) the
vulnerability path, plus a short account-compromise addendum and the incident-record template;
(4) `docs/MIMIC-GATE.md`, status CLOSED, with D-MIMIC-001 and D-MIMIC-002 quoted verbatim, the
four sequential owner-only steps with entry/exit conditions, six hard rules, a side-by-side
compatibility table against D-MIMIC-001, the abandonment-by-default exit statement, and a
reverified terms snapshot marked orientation-only.

## Changed files

- `docs/THREAT-MODEL.md`, `docs/DEPENDENCY-POLICY.md`, `docs/INCIDENT-PROCEDURE.md`,
  `docs/MIMIC-GATE.md` — new.
- `SECURITY.md` — the closing sentence "The threat model and incident procedures are
  documented under `docs/` as they land" replaced with links to the three now-existing
  documents (outward-facing text; owner decision 2 below).
- `docs/SECURITY-BASELINE.md` — a "Related documents (EP-4)" paragraph added under the
  re-verification triggers; no row changed.
- `docs/handoffs/EP-4.md` — this record. `roadmap/README.md` — EP-4 Done column (follow-up
  commit, EP-0…EP-3 pattern, once the commit is approved).

## Verification results (2026-09-02)

- **Four docs exist and cross-reference each other and `docs/SECURITY-BASELINE.md`:** scripted
  check, every doc links every other one plus the baseline (4 × 4 = 16 links present); zero
  broken relative links across the four docs, SECURITY.md, and the baseline. ✔
- **Runbook is a copy-pasteable ordered command sequence:** §A1–A13, each step with its shell
  block, read through end-to-end without execution; commands use only `git`, `gh`, `pip`, and
  `git-filter-repo`, all of which exist or are installed at step A4. Ruleset ids match
  `docs/rulesets/`. ✔ **The runbook was NOT executed** (docs-only EP; no incident has occurred;
  no ruleset was touched; `gh api` was used read-only for nothing in this EP).
- **MIMIC-GATE compatible with D-MIMIC-001 side-by-side:** §6 compatibility table maps each
  clause of D-MIMIC-001 and the charter rule to a section; the decisions are quoted verbatim in
  §2. ✔
- **Each doc names its own revisit trigger:** status line plus a closing section in all four. ✔
- **Copy rule:** `git grep "expert-reviewed"` over `docs/` and SECURITY.md hits only the EP-2
  handoff's description of the check itself. ✔
- **Leak screen:** no local paths, usernames, emails, or account details in the four docs
  (grep for user-profile paths and mail-style addresses: clean). The only account identifier
  is the public repository slug already present in SECURITY-BASELINE.md. ✔
- **Pre-commit hook dry run** on the staged docs: gitleaks "no leaks found"; tripwire layer 2
  passed (the `docs/MIMIC-GATE.md` path is `.md` and therefore exempt from the
  restricted-dataset path marker by the EP-0 design, which the hook comment anticipated).
  `gitleaks dir .` over the working tree: no leaks. ✔

## Deviations from the appendix outlines (with rationale)

- **THREAT-MODEL adds actor T7 (prompt injection via repository text)** beyond the appendix's
  five actors. Rationale: the project's authoring workflow is agent-assisted and says so
  publicly; issue/PR text reaching an agent session is a real path to assets A1/A5 that the B1
  boundary already implies. Additive; no control changed.
- **INCIDENT-PROCEDURE adds §D (account-compromise addendum) and a severity-class table
  (S1–S5).** The brief lists three paths (a–c); §D is six lines of extra steps for the T5 actor
  the threat model names, and the class table is what lets the runbook be "dry-readable" (you
  need to know which steps apply). Additive.
- **The B7 control (CSP + CI no-network test) is written as *pending EP-8 onward*** rather than
  as landed, because it is; the brief's out-of-scope line confirms enforcement is EP-8+.
- **DEPENDENCY-POLICY records the reverified gitleaks status** (upstream README, 2026-09-02:
  feature-complete, security patches only, maintainer focus shifted to "Betterleaks") and
  explicitly defers the migrate-or-stay decision to EP-8 rather than deciding it here.
- **MIMIC-GATE requires a dated DECISIONS.md entry to *open step 1***, not only the step-4 go.
  D-MIMIC-001 requires the go at step 4; the extra entry makes "someone started the memo" a
  visible, owner-initiated event rather than a private drift. Flagged as an owner-obligation
  extension (decision 4).
- **MIMIC-GATE step 2 snapshot** (DUA 1.5.0, CITI course, MIMIC-IV v3.1 of 2024-10-11, the
  2023-04-18 responsible-use post) was reverified from the public PhysioNet pages on
  2026-09-02 as the appendix asked, and is labelled orientation-only so that it is never
  mistaken for a completed step 2.

## Wording flagged as extending owner obligations (brief: "flag any wording that would extend")

1. **MIMIC-GATE §4 step 1 entry:** opening step 1 requires a DECISIONS.md entry (new).
2. **INCIDENT-PROCEDURE §A11 (S2):** the README notice stays until the owner records in
   DECISIONS.md that the leak-prevention stack was re-audited (the charter already requires the
   re-audit; the ledger entry is new).
3. **INCIDENT-PROCEDURE §B6:** owner-found clinical errors still get a public issue and the
   same freeze path, including the README notice when safety-relevant (D-RISK-004 speaks of
   "any credible challenge"; applying it to self-found errors is an extension in the direction
   of more disclosure).

No SLA, response time, or recurring obligation was added anywhere; the annual dependency audit
is folded into the existing annual content re-review so the count of recurring obligations
stays at one (D-RISK-005).

## Pointers for EP-5 (claims rows C2 and C7)

- **C2 (synthetic-only, hard guarantee):** evidence = THREAT-MODEL.md asset A5 + boundaries
  B5/B6 + §6 "No PHI, ever"; MIMIC-GATE.md §5 hard rules 1, 2, 6; INCIDENT-PROCEDURE.md class
  S2 (the stop-everything response, with the README-notice and C2-update obligation in A11);
  plus the EP-0 hooks and EP-2 attestations already cited in the traceability appendix.
- **C7 (offline, no telemetry):** evidence = THREAT-MODEL.md boundary B7 and asset A6 (states
  plainly that CSP and the CI invariant are *pending EP-8 onward*, so EP-5 should record C7 as
  "architecture decided; enforcement lands at EP-8/EP-15; verified at EP-19") and
  DEPENDENCY-POLICY.md §3 rule "no runtime dependency may perform network I/O".
- **Non-threats section** (THREAT-MODEL.md §6) is written to be citable by the standing
  disclaimer's "not HIPAA compliant because no real health information is processed" line.
- The README's "Contributing, security, and support" bullet for SECURITY.md is still accurate;
  EP-5's sweep may optionally add a pointer to `docs/THREAT-MODEL.md` but no new claim arises.

## Owner decisions (presented interactively 2026-09-02; outcomes recorded)

1. **Commit and push.** Options offered: commit and push (recommended); commit locally only;
   hold. **Owner ruling: commit and push**, two commits in the EP-0…EP-3 pattern (docs +
   handoff; then the roadmap Done-hash follow-up), no AI co-author trailer.
2. **SECURITY.md public-text edit** (the "as they land" sentence replaced with links to the
   three documents). Options: keep (recommended); revert. **Owner ruling: keep.**
3. **Scope additions** (threat-model actor T7; INCIDENT-PROCEDURE §D and the S1–S5 class
   table). Options: keep both (recommended); keep T7 and drop §D; drop both. **Owner ruling:
   keep both.**
4. **The three owner-obligation extensions** listed above. Options: accept all three
   (recommended); accept 2 and 3 only; accept 1 and 2 only. **Owner ruling: accept all three.**
   No DECISIONS.md entry is needed today; each item only prescribes a future ledger entry or
   public issue at the moment its event occurs.

## Decisions logged (reversible technical, D-EXEC-003)

- **Severity classes S1–S5** and the **A1–A13 step numbering** are this EP's structure, not the
  appendix's (which had six unnumbered steps); the appendix order is preserved inside it.
  Reversible by editing.
- **git-filter-repo install path** documented as `pip install git-filter-repo` or the upstream
  single-file script, with the ≥ 2.47 requirement for `--sensitive-data-removal` (GitHub's
  current published procedure, fetched 2026-09-02). Not installed now; installed at use.
- **Incident records directory** fixed as `docs/incidents/` (created on first use, so the tree
  is unchanged today).
- **Runtime allowlist columns** (package, pin, purpose, licence, install scripts, gzipped
  contribution, registry row, approval date) chosen here so EP-8 fills a table instead of
  designing one.
- **Cross-link edits** to SECURITY.md and SECURITY-BASELINE.md made so the "cross-reference"
  acceptance criterion holds in both directions; the SECURITY.md one is put to the owner because
  it is outward-facing text.

## Risks / notes for the next session

- The B7 controls (CSP header on Pages, CI no-network invariant) are the only threat-model
  controls not yet landed; EP-8 owns them and must flip the status column in THREAT-MODEL.md §4.
- INCIDENT-PROCEDURE §B3 assumes a per-item freeze flag in the content schema; EP-9 must
  provide it (the risk register already lists this as a schema requirement).
- EP-8 owns the gitleaks-successor question; the pinned 8.30.1 binary keeps working meanwhile.
- The A10 Pages redeploy command names `pages.yml`; EP-8 should keep that filename or update
  the runbook.

## Next eligible EPs

**EP-5** (claims matrix — depends on EP-2; this handoff's C2/C7 pointers feed it), **EP-6**
(clinical governance specs), **EP-8** (toolchain — inherits the allowlist seeding, the B7
controls, and the gitleaks question) are eligible now. EP-4 blocks nothing.
