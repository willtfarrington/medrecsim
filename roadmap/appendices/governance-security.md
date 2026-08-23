# Governance & security — policy pack, threat model, claims, release gates

This appendix is the canonical integrated governance/security/OSS/portfolio specification for
medrecsim v1, implemented by EP-0 (baseline floor), EP-1 (GitHub security settings), EP-2
(community & governance pack), EP-3 (name & identity screening), EP-4 (threat model, procedures
& MIMIC gate), EP-5 (claims matrix, release criteria, changelog), and executed at EP-38 (v1.0
release audit). Decisions cited as `D-*` resolve in [../../DECISIONS.md](../../DECISIONS.md);
integrator resolutions are cited as `I-n`; items ruled on at roadmap approval carry their `OQ-n` reference from
[open-questions.md](open-questions.md). Integrated 2026-08-23 from specialist planning; citations
carry access dates; time-sensitive facts reverify at execution.

## 1. Policy-pack file inventory (R0: EP-0, EP-2, EP-4, EP-5)

### README (full rewrite at EP-2; minimal status-line/tagline fix at EP-0, D-OSS-003)

Structure: title + one-sentence thesis (**no version number in the tagline** — fixes the
premature "v1.0.0"); status-line blockquote verbatim per D-RISK-001 ("pre-release; under active
construction; nothing here is validated"); what-this-is / what-this-is-not; screenshot
placeholder (**never a fake screenshot**); quickstart placeholder; design principles;
limitations block linking to `docs/CLAIMS.md`; non-affiliation statement; license-split
explanation; contributing/security/support links; roadmap link (with "no dates by design" note,
D-RISK-006); CITATION pointer; a reserved maintenance-status slot (D-RISK-005).

### Licensing (EP-0; D-OSS-001)

- `LICENSE` = verbatim MIT at repo root (keeps GitHub's "MIT" license badge detection).
- `LICENSE-CONTENT.md` = prose notice: CC BY 4.0 for content, the attribution string, legalcode
  link, a directory map (`packages/**` = MIT; `content/**` and teaching material under `docs/`
  = CC BY 4.0), and a trademarks-not-licensed note.
- Repo-level SPDX expression: `MIT AND CC-BY-4.0`. `package.json` `license: MIT` per code
  package; SPDX headers in content YAML files (CI-checkable); per-file headers **skipped** in
  TS source. Verify the license badge renders after first push (cosmetic risk noted).

### CONTRIBUTING (EP-2; D-OSS-002)

Narrow intake scope: bugs, typos, accessibility, tooling — **no new clinical cases** (content
suggestions via issues). DCO v1.1 `Signed-off-by` required. Three attestations on every PR:
(1) no PHI, no real-patient-derived content, no restricted datasets including MIMIC;
(2) synthetic provenance + AI-assistance disclosure; (3) rights to contribute, no encumbrance,
no third-party trade dress. Owner clinical sign-off stated as a hard rule (D-EXEC-003). No-SLA
support statement. A public one-paragraph statement of the owner's AI-assisted authoring
workflow ships per the **OQ-12** ruling (wording owner-approved at EP-2).

### Other community files (EP-2)

- `CODE_OF_CONDUCT.md`: Contributor Covenant 3.0 (current, released 2025-07-28; confirmed by
  the **OQ-9** ruling).
- `SECURITY.md`: GitHub private vulnerability reporting (verified available and free; per-repo
  enable), report via the repo's security-advisories page, no public vulnerability issues;
  in-scope: XSS-via-content, supply chain, CI, secrets; out-of-scope: clinical content disputes
  → routed to the correction path (§5 procedures).
- `SUPPORT.md`: best-effort, no SLA; **Issues only, no Discussions** (**I-11**).
- Issue templates (`config.yml` with `blank_issues_enabled: false`): bug_report;
  clinical_content_concern — the D-RISK-004 on-ramp (case ID, contested item, cited challenge
  source, severity; states the freeze procedure); accessibility_issue; feature_request (states
  the D-RISK-002 parking rule). PR template: DCO + the three attestations + "no new outward
  claims without a CLAIMS row" + CI-green + golden-snapshot-update flag (see
  [architecture.md](architecture.md) §6, OQ-8).
- `CITATION.cff`: cff 1.2.0, type software, version bumped per release (D-OSS-003).
- `THIRD-PARTY.md` at root, regenerated per release, plus `source material/REGISTRY.md` with
  columns: | ID | Asset | Type | Source URL | Version | Access date | License | Attribution? |
  Redistributable (yes/no/pointer-only) | Update cadence | Notes | (D-DATA-006).
  Recommendation: system font stack + original inline SVG icons keep the registry near-empty;
  reconciled with the UX workstream's OFL handwriting font — **the font gets a registry row and
  THIRD-PARTY entry** (see [ux-accessibility.md](ux-accessibility.md) §10).
- `CODEOWNERS` minimal: `*` mapped to the owner's GitHub account; a `/content/` comment noting
  owner-only clinical sign-off.
- Omit `FUNDING.yml`. Disable Wiki and Projects.

### Hygiene floor (EP-0; D-SEC-001)

- `.gitignore` fully layered, **private zone first** (`.local/` is line one, D-ROAD-002);
  secrets patterns with a `synthetic-fixtures/` allowlist path convention and `# SYNTHETIC`
  header convention; dependencies/build outputs; OS/editor files; logs.
- Pre-commit: gitleaks v8 (single native binary; note — project is feature-complete with a
  proposed successor "Betterleaks"; **reverify at execution**), committed `githooks/` +
  `core.hooksPath` (no husky), `.gitleaks.toml` allowlisting synthetic fixtures only; plus a
  second tripwire grep (staged `.local/` content, MRN/SSN/DOB regexes, mimic/physionet
  markers). Server-side push protection is the backstop.
- `.gitattributes` forcing LF (shared with the toolchain plan).

### docs/ set (EP-4, EP-5)

`THREAT-MODEL.md` · `DEPENDENCY-POLICY.md` · `INCIDENT-PROCEDURE.md` · `CLAIMS.md` ·
`MIMIC-GATE.md` · `RELEASE-CRITERIA.md` · `NAME-SCREEN.md` · `SECURITY-BASELINE.md` (living
checklist with verified-on dates for every settings-UI item).

## 2. GitHub security checklist (EP-1; D-SEC-001)

All features below were **verified free for public repositories as of 2026-08-23** (GitHub
documentation; access-dated citations in §11) — reverify at execution.

1. Secret scanning ON.
2. Push protection ON.
3. Private vulnerability reporting ON.
4. Dependabot alerts + `dependabot.yml` (npm + github-actions ecosystems, weekly, grouped,
   open-PR limit 5, **no auto-merge**) + `dependency-review-action` in PR CI.
5. CodeQL default setup enabled.
6. Ruleset on `main`: block force-push and deletion, require PR + passing status checks;
   **export the ruleset JSON into `docs/`** for auditability.
7. Workflow permissions default read-only, per-job grants only; "Actions can create/approve
   PRs" OFF.
8. Fork PRs: require approval for **all** outside collaborators; never combine
   `pull_request_target` with a checkout of untrusted code (noting actions/checkout v7 fails by
   default on unreviewed fork code — verified against the changelog entry of 2026-06-18).
9. DCO enforced via an ~10-line CI grep step (no third-party DCO app — least privilege).
10. All actions SHA-pinned; the Dependabot github-actions ecosystem keeps pins fresh.
11. Pages deploys only on push to `main`, using official `actions/deploy-pages`;
    `pages: write` + `id-token: write` scoped to the deploy job; the environment restricted to
    `main`.
12. Ignore rules + hooks committed **before anything else** (EP-0 is the first commit; nothing
    else pushed before it).
13. Wiki/Projects disabled; owner-account 2FA verified; no PATs anywhere in the tree.

## 3. Threat model (EP-4; D-SEC-002)

**Assets:** repository integrity (public review records are the trust product) · Pages
deployment integrity · owner account/tokens · project honesty/reputation · the absence-of-PHI
guarantee · learner privacy (nothing leaves the machine, D-ARCH-005).

**Actors:** the fallible owner · drive-by and malicious contributors — including **subtly wrong
clinical content**, the project's unique threat, mitigated by owner-only clinical sign-off
(D-EXEC-003) · supply-chain attackers · an account attacker · scrapers (accepted; the repo is
public by design, D-RISK-001).

**Trust boundaries:**

| # | Boundary | Control |
|---|----------|---------|
| B1 | Issues/PR text → maintainer | Untrusted text; never executed or auto-merged |
| B2 | Fork → CI | No secrets in CI; approval-gated workflow runs |
| B3 | `main` → Pages | The only privilege path; deploy gated on CI, scoped tokens |
| B4 | Dependencies → build | Lockfile; `ignore-scripts=true` in `.npmrc`; no unreviewed postinstall scripts |
| B5 | Owner machine → repo | Pre-commit hooks + server-side push protection |
| B6 | `.local/` → repo | Gitignore line 1 + tripwire grep + never quoted into public files |
| B7 | App → network | **None at runtime** (D-ARCH-001): CSP on Pages + a CI invariant test asserting no non-origin fetch |

**Non-threats (documented as such):** no server, no accounts, no PHI, no secrets in the product,
no payments. **Revisit trigger:** any v1.x feature that accepts input or hosts state
(D-SEC-002).

## 4. Dependency policy (EP-4; D-SEC-002)

Minimal-dependencies presumption with written justification per runtime dependency; the runtime
allowlist is fixed at EP-8 and additions are owner-only (D-EXEC-003). `npm ci`/frozen lockfile
everywhere. Grouped weekly Dependabot review — reviewed, never auto-merged. New-dependency
checklist: license, maintenance health, install scripts, size vs the bundle budget
(D-ARCH-007), registry row. Annual dependency audit aligned with the annual content re-review
(D-GOV-001, D-RISK-005).

## 5. Incident procedures (EP-4; D-SEC-002, D-RISK-004)

The runbooks are **pre-authorized** in `INCIDENT-PROCEDURE.md`; the owner personally executes
them (**I-12**).

### Sensitive-commit runbook

1. Triage: what leaked, where, for how long.
2. **Rotate any exposed credential first** — before history surgery.
3. History rewrite via git-filter-repo; temporary ruleset bypass; re-protect immediately;
   honest caveat recorded that forks/clones may retain the data.
4. Redeploy Pages from the cleaned `main`.
5. Dated **public** incident record committed.
6. Add a detection rule (gitleaks pattern / tripwire regex) so the class of leak is caught
   pre-commit next time.

### Content-error / contested-scoring path (the D-RISK-004 freeze)

1. Intake via the clinical_content_concern issue template.
2. Credibility triage against documented criteria (guards against bad-faith freeze
   weaponization).
3. If credible: content patch marks the item **"discussion item — not scored"**, bundle version
   bump, changelog records the dispute.
4. Re-adjudication through the full D-GOV-001 lifecycle.
5. Resolution patch; the claims matrix updated **in the same commit**.
6. If safety-relevant: a README notice stands until patched.

Vulnerabilities ride private vulnerability reporting (§1 SECURITY.md).

## 6. Claim–evidence matrix seed (EP-5; D-QA-002)

`docs/CLAIMS.md` maps every outward claim to its evidence or softening; checked at every
release; new claims require a new row. Seed rows:

| # | Claim | Evidence / discipline |
|---|-------|----------------------|
| C1 | Original and fictional | Trade-dress checklist records + name-screen records |
| C2 | Synthetic-only content | **Hard guarantee, never softened** — attestations + data/asset registry |
| C3 | "Physician-reviewed (single reviewer)" — **never "expert-reviewed"** | Public per-case review records (all outward copy, including clinical materials, must match this wording) |
| C4 | "Designed to teach" — never "proven to teach" | Standing disclaimer; D-PROD-006 framing |
| C5 | Every clinical rule cited | CI invariant INV-CIT-001 (warn-only until the citation spec lands at EP-6/EP-9) |
| C6 | WCAG 2.2 AA conformance | Claimable only after the v1 gate (EP-36) passes |
| C7 | Offline, no telemetry | Architecture (D-ARCH-001) + CI no-network invariant test + CSP |
| C8 | License terms | LICENSE + LICENSE-CONTENT.md |
| C9 | Case counts | Live numbers until v1 ("N published, M reviewed"; the approved target is 11 per the OQ-2 ruling) |
| C10 | Deterministic; five subscores, no composite | Golden-case regression tests |
| C11 | Status line ("pre-release … nothing here is validated") | Self-evidencing (D-RISK-001) |

### Standing disclaimers (verbatim block)

Canonical copy lives in `docs/CLAIMS.md` and is consumed unmodified by the README, the
persistent banner, and every pre-brief:

> Educational use only. All patients, clinicians, institutions, and records are synthetic and
> fictional; no real data of any kind. Not validated for learning outcomes; not a certification
> of competence; no claim of safety improvement. Clinical content is physician-reviewed
> (single reviewer). Personal project with no institutional, employer, or vendor affiliation;
> not "HIPAA compliant" because no real health information is processed. Drug information may
> become outdated — each case shows its review date; verify against current sources before any
> clinical use.

## 7. v1.0 release criteria — the twelve gates

Instantiated as `docs/RELEASE-CRITERIA.md` at EP-5; executed at EP-38.

1. Taxonomy coverage matrix satisfied and the generated output committed.
2. Every case has a public review record + in-app badge (D-RISK-003).
3. WCAG audit complete: axe green + manual keyboard + NVDA passes + 200% zoom pass + exceptions
   doc published with zero open A/AA items (D-UX-004).
4. Claims matrix: every claim evidenced or softened; no orphan claims.
5. Security checklist (§2) re-verified; no open alerts, or documented accepted risk.
6. THIRD-PARTY regenerated; registry complete; SPDX validated in CI.
7. Screenshots leak-screened, taken from the Pages deployment.
8. Usability pass done (EP-37), no data retained, findings triaged.
9. README accurate; quickstart works on a clean machine.
10. Full test pyramid green on both OSes; golden pass; bundle ≤ ~300 KB gz; interactive < 3 s on
    floor hardware (D-ARCH-007, D-QA-001).
11. Governance docs current: threat model reviewed, CITATION.cff bumped.
12. Owner sign-off recorded in DECISIONS.md (D-EXEC-003).

### 0.x conventions (D-OSS-003)

Minor versions = feature slices (v0.1.0 = R1 vertical slice); patch = fixes/content. Annotated
tags + GitHub Releases; Keep a Changelog format plus a custom **"Content"** category; every tag
checklist includes a claims-matrix check and a CITATION.cff bump.

## 8. Name & identity screening (EP-3; D-OSS-004)

**Protocol:** GitHub search; npm registry 404-check; PyPI JSON 404-check; RDAP domain lookups;
USPTO manual search (classes 9/41/42/44 + phonetic variants); general web + app stores.
Fictional in-sim names are screened before the first case publishes. Every record is dated and
carries "informal screening; not legal advice." Collision severity L0–L3: L2+ = owner decision;
L3 = rename before the v1 visibility push (a GitHub repo rename auto-redirects).

**PRELIMINARY results, 2026-08-23** *(preliminary; informal screening; not legal advice;
reverify at execution)*: GitHub — only this project; npm — name free; PyPI — name free;
medrecsim.com/.net/.org — unregistered; USPTO — **inconclusive, manual session still needed**
(completed inside EP-3); web — no exact match; nearest findings all L1 (a "MedRecs Management",
a MedSim/MedSimAI cluster, a "Medrec:M"). Reading: L1 → proceed; USPTO remains outstanding; the
persistent non-affiliation statement does real work against the MedSim-cluster adjacency.
Defensive domain registration was declined per the **OQ-10** ruling (recurring cost vs
complete-at-rest, D-RISK-005); the Pages URL is canonical.

## 9. MIMIC gate document outline (EP-4; D-MIMIC-001/002)

`docs/MIMIC-GATE.md` — status **CLOSED; this document authorizes nothing**. The candidate goal
is quoted verbatim from D-MIMIC-002 (aggregate, disclosure-safe distributional realism to
inform human authoring; per-case import explicitly not a candidate; recorded caveat that MIMIC
lacks BPMH ground truth, fill history, adherence, and source-conflict labels).

**Four sequential steps (all required, in order):**

1. Written goal + construct memo: why the synthetic pipeline cannot answer it, the exact tables
   needed, disclosure-safety per intended output.
2. Then-current terms verification: PhysioNet credentialing; CITI Data-or-Specimens-Only
   training; the Credentialed Health Data DUA (v1.5.0 per the MIMIC-IV v3.1 page, existence
   verified 2026-08-23 — **reverify**); PhysioNet responsible-LLM-use guidance (the DUA
   prohibits third-party APIs/online platforms; this project adds a zero-exception rule); IRB
   determination if required; per-version citation and DUA text captured.
3. Bounded, read-only feasibility spike: aggregate-only outputs with a written
   disclosure-safety check (minimum cell sizes, no rare combinations, no dates).
4. Explicit owner go recorded in DECISIONS.md, scoped to the memo.

**Hard rules:** credentials, data, and derivatives never on agent-reachable paths — including
this repository's `.local/`; no restricted data into any LLM, agent, or API, ever; derivatives
nonpublic by default; individual access only; any ambiguity → the gate stays closed. **Exit
statement:** abandonment is the default trajectory.

## 10. Portfolio & maintenance plan (D-RISK-005; woven through EP-2, EP-19, EP-38)

**Stage narratives:** R0 — the repo demonstrates judgment (governance-first), with a
vaporware-risk mitigation note that R1 is next · R1 — live Pages demo + an honest "works today"
table · R2 — case gallery with review badges + the rendered coverage matrix as the
differentiator · v1.0 — claims flip to evidenced; README carries the case-study narrative arc
(per the **OQ-11** ruling: README narrative in v1; a standalone case-study document is v1.x
polish, branch B-13).

**Complete-at-rest mechanics:** no cron workflows (or accept GitHub's 60-day auto-disable);
Dependabot volume capped (§2.4); a pre-written stepped-away paragraph kept under the `.local/`
convention until needed (**I-16** — avoids signaling intent in public history); an amber
staleness display rule — review badges older than 12 months render amber — is **recommended to
build in** so staleness self-flags (D-RISK-005).

**Annual re-review reminder:** a pinned future-dated issue (primary) + a personal calendar
entry (secondary).

## 11. Citations (accessed 2026-08-23; reverify at execution)

Contributor Covenant 3.0 (released 2025-07-28) · GitHub documentation: private vulnerability
reporting, secret scanning + push protection, CodeQL default setup, repository rulesets,
`pull_request_target` security guidance, actions/checkout v7 changelog (2026-06-18),
CITATION.cff support — all verified free for public repositories · SPDX spec 3.0.1 +
license-identifier-in-source guidance · gitleaks project status (via secondary coverage;
**reverify** — successor "Betterleaks" proposed) · PhysioNet: main site, MIMIC-IV v3.1 page
(Credentialed Health Data DUA v1.5.0), responsible-LLM-use guidance post · DCO v1.1 · CC BY 4.0
legalcode · Keep a Changelog · name-screen endpoints (GitHub, npm registry, PyPI JSON, RDAP;
USPTO manual search outstanding).
