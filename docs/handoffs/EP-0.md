# EP-0 handoff — Baseline floor: ignore/hooks/licenses

**Status:** complete · **Date:** 2026-08-23 · **Brief:** roadmap/EP-0-baseline-floor.md

## Completed scope IDs

All six in-scope items of the EP-0 brief: (1) layered `.gitignore`, (2) `.gitattributes`
LF policy, (3) committed `githooks/` pre-commit with gitleaks + tripwire grep, (4) `LICENSE`
(MIT) + `LICENSE-CONTENT.md` (CC BY 4.0 split), (5) README minimal fix, (6) blocked-secret
hook demonstration.

## Changed files

- `.gitignore` — fully layered; `.local/` is literally line 1 (D-ROAD-002); secrets,
  data, dependency/build, OS/editor, and log layers; synthetic-fixtures convention
  documented at the bottom.
- `.gitattributes` — new; `* text=auto eol=lf` repo-wide + binary extension list (risk R-11).
- `.gitleaks.toml` — new; extends the gitleaks default ruleset; sole allowlist is
  `synthetic-fixtures/` paths (files there must carry a `# SYNTHETIC` first-line header).
- `githooks/pre-commit` — new; layer 1 = gitleaks staged scan (fails **closed** if the
  binary is missing); layer 2 = tripwire grep (staged `.local/` paths; MRN/SSN/DOB-like
  patterns; mimic/physionet markers in non-markdown paths and data-like file contents;
  `# SYNTHETIC` header enforcement for synthetic-fixtures files).
- `githooks/README.md` — new; activation instructions (`git config core.hooksPath githooks`).
- `LICENSE` — new; verbatim MIT, © 2026 W. Taylor Farrington (D-OSS-001).
- `LICENSE-CONTENT.md` — new; CC BY 4.0 content notice, attribution string, legalcode link,
  directory map, trademarks-not-licensed note, `MIT AND CC-BY-4.0` SPDX expression.
- `README.md` — removed the premature "v1.0.0" tagline (D-OSS-003); added the D-RISK-001
  status blockquote verbatim: "pre-release; under active construction; nothing here is
  validated". Full rewrite remains EP-2.
- `docs/handoffs/EP-0.md` — this record.
- `roadmap/README.md` — EP-0 Done column recorded (follow-up commit).

## Tool pin & reverify note

**gitleaks v8.30.1**, installed as a single native Windows binary via
`winget install Gitleaks.Gitleaks`. Reverify note (per brief): gitleaks is
feature-complete with an announced successor; reverify the pinned tool/version at EP-8
(toolchain bootstrap) and at each R-phase boundary. Pin is recorded in `.gitleaks.toml`.

## Verification results

- `git check-ignore -v .local/probe` → `.gitignore:1:.local/` (first rule). ✔
- `git ls-files` contains no `.local/` paths. ✔
- **Blocked-secret demo (no secret values retained):** a scratch file containing a
  fake GitHub-PAT-shaped token (`ghp_` + 36 random alphanumerics) was staged and a commit
  attempted; gitleaks reported `leaks found: 1` and the hook blocked the commit
  (exit 1, HEAD unchanged). The scratch file was deleted and never committed. ✔
- **Tripwire demo:** a scratch file containing an MRN-labeled eight-digit number passed
  gitleaks but was blocked by the layer-2 tripwire grep (exit 1, HEAD unchanged); deleted,
  never committed. ✔ (Amusingly, the first draft of this very handoff quoted that literal
  and was itself blocked by the hook — evidence the tripwire scans documentation too.)
- Demo caveat, recorded for honesty: a first demo attempt used a fake AWS key containing
  the substring `FAKE`, which gitleaks' default allowlist stopwords let through, and that
  scratch commit briefly existed locally; it was removed via `git reset HEAD~1` **before
  any push** and its file deleted. Lesson: the default ruleset ignores obviously-fake
  tokens; the layered tripwire and server-side push protection (EP-1) remain necessary.
- README contains the status blockquote verbatim and no "v1.0.0" text. ✔
- License badge on GitHub after push (commit `e537b11`): the repos API reports
  `"spdx_id": "MIT"` — detection succeeded, badge renders. ✔

## Decisions logged (reversible technical, D-EXEC-003)

- Tripwire scoping: mimic/physionet **path** check exempts `*.md` (governance docs such as
  the future `docs/MIMIC-GATE.md` legitimately name the gate); mimic/physionet **content**
  check applies only to data-like extensions (csv/tsv/json/jsonl/ndjson/yaml/yml/txt/dat).
  Restricted datasets never ship as markdown; refine at EP-4 if the threat model demands.
- Hook fails closed when gitleaks is absent (leak prevention outranks convenience).
- gitleaks installed via winget (native binary, no npm dependency — D-ARCH-003 friendly).

## Risks / notes for the next session

- `core.hooksPath` is local git config: every fresh clone must run
  `git config core.hooksPath githooks` (documented in `githooks/README.md`). EP-1's
  server-side push protection is the backstop for clones that skip it.
- gitleaks default rules ignore stopword-containing tokens (see demo caveat) — do not
  treat the local scan as sufficient; EP-1 must land before substantive content pushes.
- `LICENSE-CONTENT.md` references `packages/**` and `content/**` before those directories
  exist; they arrive at EP-8/EP-9 per the architecture appendix.

## Next eligible EPs

**EP-1** (GitHub security settings & baseline doc), **EP-2** (community & governance pack),
and **EP-3** (name & identity screening spike) are now eligible. EP-8 additionally requires
EP-1.
