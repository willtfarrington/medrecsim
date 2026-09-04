# Threat model (D-SEC-002)

**Status:** current as of 2026-09-02 (EP-4) · **Owner:** repository owner · **Revisit trigger:**
any v1.x feature that accepts learner input or hosts state (§8), plus the standing review points
listed there.

This is the written threat model required by D-SEC-002. It names what the project must protect,
who could plausibly threaten it, where trust changes hands, and which control stands at each
boundary. It is deliberately short: medrecsim is a public repository that builds a static,
client-only web page. Most of the classic attack surface (servers, accounts, stored data,
payments) does not exist here, and §6 says so explicitly so that nobody has to re-derive it.

Companion documents: [SECURITY-BASELINE.md](SECURITY-BASELINE.md) (the dated record of which
controls are actually switched on), [DEPENDENCY-POLICY.md](DEPENDENCY-POLICY.md) (boundary B4
in detail), [INCIDENT-PROCEDURE.md](INCIDENT-PROCEDURE.md) (what happens when a control fails),
[MIMIC-GATE.md](MIMIC-GATE.md) (the closed gate that keeps restricted data out of scope), and
the public [SECURITY.md](../SECURITY.md) reporting policy. Decisions cited as `D-*` resolve in
[DECISIONS.md](../DECISIONS.md).

## 1. System in one paragraph

A public GitHub repository holds Markdown governance documents, TypeScript source (from EP-8),
and schema-validated synthetic case content. GitHub Actions builds and tests it and deploys a
static bundle to GitHub Pages **only from `main`**. Learners open the Pages URL in a browser;
the app runs entirely on their machine, makes no network requests after load, keeps optional
convenience state in `localStorage`, and has no accounts, backend, telemetry, or runtime
language model (D-ARCH-001, D-ARCH-005, D-AI-001). The owner works on a Windows machine with
committed pre-commit hooks and a gitignored private zone (`.local/`). Agent sessions
(AI-assisted authoring, disclosed in CONTRIBUTING.md) operate on the repository from that
machine under the same hooks.

## 2. Assets

| # | Asset | Why it matters | Where it lives |
|---|-------|----------------|----------------|
| A1 | **Repository integrity**, especially the public review records, accepted/unsafe action sets, scoring rules, and citations | The public, dated review record is the project's *trust product*: a learner can rely on the simulation only because the reasoning behind every scored item is inspectable and was signed off by the owner (D-GOV-001, D-RISK-003). Silent alteration is the worst outcome. | `main` and its history; `content/**` (from EP-9); `docs/` |
| A2 | **Pages deployment integrity** | The Pages URL *is* the demo (D-UX-006). A tampered bundle could teach wrong content or exfiltrate data under the project's name. | GitHub Pages environment; the deploy workflow |
| A3 | **Owner account and tokens** | The owner is the only maintainer and the only clinical signatory (D-EXEC-003); the account is the root of trust for A1 and A2. | GitHub account; `gh` keyring token; any future npm token |
| A4 | **Honesty and reputation** | The project's value is its candour (status line, claims matrix, single-reviewer disclosure). A leak, a fake screenshot, or an unevidenced claim damages this more than any code bug. | README, `docs/CLAIMS.md` (EP-5), review records |
| A5 | **The absence-of-PHI guarantee** | "Synthetic only" is a hard guarantee that is never softened (claims row C2). One real record, one restricted-dataset row, or one anecdote "de-identified from memory" breaks it permanently for the whole history. | Every committed byte; CI logs; agent context |
| A6 | **Learner privacy** | Nothing leaves the learner's machine (D-ARCH-005). A learner practising a safety-critical skill should not be observable while doing so. | The running app; the network boundary B7 |

## 3. Actors

