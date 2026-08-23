# EP-<n> — <Title>

**Size:** S|M|L · **Type:** implementation|content|governance|spike · **Core/Stretch:** core|stretch ·
**Depends on:** EP-x (title), … · **Blocks:** EP-y (title), …

## Context

Why this brief exists now, which `D-*` decisions it implements, what already exists in the tree,
and what does not. Self-contained: a session that has read only `CLAUDE.md` → `DECISIONS.md` →
this phase's table in `roadmap/README.md` → this brief can execute it without reading any other
brief.

## Safety & policy preconditions

Which charter constraints this brief could touch, and the specific guard for each: synthetic-only
content, clinical sign-off checkpoints (owner-only per D-EXEC-003), harm-language rules
(D-SCOR-003), leak prevention (`.local/`, screenshots, metadata), licensing/attribution
(D-DATA-006), accessibility (D-UX-004), security baseline (D-SEC-001). `n/a` is a valid answer but
must be written per item, not omitted.

## In scope

Numbered, ordered, concrete steps.

## Out of scope

Each excluded item names the EP or `final-roadmap.md` entry that owns it.

## Owner checkpoints

Points where work must pause for the owner (clinical sign-off, claim approval, dependency
additions, naming). `none` is valid for purely technical briefs.

## Verification / acceptance

Mechanically checkable wherever possible; every implementation brief names at least one command
and leaves `main` runnable with CI green. Judgement-based criteria are marked *(judgement)* and
say who judges. Content briefs name the review record(s) that must exist.

## Handoff

What the public-safe handoff record — written to `docs/handoffs/EP-<n>.md` — must contain beyond
the standard fields (completed IDs, changed files, verification results, decisions logged,
risks, next eligible EPs).

## Parked → final-roadmap.md

Items discovered during this brief that belong to a later release (D-RISK-002). `none` is valid.
