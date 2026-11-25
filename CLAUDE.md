# medrecsim — session guide

medrecsim is an educational, fully synthetic medication-reconciliation simulation (fictional,
vendor-neutral EHR-like interface) for PGY-1–2 residents and senior medical students. Personal
project of the repository owner; no employer, hospital, EHR-vendor, pharmacy, or payer
affiliation. Not medical advice, not clinical decision support, not validated for learning
outcomes. All content is fictional and synthetic.

## Read order for every working session

1. This file.
2. [DECISIONS.md](DECISIONS.md) — the binding decision ledger (D-*). Decisions are only changed by
   a new dated entry there, made by the project owner.
3. [roadmap/README.md](roadmap/README.md) — phase tables; find the one EP brief you were assigned.
4. That single `roadmap/EP-N-*.md` brief. Briefs are self-contained; do not read other briefs.

## Hard rules (non-negotiable, from the approved Planning Charter — roadmap/charter.md)

- **Synthetic only.** Never add real patient information, employer data, institutional screenshots,
  identifiable anecdotes, or cases "deidentified from memory." No restricted datasets (MIMIC or
  otherwise) anywhere near this repo, CI, or any agent context.
- **No runtime LLM; no LLM as clinical truth or judge — ever.**
- **No telemetry, accounts, backend, or free-text learner input in v1.** Static client-only app.
- **Clinical content sign-off belongs to the owner alone.** Agents never author or alter
  accepted/unsafe action sets, scoring semantics, or clinical teaching content without an explicit
  owner review checkpoint recorded per the content lifecycle (D-GOV-001).
- **Every clinical rule cites an authoritative source with version/access date.**
- **Harm language:** plausible-consequence phrasing with ordinal severity; no invented
  probabilities or statistics (D-SCOR-003).
- **Scope is frozen.** New ideas go to `roadmap/final-roadmap.md` (parked list), never into a
  running EP (D-RISK-002).
- **Privacy/leak hygiene:** `.local/` is private and gitignored — never commit it, never quote its
  contents into public files. Screenshots/docs must be screened for paths, usernames, emails, and
  metadata before inclusion.
- **Do not publish** beyond this repo and its GitHub Pages deployment; releases, claims, licensing,
  and naming changes are owner-only decisions.

## Working conventions

- One EP brief per session. Implementation EPs leave `main` runnable and CI green. Every EP ends
  with a public-safe handoff record written to **`docs/handoffs/EP-N.md`** (completed IDs,
  changed files, verification results, decisions logged, risks, next eligible EPs) — a fresh
  session finds the latest handoff there, never in chat memory.
- Sessions resume from repository state only; chat memory is never load-bearing.
- Windows-native toolchain (Node LTS). No WSL, containers, or virtualization changes.
- Reversible technical choices may be made autonomously but must be logged (ADR or brief note).
  Owner-only: anything listed under D-EXEC-003.

<!-- roadmap-wrangler:begin -->
## Roadmap house style

Written by Roadmap Wrangler (`crw formalise`; clauderoadmapwrangler D-4, D-10 … D-13) between
these markers, which it may rewrite: edit outside them. This file's own rules win where they
differ.

- **Read first:** `roadmap/README.md` (the next unchecked EP in table order and its brief notes
  under the phase table), `DECISIONS.md`, the last executed brief's completion note,
  `roadmap/owner-tasks.md` and `roadmap/inbox.md`.
- **Inbox triage:** for each open message, `- [ ] IN-n (from <project> EP-k, date) text`, roll it
  into this session if it fits the brief and is at most S-sized; otherwise add it to the brief
  notes of a named later EP or propose a new row in the right phase, confirming with the owner
  through `AskUserQuestion`; or decline it with a reason. Write the disposition on its line and
  tick its box.
- **Brief first:** an EP session starts by writing `roadmap/EP-N-<slug>.md` from
  `roadmap/_TEMPLATE.md`: YAML front matter (`ep`, `title`, `size`, `model`, `effort`, `status`),
  then Context, In scope, Out of scope and Verification / acceptance.
- **Completion note:** the brief ends with
  `> **Completion note (YYYY-MM-DD; model/effort; duration).**`, recording each owner decision and
  its outcome. A message for another project follows as a `> **Handed on (to <project>).**` block,
  which the tool delivers into that project's `roadmap/inbox.md` once the brief is committed.
- **Owner tasks:** what only the owner can do is appended to `roadmap/owner-tasks.md` as
  `- [ ] OT-n (EP-k, date) text`, ending `[before EP-m]` only when EP-m builds on it.
- **The roadmap:** phase tables `| # | Brief | Size | Depends on | Core | Done |`, a done row's
  cell `☑` and one backticked commit hash; each upcoming EP's detail is a `- **EP-n.** …` bullet
  under `**Brief notes.**`.
- **Sizes:** a brief is S (about 30 minutes of active work) or M (about 45): an S where its shape
  is known at planning and it touches a handful of files, an M for an investigation, a state
  machine or the choice of a tool. A row is not cut only to make it smaller, and a row that
  proves larger at pickup is split there, never run long.
- **Manual:** a project the owner calls working well enough to owe one keeps `docs/manual.md`
  (reference chapters, then a walkthrough of the routes no real use has met) and
  `docs/manual-changes.md`, where each brief that changes what a user sees or does adds a
  `## EP-n — <title> (date)` section before its close; the phase's re-plan folds that file into
  the manual and empties it. `crw manual` builds the PDFs, which are never tracked.
<!-- roadmap-wrangler:end -->