| # | Actor | Capability | What they could do, to which asset | Project stance |
|---|-------|-----------|------------------------------------|----------------|
| T1 | **The fallible owner** | Full write access; works fast; uses agent sessions | Commit `.local/` material, a credential, a path or username, or a screenshot with metadata (A5, A4); merge a mistaken clinical change (A1) | Treated as the *most likely* source of an incident. Controls: hooks, push protection, checklists, the freeze path, and a pre-authorized runbook so the response is not improvised. |
| T2 | **Drive-by contributor** | Opens issues and PRs; may paste anything into issue text | Paste real patient details or restricted data into an issue (A5); submit a PR that quietly changes a scored item or a citation (A1) | Issue and PR text is untrusted (B1). Clinical content is never accepted as a PR (CONTRIBUTING.md); every PR carries the three attestations. |
| T3 | **Malicious contributor** | As T2, but deliberate: social engineering, a plausible-looking "fix" | **Subtly wrong clinical content**, the project's distinctive threat: a change to an accepted set, an unsafe-set rationale, or a dose in a formulary entry that reads as a correction but teaches harm (A1, A4). Also: bad-faith use of the contest procedure to freeze correct content (D-RISK-004 weaponization). | Mitigated by owner-only clinical sign-off recorded in the public review record (D-EXEC-003; CODEOWNERS on `/content/`), by CI invariants that make silent semantic drift visible (golden snapshots, citation checks), and by the credibility-triage criteria in [INCIDENT-PROCEDURE.md](INCIDENT-PROCEDURE.md) §B. |
| T4 | **Supply-chain attacker** | Publishes a malicious npm package version, a typosquat, a compromised GitHub Action, or a poisoned postinstall script | Run code at install or build time (A1, A2, A3); ship exfiltration code inside the bundle (A6) | Minimal dependencies, frozen lockfile, `ignore-scripts`, SHA-pinned actions, reviewed-not-auto-merged updates, and the no-network invariant (B4, B7; [DEPENDENCY-POLICY.md](DEPENDENCY-POLICY.md)). |
| T5 | **Account attacker** | Phishes or steals the owner's GitHub session, PAT, or `gh` token | Push to `main`, alter rulesets, deploy to Pages, delete history (A1–A4) | 2FA, least-privilege tokens, no PATs in the tree, history-protection ruleset with **no bypass actors**, ruleset exports that make drift detectable, and the rotate-first runbook. |
| T6 | **Scrapers and crawlers** | Read everything public; train on it; mirror it | Copy the content (A4 at most) | **Accepted.** The repository is public by design (D-RISK-001); licences permit reuse with attribution (D-OSS-001). Nothing private is ever committed, so scraping cannot reach A5. |
| T7 | **Prompt injection via repository text** (a special case of T2/T3) | Writes instructions into an issue, PR description, or contributed file hoping an agent session executes them | Cause an agent session to weaken a control, commit `.local/` content, or alter clinical text (A1, A5) | Issue/PR text is data, never instructions (B1). Agent sessions resume from repository state and the decision ledger only; owner-level actions are confirmed interactively; hooks and push protection apply to agents exactly as to the owner. |

## 4. Trust boundaries and controls

Each boundary is a place where data or authority crosses from a less trusted to a more trusted
context. "Landed" cites the EP that implemented the control; rows marked *pending* name the EP
that will, and are re-checked at the EP-19 and EP-38 release gates.

