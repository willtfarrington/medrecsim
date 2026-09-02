# EP-7 handoff — Discrepancy taxonomy v1

**Status:** complete — all owner decisions ruled 2026-09-02 (see "Owner decisions") ·
**Date:** 2026-09-02 · **Brief:** roadmap/EP-7-taxonomy.md · **Commits:** `COMMIT1`
(taxonomy, policy and registry rows, index, changelog, handoff), plus the done-hash follow-up

## Completed scope IDs

All eight in-scope items.

1. **Taxonomy doc** at `docs/clinical/TAXONOMY.md` (the path pre-announced by the EP-6 index;
   instrument version 1.0, dated 2026-09-02). Logged in `docs/clinical/README.md`.
2. **TYPE axis (13)** — §1: the brief's thirteen tokens in the brief's order and spelling, each
   with definition, boundary ("counts when / does not count when"), and citations.
   `wrong-route` retained (decision and rationale in §7.6 and below). Prescribed-vs-actual and
   stale import documented as mechanism families, not types (§0, §6).
3. **MECHANISM axis (14, four strata)** — §2: system/record (6), undocumented intentional (2),
   patient/agent-side systems-framed (5), epistemic (1); marked a design construct grounded in
   MARQUIS/MATCH and the WHO High 5s intent split, with the adaptation stated.
4. **DETECTABILITY axis (7)** — §3, with the INV-DISC-001/002/003 rules restated.
5. **Ordinals** — §4 urgency U1–U4 (U4 anchored to the ISMP/CMS time-critical class
   definition); §5 severity S0–S4 anchored to NCC MERP 2022 read as *potential* worst-credible
   outcome (adaptation stated in §5.1 and §7.8; MERP A–B excluded by construction);
   reversibility (3; MERP temporary/permanent split); time-to-harm (4; levels 1–2 anchored to
   the ISMP scheduled-medication windows, levels 3–4 to Tier A exemplars). §5.4 states
   urgency ≠ time-to-harm with three worked contrasts.
6. **Phenotype mapping** — §6: ten D-TAX-002 clauses → predicates P1–P10 (P4 and P6 split into
   a/b sub-rows), each evaluable from case metadata plus a formulary class lookup, so EP-20
   can derive the matrix mechanically.
7. **Divergence notes** — §7.1–7.9: restart-gap promotion; allergy inclusion; MedTax crosswalk
   (all thirteen types plus the two MedTax types not adopted); 2016 review; mechanism strata
   vs the intent split; detectability as construct; wrong-route; TJC cite-both; MERP; levodopa.
8. **Citations** — every value row carries ≥1 citation id; §9 register holds 30 ten-key records
   with version and access date; 20 new source keys added to CITATION-POLICY.md §7 and the
   registry in the same change.

## Changed files

- `docs/clinical/TAXONOMY.md` — new.
- `docs/clinical/CITATION-POLICY.md` — §7: `WHO-HIGH5S-SOP-2014` row refreshed (URL, access
  date, re-verify discharged); 20 pointer rows added; §8: one drift bullet and one log row.
  Tiers and the rule untouched.
- `source material/REGISTRY.md` — WHO row refreshed; 20 pointer-only rows added; closing
  paragraph updated.
- `docs/clinical/README.md` — TAXONOMY.md row added; "later additions" sentence removed;
  intro names EP-7 and appendix §1.
- `CHANGELOG.md` — one `[Unreleased] › Added` bullet.
- `docs/handoffs/EP-7.md` — this record. `roadmap/README.md` — EP-7 Done column (follow-up
  commit, EP-0…EP-6 pattern).

## Verification results (2026-09-02)

Scripted checker (`verify.py`, scratchpad; not committed) plus the repo hooks:

- **Doc exists; all five axes present; each a closed enumerated set with citations:** five axis
  headings found; enum export parsed — 13 / 14 / 7 / 4 / 5 / 3 / 4 tokens; every exported token
  has a definition row in §1–§5 (50 value rows) and every row carries ≥1 `[cit-…]`. ✔
- **Exact spellings match the brief:** type, mechanism, detectability, and time-to-harm token
  lists compared list-vs-list against the brief; all identical; all 50 tokens unique. ✔
- **Phenotype table covers every D-TAX-002 row (list-vs-list):** the ledger entry parsed to
  10 clauses; §6 has P1–P10 with P4/P6 split into a/b (12 rows, 10 clauses). ✔
- **Ordinals define every level with an anchor source:** U1–U4, S0–S4, three reversibility
  levels, four time-to-harm levels each carry an anchor column and citations. ✔
- **NCC MERP adaptation stated:** §5.1 and §7.8; the register record carries the policy's
  `adapted —` note. ✔
