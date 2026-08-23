# Security baseline — living checklist (D-SEC-001)

This document is the durable record of the medrecsim security baseline: the local half landed at
EP-0, the server-side (GitHub-hosted) half is configured at EP-1 per
[roadmap/EP-1-security-settings.md](../roadmap/EP-1-security-settings.md) and
[roadmap/appendices/governance-security.md](../roadmap/appendices/governance-security.md) §2.
Server-side settings live in the GitHub UI and can drift silently; every row below therefore
carries a **verified-on date** and the method used. This file records settings states and dates
only — never tokens, account details, or secret values.

**Re-verification triggers:** (1) every tagged release; (2) EP-38 release audit, gate 5
(security baseline re-verified); (3) any change to repository settings, rulesets, or Actions
policy — after which the live ruleset JSON must be re-exported into `docs/rulesets/` (see
"Drift rule" below).

Status legend: ✅ verified · ⏳ pending owner action (this repo's agent sessions have no
repo-admin API access; see "How to complete" below) · ⛔ blocked (reason noted).

## A. Server-side items (EP-1 scope)

| # | Item | Prescribed state (D-SEC-001) | Status | Verified on | Method |
|---|------|------------------------------|--------|-------------|--------|
| A1 | Secret scanning | Enabled | ⏳ | — | admin API/UI (default-on for public repos is expected but not yet confirmed for this repo) |
| A2 | Push protection | Enabled | ⏳ | — | admin API/UI |
| A3 | Private vulnerability reporting | Enabled | ⏳ (public API showed `enabled: false` on 2026-08-23) | — | `GET /repos/{o}/{r}/private-vulnerability-reporting` (public) |
| A4 | Dependabot alerts | Enabled (`dependabot.yml` config file itself is EP-2) | ⏳ | — | admin API/UI |
| A5 | CodeQL default setup | Configured; first scan completes without configuration errors | ⏳ | — | admin API/UI. Expected blocker: repo contains no CodeQL-supported language until EP-8 — if enablement is refused, record that here and retry at EP-8. |
| A6 | Ruleset on `main` | Two active rulesets matching [rulesets/main-history-protection.json](rulesets/main-history-protection.json) (block force-push + deletion, no bypass) and [rulesets/main-pr-gate.json](rulesets/main-pr-gate.json) (require PRs; repo-admin bypass) | ⏳ (public API showed zero rulesets on 2026-08-23) | — | `GET /repos/{o}/{r}/rulesets` (public) |
| A7 | Required status checks on `main` | **EP-8 placeholder** — check names are added to the PR-gate ruleset once CI exists | ⛔ deferred to EP-8 by design | — | — |
| A8 | Actions: default workflow permissions | Read-only | ⏳ | — | admin API/UI |
| A9 | Actions: "can create or approve pull requests" | OFF | ⏳ | — | admin API/UI |
| A10 | Fork PRs | Require approval for **all** outside collaborators. Standing policy: never combine `pull_request_target` with a checkout of fork code (enforced in workflow reviews from EP-8). | ⏳ | — | admin API/UI |
| A11 | Wiki | Disabled | ⏳ (public API showed `has_wiki: true` on 2026-08-23) | — | `GET /repos/{o}/{r}` (public) |
| A12 | Projects | Disabled | ⏳ (public API showed `has_projects: true` on 2026-08-23) | — | `GET /repos/{o}/{r}` (public) |
| A13 | Owner-account 2FA | Active | ⏳ owner-only (account settings are not repo-readable) | — | UI: Settings → Password and authentication |
| A14 | No PATs or secrets anywhere in tree or history | Clean | ✅ | 2026-08-23 | `gitleaks dir .` (working tree) and `gitleaks git .` (all 4 commits): no leaks found |
| A15 | Push-protection live demo | Dummy-secret push blocked server-side on a scratch branch, branch deleted, no secret value retained | ⏳ owner-run (procedure below) | — | — |

## B. Local items (EP-0 scope — from [handoffs/EP-0.md](handoffs/EP-0.md))

| # | Item | Status | Verified on | Method |
|---|------|--------|-------------|--------|
| B1 | Layered `.gitignore`, `.local/` as line 1 (D-ROAD-002) | ✅ | 2026-08-23 | `git check-ignore -v` + `git ls-files` audit |
| B2 | `.gitattributes` LF policy + binary list | ✅ | 2026-08-23 | committed at `e537b11` |
| B3 | Pre-commit hook: gitleaks staged scan, **fails closed** if binary missing | ✅ | 2026-08-23 | blocked-secret demo (EP-0 handoff) |
| B4 | Pre-commit layer 2: tripwire grep (`.local/` paths, MRN/SSN/DOB patterns, mimic/physionet markers, `# SYNTHETIC` header enforcement) | ✅ | 2026-08-23 | tripwire demo (EP-0 handoff) |
| B5 | `.gitleaks.toml` pin (gitleaks v8.30.1) + synthetic-fixtures allowlist convention | ✅ | 2026-08-23 | committed at `e537b11` |
| B6 | Hook activation is per-clone (`git config core.hooksPath githooks`) — server-side push protection (A2) is the backstop for clones that skip it | ✅ documented | 2026-08-23 | `githooks/README.md` |

## How to complete the pending rows

