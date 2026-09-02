# Claim–evidence matrix (D-QA-002)

**Status:** live — checked at every tag, with the result recorded in the release notes and the
handoff of the releasing EP · **Instantiated:** 2026-09-02 (EP-5) from the approved seed in
[roadmap/appendices/governance-security.md](../roadmap/appendices/governance-security.md) §6 ·
**Owner of the rows:** the project owner alone (D-EXEC-003) · **Next check:** the `v0.1.0` tag
(EP-19), then every tag, then the v1.0 audit (EP-38).

This file maps every outward claim the project makes to the evidence behind it, or to the
softening that keeps the claim honest while the evidence does not yet exist. It is the
enforcement surface for the charter's non-goals and for D-PROD-006's "honest simulation"
framing. Two rules follow from D-QA-002:

1. **No claim without a row.** A pull request or session that adds a new outward claim (in
   the README, the application, a pre-brief, a release note, a repository description, or any
   other public text) adds a row here in the same change. New outward claims are owner-only;
   the pull-request template asks contributors to attest that they added none.
2. **No row without evidence or softening.** Each row's evidence cell names an artifact that
   exists in the repository, or names the exact EP that will supply it and the wording the
   project is limited to until then.

"Outward copy" means: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`,
`CODE_OF_CONDUCT.md`, `THIRD-PARTY.md`, `CITATION.cff`, `CHANGELOG.md`, `LICENSE-CONTENT.md`,
the repository description, `.github/` templates, everything under `docs/` except the
`docs/handoffs/` records, everything that ships inside the application (banner, pre-briefs,
debrief text, about page), `source material/`, and any future `content/` and `packages/`
tree. Release notes are outward copy. The decision ledger, the charter, the roadmap briefs,
and the handoff records are historical or instruction text and are exempt from the copy rules
but not from the synthetic-only rule.

## The matrix

Status vocabulary: **Evidenced** (artifact exists and was checked on the date shown) ·
**Softened** (the claim is worded so that it is true today without further evidence) ·
**Deferred → EP-N** (the artifact does not exist yet; the named EP supplies it; the wording
column states the limit until then). A row may carry more than one status when the claim has
several parts.

| # | Claim (as the project may state it) | Evidence or softening | Status (2026-09-02) |
|---|---|---|---|
| **C1** | **Original and fictional.** Fictional institutions, people, and records; an original visual identity; no third-party trade dress; the project name screened for collisions. | *Name:* [NAME-SCREEN.md](NAME-SCREEN.md) — six venues screened (Run 1 2026-08-23, Run 2 2026-09-02), overall L2 adjudicated **keep the name** by the owner; the official USPTO manual session is owner-scheduled before the `v0.1.0` tag (Run 3). *Visual identity and trade dress:* the trade-dress originality checklist and its dated records (EP-10). *In-sim names:* the fictional-name screening rule in NAME-SCREEN.md (last section), executed per registry name at EP-10 and per case at each case EP. | Evidenced (name) · Deferred → EP-10 (identity + originality records), case EPs (per-case name screens). Until then the README may say "original visual identity" only as a design commitment under C11. |
| **C2** | **Synthetic-only content — a hard guarantee, never softened.** Every patient, clinician, institution, record, and anecdote is synthetic and fictional; no real patient information, employer or institutional material, or restricted dataset (MIMIC or otherwise) is used anywhere in the repository, its tooling, its CI, or any agent context. | Layered, all landed: (a) pre-commit gitleaks + tripwire grep for `.local/` paths, MRN/SSN/DOB-like patterns, and restricted-dataset markers ([githooks/](../githooks/README.md), EP-0); (b) server-side secret scanning + push protection ([SECURITY-BASELINE.md](SECURITY-BASELINE.md) rows A1–A2, EP-1); (c) the three contributor attestations in [CONTRIBUTING.md](../CONTRIBUTING.md) and the PR template, plus a required no-PHI checkbox on every issue form (EP-2); (d) [THREAT-MODEL.md](THREAT-MODEL.md) asset A5, boundaries B5/B6, and §6 "No PHI, ever" (EP-4); (e) [MIMIC-GATE.md](MIMIC-GATE.md) §5 hard rules — the gate is closed and authorizes nothing (EP-4); (f) [INCIDENT-PROCEDURE.md](INCIDENT-PROCEDURE.md) severity class S2 — a stop-everything response with a public record and a README notice if this guarantee is ever breached (EP-4); (g) the data/asset registry in [source material/REGISTRY.md](../source%20material/REGISTRY.md) and the `.local/` convention for anything unvetted (D-DATA-006). | **Evidenced.** This row is never softened; if it cannot be evidenced the project stops (INCIDENT-PROCEDURE S2). |
| **C3** | **"Physician-reviewed (single reviewer)"** — the only permitted description of clinical review. Never "expert-reviewed", "peer-reviewed", "validated", or "pharmacist-reviewed" (the last of these until an independent pharmacist review has actually occurred, D-CLIN-001). | *Wording discipline:* the copy rule is stated in CONTRIBUTING.md, the PR template, and here; checked by the grep in [RELEASE-CRITERIA.md](RELEASE-CRITERIA.md) at every tag. *Substance:* one public, versioned, dated review record committed beside each case (D-GOV-001), rendered as an in-app badge with the review-record version, date, and the words "single-clinician review" in every pre-brief (D-RISK-003). The structured self-review checklist arrives with EP-6; the first review record with the exemplar case at EP-14; one per case thereafter. | Evidenced (wording; no clinical content exists yet, so the statement is currently vacuously true) · Deferred → EP-6 (checklist), EP-14 and each case EP (review records), EP-19 (badge). The single-reviewer limitation is disclosed in the standing disclaimer and stays disclosed until an independent dual review has happened and is recorded. |
| **C4** | **"Designed to teach" — never "proven to teach".** The simulation is built to teach and formatively assess BPMH and discrepancy-resolution skills; it is not validated for learning outcomes, does not certify competence, and makes no safety-improvement claim. | Standing disclaimer sentences 3 and 4 below; README "What this is not" ("It is designed to teach; it is not proven to teach"); D-PROD-006 framing (explicit "not yet validated" wording); learner pilots are a v1.x gate with their own consent/IRB analysis and have not occurred. Any future validation claim needs a new row, a cited study, and an owner decision. | **Softened** — the softening is the evidence; nothing further is required at v1.0. |
| **C5** | **Every clinical rule cites an authoritative source** with version and access date; any number that appears in teaching text comes from a cited note (D-GOV-002, D-SCOR-003). | Citation format and approved-source tiers: EP-6. Validator invariant INV-CIT-001 (D-DATA-003): lands at EP-9 at **warn level**, becomes strict with the full invariant suite at EP-20. Debrief teaching notes always render their citations (D-RISK-003, EP-24). Until then the claim describes the authoring rule the project binds itself to, not a checked property of shipped content — and no clinical content is shipped. | Deferred → EP-6 (spec), EP-9 (warn-level check), EP-20 (strict), EP-24 (rendered citations). Permitted wording until EP-20: "every clinical rule is required to cite …" or the README's present-tense principle under C11. |
| **C6** | **Accessibility.** WCAG 2.2 AA is a v1 release gate; the application is *designed to meet* WCAG 2.2 AA. **Conformance is claimed only after the EP-36 gate passes** (D-UX-004). | Before EP-36: wording limited to "designed to meet WCAG 2.2 AA", "WCAG 2.2 AA is a release gate", or a list of what the gate requires (keyboard-only operation, screen-reader pass, 200 % zoom/reflow, non-color-only information, reduced motion). After EP-36: axe-core results in CI, the manual keyboard-only and NVDA pass logs, the 200 % zoom pass, and a published exceptions document with zero open A/AA items, plus a conformance statement. | **Softened** now · Deferred → EP-36 (audit artifacts) · claimable at EP-38. The README's "Accessible by design" principle is gate wording, not a conformance claim. |
| **C7** | **Offline; no telemetry.** Client-only static application: no accounts, no backend, no telemetry, no runtime network calls after page load from the Pages origin, no language model at runtime; nothing leaves the learner's machine (D-ARCH-001, D-ARCH-005, D-AI-001). | *Decided and documented:* D-ARCH-001 (costly to reverse); [THREAT-MODEL.md](THREAT-MODEL.md) boundary B7 and asset A6, §6 non-threats; [DEPENDENCY-POLICY.md](DEPENDENCY-POLICY.md) §3 rule that no runtime dependency may perform network I/O; [SECURITY.md](../SECURITY.md) lists the no-network guarantee as in scope for vulnerability reports. *Enforcement:* a Content-Security-Policy delivered with the Pages bundle permitting only same-origin resources, and a CI invariant test that fails the build if any code path can issue a non-origin fetch, XHR, WebSocket, beacon, or form submission — both land with the toolchain and app shell. | Evidenced (architecture decision + threat-model control) · Deferred → EP-8 (CSP + CI no-network test), EP-15 (app-shell verification), first verified at the `v0.1.0` tag (EP-19). Until then the README may state the architecture as a design commitment; "verified" wording waits for EP-19. |
| **C8** | **License terms.** Code is MIT; content (case bundles, formulary, teaching notes, educational documentation) is CC BY 4.0; repository-level SPDX expression `MIT AND CC-BY-4.0`; names, fictional institutions, and visual identity are not licensed; third-party material is listed with its license (D-OSS-001). | [LICENSE](../LICENSE) (verbatim MIT) · [LICENSE-CONTENT.md](../LICENSE-CONTENT.md) (CC BY 4.0 notice, directory map, attribution string, trademarks-not-licensed note) · [THIRD-PARTY.md](../THIRD-PARTY.md) (regenerated per release once the toolchain's notice script exists; hand-maintained stub until then) · [source material/REGISTRY.md](../source%20material/REGISTRY.md) · GitHub license detection reports `MIT` (EP-0 handoff). SPDX headers in content files and the CI SPDX check arrive with EP-8/EP-9. | Evidenced · Deferred → EP-8/EP-9 (SPDX headers + CI validation; the `packages/**` and `content/**` paths named in the directory map). |
| **C9** | **Case counts.** Stated only as live numbers — "N cases published, M with a public review record" — until v1.0; the roster target (11 cases: 2 introductory / 6 core / 3 advanced, OQ-2) is stated as a target, never as an achievement. | The count of case bundles in the repository and the count of committed review records, both checkable by listing `content/`; the coverage matrix output (EP-20, EP-35) is the evidence that the roster is complete. Today the README states **no** count and the roadmap section describes R1 as "one complete introductory case" — a plan, not a claim. | Softened (no count stated) · Deferred → EP-19 (first live count: 1 published, 1 reviewed), EP-35 (roster closure). Every tag re-states the live numbers. |
| **C10** | **Deterministic engine; five transparent subscores, no composite number.** Cases are fully authored and replayable; scoring compares only against accepted-alternative sets, never a hidden single answer where uncertainty is irreducible; reference answers and scoring rules are public by design; unsafe actions are never blocked in-sim (D-CASE-001, D-SCOR-001/002, D-MED-005, D-GOV-003). | Golden-case regression snapshots (full runs including scoring and debrief data) and determinism property tests against the headless engine (D-QA-001; EP-12); the public reference layer in every case bundle (D-GOV-003; EP-9/EP-14); snapshot updates guarded by the PR-template flag and owner review (OQ-8). | Deferred → EP-11/EP-12 (engine + golden harness), EP-14 (first public reference layer). Until then the README's scoring and engine sentences are design commitments under C11. |
| **C11** | **Status line: "pre-release; under active construction; nothing here is validated"** (D-RISK-001), shown as the README's first blockquote until v1.0. | Self-evidencing: the line is its own evidence, and it is the softening that covers every present-tense description of designed-but-not-yet-built behavior in the README (the seven evidence sources, the debrief, the workspace, the clock, the scoring — each individually tracked by C1, C5, C6, C7, C10 above). It is removed only by the v1.0 audit (EP-38), at which point every sentence it was covering must be evidenced by the working application (RELEASE-CRITERIA gate 9). | **Evidenced** (present in README) · Removal → EP-38. A maintenance-status line (D-RISK-005) may be added beside it if the owner steps away; that line is likewise self-evidencing. |

## Standing disclaimers (canonical block)

This is the canonical copy. `README.md` ("Limitations and disclaimers"), the persistent in-app
banner, and every case pre-brief reproduce it **verbatim** — same words, same punctuation —
and the release check diffs them against this block. Any change to the block is an owner
decision recorded in DECISIONS.md and propagated to every consumer in the same commit.

> Educational use only. All patients, clinicians, institutions, and records are synthetic and
> fictional; no real data of any kind. Not validated for learning outcomes; not a certification
> of competence; no claim of safety improvement. Clinical content is physician-reviewed
> (single reviewer). Personal project with no institutional, employer, or vendor affiliation;
> not "HIPAA compliant" because no real health information is processed. Drug information may
> become outdated — each case shows its review date; verify against current sources before any
> clinical use.

What each sentence rests on:

| Sentence | Rests on |
|---|---|
| 1. "Educational use only." | Charter non-goals (not medical advice, not clinical decision support, not patient-facing); C4. |
| 2. "All patients, clinicians, institutions, and records are synthetic and fictional; no real data of any kind." | C2 (hard guarantee); C1. |
| 3. "Not validated for learning outcomes; not a certification of competence; no claim of safety improvement." | C4; D-PROD-006; learner pilots are a v1.x gate that has not run. |
| 4. "Clinical content is physician-reviewed (single reviewer)." | C3; D-CLIN-001 documented-equivalent review path with the single-reviewer limitation disclosed. |
| 5. "Personal project with no institutional, employer, or vendor affiliation; not "HIPAA compliant" because no real health information is processed." | A statement of fact by the owner (self-evidencing, like C11); [THREAT-MODEL.md](THREAT-MODEL.md) §6 non-threats ("No PHI, ever"); C2. |
| 6. "Drug information may become outdated — each case shows its review date; verify against current sources before any clinical use." | C3 (dated review records, in-app badge, D-RISK-003); the annual re-review (D-GOV-001); the amber staleness rule for badges older than twelve months (D-RISK-005). |

Consumers today: `README.md` only. The banner and pre-briefs arrive with EP-15 and EP-19 and
must consume this block unmodified from the start.

## Checking the matrix at a tag

The procedure and the exact commands live in [RELEASE-CRITERIA.md](RELEASE-CRITERIA.md)
("Per-tag checklist"). In short: every row is re-read; each *Deferred* row whose EP has
landed is flipped to *Evidenced* with the artifact named and dated; the copy-rule grep is
clean; the disclaimer block diffs identical across all consumers; the README sweep finds no
sentence without a row or a claim-free verdict; and the result ("claims: clean at `vX.Y.Z`,
date") is written into the release notes and the releasing EP's handoff.

## Adding a row

Owner-only (D-EXEC-003). Append `C12`, `C13`, … — never renumber — with the claim worded
exactly as the project intends to state it, the evidence or softening, and the status. Add
the row and the outward text in the same commit. If the evidence does not exist yet, the
status names the EP that will supply it and the wording the project is limited to until then.
Rows are never deleted; a withdrawn claim keeps its row with status **Withdrawn** and the date,
so that the history of what the project has and has not claimed stays public.

## Related documents

[RELEASE-CRITERIA.md](RELEASE-CRITERIA.md) · [THREAT-MODEL.md](THREAT-MODEL.md) ·
[NAME-SCREEN.md](NAME-SCREEN.md) · [SECURITY-BASELINE.md](SECURITY-BASELINE.md) ·
[INCIDENT-PROCEDURE.md](INCIDENT-PROCEDURE.md) · [../CHANGELOG.md](../CHANGELOG.md) ·
[../DECISIONS.md](../DECISIONS.md) (D-QA-002, D-PROD-006, D-CLIN-001, D-RISK-001, D-EXEC-003).
