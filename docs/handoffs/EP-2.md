# EP-2 handoff — Community & governance pack

**Status:** complete (one owner checkpoint open — OQ-12 wording; see below) · **Date:**
2026-09-02 · **Brief:** roadmap/EP-2-community-pack.md · **Commit:** `80710ef`

## Completed scope IDs

All eleven in-scope items: (1) README full rewrite; (2) CONTRIBUTING with DCO 1.1, the three
attestations, owner clinical sign-off statement, no-SLA statement, and the OQ-12 paragraph
(proposed wording, flagged); (3) CODE_OF_CONDUCT = Contributor Covenant 3.0; (4) SECURITY.md;
(5) SUPPORT.md; (6) four issue forms + `config.yml` (blank issues off) + PR template;
(7) CODEOWNERS; (8) CITATION.cff; (9) `dependabot.yml`; (10) THIRD-PARTY.md stub +
`source material/REGISTRY.md`; (11) no FUNDING.yml; Wiki, Projects, and Discussions confirmed
disabled via `gh repo view` (all `false`).

## Changed files

- `README.md` — rewrite per brief item 1: no version in the tagline; D-RISK-001 status
  blockquote verbatim; what-this-is / what-this-is-not; screenshot and quickstart
  placeholders (text only, no mock-ups); design principles; limitations block linking
  `docs/CLAIMS.md` (forward link, lands at EP-5) and carrying the standing-disclaimer block
  verbatim from governance-security.md §6; non-affiliation; MIT/CC BY split; contributing/
  security/support/CoC links; roadmap link with "no calendar dates, by design"; CITATION
  pointer; reserved maintenance-status slot as an HTML comment under the status line.
- `CONTRIBUTING.md` — narrow intake; **no new clinical cases as PRs**; DCO 1.1 reproduced;
  three attestations worded to cover every D-OSS-002 term (no PHI / no real-patient-derived
  content / no restricted datasets incl. MIMIC; synthetic provenance + AI-assistance
  disclosure; rights to contribute / no proprietary material / no third-party trade dress);
  owner-only clinical sign-off; best-effort no-SLA; OQ-12 paragraph.
- `CODE_OF_CONDUCT.md` — Contributor Covenant 3.0 text (fetched 2026-09-02 from
  contributor-covenant.org, CC BY-SA 4.0, attribution retained). The two template
  `[NOTE: …]` placeholders were resolved: reporting means = private contact via the owner's
  GitHub profile, with an honest single-moderator limitation statement; the enforcement
  ladder kept as published.
- `SECURITY.md` — private advisory URL; no public vulnerability issues; in-scope
  (XSS-via-content, supply chain, CI/deploy, secrets or sensitive material, the no-network
  guarantee) / out-of-scope (clinical disputes → correction path; DoS; third-party services).
- `SUPPORT.md` — best-effort, Issues only (I-11), what not to send.
- `.github/ISSUE_TEMPLATE/config.yml` (`blank_issues_enabled: false`; contact links to the
  private advisory page and SUPPORT.md), `bug_report.yml`, `clinical_content_concern.yml`
  (case ID + version, contested item, cited challenge, ordinal severity dropdown; states the
  D-RISK-004 freeze procedure), `accessibility_issue.yml`, `feature_request.yml` (states the
  D-RISK-002 parking rule). Every form opens with a required no-PHI checkbox.
- `.github/PULL_REQUEST_TEMPLATE.md` — DCO + three attestations + "no new outward claim
  without a CLAIMS.md row" + copy-rule box + golden-snapshot-update flag (OQ-8) + CI-green.
- `.github/CODEOWNERS` — `*` and `/content/` → `@willtfarrington`, sign-off comment.
- `CITATION.cff` — cff 1.2.0, type software, version `0.0.0`, license list `[MIT, CC-BY-4.0]`.
- `.github/dependabot.yml` — npm + github-actions, weekly, grouped, open-PR limit 5, comment
  records the reviewed-never-auto-merged policy (D-SEC-002).
- `THIRD-PARTY.md` — stub; records that nothing is redistributed yet and lists the two reused
  governance texts (Contributor Covenant, DCO) with their licenses.
- `source material/REGISTRY.md` — column schema exactly as the brief (ID / Asset / Type /
  Source URL / Version / Access date / License / Attribution? / Redistributable / Update
  cadence / Notes), storage rules, empty table. `source material/README.md` (previously a
  zero-byte file) now points to it.
- `docs/handoffs/EP-2.md` — this record. `roadmap/README.md` — EP-2 Done column
  (follow-up commit, EP-0/EP-1 pattern).

## Verification results (2026-09-02)

- **Community-standards checklist:** `GET /community/profile` → `health_percentage: 100`;
  description, README, license, code of conduct, contributing, PR template all present. ✔
  Quirk: the profile's `issue_template` key reads `false` and GraphQL `issueTemplates` was
  empty immediately after the push — see "Template rendering quirks" below.
- **Issue forms + PR template:** all five ISSUE_TEMPLATE files present on `main` via the
  contents API; each form, the config, and `dependabot.yml` validate against the SchemaStore
  JSON schemas (`github-issue-forms`, `github-issue-config`, `dependabot-2.0`) with zero
  errors; GraphQL `pullRequestTemplates` lists `PULL_REQUEST_TEMPLATE.md`. Attestation
  checkboxes are in the PR template and a required no-PHI checkbox heads every form. ✔
  (see quirk note for the limits of what could be checked without a browser session)
- **Copy rule:** `git grep -n "expert-reviewed"` over README, CONTRIBUTING, SECURITY, SUPPORT,
  CoC, THIRD-PARTY, CITATION, `.github/`, `source material/` → no hits. Remaining hits are
  the ledger (D-PROD-006), the charter, and roadmap briefs (all exempt historical/instruction
  text). ✔
