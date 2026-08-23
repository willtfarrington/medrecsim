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