- **No probabilities anywhere:** narrative §0–§8 lint for `%`, "probab", "likel", "chance",
  "odds", "risk of" → 0 hits (rule statements and URLs excluded). The only numeric tokens in
  §1–§5 are the ISMP 30-minute / 1-hour / 2-hour windows, each on a row that cites the ISMP
  guideline. In §9 one register note quotes the clozapine label's "approximately 25% of the
  previous dosage" — a dose fraction from the cited label, stated as such, not a probability. ✔
- **Divergence notes present for every departure:** §7.1–§7.9. ✔
- **Citation register well-formed:** 30 records, ten keys each, ISO `accessed`, non-empty
  `version-or-date`, tier A/B/C only; every cited id resolves; no uncited record; every
  `source` key exists in policy §7 and the registry, and the two key sets are identical (36). ✔
- **Copy rule:** the RELEASE-CRITERIA per-tag `git grep` over outward copy → no output. ✔
- **Links:** every relative link in the five changed files resolves (0 broken). ✔
- **Encoding / EOL:** `git ls-files --eol` → `i/lf w/lf` for all five staged files; no BOM. ✔
- **Pre-commit hook dry run** on the staged set: gitleaks "no leaks found"; tripwire layer 2
  passed (exit 0). ✔
- **Leak screen:** staged diff grepped for local paths, usernames, and e-mail → 0 hits. The
  new files name only public URLs, DOIs, PMIDs, decision IDs, and repository paths; nothing
  from `.local/` was read or quoted. ✔

## The `wrong-route` decision (required by the brief)

**Recommendation: keep** (TAXONOMY.md §7.6). The Joint Commission names route among the
medication-information elements and MedTax carries a dosage-form/route type; the coverage
matrix tracks phenotypes, so an unused enum value costs nothing at v1, whereas adding a value
after the EP-9 freeze is a codemod migration (D-DATA-002). No v1 case is required to use it;
EP-35 reports it as "retained, unused" if that holds. **Owner ruling (2026-09-02): keep.**

## Exact enum spellings EP-9 must import (required by the brief)

TAXONOMY.md §8 is the source of truth. Verbatim:

- **type:** `omission` `commission` `wrong-dose` `wrong-frequency-schedule` `wrong-route`
  `wrong-formulation` `wrong-strength-concentration` `therapeutic-duplication`
  `brand-generic-duplication` `wrong-drug-lasa` `restart-gap` `status-discrepancy`
  `allergy-record-discrepancy`
- **mechanism:** `stale-record-propagation` `transcription-error` `lasa-confusion`
  `transition-communication-gap` `data-fragmentation` `auto-population-default-error` ·
  `prescriber-change-undocumented` `hold-not-documented` · `cost-access-barrier`
  `supply-interruption` `regimen-complexity-misunderstanding` `informed-self-adjustment`
  `language-access-barrier` · `informant-knowledge-limit`
- **detectability:** `single-source-explicit` `cross-source-conflict` `interview-elicited`
  `artifact-dependent` `escalation-dependent` `longitudinal-inference` `irreducible`
- **urgency:** `U1` `U2` `U3` `U4` · **severity:** `S0` `S1` `S2` `S3` `S4` ·
  **reversibility:** `self-limiting` `reversible-with-treatment` `irreversible` ·
  **timeToHarm:** `immediate` `hours-to-a-day` `days` `weeks-plus`

Stratum names in the §8 map (`system-record`, `undocumented-intentional`,
`patient-agent-side`, `epistemic`) are documentation groupings; EP-9 may flatten the mechanism
enum. Field names suggested in §8 are not frozen.

## Source-access failures and how cited (risk R-6, required by the brief)

Full table in TAXONOMY.md §10. Summary:

| Source | Outcome | How cited |
|---|---|---|
| WHO High 5s SOP v3 | **Re-verified** from the full PDF (36 pp.) at the cdn.who.int URL; the EP-6 "re-verify at EP-7" is discharged; the SOP contains no allergy content. | Full record; registry and policy rows refreshed. |
| AHRQ MATCH toolkit | ahrq.gov HTTP 403 to agent fetch (as at EP-6). | Not cited directly; the MATCH study report (Gleason 2010, Tier C) carries the construct; EP-13 re-verifies by hand as planned. |
| AHRQ LEP guide | PSNet catalogue entry verified; guide body on ahrq.gov not opened. | Cited at catalogue level; hand re-verify at EP-26. |
| NIH ARV interruption section | Plain fetch HTTP 403; PDF path served an HTML block page; browser-user-agent fetch HTTP 200 with the wording quoted. | Cited with a note; hand re-verify at EP-30. |
| DailyMed clozapine label | Search UI empty to agent fetch; REST API resolved the set id and the label page opened. | Cited by set id (Mylan, revised 4/2026); SP-1 at EP-32 remains authoritative for C11. |
| MedTax full text; AAAAI/ACAAI 2022 full text | Subscription; PubMed records verified. | Record-level citations with re-verify notes; MedTax type names verified through the open-access application paper (Imfeld-Isenegger 2020). |
| ASHP medication-reconciliation statement | ashp.org served an HTML shell instead of the PDF (both URL forms). | Not cited. |
| eCFR 45 CFR 92.201 | Redirected to a bot-block page. | Not cited; the AHRQ LEP guide anchors the language-access mechanism. |
| ECRI-hosted ISMP lists | Still public on 2026-09-02. | Unchanged. |

