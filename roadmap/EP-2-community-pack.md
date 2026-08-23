# EP-2 — Community & governance pack

**Size:** M · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** EP-0 (Baseline floor) · **Blocks:** EP-5 (Claims matrix, release criteria, changelog)

## Context

Implements the OSS governance pack: narrow PR intake with DCO + attestations (D-OSS-002),
honest-portfolio README with the status line (D-RISK-001, D-OSS-003), CITATION.cff and
issue/PR templates (D-OSS-003), the D-RISK-004 contested-content on-ramp, and the data/asset
registry home (D-DATA-006). Full inventory with file-by-file content:
[appendices/governance-security.md](appendices/governance-security.md) §1. Assumes OQ-9
(Contributor Covenant **3.0**) and OQ-12 (**yes**, one owner-approved AI-assisted-authoring
paragraph) per [appendices/open-questions.md](appendices/open-questions.md); Issues-only, no
Discussions (integrator resolution I-11).

## Safety & policy preconditions

- Synthetic-only content: attestation checkboxes (no PHI, no real-patient-derived or restricted
  material incl. MIMIC, synthetic provenance) are load-bearing here — wording must match
  D-OSS-002 exactly.
- Clinical sign-off (D-EXEC-003): CONTRIBUTING states plainly that clinical content sign-off is
  owner-only and new clinical cases are not accepted as PRs.
- Harm language (D-SCOR-003): n/a — no clinical content authored.
- Leak prevention: README screenshot slot is a **placeholder** — never a mock/fake screenshot;
  real ones arrive leak-screened at EP-19 (D-UX-006).
- Licensing/attribution (D-DATA-006): README explains the MIT/CC BY split; `source
  material/REGISTRY.md` table lands here (empty is fine).
- Accessibility (D-UX-004): accessibility_issue template included; docs use plain language.
- Security baseline (D-SEC-001): SECURITY.md points to private vulnerability reporting (enabled
  at EP-1); no public vuln issues.

## In scope

1. README full rewrite: title + thesis (no version number in the tagline); D-RISK-001 status
   blockquote verbatim; what-this-is / what-this-is-not; screenshot placeholder; quickstart
   placeholder; design principles; limitations block linking `docs/CLAIMS.md` (file lands at
   EP-5 — forward link is intentional); non-affiliation statement; license-split explanation;
   contributing/security/support links; roadmap link with "no dates by design"; CITATION
   pointer; reserved maintenance-status slot. Copy rule: "physician-reviewed (single reviewer)",
   never "expert-reviewed".
2. CONTRIBUTING.md: narrow intake (bugs/typos/accessibility/tooling; **no new clinical cases** —
   content ideas via issues); DCO v1.1 Signed-off-by; the three attestations; owner clinical
   sign-off statement; best-effort/no-SLA; the OQ-12 AI-assisted-authoring paragraph (wording
   owner-approved before merge).
3. CODE_OF_CONDUCT.md: Contributor Covenant 3.0 (OQ-9 assumption).
4. SECURITY.md: report via the repo's private advisory flow; no public vuln issues; scope in
   (XSS-via-content, supply chain, CI, secrets) / out (clinical disputes → correction path).
5. SUPPORT.md: best-effort, Issues only (I-11).
6. Issue templates (`config.yml` with `blank_issues_enabled: false`): bug_report;
   clinical_content_concern (D-RISK-004 on-ramp: case ID, contested item, cited challenge
   source, severity; states the freeze procedure); accessibility_issue; feature_request (states
   the D-RISK-002 parking rule). PR template: DCO + attestations + "no new outward claims
   without a CLAIMS.md row" + CI-green checkbox.
7. CODEOWNERS: `*` → the owner's GitHub handle; comment on `/content/` re owner sign-off.
8. CITATION.cff (cff 1.2.0, type software, current 0.x version).
9. `dependabot.yml`: npm + github-actions ecosystems, weekly, grouped, open-PR limit 5, no
   auto-merge (D-SEC-002 reviewed-not-auto-merged).
10. THIRD-PARTY.md stub (regenerated per release from EP-8's script) + `source
    material/REGISTRY.md` with the column schema (ID/Asset/Type/Source URL/Version/Access
    date/License/Attribution/Redistributable/Update cadence/Notes).
11. Omit FUNDING.yml; confirm Wiki/Projects disabled (EP-1).

## Out of scope

- docs/CLAIMS.md, RELEASE-CRITERIA, CHANGELOG → EP-5. Threat model/procedures → EP-4.
- DCO CI enforcement, dependency-review-action, THIRD-PARTY regen script → EP-8.
- Any real screenshot → EP-19.

## Owner checkpoints

- AI-assisted-authoring paragraph wording (OQ-12) — owner approves before merge *(judgement)*.
- If the owner rules OQ-9 differently, swap CoC text (mechanical).

## Verification / acceptance

- GitHub community-standards checklist shows all items green after push.
- All four issue templates + PR template render on the New Issue / New PR pages; attestation
  checkboxes present.
- `git grep -n "expert-reviewed"` finds no hits in README/CONTRIBUTING/templates (ledger and
  charter historical text exempt).
- CITATION.cff validates (GitHub renders the "Cite this repository" widget).

## Handoff

Standard fields, plus: OQ-9/OQ-12 assumptions restated with whatever the owner ruled; any
template rendering quirks; note that EP-5 must complete the README→CLAIMS mapping sweep.

## Parked → final-roadmap.md

none
