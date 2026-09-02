# EP-6 handoff — Clinical governance specs: citations & checklists

**Status:** complete — all owner decisions ruled 2026-09-02 (see "Owner decisions") ·
**Date:** 2026-09-02 · **Brief:** roadmap/EP-6-clinical-governance.md · **Commits:** `cb6a3dc`
(instruments, registry rows, CHANGELOG, README pointer, handoff), plus the done-hash follow-up

## Completed scope IDs

All five in-scope items.

1. **SP-3 executed.** The Joint Commission's 2026 hospital-program successor to NPSG.03.06.01
   is **NPG.14.05.01** ("The hospital maintains and communicates accurate patient medication
   information") under Goal 14 of the *National Performance Goals, Effective January 2026 for
   the Hospital Program*; the five elements of performance reproduce NPSG.03.06.01 EP 1–5 with
   pronoun and cross-reference changes only. Integrator resolution **I-14 confirmed** (cite the
   archived NPSG plus the successor with a transition note); the identifier is now recorded
   rather than left as "successor wording". Citation and access date in
   `docs/clinical/CITATION-POLICY.md` §6.
2. **Citation policy** — `docs/clinical/CITATION-POLICY.md` v1.0: the ten-key YAML record,
   tiers A–D with named examples, the rule "every scored clinical rule cites ≥1 Tier A or B
   source" with the INV-CIT-001 check list, the mandatory adaptation statements (NCC MERP as
   potential worst-credible outcome; time-critical definition as a class rule), the I-15
   login-gated procedure (`.local/sources/<citation-id>/` archive convention, pointer-only
   registry row), the I-14 renumbering rule, a 16-key approved-source pointer list with access
   dates and access status, and the R-6 drift log. Location `docs/clinical/` chosen and logged
   in `docs/clinical/README.md`.
3. **Clinical self-review checklist** — `docs/clinical/CLINICAL-SELF-REVIEW-CHECKLIST.md`
   v1.0: twelve sections, 51 checks (`CSR-01.1` … `CSR-12`), including the BPMH domains from
   the MARQUIS pocket card and ISMP Best Practice 21, the high-alert audit against the 2024
   ISMP acute-care list and the 2026–2027 Targeted Best Practices, the LASA audit against the
   June-2024 Confused Drug Names list, and §9 quoting D-SCOR-003 verbatim. Sign-off block maps
   field-for-field to the review record.
4. **Stigma-safety checklist** — `docs/clinical/STIGMA-SAFETY-CHECKLIST.md` v1.0: eleven items,
   30 checks (`SS-01.1` … `SS-11`), an enumerated banned-terms set for a mechanical screen, item
   6 split into per-case recording (SS-06.1/06.2) and the EP-35 roster tabulation (SS-06.3),
   sources NIDA / APA / AMA cited.
5. **Review-record template** — `docs/clinical/REVIEW-RECORD-TEMPLATE.md` v1.0: the public
   `review-record.yaml` (record version, review date, fixed review-model string, checklist
   versions, content version reviewed, disposition, sources verified, findings, re-review
   triggers and due date), the `case.yaml` badge fields (`reviewRecordRef`, `preBriefBadge`
   with `label`, `recordVersion`, `reviewDate`, `staleAfter`), the amber staleness default, the
   rendered-record shape, and a coverage table against the EP-9 `case.yaml` needs.

## Changed files

- `docs/clinical/README.md`, `docs/clinical/CITATION-POLICY.md`,
  `docs/clinical/CLINICAL-SELF-REVIEW-CHECKLIST.md`, `docs/clinical/STIGMA-SAFETY-CHECKLIST.md`,
  `docs/clinical/REVIEW-RECORD-TEMPLATE.md` — new.
- `source material/REGISTRY.md` — 16 pointer-only rows (one per approved-source key), replacing
  the empty-registry placeholder; column schema unchanged.
- `CHANGELOG.md` — one `[Unreleased] › Added` bullet for the instruments and registry rows.
- `README.md` — one claim-free sentence in "Limitations and disclaimers" pointing to
  `docs/clinical/` (owner decision 2). Disclaimer block untouched.
- `docs/handoffs/EP-6.md` — this record. `roadmap/README.md` — EP-6 Done column (follow-up
  commit, EP-0…EP-5 pattern).

## Verification results (2026-09-02)

- **Four instruments exist under `docs/clinical/`, each with a version number and date:**
  `grep "Instrument version" docs/clinical/*.md` → four hits, all `1.0 · Date: 2026-09-02`. ✔