Drift observed: healthit.gov/isp → isp.healthit.gov (HTTP 301); logged in policy §8.

## Owner decisions (presented interactively 2026-09-02; outcomes recorded)

1. **Approval of the value-sets and ordinal anchors** (brief checkpoint; D-EXEC-003). Options:
   approve as written (recommended); approve with listed edits; hold. **Owner ruling: approve
   as written.** Recorded in TAXONOMY.md §11 (all five axes, dated); the §8 tokens are
   spelling-frozen from this ruling and EP-9 imports them verbatim.
2. **`wrong-route` keep/drop.** Options: keep (recommended); drop. **Owner ruling: keep.**
   Recorded in TAXONOMY.md §7.6 and §11.
3. **Commit and push.** Options: commit and push, two commits in the EP-0…EP-6 pattern
   (recommended); commit locally only; hold. **Owner ruling: commit and push**, two commits,
   no AI co-author trailer.

## Decisions logged (reversible technical, D-EXEC-003)

- **Ordinal token spellings** `U1`–`U4`, `S0`–`S4` (capital letter + digit) rather than
  worded tokens; labels carry the words. Reversible until the EP-9 freeze.
- **Reversibility tokens** `self-limiting` / `reversible-with-treatment` / `irreversible`
  (the brief specified "3-level" without names); anchored to the MERP temporary/permanent
  split.
- **Severity mapping** S0 = MERP C–D, S1 = E, S2 = F, S3 = G–H, S4 = I; MERP A–B excluded by
  construction (a recorded discrepancy has reached the record).
- **Time-to-harm anchors** for `days` and `weeks-plus` use Tier A exemplars from the roster's
  own drug classes (clozapine label; NIH ARV guideline) rather than leaving the levels
  unanchored; the per-case scored rules still cite at case authoring (policy §4).
- **One primary mechanism per discrepancy**, optional secondaries left to EP-9's shape
  decision (stated in §0).
- **MedTax "therapeutic class substitution" and "other" not adopted** (§7.3) — closed value-set
  by design; substitution decomposes into commission + omission.
- **Phenotype P3 kept as one row** matching the ledger's wording, with a note that the tool
  should also report per-value counts; P9 tests the formulary class through the formulary id.
- **Citation id convention** continued (`cit-<slug>-<year>`); Tier C records cite DOIs as
  `url` (bibliographic landing per policy §1).
- **New Tier A sources placed under the existing tier definition** (federal bodies: ONC/ASTP,
  FDA, CDC/NCHS, NIH Clinicalinfo, DailyMed, AHRQ PSNet) without editing the policy's
  named-examples column, which is owner-only. The owner may add them to the examples column at
  any re-review.
- **Registry licence cells** for open-access papers record the licence as published (CC BY);
  nothing is redistributed.

## Risks / notes for the next session

- **EP-9** imports §8 verbatim after the owner's ruling; decides primary/secondary mechanism
  shape, field names, and whether to lint severity/reversibility consistency (§5.3).
- **Traceability appendix row for D-MED-001** says EP-7 refines the claim-status vocabulary
  "vs AHRQ/ISMP"; the EP-7 brief does not include it and D-MED-001 itself delegates refinement
  to the schema epic. Not done here (scope frozen, D-RISK-002); EP-9 should treat it as its
  own item. The appendix was not edited.
- **EP-13** re-verifies AHRQ MATCH by hand (unchanged from EP-6).
- **EP-20** implements the §6 predicates; P9 needs a formulary class lookup and the
  `highAlert` flag; P5 pairs with INV-REF-002.
- **EP-26 / EP-30 / EP-31 / EP-32** carry hand re-verify notes for the AHRQ LEP guide, the NIH
  ARV section, the AAAAI/ACAAI parameter, and the clozapine label (SP-1).
- **R-6 watch:** ahrq.gov and clinicalinfo.hiv.gov block plain agent fetches; PSNet and a
  browser user agent work today. If either closes, apply policy §5 and log in §8.
- The `%` in one §9 register note (clozapine label quotation) will trip a naive "no `%`
  anywhere" grep; INV-ACT-001's lint applies to teaching text, not to citation notes, and the
  handoff records the exception.

## Next eligible EPs

**EP-8** (toolchain bootstrap) is eligible now. **EP-9** becomes eligible once EP-8 is done
(its EP-7 dependency is satisfied by this packet's recorded approval). EP-13 additionally
needs EP-9.
