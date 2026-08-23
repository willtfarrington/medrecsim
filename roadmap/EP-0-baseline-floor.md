# EP-0 — Baseline floor: ignore/hooks/licenses

**Size:** S · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** none · **Blocks:** EP-1 (GitHub security settings & baseline doc), EP-2 (Community & governance pack), EP-8 (Toolchain bootstrap + ADRs)

## Context

The repo is a public skeleton (two-line README, empty subdirectory READMEs, no license/CI/code)
and stays public during construction (D-RISK-001). D-SEC-001 requires the local hygiene floor
before any substantive push; D-OSS-001 fixes the MIT + CC BY 4.0 license split; D-OSS-003 orders
the premature "v1.0.0" tagline fix. This brief must produce **the first commit after the existing
skeleton — nothing else is pushed before it** (risks R-9 in [appendices/risk-register.md](appendices/risk-register.md)).
Detailed pack inventory: [appendices/governance-security.md](appendices/governance-security.md) §1.

## Safety & policy preconditions

- Synthetic-only content: n/a — no clinical content in this EP; the ignore/hook layer landed here
  is the enforcement floor for that rule going forward.
- Clinical sign-off (D-EXEC-003): n/a.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: this EP *is* the guard — `.local/` must be the first `.gitignore` line
  (D-ROAD-002); secret/data pre-commit scan lands before anything else does.
- Licensing/attribution (D-DATA-006, D-OSS-001): license files land here; terms are owner-decided
  — instantiate verbatim, do not vary.
- Accessibility (D-UX-004): n/a — no UI.
- Security baseline (D-SEC-001): local layer implemented here; server-side settings are EP-1.

## In scope

1. Layered `.gitignore`: `.local/` as the first line; secret patterns with a `synthetic-fixtures/`
   allowlist path convention (files there carry a `# SYNTHETIC` header); dependency/build outputs;
   OS/editor files; logs.
2. `.gitattributes` forcing LF repo-wide (Windows/Linux parity, risk R-11).
3. Pre-commit hooks in a committed `githooks/` dir activated via `core.hooksPath` (no husky):
   gitleaks v8 (single Windows binary) with `.gitleaks.toml` whose only allowlist is the
   synthetic-fixtures convention, plus a second tripwire grep (staged `.local/` paths;
   MRN/SSN/DOB-like patterns; mimic/physionet markers). Record the gitleaks version and a
   reverify note (tool is feature-complete with an announced successor).
4. `LICENSE` = verbatim MIT text (keeps GitHub's license detection). `LICENSE-CONTENT.md` prose:
   CC BY 4.0 for content, attribution string, legalcode link, directory map (packages/** = MIT;
   content/** and teaching docs = CC BY 4.0), trademarks-not-licensed note.
5. README minimal fix only (full rewrite is EP-2): remove the "v1.0.0" tagline; add the
   D-RISK-001 status blockquote verbatim ("pre-release; under active construction; nothing here
   is validated").
6. Demonstrate the hook: stage a fake secret in a scratch file, confirm the commit is blocked,
   then delete the file (never commit it). Record the demonstration in the handoff.

## Out of scope

- GitHub server-side settings, ruleset, SECURITY-BASELINE.md → EP-1.
- README full rewrite, community files, templates, CITATION.cff, dependabot.yml → EP-2.
- CI workflows, `.npmrc`, SHA pinning, THIRD-PARTY regeneration → EP-8.
- Threat model / procedures → EP-4. Claims matrix / changelog → EP-5.

## Owner checkpoints

none — license terms and status wording are already owner-decided (D-OSS-001, D-RISK-001); this
brief only instantiates them.

## Verification / acceptance

- `git check-ignore -v .local/probe` reports `.local/` ignored by the first `.gitignore` rule.
- `git ls-files` output contains no `.local/` paths.
- Staged fake secret is blocked by the pre-commit hook (demonstrated; described in handoff).
- README contains the status blockquote verbatim and no "v1.0.0" text.
- `LICENSE` and `LICENSE-CONTENT.md` exist; after push, GitHub shows the MIT license badge
  (cosmetic — note in handoff if detection misfires, do not restructure for it).
- This EP's commit is the first content pushed beyond the pre-existing skeleton.

## Handoff

Standard fields, plus: gitleaks version pinned + reverify note; confirmation text of the
blocked-secret demo (no secret values); whether the license badge rendered; explicit statement
that EP-1, EP-2, EP-3 are now eligible.

## Parked → final-roadmap.md

none