| # | Boundary | What crosses | Control | Status |
|---|----------|--------------|---------|--------|
| B1 | **Issue / PR text → maintainer and agent sessions** | Free text written by anyone | Untrusted: never executed, never auto-merged, never treated as instructions by an agent session. Clinical challenges enter only through the *clinical content concern* form and the credibility triage in INCIDENT-PROCEDURE §B. Blank issues disabled; every form opens with a required no-PHI checkbox. | Landed (EP-2 templates; EP-1 fork-PR approval) |
| B2 | **Fork → CI** | Workflow runs triggered by outside contributors | No secrets exist in CI at all; workflow runs from outside collaborators require approval for **all** of them; `pull_request_target` is never combined with a checkout of fork code; the default workflow token is read-only; Actions cannot create or approve PRs. | Landed (EP-1 rows A8–A10; EP-8 workflow files `ci.yml` / `pages.yml`: `pull_request` only, never `pull_request_target`, `permissions: contents: read`, no secrets referenced) |
| B3 | **`main` → Pages** | The built bundle | The **only privilege path** in the project. Deploys only on push to `main`, via the official `actions/deploy-pages`, with `pages: write` + `id-token: write` scoped to the deploy job, the Pages environment restricted to `main`, and the deploy gated on CI green. `main` itself is protected by two rulesets (history protection with no bypass; PR gate). | Landed (EP-1 row A6 rulesets; EP-8 `pages.yml`: triggers only on push to `main`, runs the whole CI workflow as a called job and deploys only if it succeeds, `pages: write` + `id-token: write` on the deploy job alone; required checks and the `github-pages` environment restriction recorded in SECURITY-BASELINE.md rows A7 and C9) |
| B4 | **Dependencies → build** | npm packages, transitive packages, GitHub Actions | Committed lockfile with frozen installs; `ignore-scripts=true` in `.npmrc`; no unreviewed postinstall scripts; minimal-dependency presumption with a written justification per runtime dependency; SHA-pinned actions; weekly grouped Dependabot PRs that are reviewed and never auto-merged; dependency-review-action on PRs; CodeQL. Detail: [DEPENDENCY-POLICY.md](DEPENDENCY-POLICY.md). | Landed (EP-4 policy; EP-2 Dependabot config; EP-8: `medrecsim/.npmrc` `ignore-scripts=true`, pnpm lockfile with frozen installs, `allowBuilds: {}` + `minimumReleaseAge: 1440`, every action SHA-pinned with a CI pin check, `dependency-review-action` on PRs, CodeQL default setup) |
| B5 | **Owner machine → repository** | Every commit and push | Committed `githooks/pre-commit`: gitleaks secret scan (fails closed if the binary is missing) plus a tripwire grep for staged `.local/` paths, MRN/SSN/DOB-like patterns, and restricted-dataset markers; server-side secret scanning + push protection as the backstop for any clone that skipped hook activation. | Landed (EP-0 rows B1–B6; EP-1 rows A1–A2) |
| B6 | **`.local/` → repository** | The private working zone: planning notes, unvetted source material, incident worksheets | `.local/` is line 1 of `.gitignore` (D-ROAD-002); the tripwire blocks any staged `.local/` path; the standing rule that `.local/` contents are never quoted into public files; screenshots and docs screened for paths, usernames, emails, and metadata before inclusion. | Landed (EP-0) |
| B7 | **App → network** | **Nothing, at runtime.** | The app makes no request after the page load from the Pages origin (D-ARCH-001). Enforced two ways: a Content-Security-Policy delivered with the Pages bundle that permits only same-origin resources, and a CI invariant test that fails the build if any code path can issue a non-origin fetch, XHR, WebSocket, beacon, or form submission. `localStorage` holds convenience state only, with a "clear all local data" control (D-ARCH-005). | Landed at EP-8 as a **static** control: the production `index.html` carries a same-origin CSP `<meta>` (`default-src 'self'; connect-src 'none'; object-src 'none'; form-action 'none'; base-uri 'self'`, injected at build time), and `medrecsim/scripts/check-no-network.mjs` fails CI if the built bundle contains a network-capable API (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`, …) or an off-origin URL outside a documented allow-list; Vite's module-preload polyfill (the one `fetch` in a default build) is disabled. **Runtime** verification (Playwright network interception on the deployed page) remains EP-15/EP-19, when claims row C7 flips to verified |

### How the boundaries compose

The privilege graph is a straight line: *anyone* → B1 (text only) → B2 (CI, no secrets) → B3
(`main` → Pages). An attacker who cannot get a commit onto `main` cannot reach learners. Getting
a commit onto `main` requires either the owner's account (T5, defended by 2FA and rotate-first)
or the owner's own hands (T1, defended by hooks and review discipline). B4 is the one path that
bypasses this line, because a dependency runs *inside* the build; that is why the dependency
policy is stricter than the project's size would otherwise justify. B7 is the last line: even
if a malicious bundle were built, a same-origin CSP and the no-network test limit what it can do
to a learner.

## 5. Threat scenarios worth naming

Ordinal likelihood and impact follow the [risk register](../roadmap/appendices/risk-register.md)
(R-8 supply chain, R-9 accidental sensitive commit, R-16 single-reviewer error). No numeric
probabilities are stated anywhere in this project; D-SCOR-003 governs clinical text, and the
same discipline is kept here.

| Scenario | Actor → asset | Boundary | Primary control | If it fails |
|----------|---------------|----------|-----------------|-------------|
| Owner commits a token, a `.local/` file, or a path/username in a screenshot | T1 → A3/A5/A4 | B5, B6 | Hooks + push protection + leak screening | INCIDENT-PROCEDURE §A (rotate → rewrite → record) |
| Owner commits content derived from a real patient or a restricted dataset, even inadvertently | T1 → A5 | B5, B6, MIMIC gate | Tripwire markers; charter rule; MIMIC-GATE hard rules; agent context never contains restricted data | **Stop everything.** INCIDENT-PROCEDURE §A as an S2 incident; re-audit the leak-prevention stack before resuming (charter domain 16) |
| A "correction" PR changes an accepted/unsafe set so that it teaches an unsafe action | T3 → A1/A4 | B1 | No clinical content via PR; owner-only sign-off; golden snapshots make semantic drift visible in CI | INCIDENT-PROCEDURE §B (freeze → re-adjudicate) plus a README notice if safety-relevant |
| Bad-faith use of the clinical-concern form to freeze correct content | T3 → A1/A4 | B1 | Credibility-triage criteria; freezes are per item and public | Public triage record; repeat reports closed by reference |
| A compromised npm package version with a postinstall payload arrives via a Dependabot PR | T4 → A2/A3 | B4 | `ignore-scripts`; frozen lockfile; human review of the grouped PR; dependency-review-action | INCIDENT-PROCEDURE §A + §C; redeploy Pages from the last known-good commit |
| A compromised GitHub Action tag | T4 → A2 | B2, B4 | Full-SHA pins; Dependabot updates pins under review | Pin back; redeploy; incident record |
| Stolen owner session pushes to `main` or edits rulesets | T5 → A1–A4 | B3, B5 | 2FA; no PATs in tree; history protection has no bypass actors; ruleset drift rule | INCIDENT-PROCEDURE §D then §A |
| Bundle gains a network call (analytics snippet, font CDN, a dependency phoning home) | T4/T1 → A6 | B7 | CSP + CI no-network invariant | Build fails; if already deployed, treat as a vulnerability (§C) and redeploy |
| Content YAML carries markup that the renderer executes (XSS via content) | T3/T1 → A2/A6 | B1, B7 | Schema validation; renderer escapes content; CSP forbids inline script | Vulnerability path §C |
| Agent session follows injected instructions from an issue | T7 → A1/A5 | B1, B5 | Text-is-data rule; interactive confirmation of owner-level actions; hooks apply to agents | As for the underlying incident class |

## 6. Non-threats (documented as such)

These are stated so that future reviewers do not spend effort on them and so that the claims
matrix (EP-5) can cite this section.

- **No server.** There is nothing to harden, patch, or flood beyond GitHub's own infrastructure,
  which is out of scope (SECURITY.md).
- **No accounts, sessions, or authentication** in the product. There are no credentials to
  steal from learners and no user database to breach.
- **No PHI, ever.** Not "protected", *absent*. The project is not "HIPAA compliant" because no
  real health information is processed (standing disclaimer). The threat is *introducing* PHI
  (A5), not protecting it.
- **No secrets in the product.** The bundle is public by construction; a secret in it would be
  a B5 incident, not a design feature.
- **No payments, no third-party integrations, no live EHR connection** (README, "What this is
  not").
- **Summative integrity is a non-goal** (D-GOV-003). Reference answers are public; "cheating"
  is not a threat because there is nothing to cheat at.

## 7. Accepted risks

- **Scraping and model training** on public content (T6): accepted under the chosen licences.
- **Forks and clones retain history.** A history rewrite cannot reach them; the runbook records
  this caveat honestly rather than pretending otherwise.
- **Single maintainer.** The owner is a single point of failure for review and response.
  Mitigations are disclosure ("physician-reviewed (single reviewer)"), the named dual-review
  upgrade trigger (D-CLIN-001), and complete-at-rest design (D-RISK-005), not redundancy.
- **Local hooks are opt-in per clone.** Server-side push protection catches only
  GitHub-recognised secret formats, not PHI-like patterns; a contributor who skips hook
  activation and pastes PHI into a PR is caught by review, not automation. CONTRIBUTING.md
  asks every contributor to activate the hooks.
- **Best-effort response times.** No SLA is promised anywhere; SECURITY.md and SUPPORT.md say
  so, and INCIDENT-PROCEDURE.md does not change that.

## 8. Revisit triggers and review points

This document is revisited, and its status line updated, when any of the following occurs:

1. **Any v1.x feature that accepts learner input or hosts state** (D-SEC-002's trigger): free
   text, uploads, accounts, shared links, a backend, telemetry, or a runtime model. Each of
   these collapses one or more non-threats in §6 and must be modelled before it is built.
2. **Any change to D-ARCH-001 or D-ARCH-005** (client-only; local convenience state only).
3. **Every tagged release** and the EP-38 release audit (gate 11: "governance docs current:
   threat model reviewed"), alongside the security-baseline re-verification.
4. **Any incident** handled under INCIDENT-PROCEDURE.md: its closing step asks whether this
   model missed the scenario.
5. **EP-8** (toolchain): confirm that B2, B3, B4, and B7's pending controls landed as described — **done 2026-09-04** (§4 rows B2/B3/B4/B7 updated; SECURITY-BASELINE.md section C).
   and change the status column.

## 9. Traceability

| Requirement | Source | Where satisfied |
|-------------|--------|-----------------|
| Written threat model covering supply chain, malicious contributions, CI/token compromise, Pages integrity | D-SEC-002 | §3 T3–T5, §4 B2–B4, §5 |
| Synthetic-only guarantee | Charter; claims row C2 | A5, B5, B6, MIMIC-GATE.md |
| No runtime network / no telemetry | D-ARCH-001; claims row C7 | B7 |
| Subtly wrong clinical content mitigated by owner-only sign-off | D-EXEC-003, D-GOV-001 | T3, §5 |
| Revisit trigger | D-SEC-002 | §8 |
