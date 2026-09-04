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
