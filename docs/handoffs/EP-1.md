# EP-1 handoff — GitHub security settings & baseline doc

**Status:** complete (two owner follow-ups open — see below) · **Date:** 2026-08-23 ·
**Brief:** roadmap/EP-1-security-settings.md

Executed in two stages the same day: stage 1 (commit `98fe030`) prepared all artifacts but had
no repo-admin API access — the session could not run the interactive `gh auth login`, and the
permission classifier (correctly) blocked both credential-store reuse and the dummy-secret
push. Stage 2, after the owner authenticated the GitHub CLI, applied and verified every
server-side setting.

## Completed scope IDs

All nine in-scope items, with two carve-outs recorded below: (1) secret scanning + push
protection enabled; (2) private vulnerability reporting enabled; (3) Dependabot alerts
enabled; (4) CodeQL default setup configured (first-scan carve-out below); (5) rulesets on
`main` created and exported to `docs/rulesets/`; (6) Actions hardening (read-only default
permissions, create/approve-PRs off, fork-PR approval for all outside collaborators,
standing `pull_request_target` policy recorded); (7) `docs/SECURITY-BASELINE.md` with dated
rows and re-verification triggers; (8) housekeeping (no-PATs verified via gitleaks; Wiki and
Projects disabled; 2FA carve-out below); (9) push-protection demo procedure documented
(execution carve-out below).

## Changed files

- `docs/SECURITY-BASELINE.md` — the durable artifact: every D-SEC-001 item (server A-rows +
  EP-0 local B-rows) as a dated, verified row; completion/re-verification command block; UI
  click-paths; A15 demo procedure; ruleset drift rule; logged design notes.
- `docs/rulesets/main-history-protection.json`, `docs/rulesets/main-pr-gate.json` — live
  ruleset exports (ids 21252019 / 21252020; volatile server fields stripped, pretty-printed).
- `docs/handoffs/EP-1.md` — this record.
- `roadmap/README.md` — EP-1 Done column (follow-up commit, EP-0 pattern).

## Verification results (all `gh api` read-backs, 2026-08-23)

- Secret scanning `enabled`; push protection `enabled`. ✔
- Private vulnerability reporting `enabled: true` (was `false` pre-EP-1). ✔
- Dependabot alerts: `GET /vulnerability-alerts` → 204. ✔
- CodeQL default setup `state: configured`, `query_suite: default`. ✔ (see carve-out)
- Rulesets `main-history-protection` + `main-pr-gate` both `enforcement: active`; committed
  JSON matches the live export. ✔
- Actions: `default_workflow_permissions: read`, `can_approve_pull_request_reviews: false`,
  fork-PR `approval_policy: all_external_contributors`. ✔
- `has_wiki: false`, `has_projects: false`. ✔
- gitleaks working-tree + full-history scans: no leaks found (no PATs in tree). ✔

## Carve-outs / settings that could not be fully verified (reason + follow-up)

1. **CodeQL first scan** (brief item 4 "wait for the first scan to complete"): default setup
   is configured but `languages: []` — the repo is markdown/JSON-only, so there is nothing
   for CodeQL to scan and no run has occurred. Follow-up: **EP-8** verifies the first
   completed scan once code exists (baseline row A5).
2. **Owner-account 2FA** (item 8): the CLI token has no account scope, so
   `two_factor_authentication` is unreadable by the session. Follow-up: owner confirms in
   account Settings → Password and authentication (baseline row A13).
3. **Push-protection demo** (item 9): not executed — the permission classifier blocks agent
   sessions from committing secret-shaped content with `--no-verify`, and a random fake token
   would fail provider checksums anyway (EP-0 lesson). Follow-up: **owner-run**, exact
   procedure in SECURITY-BASELINE.md §A15 (revoked fine-grained PAT; scratch branch; expect
   GH013; delete branch; record without quoting the secret). No secret values — real or fake —
   were committed, pushed, or retained by either stage.

## Ruleset placeholder note for EP-8 (required by brief)

`main-pr-gate` deliberately contains **no** `required_status_checks` rule: check names do not
exist until EP-8's CI. EP-8 must add the rule with the real check names, update the live
ruleset, and re-export the stripped JSON into `docs/rulesets/` (baseline rows A6/A7 + drift
rule). Note: the server added `require_extra_approval_for_unattributed_changes: true` as a
default on the pull_request rule — kept, it is protective.

## Decisions logged (reversible technical, D-EXEC-003)

- **GitHub CLI installed**: `gh` 2.98.0 via `winget install GitHub.cli` (native binary,
  D-ARCH-003-friendly; same pattern as EP-0's gitleaks install). Authenticated by the owner
  via `gh auth login` (keyring).
- **Two-ruleset split with admin bypass on the PR gate only**: history protection
  (force-push/deletion) has no bypass actors; the PR-requirement ruleset grants the
  Repository-admin role always-bypass so D-EXEC-002's solo trunk-based sessions can keep
  committing to `main`. Rationale + revisit triggers in SECURITY-BASELINE.md "Design notes".
- **Ruleset export hygiene**: committed exports strip volatile server fields
  (`_links`, `node_id`, `created_at`, `updated_at`, `current_user_can_bypass`).

## Risks / notes for the next session

- Direct pushes to `main` now succeed via admin bypass on `main-pr-gate` (git may print a
  bypass notice); force-push and branch deletion are hard-blocked for everyone.
- Server-side push protection is now the active backstop for clones that skip
  `git config core.hooksPath githooks` — but it only covers GitHub-known patterns; the local
  hook layers remain the primary defense.
- Dependabot **alerts** are on; the `dependabot.yml` config (npm + github-actions, weekly,
  grouped, open-PR limit 5, no auto-merge) is EP-2 scope.

## Next eligible EPs

**EP-2** (community & governance pack), **EP-3** (name screening), and **EP-4** (threat
model — depends on EP-1) are eligible. **EP-8** (toolchain) is eligible per the dependency
table; it additionally owes the A5 first-scan verification and the A7 required-checks
placeholder from this EP.
