# EP-4 — Threat model, procedures & MIMIC gate

**Size:** M · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** EP-1 (GitHub security settings & baseline doc) · **Blocks:** none (its documents are re-verified at the EP-19 and EP-38 release gates)

## Context

Implements D-SEC-002 (written threat model, dependency policy, incident/correction procedures)
and instantiates the closed MIMIC gate (D-MIMIC-001/002) as a public document. The
contested-scoring freeze path (D-RISK-004) and the pre-authorized history-rewrite runbook
(integrator resolution I-12: owner personally executes) live here. Full outlines:
[appendices/governance-security.md](appendices/governance-security.md) §3 (threat model),
§4 (dependency policy), §5 (incident procedures) and §9 (MIMIC gate). EP-1's server-side baseline must exist first because
the runbook references its ruleset and settings.

## Safety & policy preconditions

- Synthetic-only content: the MIMIC-GATE doc is the standing enforcement text — its hard rules
  (no restricted data near agents/CI/this repo, ever) must be stated verbatim-compatible with
  D-MIMIC-001.
- Clinical sign-off (D-EXEC-003): n/a — no clinical content; the correction procedure routes
  clinical re-adjudication to the owner via D-GOV-001.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: the sensitive-commit runbook is itself the mitigation; docs contain no
  tokens, no account identifiers, no machine details.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): n/a.
- Security baseline (D-SEC-001): builds on EP-1; the dependency policy extends it to the npm
  supply chain.

## In scope

1. `docs/THREAT-MODEL.md`: assets (repo integrity — review records are the trust product; Pages
   integrity; account/tokens; honesty/reputation; the absence-of-PHI guarantee; learner
   privacy); actors (fallible owner; drive-by and malicious contributors — including
   subtly-wrong clinical content, mitigated by owner-only sign-off; supply chain; account
   attacker; scrapers accepted); trust boundaries B1–B7 (issues/PR text untrusted; fork→CI
   approval-gated, no secrets; main→Pages as the only privilege path; deps→build behind
   lockfile + ignore-scripts; owner machine→repo behind hooks + push protection; `.local/`→repo;
   app→network **none at runtime** — CSP on Pages + a CI invariant test for non-origin fetches);
   documented non-threats; revisit trigger = any input-accepting v1.x feature.
2. `docs/DEPENDENCY-POLICY.md`: minimal-deps presumption with written justification per dep;
   runtime allowlist section (seeded at EP-8); frozen lockfile installs; weekly grouped
   reviewed-not-auto-merged updates; new-dependency checklist (license, maintenance, install
   scripts, size vs bundle budget, registry row); annual audit aligned with content re-review.
3. `docs/INCIDENT-PROCEDURE.md`:
   a. Sensitive-commit runbook, pre-authorized (I-12), owner personally executes: triage →
      **rotate first** → history rewrite (filter-repo) with temporary ruleset bypass →
      re-protect → honest fork caveat → redeploy Pages → dated public incident record → add a
      detection rule. Copy-pasteable command sequence.
   b. Content-error / contested-scoring path (D-RISK-004): intake via the
      clinical_content_concern template → credibility triage (criteria documented — guards
      against bad-faith freeze weaponization) → freeze patch marking the item "discussion item —
      not scored" + content-version bump + changelog dispute record → D-GOV-001 re-adjudication
      → resolution patch → CLAIMS.md update in the same commit; safety-relevant errors get a
      README-level notice until patched.
   c. Vulnerability path: private vulnerability reporting (per EP-1/EP-2).
4. `docs/MIMIC-GATE.md`: status **CLOSED — authorizes nothing**; candidate goal verbatim from
   D-MIMIC-002; the four gate steps (goal+construct memo → then-current
   credentialing/DUA/responsible-LLM-use/IRB verification → bounded read-only aggregate-only
   feasibility spike with disclosure-safety checks → explicit owner go in DECISIONS.md); hard
   rules: credentials/data/derivatives never on agent-reachable paths including this repo's
   `.local/`; no restricted data into any LLM/agent/API ever; derivatives nonpublic by default;
   ambiguity → closed; abandonment is the default trajectory.

## Out of scope

- CLAIMS.md / release criteria → EP-5. Enforcing CSP/no-network in CI → EP-8 onward.
- Runtime-allowlist contents → EP-8. Any MIMIC work of any kind → closed gate (B-21 in
  [final-roadmap.md](final-roadmap.md)).

## Owner checkpoints

none — all content is decided (D-SEC-002, D-MIMIC-001/002, I-12); the runbook's
pre-authorization is already logged. Flag any wording that would *extend* owner obligations.

## Verification / acceptance

- The four docs exist and cross-reference each other and `docs/SECURITY-BASELINE.md`.
- Runbook section is a copy-pasteable ordered command sequence (dry-readable without execution).
- MIMIC-GATE's four steps and hard rules are compatible with D-MIMIC-001 read side-by-side.
- Each doc names its own revisit trigger. *(judgement — executing session self-checks; owner
  spot-reads at the EP-5 claims sweep)*

## Handoff

Standard fields, plus: any deviation from the appendix outlines with rationale; confirmation the
runbook was NOT executed (docs-only EP); pointers for EP-5's claims rows (C2, C7 evidence).

## Parked → final-roadmap.md

none
