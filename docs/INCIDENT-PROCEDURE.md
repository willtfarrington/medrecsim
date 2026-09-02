# Incident and correction procedures (D-SEC-002, D-RISK-004, I-12)

**Status:** current as of 2026-09-02 (EP-4); **no procedure in this document has been executed**
(there has been no incident) · **Owner:** repository owner · **Revisit trigger:** §F.

This document holds four procedures:

- **§A Sensitive-commit runbook**: a credential, private material, or (worst case) real patient
  or restricted-dataset data reaches the repository. Pre-authorized; owner executes.
- **§B Content-error and contested-scoring path**: the D-RISK-004 freeze, from intake to
  resolution, including the credibility criteria that keep the freeze from being weaponized.
- **§C Vulnerability path**: a security report arrives through private vulnerability reporting.
- **§D Account-compromise addendum**: the extra steps when the owner account itself is the
  problem.

It is the "if it fails" column of [THREAT-MODEL.md](THREAT-MODEL.md) §5. Settings it touches are
recorded with dates in [SECURITY-BASELINE.md](SECURITY-BASELINE.md); the dependency rules it
relies on are in [DEPENDENCY-POLICY.md](DEPENDENCY-POLICY.md); the restricted-data rules that
make an S2 incident a stop-everything event are in [MIMIC-GATE.md](MIMIC-GATE.md). The public
reporting policy is [SECURITY.md](../SECURITY.md).

## Standing authorization (integrator resolution I-12)

The sensitive-commit runbook in §A is **pre-authorized**: when its trigger conditions are met
the owner does not need a further decision to run it, and it is written so that it can be
followed under stress without improvisation. The authorization is scoped as follows:

- The **owner personally executes** every step that rotates a credential, disables a ruleset,
  rewrites history, force-pushes, or contacts GitHub Support. Agent sessions **never** perform
  those steps, even when asked mid-session; they may draft the incident record, the detection
  rule, and the triage worksheet, and they may run the read-only discovery commands in A2.
- Nothing here creates a response-time obligation. SECURITY.md and SUPPORT.md promise
  best-effort handling with no service level, and this document does not change that.
- Nothing here authorizes disclosure of the sensitive content itself. The public incident
  record describes the *class* of what leaked and the exposure window, never the value.

## Severity classes

| Class | What reached the repository, an issue, CI logs, or agent context | Path | Notes |
|-------|------------------------------------------------------------------|------|-------|
| **S1** | A credential or token (GitHub PAT or session token, npm token, any API key), real or believed real | §A | Rotate first, always |
| **S2** | Real patient information of any kind, content "de-identified from memory", or any material from a restricted dataset (MIMIC or other) or its derivatives | §A, as a **stop-everything** event | Breaks the absence-of-PHI guarantee (asset A5). The charter's stop condition: work pauses until the runbook is complete and the leak-prevention stack has been re-audited |
| **S3** | Private material that is not S1/S2: `.local/` content, local paths, usernames, email addresses, machine details, planning notes, unvetted source material, screenshot metadata | §A, abbreviated (A1, A3–A7, A9–A11) | Rewrite is still preferred because "it is only a path" is how habits erode |
| **S4** | A security vulnerability in the app, content rendering, CI, or the Pages deployment, reported or discovered | §C | If the vulnerability *exposed* S1–S3 material, run §A as well |
| **S5** | A clinical content error or a contested classification | §B | Not a security incident; the correction path exists so that it is never handled ad hoc |

If the class is unclear, treat it as the higher one.

---

## §A. Sensitive-commit runbook (S1, S2, S3)

The order matters: **rotate before you rewrite.** A history rewrite takes time and cannot reach
forks, clones, or caches; a rotated credential is dead everywhere at once.

Conventions used below: run in **Git Bash** on the owner's Windows machine (the commands are
POSIX shell); `R=willtfarrington/medrecsim`; ruleset ids are those exported in
`docs/rulesets/` (history protection `21252019`, PR gate `21252020`; confirm with A5's first
command if they have been recreated since). Work notes go under `.local/incident/`, which is
gitignored; nothing there is ever quoted into a public file.

### A1. Stop and triage (minutes)

Do not push anything further. Open a private worksheet and answer, in writing:

```sh
mkdir -p .local/incident && printf '# incident %s\n\n' "$(date -u +%Y-%m-%dT%H:%MZ)" > .local/incident/worksheet.md
```

- **What** leaked: class (S1/S2/S3), file path(s), the nature of the content (described, not
  pasted).
- **Where** it is: only in the working tree (not yet committed), committed locally only, pushed
  to a branch, pushed to `main`, deployed to Pages, mirrored into an issue or PR, present in a
  CI log.
- **How long**: first commit time to now. `git log --format='%H %cI' --diff-filter=A -- <path>`
  gives the introducing commit.
- **Who could have seen it**: public repository, so assume anyone; note whether the Pages site
  served it and whether any fork exists (`gh api "repos/$R/forks" --jq 'length'`).

If the material is only in the working tree or only in a local commit that was never pushed,
the runbook shrinks to: remove it, `git commit --amend` or `git reset`, verify with A2's
discovery commands, then A11 (detection rule). No public record is needed for an unpushed
mistake, but the worksheet is kept.

### A2. Rotate first (S1; also any credential that *could* have been in S2/S3 material)

Every credential that appeared, or that lived on a machine or in a file that appeared, is
revoked and reissued **before** any history work. Typical inventory for this project:

| Credential | Revoke | Reissue |
|------------|--------|---------|
| GitHub personal access token (classic or fine-grained) | github.com → Settings → Developer settings → Personal access tokens → delete it. There is no CLI path for another token's deletion. | Only if still needed; the project keeps **no** PATs in the tree by policy (baseline row A14) |
| `gh` CLI session token | `gh auth logout` on every machine that was logged in, then in the browser: Settings → Applications → Authorized OAuth Apps → GitHub CLI → Revoke | `gh auth login` |
| GitHub account password / sessions (if the leak suggests session compromise) | Settings → Password and authentication → change password; Settings → Sessions → revoke all other sessions; confirm 2FA still enabled | See §D |
| npm token (once EP-8 introduces publishing, if ever) | `npm token revoke <id>` or npmjs.com → Access Tokens | Only if needed |
| Any provider API key that appeared in `.local/` material | Provider console | Provider console |

Record in the worksheet which credentials were rotated and when. A credential you are *not
sure* was exposed is rotated anyway.

### A3. Confirm the extent in history (read-only discovery)

Find every commit and path that carries the material. These commands print paths and hashes,
not content; do not run `git show` on the offending blob into a terminal that is being logged
or screen-shared.

```sh
# Every commit that touched the file(s)
git log --all --format='%h %cI %s' -- <path>

# Every commit whose tree contains a pattern (describe the pattern in a private file, one per line)
# .local/incident/patterns.txt is gitignored. Never put the literal secret in a shell history line.
git rev-list --all | while read -r c; do git grep -q -F -f .local/incident/patterns.txt "$c" && echo "$c"; done

# Issues, PRs, and comments that may quote it (search titles/bodies)
gh search issues --repo "$R" "<non-secret identifying words>" --json number,title,url
gh api "repos/$R/issues/comments?per_page=100" --jq '.[] | {id, html_url}'   # then inspect suspects
```

If an issue or PR quotes the material: edit the comment to remove it, then ask GitHub Support to
purge the edit history (A8). If a CI log contains it: delete the workflow run
(`gh run delete <run-id>`), noting that logs of public repositories may have been fetched.

### A4. Prepare the rewrite

Work in a **fresh mirror clone**, never in the everyday working copy. Install `git-filter-repo`
if absent (needs git ≥ 2.36 and Python 3 ≥ 3.6; `--sensitive-data-removal` needs
git-filter-repo ≥ 2.47).

```sh
pip install git-filter-repo          # or place the single-file script on PATH (upstream INSTALL.md)
git filter-repo --version

cd "$(mktemp -d)"                    # scratch location outside the repository
git clone --mirror "https://github.com/$R.git" medrecsim-rewrite.git
cd medrecsim-rewrite.git
```

Choose the operation:

- **Remove a whole file from all history** (the usual S3 case, and S1 when the secret was in a
  file of its own):

  ```sh
  git filter-repo --sensitive-data-removal --invert-paths --path <path/to/file> [--path <another>]
  ```

