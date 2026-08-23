# EP-36 — Accessibility gate hardening

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** all UI EPs (EP-15…EP-19, EP-21…EP-25) · **Blocks:** EP-37 (Usability evaluation
& remediation), EP-38 (v1.0 release audit & sign-off)

## Context

WCAG 2.2 AA is a v1 release gate (D-UX-004), and every UI slice has carried its own per-slice
DoD (axe-clean, keyboard demo, announcer discipline) since EP-15. This EP is the systematic
closing pass across the *whole* app: the full manual NVDA + keyboard script, 200% zoom/reflow
verification, emptying the exception ledger, the public conformance statement, and the
performance floor (D-ARCH-007: interactive < 3 s on throttled ~2018-class hardware). It also
lands the windows-nightly Playwright e2e lane (integrator resolution I-5: stages 1–8 both-OS on
PRs; e2e ubuntu-on-PR + windows-nightly satisfies D-QA-001 parity). Canonical spec:
[appendices/ux-accessibility.md](appendices/ux-accessibility.md) (14-step script, state matrix,
exception process); perf/CI details in [appendices/architecture.md](appendices/architecture.md).

## Safety & policy preconditions

- Synthetic-only: n/a — no content authored; test walkthroughs use reviewed cases.
- Clinical sign-off (D-EXEC-003): n/a — any content defect found is routed to the owning case's
  lifecycle, not patched here.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: manual-audit logs committed publicly are screened for paths/usernames before
  commit.
- Licensing/attribution (D-DATA-006): n/a — no new assets.
- Accessibility (D-UX-004): this EP *is* the gate; the documented-exception process must end with
  zero open A/AA exceptions.
- Security baseline (D-SEC-001): nightly workflow follows existing permissions posture
  (least-privilege token, SHA-pinned actions, no secrets to forks).

## In scope

1. **Full manual audit, twice:** execute the complete 14-step NVDA + keyboard script (landmarks →
   picker → pre-brief → shell → table nav + bulk cite → popover trap/restore → interview incl.
   modes → artifact → phone cost/advance → time-critical announcements → logs/action
   list/provenance round-trip incl. 2.4.11 → signature → debrief both views → settings +
   viewport notice) in **two browsers** (Firefox + Chrome); commit dated, signed audit logs.
2. **200% zoom/reflow pass** across all surfaces in the designed reflow mode (EP-15); only data
   tables scroll internally; committed evidence.
3. High-contrast/forced-colors run recorded as **informative** (I-10) — findings logged, not
   gate-blocking.
4. **Exceptions emptied:** work `docs/a11y/exceptions.md` to zero open A/AA items; remaining rows
   are N/A-with-rationale only; fix defects across any UI surface as needed.
5. **axe allowlist emptied:** the CI axe run (state matrix incl. popover open, signature with
   errors, debrief reveal card) passes with a zero-entry exception allowlist; serious/critical
   fail the build.
6. **Conformance statement:** public doc stating WCAG 2.2 AA scope, method (automated + manual
   keyboard + NVDA), date, and known N/A rationales — wording feeds the claims matrix (claim
   stays unflipped until EP-38).
7. **Floor-hardware performance:** interactive < 3 s under a throttled 2018-class CPU/network
   profile; initial bundle ≤ 300 KB gz re-verified; committed measurement method + numbers.
8. **windows-nightly e2e wiring:** scheduled workflow running the full Playwright keyboard-only
   e2e suite on windows-latest; failures notify via issue creation; document the I-5 rationale in
   the workflow.
9. Reduced-motion and no-timing-dependence spot re-verification (D-UX-004, D-WF-002 rationale
   documented).

## Out of scope

- Usability (heuristic/think-aloud) work — EP-37.
- Release-time claims flip and screenshots — EP-38.
- Forced-colors as a *gate* — recorded informative (I-10); reconsider post-v1 only.

## Owner checkpoints

none during execution; the conformance statement's outward wording is presented to the owner
with the handoff (new outward claim territory — D-EXEC-003) but is only *published as a claim*
at EP-38.

## Verification / acceptance

- Both browser audit logs committed, dated, all 14 steps passed (re-run after fixes until clean).
- `docs/a11y/exceptions.md` contains zero open A/AA rows *(mechanical: CI check greps for open
  rows)*; axe allowlist file empty; CI green on both OSes.
- Perf numbers committed and under budget; bundle check green.
- Nightly windows e2e workflow exists, has run green at least once (manual dispatch acceptable
  for first run).
- *(judgement — executing session, logged)* audit-log completeness and honesty.

## Handoff

Standard fields + audit log paths, defect list fixed (by surface), perf measurements, nightly
workflow run link/ID, and the draft conformance statement for owner reading.

## Parked → final-roadmap.md

none expected; enhancement-level a11y ideas (beyond AA) are parked (D-RISK-002).