- **Every brief-listed section/item present:** self-review §1–§12 (`grep -c '^\- \*\*CSR-'`
  → 51 checks across twelve `## n.` headings); stigma-safety items 1–11 (30 checks). Section
  titles match the brief's list one-for-one. ✔
- **Harm-language section quotes D-SCOR-003:** `CLINICAL-SELF-REVIEW-CHECKLIST.md` §9 opens
  with the ledger entry as a blockquote, byte-for-byte from DECISIONS.md. ✔
- **"physician-reviewed (single reviewer)" used throughout:** the phrase appears in all four
  instruments and the index (12 occurrences); the review-record `reviewModel` and the badge
  `label` are fixed to it. No instrument uses any other review descriptor except inside the
  copy rule's own "never …" statement. ✔
- **SP-3 recorded with citation + access date; I-14 confirmed:** CITATION-POLICY.md §6 table
  (both identifiers, wording, program documents, URLs, accessed 2026-09-02, two corroborating
  Joint Commission documents). ✔
- **Template covers `case.yaml` needs at EP-9:** REVIEW-RECORD-TEMPLATE.md §4 maps
  `reviewRecordRef`, `preBriefBadge`, record version/date, checklist versions, content version,
  disposition, re-review triggers, and parseability (INV-META-001) to fields. ✔
- **Copy rule:** the RELEASE-CRITERIA per-tag `git grep` (run with `--untracked` so the new
  files were included) → **no output**. The one new mention of the forbidden phrases
  (CSR-11.1) sits on a line carrying "never". ✔
- **Links:** every relative link in the five new files resolves (scripted, 0 broken). ✔
- **Encoding / EOL:** `git ls-files --eol` reports `i/lf w/lf` for every staged file; no BOM. ✔
- **Pre-commit hook dry run** on the staged set: gitleaks "no leaks found"; tripwire layer 2
  passed. ✔
- **Leak screen:** the new files name only public URLs, public decision IDs, public repository
  paths, and the `.local/sources/` *convention* (no contents, no listing); no local paths,
  usernames, or emails. Nothing from `.local/` was read or quoted. ✔

## Instrument versions

| Instrument | Version | Date |
|---|---|---|
| Citation policy | 1.0 | 2026-09-02 |
| Clinical self-review checklist | 1.0 | 2026-09-02 |
| Stigma-safety checklist | 1.0 | 2026-09-02 |
| Review-record template | 1.0 | 2026-09-02 |

## SP-3 outcome (required by the brief)

NPSG.03.06.01 → **NPG.14.05.01**, hospital program, effective 2026-01-01; wording substantively
unchanged (EP 1–5 retained; discrepancy definition "omissions, duplications, contraindications,
unclear information, and changes" retained; closing cross-references renumbered). I-14 confirmed;
the policy's transition-note template is written against this pair. The Nursing Care Center
program kept NPSG.03.06.01 in 2026 and is *not* the citation medrecsim uses (D-PROD-004).
Anticoagulant therapy is likewise renumbered NPSG.03.05.01 → NPG.14.04.01 (relevant to C03 /
CSR-04.2). The planning appendix's "hospital-program wording reverify at execution" is
discharged.

## Source drift observed (risk R-6, required by the brief)

| Source | What moved | Treatment applied |
|---|---|---|
| ISMP lists and best practices | Canonical host is now ECRI (`online.ecri.org/hubfs/ISMP/Resources/…`); legacy `ismp.org` paths were not relied on (one 2011 PDF still served there). All three lists needed by v1 were **publicly downloadable** on 2026-09-02; the ECRI "Download the list" pages could become form-gated. | Cite the ECRI URLs; landing pages recorded; I-15 procedure ready if gating appears. |
| ISMP Targeted Best Practices | New **2026–2027** edition (the appendix cited 2024–25). Best Practice 21 (medication reconciliation) retained; **no levodopa / Parkinson-timing best practice exists in any edition** — the brief's attribution was wrong. | Policy §7 correction note; checklist CSR-04.4 cites the ISMP 2011 timely-administration definition + CMS S&C-12-05 for the ±30-minute window and requires a Tier B/C Parkinson source at EP-28. |
| The Joint Commission | jointcommission.org HTML pages return HTTP 403 to unauthenticated agent fetches; the `digitalassets.jointcommission.org` PDFs do not. NPSG chapter superseded by the NPG chapter for hospitals. | PDFs cited; §6 renumbering rule. |
| AMA Manual of Style §11.12 | Login-gated (Oxford Academic). | Cited bibliographically (I-15); no archived copy held; AMWA public summary noted as Tier D colour. |
| AHRQ MATCH | ahrq.gov returned HTTP 403 to agent fetch this session. | Planning access date retained; **re-verify by hand at EP-13**. |
| WHO High 5s SOP | Not re-fetched this session. | Planning access date retained; **re-verify at EP-7**. |

## Owner decisions (presented interactively 2026-09-02; outcomes recorded)

1. **Approval of the four instruments** (brief checkpoint). Options: approve as written
   (recommended); approve with listed edits; hold. **Owner ruling: approve as written.** The
   instruments are the owner's gate instruments at v1.0 from this commit.
2. **README pointer sentence** (outward text). Options: add the sentence (recommended); leave
   unchanged. **Owner ruling: add.** The sentence is claim-free (describes files that exist)
   and rests on existing rows C3/C5; no new CLAIMS.md row is needed.
3. **Badge label.** Options: "physician-reviewed (single reviewer)" (recommended); render both
   phrases; "single-clinician review" only. **Owner ruling: "physician-reviewed (single
   reviewer)".** Recorded in REVIEW-RECORD-TEMPLATE.md §2 as the fixed `label`. D-RISK-003's
   "single-clinician review" is read as describing the review model, not the literal string;
   RELEASE-CRITERIA gate G2 and CLAIMS row C3 still quote the literal and should be aligned to
   the canonical phrase at EP-19's per-tag check (note below).
