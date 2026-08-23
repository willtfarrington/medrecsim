# EP-1 — GitHub security settings & baseline doc

**Size:** S · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** EP-0 (Baseline floor) · **Blocks:** EP-4 (Threat model, procedures & MIMIC gate), EP-8 (Toolchain bootstrap + ADRs)

## Context

Implements the server-side half of the D-SEC-001 security baseline (the local half landed at
EP-0). All named features were verified free for public repos at planning time (2026-08-23) —
reverify at execution (D-RISK-006). The full checklist with rationale is
[appendices/governance-security.md](appendices/governance-security.md) §2. Because several items
are configured in the GitHub UI, the durable artifact is `docs/SECURITY-BASELINE.md`: a living
checklist with a verified-on date per item, guarding against silent settings drift.

## Safety & policy preconditions

- Synthetic-only content: n/a — no clinical content.
- Clinical sign-off (D-EXEC-003): n/a.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: push protection enabled here is the server-side backstop to EP-0's hooks;
  never paste tokens or account details into committed docs — the baseline doc records settings
  states and dates only.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): n/a.
- Security baseline (D-SEC-001): this brief is that baseline's server half; nothing substantive
  is pushed to the repo by later EPs until it is green.

## In scope

1. Enable secret scanning + push protection.
2. Enable private vulnerability reporting (the SECURITY.md file itself is EP-2).
3. Enable Dependabot alerts (the `dependabot.yml` config file is EP-2).
4. Enable CodeQL default setup; wait for the first scan to complete.
5. Ruleset on `main`: block force-push and deletion; require PRs and status checks (required
   check names are added at EP-8 once CI exists — note the placeholder). Export the ruleset JSON
   to `docs/` so drift is diffable.
6. Actions hardening: default workflow permissions read-only; "Actions can create or approve
   PRs" OFF; fork PRs require approval for **all** outside collaborators. Record the standing
   policy: never `pull_request_target` + checkout of fork code (enforced in workflows at EP-8).
7. `docs/SECURITY-BASELINE.md`: every item above as a dated row (verified-on), including the
   EP-0 local items, with re-verification triggers (each release; EP-38 gate 5).
8. Housekeeping: verify 2FA is active on the owner account; confirm no PATs anywhere in the
   tree; disable Wiki and Projects.
9. Demonstrate push protection: attempt to push a dummy secret on a scratch branch; confirm the
   server-side block; delete the branch.

## Out of scope

- CI workflows, DCO check, dependency-review-action, SHA pinning, Pages workflow → EP-8.
- SECURITY.md, dependabot.yml, community files → EP-2.
- Threat model and incident procedures → EP-4.

## Owner checkpoints

UI-configured settings require repo-admin access: the session prepares exact click-paths and
verifies results via `gh api`; the owner performs any step the session cannot. No decision
content is delegated — all settings are prescribed by D-SEC-001.

## Verification / acceptance

- `gh api` (or equivalent) output confirming: secret scanning, push protection, PVR, Dependabot
  alerts, CodeQL enabled; ruleset active on `main`.
- CodeQL first scan completed without configuration errors.
- Dummy-secret push blocked server-side (demonstrated; described without the secret value).
- `docs/SECURITY-BASELINE.md` exists; every row has a verified-on date; ruleset JSON export
  committed in `docs/` and matching the live ruleset.

## Handoff

Standard fields, plus: any setting that could not be enabled (with reason and follow-up); the
ruleset placeholder note for EP-8's required checks; confirmation of the push-protection demo.

## Parked → final-roadmap.md

none