Repo-admin access is required; agent sessions on this machine cannot authenticate the GitHub
CLI themselves. Either (a) run `gh auth login` once in any terminal and hand the session back
to finish and verify, or (b) click through the UI paths below. After either path, fill in the
Status/Verified-on columns above.

### Terminal path (GitHub CLI, after `gh auth login`)

```sh
R=willtfarrington/medrecsim

# A1+A2 — secret scanning + push protection
gh api -X PATCH "repos/$R" \
  -f 'security_and_analysis[secret_scanning][status]=enabled' \
  -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'

# A3 — private vulnerability reporting
gh api -X PUT "repos/$R/private-vulnerability-reporting"

# A4 — Dependabot alerts
gh api -X PUT "repos/$R/vulnerability-alerts"

# A5 — CodeQL default setup (may refuse until EP-8 adds a supported language — record & retry)
gh api -X PATCH "repos/$R/code-scanning/default-setup" -f state=configured

# A6 — rulesets (import the intended definitions committed in docs/rulesets/)
gh api -X POST "repos/$R/rulesets" --input docs/rulesets/main-history-protection.json
gh api -X POST "repos/$R/rulesets" --input docs/rulesets/main-pr-gate.json

# A8+A9 — Actions workflow permissions
gh api -X PUT "repos/$R/actions/permissions/workflow" \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false

# A10 — fork-PR approval policy (if this endpoint 404s on your gh version, use the UI path)
gh api -X PUT "repos/$R/actions/permissions/fork-pr-contributor-approval" \
  -f approval_policy=all_external_contributors

# A11+A12 — disable Wiki and Projects
gh api -X PATCH "repos/$R" -F has_wiki=false -F has_projects=false

# Verification (read back every setting; paste states/dates — never tokens — into this doc)
gh api "repos/$R" --jq '{has_wiki, has_projects, security_and_analysis}'
gh api "repos/$R/private-vulnerability-reporting"
gh api "repos/$R/vulnerability-alerts" -i --silent   # 204 = enabled
gh api "repos/$R/code-scanning/default-setup"
gh api "repos/$R/rulesets" --jq '.[] | {id, name, enforcement}'
gh api "repos/$R/actions/permissions/workflow"
```

### UI path

- **A1–A5:** Settings → Advanced Security (a.k.a. Code security and analysis): enable Secret
  scanning, Push protection, Private vulnerability reporting, Dependabot alerts; Code scanning →
  Set up → Default (CodeQL).
- **A6:** Settings → Rules → Rulesets → New branch ruleset → Import a ruleset → select the two
  files in `docs/rulesets/`.
- **A8–A10:** Settings → Actions → General: Workflow permissions = "Read repository contents and
  packages permissions"; uncheck "Allow GitHub Actions to create and approve pull requests";
  Fork pull request workflows from outside collaborators = "Require approval for all outside
  collaborators".
- **A11–A12:** Settings → General → Features: uncheck Wikis and Projects.
- **A13:** account Settings → Password and authentication: confirm 2FA is enabled.

### A15 — push-protection demo procedure (owner-run)

1. `git checkout -b scratch/push-protection-demo`
2. Add a file containing a **detectable but worthless** secret. A random made-up token usually
   fails the provider checksum and will NOT trigger detection (lesson from the EP-0 demo);
   the dependable test is a real credential that has already been revoked — e.g. create a
   fine-grained PAT with no scopes, revoke it immediately, then paste the revoked value.
   Never use a live credential.
3. `git commit --no-verify -m "push-protection demo"` — `--no-verify` deliberately bypasses the
   EP-0 local hook (which would otherwise block first); the demo targets the server backstop.
4. `git push origin scratch/push-protection-demo` — expect rejection with a `GH013` /
   "push protection" message.
5. `git checkout main && git branch -D scratch/push-protection-demo`; record the result here
   **describing, never quoting, the secret**. If the push was not blocked, delete the remote
   branch immediately (`git push origin --delete scratch/push-protection-demo`) and record the
   failure and its cause.

## Drift rule

The committed JSON in `docs/rulesets/` must always match the live rulesets. After any ruleset
change, re-export and diff:

```sh
gh api "repos/willtfarrington/medrecsim/rulesets" --jq '.[].id'   # list ids
gh api "repos/willtfarrington/medrecsim/rulesets/<id>"            # export; reconcile into docs/rulesets/
```

Note the API export adds server-assigned fields (`id`, `created_at`, …) — reconcile the
meaningful fields (`name`, `target`, `enforcement`, `conditions`, `rules`, `bypass_actors`).

## Design notes (reversible technical decisions, logged per D-EXEC-003)

- **Two rulesets instead of one.** D-SEC-001's "no force-push, require PR + checks" is split so
  that history protection (force-push/deletion blocks) has **no bypass actors at all**, while
  the PR-gate ruleset grants the Repository admin role an always-bypass. Rationale: D-EXEC-002
  sessions work trunk-based on `main` during solo construction; a bypass on the PR gate keeps
  that workflow possible without ever weakening history protection. Revisit when outside
  contributions open up (EP-2/D-OSS-002) or at EP-8 when required checks are added.
- **Required status checks deferred to EP-8** (A7): a `required_status_checks` rule naming
  checks that do not exist yet would block every PR; the brief prescribes adding the names once
  CI exists.