4. **Commit and push.** Options: commit and push, two commits (recommended); commit locally
   only; hold. **Owner ruling: commit and push**, two commits in the EP-0…EP-5 pattern, no AI
   co-author trailer.

## Decisions logged (reversible technical, D-EXEC-003)

- **Location `docs/clinical/`** (the brief's default) with an index README; EP-7's
  `TAXONOMY.md` is pre-announced there.
- **CLAIMS.md rows C3 and C5 left as they stand.** Their evidence cells still say the checklist
  and citation spec "arrive with EP-6"; RELEASE-CRITERIA's per-tag procedure flips Deferred rows
  at the tag, and CLAIMS.md rows are owner-only, so no edit was made. EP-19 flips them.
- **Source-key convention** (`TJC-NPG-HAP-2026`, `ISMP-HIGH-ALERT-ACUTE-2024`, …) as the
  `source` field's vocabulary, mirrored one-to-one in the registry. Reversible by renaming.
- **Citation `id` convention** `cit-<slug>-<year>`; withdrawn records keep their id.
- **INV-CIT-001 check list (a–e)** written into the policy as the target for EP-9/EP-20; the
  numeric-token check is shared with INV-ACT-001's harm-language lint.
- **Four dispositions** (`approved`, `approved-with-changes`, `returned`, `frozen-items`) and
  the rule that `returned` records are still committed.
- **Amber staleness default** (badge past `staleAfter` = review date + 12 months) adopted from
  the governance appendix's recommendation; EP-19 implements.
- **Banned-terms set enumerated** beyond the brief's four (clean/dirty, non-compliant, denies)
  to include the NIDA and APA "avoid" lists relevant to the roster, so SS-02.2 can be a grep.
- **Checklist check ids** (`CSR-nn.m`, `SS-nn.m`) so review records can cite findings
  precisely and EP-35 can tabulate SS-06.1.
- **Pointer rows for planning-verified-only sources** (AHRQ MATCH, WHO High 5s) carry the
  planning access date and a named re-verify EP rather than being omitted.

## Risks / notes for the next session

- **EP-7** cites NPG.14.05.01 EP 3's discrepancy list directly for the Type axis and re-verifies
  the WHO High 5s SOP (pointer row says so). It should reuse the source keys here.
- **EP-9** encodes the ten-key citation record and the review-record YAML verbatim; the
  optional `access` field (public / login-gated / archived-only) suggested by §5 is EP-9's call.
- **EP-13** re-verifies AHRQ MATCH by hand (agent fetch blocked) and applies CSR-04/05 to the
  first formulary wave against the 2024 ISMP lists.
- **EP-19** must (a) render the badge label as ruled, (b) implement the amber rule, and (c)
  align the literal "single-clinician review" in RELEASE-CRITERIA G2 and CLAIMS C3 with the
  canonical phrase when it flips C3/C5.
- **EP-28 (C07)** needs a Tier B/C source for levodopa's time-critical status; the ISMP best
  practices do not supply one. The brief text and the planning appendix still carry the old
  attribution; they are historical and were not edited.
- **R-6 watch:** if ECRI gates the ISMP downloads, apply policy §5 and add a §8 log line.

## Next eligible EPs

**EP-7** (Discrepancy taxonomy v1 — depends on EP-6, now satisfied) and **EP-8** (toolchain)
are eligible. EP-13 additionally needs EP-9 and EP-7.
