# Architecture decision records

Written at EP-8 per the frames in
[roadmap/appendices/architecture.md](../../roadmap/appendices/architecture.md) §8. Each record
carries its status, date, the ledger decision it implements or discharges, its measured
evidence (spikes SP-4 and SP-5 ran inside EP-8), and a reversibility note. Reversing a record
means a new dated record that supersedes it; the old one is kept and marked superseded.
Decisions listed in `DECISIONS.md` are the owner's and are never changed here.

| ADR | Decision | Frame discharged |
|---|---|---|
| [ADR-1](ADR-1-ui-framework.md) | **Svelte 5** over React 19 (SP-4: 13.9 KB vs 60.0 KB gz initial JS; 641 ms vs 774 ms throttled render) | D-ARCH-004 |
| [ADR-2](ADR-2-validation-library.md) | **Zod 4 as source of truth + exported JSON Schema** for editor autocomplete (SP-5: working `yaml-language-server` demo; 10/10 fixture agreement with Ajv) | D-DATA-003, I-3 |
| [ADR-3](ADR-3-build-time-content-compile.md) | **Build-time content compile**; the runtime never parses YAML | D-GOV-003, D-ARCH-007, D-DATA-005 |
| [ADR-4](ADR-4-package-manager.md) | **pnpm workspaces**, provisioned by Corepack, hash-pinned | D-ARCH-002/003, D-SEC-002 |
| [ADR-5](ADR-5-no-ui-state-library.md) | **No UI state library**; the engine owns state | D-ARCH-006, D-ARCH-005 |
| [ADR-6](ADR-6-property-test-library.md) | **fast-check** for property tests | D-QA-001 |
| [ADR-7](ADR-7-content-schema-v0.md) | **Content schema v0.1** — the six schema tensions (T-1 relative time compiled absolute · T-2 sanctioned unresolved-label flag · T-3 claim as reveal atom · T-4 DNF detectability paths · T-5 per-case rationale menus · T-6 hints in the reference layer, all three grades per target) and the D-MED-001 vocabulary adopted verbatim (EP-9, 2026-09-04) | D-MED-001/005, D-DATA-002/003/004, I-6, I-9 |
| [ADR-8](ADR-8-visual-identity.md) | **Visual identity**: CSS custom-property tokens with a contrast test as the contract; two self-hosted OFL variable fonts (Atkinson Hyperlegible Next, Caveat) subset to Latin; composition divergences recorded in docs/ORIGINALITY-CHECKLIST.md (EP-10, 2026-09-04) | D-UX-001/002/004/006, D-ARCH-001, SP-8, SP-9 |
| [ADR-9](ADR-9-engine-core.md) | **Engine core**: event-sourced session over a thirteen-action learner log; integer simulated clock with no `Date`; compile-time case-local offset for escalation windows; earned, recorded visibility; the engine core as an evidence-only TypeScript project with a layer fixture; the rationale menu as the one sanctioned crossing; the D-MED-002 fence (structural + typed error + property); five-field persistence envelope with discard-on-mismatch; the seam as landed with fail-closed EP-12 stubs; the determinism lint made real (EP-11, 2026-09-04) | D-ARCH-005/006, D-WF-002, D-SIM-001, D-MED-002/004/005, D-CLIN-002, D-DATA-002, I-4, OQ-6 |