- **Replace text inside files** (S1 when the secret sits in an otherwise-legitimate file). The
  replacements file lives under `.local/incident/` of the *working* clone, one rule per line,
  `literal==>REDACTED`; copy it into the scratch directory, never into the mirror's tree:

  ```sh
  git filter-repo --sensitive-data-removal --replace-text /path/to/scratch/replacements.txt
  ```

`filter-repo` removes the `origin` remote after rewriting; add it back:

```sh
git remote add origin "https://github.com/$R.git"
```

Sanity-check the result before pushing: rerun the A3 discovery loop inside the mirror and
expect no hits; `git log --oneline | head` should show the expected commits with new hashes.

### A5. Temporarily lift history protection

The `main-history-protection` ruleset blocks non-fast-forward pushes and has **no bypass
actors** by design, so it must be disabled for the duration of the push and re-enabled
immediately afterwards. Record both timestamps in the worksheet.

```sh
gh api "repos/$R/rulesets" --jq '.[] | {id, name, enforcement}'          # confirm the id
gh api -X PUT "repos/$R/rulesets/21252019" -f enforcement=disabled       # history protection OFF
gh api "repos/$R/rulesets/21252019" --jq '.enforcement'                  # expect: disabled
```

Do not touch `main-pr-gate` (its admin bypass already permits the owner's push) and do not
disable push protection or secret scanning at any point.

### A6. Force-push the cleaned history

```sh
git push --force --mirror origin
```

`--mirror` from the mirror clone replaces every branch and tag on the remote with the rewritten
ones and deletes any remote ref that no longer exists locally. Any open PR based on the old
history will show as conflicted or closed; that is expected and is noted in the incident record.

### A7. Re-protect immediately and verify

```sh
gh api -X PUT "repos/$R/rulesets/21252019" -f enforcement=active         # history protection ON
gh api "repos/$R/rulesets" --jq '.[] | {id, name, enforcement}'          # both: active
```

Then apply the SECURITY-BASELINE.md drift rule: re-export both rulesets, strip the volatile
fields, and confirm `docs/rulesets/*.json` still matches (the only intended difference is none;
`updated_at` is stripped). Add a dated re-verification note to baseline row A6.

### A8. Ask GitHub Support to purge cached views and dereferenced commits (S1, S2; optional S3)

A force-push does not remove the old commits from GitHub's servers immediately: they remain
reachable by hash, in cached views, and through any PR that referenced them. GitHub's published
procedure is to contact Support with the repository name, the number of PRs affected, and the
first rewritten commit, and to ask that affected PRs be dereferenced or deleted, garbage
collection run, and cached views removed. Support states it acts on *sensitive* data and only
when rotation alone cannot mitigate the risk, which is exactly the S1/S2 case. Record the ticket
reference (not its contents) in the worksheet and the date in the public record.

### A9. Clean local clones and scratch material

On every machine that had a clone containing the old history:

```sh
# Simplest and safest: delete the old clone and re-clone.
# If the clone must be kept (uncommitted work), purge the old objects instead:
git fetch --all --prune
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Then delete the scratch mirror directory, the replacements file, and any temporary copy of the
material. Keep the worksheet (it is under `.local/` and gitignored). Ask any known collaborator
with a clone to do the same, and say plainly that you cannot verify they did (see A10's caveat).

### A10. Redeploy Pages from the cleaned `main`

Once the Pages workflow exists (EP-8), trigger a fresh deploy so the served bundle is built from
the rewritten `main` and no artifact from the old history remains:

```sh
gh workflow run pages.yml --ref main            # or push an empty commit: git commit --allow-empty -m "redeploy after incident"
gh run watch
```

Before EP-8 there is no deployment and this step is recorded as "n/a: no Pages deployment yet".

### A11. Dated public incident record

Commit `docs/incidents/YYYY-MM-DD-<short-slug>.md` (create the directory on first use) using
the template in §E. It states the class, the exposure window, what was rotated (by type), that
history was rewritten, the Support request date, and this **honest caveat, verbatim or
equivalent**:

> A history rewrite removes the material from this repository, its Pages deployment, and, once
> GitHub Support has acted, from GitHub's caches. It cannot remove it from forks, clones, or
> copies made while it was public. Anyone holding such a copy should treat the material as
> withdrawn; any credential in it has been rotated and is inert.

For **S2**, add a notice at the top of the README (directly under the status line) that links
the record and states that the synthetic-only guarantee was breached and how, and keep it there
until the owner records in DECISIONS.md that the leak-prevention stack was re-audited. The
claims matrix row C2 (EP-5) is updated in the same commit.

### A12. Add a detection rule

Every incident ends by making its class impossible to repeat silently:

- **Secret-shaped material**: add a `[[rules]]` entry to `.gitleaks.toml` with a regex for the
  format (never the value), or confirm the default ruleset already covers it and explain why it
  was missed (usually `--no-verify` or a clone without hooks).
- **Private paths, usernames, emails, machine names**: extend the tripwire in
  `githooks/pre-commit` (layer 2c) with a pattern; keep the pattern generic (for example an
  `@`-domain, a `C:\Users\` prefix) rather than the specific value.
- **PHI-like or restricted-data material**: extend the `phi_re` / `marker_re` patterns or the
  file-type list in layer 2c.

Test the rule the way EP-0 did: stage a harmless sample that matches, confirm the hook blocks
it, unstage it, and describe the test in the incident record. Commit the rule together with the
record.

### A13. Close

- Re-run the SECURITY-BASELINE.md verification block (dates updated).
- Note in the worksheet whether THREAT-MODEL.md §5 already listed the scenario; if not, add a
  row.
- For S2: the roadmap pauses at the current EP until the owner records the re-audit in
  DECISIONS.md (charter domain 16; risk register closing paragraph).
- Update the risk register entry (R-8 or R-9) with a one-line "fired on <date>; see record".

---

## §B. Content-error and contested-scoring path (S5; D-RISK-004)

This path handles any claim that a scored item, teaching note, or citation is wrong, whether it
comes from an outside report or from the owner's own re-review. It exists because the project's
single-reviewer model *will* be wrong sometimes and says so; the credibility of the whole
simulation depends on errors being frozen quickly, adjudicated openly, and never argued about
in private.

### B1. Intake

Reports arrive through the **clinical content concern** issue form
(`.github/ISSUE_TEMPLATE/clinical_content_concern.yml`), which requires: the case ID and
content version, the contested item quoted or identified, the challenge with at least one cited
source, and an ordinal severity (safety-relevant / teaching-relevant / precision or citation).
Reports that arrive another way (email, a PR, a security advisory) are moved into an issue on
that form by the owner, credited to the reporter if they wish.

Anything in the report that is real patient information is handled first under §A as S2 (the
form says not to include it; people do anyway). The clinical question is then taken up on its
merits.

### B2. Credibility triage (owner; documented criteria)

The owner posts a public triage comment on the issue applying the criteria below and stating
the outcome. Triage is a clinical judgement and therefore owner-only (D-EXEC-003); the criteria
are public so that the judgement is auditable. There is no timeline commitment; "under triage"
is a visible state.

**A report is credible, and the item is frozen, when it identifies a specific item AND at least
one of the following holds:**

1. It cites an authoritative source (a current guideline, labelling, a national safety body such
   as ISMP, AHRQ, or WHO, or primary literature; the approved-source tiers from EP-6 apply) that
   is on point and that the owner cannot show to be superseded or misread within a bounded
   reading.
2. It describes a mechanism of harm or a clinical scenario under which the current
   classification would mislead a learner, and the owner cannot rule the mechanism out without
   the full D-GOV-001 re-review.
3. It shows an internal inconsistency in the case: the item contradicts the case's own evidence
   layer, its cited teaching note, or another accepted alternative.
4. It comes from the owner's own annual re-review or a schema migration touching clinical
   semantics (D-GOV-001 triggers), in which case it is credible by construction.

**A report is not credible (no freeze) when any of the following describes it, and the triage
comment says which:**

- No specific item is identified, or the concern is with the simulation's premise rather than a
  scored item (those are feature requests or are answered by the standing disclaimers).
- No source and no mechanism is offered, and the challenge is an assertion of preference.
- The cited source is misquoted, withdrawn, superseded, or not about the situation the case
  models, and the triage comment shows this with a citation of its own.
- The "error" is a legitimate alternative that the case already accepts (accepted or
  partially-accepted set) or has already marked as irreducible uncertainty (D-MED-005).
- It duplicates a dispute already adjudicated (linked in the case changelog) and brings no new
  evidence.
- It asks the project to remove a disclosure of uncertainty, a citation, or a limitation
  statement, rather than to correct content.

**Guards against weaponization** (the D-RISK-004 risk that freezes are used to disable correct
content or exhaust the owner):

- A freeze is always **per item**, never per case, per topic, or project-wide.
- Every triage decision, freeze, and resolution is public in the issue and the case changelog.
  There are no private outcomes to pressure.
- Reporter identity is neither a qualification nor a disqualification; only the content of the
  report is triaged. Credentials asserted in a report are not verified and do not count.
- Repeat or serial reports without new evidence are closed by reference to the earlier triage
  comment, in one line, without re-triage.
- A pattern of **two or more sustained freezes** (that is, freezes that end in a content change)
  across the roster is itself a signal: the risk register's evidence rule says pause the case
  wave and redesign the affected authoring process. That is a strengthening of review, not a
  weakening.
- Bad-faith conduct in the issue itself is a Code of Conduct matter and is handled there,
  separately from the clinical question, which is still triaged on its merits.

### B3. Freeze patch (if credible)

One commit, opened as a PR if outside contributions are active or committed directly during solo
construction, that:

1. Marks the contested item **"discussion item — not scored"** in the case bundle's reference
   layer (the schema carries a per-item freeze flag by requirement, EP-9). The engine excludes
   frozen items from scoring and the debrief shows the item with its dispute status rather than
   a verdict.
2. Bumps the case bundle's content version (D-DATA-002 per-bundle stream).
3. Adds a **Disputed** entry to the case changelog: date, issue link, item, severity as
   reported, and the triage outcome.
4. If the reported severity is **safety-relevant** and the owner's triage agrees, adds a notice
   to the README (under the status line) naming the case and item and linking the issue, and
   mirrors the notice in the case's pre-brief text if the app exists. The notice stays until
   B5.

CI (validation, golden snapshots) must pass with the freeze in place; the golden update is
flagged in the PR template per OQ-8.

### B4. Re-adjudication (full D-GOV-001 lifecycle)

The item goes back through the content lifecycle as if new: automated validation, the clinical
self-review checklist, the stigma-safety checklist where narrative is touched, and a new
versioned, dated, **public** review record committed beside the case that cites the sources
considered, including the reporter's. The record states one of:

- **Upheld as authored** (with the reason the challenge does not change the classification);
- **Changed** (new classification or wording, with citations);
- **Reclassified as irreducible uncertainty** (the item becomes an accepted alternative or is
  moved out of scoring permanently, per D-MED-005).

The owner signs the record (D-EXEC-003). Agents may draft; they never decide.

### B5. Resolution patch

One commit that:

1. Removes the freeze flag and applies the outcome; bumps the content version again.
2. Adds a **Resolved** entry to the case changelog linking the review record.
3. **Updates `docs/CLAIMS.md` in the same commit** if any outward wording is affected (for
   example the case count of "reviewed" cases, or a claim about a rule that changed). If the
   claims matrix does not yet exist (before EP-5) this obligation transfers to EP-5's sweep and
   is noted in the changelog entry.
4. Removes the README and pre-brief notices added in B3.
5. Closes the issue with a link to the record and thanks the reporter (credit in the record if
   they wish).

### B6. Owner-initiated errors

When the owner finds the error, B1's issue is still opened (by the owner) so that the public
trail exists; B2 is satisfied by criterion 4; B3–B5 run unchanged. Safety-relevant errors found
by the owner get the README notice exactly as outside reports do.

---

## §C. Vulnerability path (S4)

1. **Intake** is GitHub private vulnerability reporting only (SECURITY.md; baseline row A3).
   A vulnerability posted as a public issue is acknowledged in one line, the reporter is asked
   to use the private flow, and the issue is closed; the report is then handled privately from
   the information already public.
2. **Acknowledge** when read; best-effort, no SLA.
3. **Classify**: if the report shows that S1–S3 material was exposed, run §A now and return
   here afterwards.
4. **Fix** on `main` (or a short-lived branch if the fix needs CI iteration). If the Pages
   deployment is affected and the fix will take time, redeploy from the last known-good commit
   or tag first:

   ```sh
   git checkout -b hotfix/rollback <known-good-sha>
   # push to main only through the normal path; the rollback is a normal commit, never a force-push
   ```

5. **Verify** the fix in CI and, where the report concerns runtime behaviour, on the live Pages
   URL.
6. **Disclose**: a dated public note committed under `docs/incidents/` (template §E, "S4"
   class), and a GitHub Security Advisory published from the private report once fixed, with
   credit if the reporter wishes. Content-rendering issues (XSS via content files) also get a
   CI invariant or schema rule so the class cannot return.
7. **Close** by re-running the relevant SECURITY-BASELINE.md rows and asking whether
   THREAT-MODEL.md §5 needs a row.

---

## §D. Account-compromise addendum (T5)

If there is any sign that the owner account or its tokens were used by someone else (unknown
commits, ruleset changes, a Pages deploy the owner did not trigger, unfamiliar sessions):

1. From a known-clean device: change the account password; revoke all other sessions; confirm
   2FA is still enabled and the recovery codes are in the owner's possession; revoke every PAT
   and every authorized OAuth/GitHub App the owner does not recognise; `gh auth logout` and
   re-login.
2. Read the repository's settings back against SECURITY-BASELINE.md rows A1–A12 and both
   ruleset exports; restore anything that drifted; record the drift in the baseline.
3. Audit `main`: `git log --format='%h %cI %an %s' <last-known-good>..origin/main`. Revert
   unrecognised commits with ordinary revert commits (history protection is not lifted for
   this; the point is to preserve the evidence). Redeploy Pages from a known-good commit.
4. Check the account's security log (Settings → Security log) for the window and note the
   findings in the private worksheet.
5. Then run §A for anything the intruder could have read or written, and §C if they changed
   code or content, and write a single public record under §E covering the whole event.

---

## §E. Incident record template

File: `docs/incidents/YYYY-MM-DD-<slug>.md`. Public. Contains no secret values, no paths,
usernames, or emails, and no patient-like content of any kind, even redacted.

```markdown
# Incident record — YYYY-MM-DD — <one-line title>

**Class:** S1 | S2 | S3 | S4 · **Status:** open | closed (YYYY-MM-DD) · **Runbook:**
INCIDENT-PROCEDURE.md §A | §C | §D

## What happened
<Two to four sentences. Class of material, where it was, how it got there. No values.>

## Exposure window
First commit / first public visibility: <UTC timestamp> · Detected: <UTC timestamp> ·
Removed from `main`: <UTC timestamp> · Pages redeployed: <UTC timestamp or n/a>

## Actions taken
- Rotated: <credential types, not values>
- History rewritten with git-filter-repo on <date>; history-protection ruleset disabled
  <HH:MM>–<HH:MM> UTC and re-enabled; ruleset exports re-verified
- GitHub Support asked to purge caches and dereferenced commits on <date> (ticket held privately)
- Detection rule added: <file and one-line description>

## Caveat
A history rewrite removes the material from this repository, its Pages deployment, and, once
GitHub Support has acted, from GitHub's caches. It cannot remove it from forks, clones, or
copies made while it was public. Anyone holding such a copy should treat the material as
withdrawn; any credential in it has been rotated and is inert.

## Follow-ups
- <threat-model row added / baseline rows re-verified / roadmap pause and re-audit for S2>
```

---

## §F. Revisit triggers

- **EP-8**: the Pages workflow name in A10 and the package-manager tooling in §A become real;
  update the commands. Confirm the schema's per-item freeze flag (B3) exists at **EP-9**.
- **EP-5**: `docs/CLAIMS.md` exists; B5.3 and A11's C2 reference become live obligations.
- **Any change to the rulesets** (ids or bypass actors): update A5/A7.
- **Any change to D-RISK-004 or D-GOV-001** (owner, via DECISIONS.md): update §B.
- **After any execution** of §A, §C, or §D: the closing step reviews this document for what was
  missing or wrong, and the status line records "executed on <date>; see docs/incidents/".
- **Every tagged release** and the EP-38 audit (gate 11), read-through only.