- **CITATION.cff:** `cffconvert --validate` → "valid according to schema version 1.2.0"; the
  public repo page renders the "Cite this repository" control. ✔
- **Security policy:** GraphQL `securityPolicyUrl` resolves to the repo's security/policy page;
  private vulnerability reporting was enabled at EP-1. ✔
- **Housekeeping:** `has_wiki`, `has_projects`, `has_discussions` all `false`. ✔ Pre-commit
  hooks ran on the commit (gitleaks: no leaks found). ✔

## OQ-9 / OQ-12 assumptions restated

- **OQ-9 — Contributor Covenant 3.0:** applied as ruled. If the owner ever prefers 2.1, the
  swap is mechanical (replace the file, keep the reporting paragraph).
- **OQ-12 — AI-assisted-authoring paragraph:** one paragraph ships in CONTRIBUTING under a
  visible "proposed wording, awaiting owner approval" callout. The brief makes the wording an
  owner judgement checkpoint before merge; this session is non-interactive and commits to
  `main` directly, so the paragraph is committed *as a labelled draft* rather than silently
  presented as approved. **Owner action:** edit as desired and delete the callout blockquote;
  that removal is the approval record. README only points to CONTRIBUTING for it (no second
  copy to keep in sync).

## Template rendering quirks

- GitHub's REST community profile reports `issue_template: false` and the GraphQL
  `issueTemplates` list was empty right after the push, even though the five files are on
  `main` and are schema-valid. Anonymous HTTP fetches of `/issues/new/choose` redirect to
  sign-in, so the rendered chooser could not be inspected from the session. The follow-up
  GraphQL query after an indexing wait is recorded at the end of this section. **Owner
  action (one minute):** open Issues → New issue and confirm the four forms and two contact
  links appear and that blank issues are unavailable.
- GraphQL `codeOfConduct` reports `key: other` — GitHub's detector matches the 1.4/2.x texts;
  3.0 with a customised reporting paragraph is not fingerprinted. The community profile still
  counts the file as present.
- The community profile's `documentation` URL says `tree/master/docs` although the default
  branch is `main`; GitHub-side quirk, nothing to fix.
- `dependabot.yml`'s npm entry points at `/` before any `package.json` exists; Dependabot will
  log "no manifest found" until EP-8 lands the root manifest. Harmless and expected; the file
  comment says so. If EP-8's ADR puts manifests elsewhere, update `directory` then.
- Follow-up GraphQL result: still `[]` about two minutes after the push. Together with the
  100% health score this points to the API fields covering only Markdown-style templates
  (YAML issue forms are not surfaced there), not to a defect in the files; the SchemaStore
  validation is the strongest evidence available from the session. The owner's one-minute
  check above closes the gap.

## Decisions logged (reversible technical, D-EXEC-003)

- **Repo description edited** (server-side): the old description still carried the premature
  "v1.0.0" that EP-0 removed from the README tagline (D-OSS-003). Replaced with a one-line
  synthetic/pre-release thesis matching the README. Reversible via `gh repo edit`.
- **Label `clinical-content` created** (color `#b60205`) so the clinical-content-concern form
  can auto-label; forms otherwise silently drop unknown labels. Existing default labels `bug`,
  `accessibility`, `enhancement` reused.
- **CoC reporting channel** = private contact via the owner's GitHub profile, not an email
  address in the repo (CLAUDE.md leak hygiene: no emails in public files). Publishing a
  dedicated contact address is the owner's call.
- **CITATION version `0.0.0`** (no release yet; `date-released` omitted). Bump to `0.1.0` with
  a date at EP-19 per D-OSS-003. `license` is a two-element list because CFF 1.2.0 accepts SPDX
  identifiers, not expressions; the README carries the `MIT AND CC-BY-4.0` expression.
- **Standing-disclaimer block** placed in the README verbatim from governance-security.md §6
  so the README consumes canonical copy now; when `docs/CLAIMS.md` lands (EP-5) that file
  becomes the source and the README text must stay byte-identical to it.
- **Golden-snapshot-update flag** included in the PR template (appendix §1 + OQ-8) although
  the brief's item 6 did not list it; mechanical and harmless before EP-12.
- **cffconvert** (Python, user-site install) used once for validation; not a project
  dependency and not recorded in the registry.

## Notes for EP-5 (required by brief)

EP-5 must complete the README → CLAIMS mapping sweep: every outward claim now in the README
(synthetic-only; physician-reviewed (single reviewer); designed-not-proven to teach; offline /
no telemetry / no runtime LLM; WCAG 2.2 AA *as a gate*, not as a conformance claim; license
terms; deterministic five-subscore scoring; original and fictional identity) needs a matching
row with evidence or softening. Also: move the standing-disclaimer block's canonical home to
`docs/CLAIMS.md`, and add the PR-template "no new outward claim without a CLAIMS row" rule to
the release-criteria checklist.

## Risks / notes for the next session

- The OQ-12 callout is public until the owner removes it; that is intended honesty, not an
  oversight, but it should not linger past the next owner session.
- Direct pushes to `main` continue to succeed via the EP-1 admin bypass (git prints
  "Changes must be made through a pull request" as a bypass notice); CODEOWNERS only bites on
  pull requests and does nothing until outside contributions arrive.
- DCO CI enforcement, dependency-review-action, and the THIRD-PARTY regeneration script are
  EP-8 scope; until then the DCO and CI-green boxes in the PR template are honour-system.

## Next eligible EPs

**EP-5** (claims matrix, release criteria, changelog — depends on EP-2, now unblocked),
**EP-3** (name & identity screening), **EP-4** (threat model — depends on EP-1), **EP-6**
(clinical governance specs), and **EP-8** (toolchain) are eligible.
