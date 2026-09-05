# medrecsim workspace

Code workspace for medrecsim (see the [repository README](../README.md) for what the project
is). Everything runnable lives here; governance and clinical documents live one level up.
Layout per `roadmap/appendices/architecture.md` §1 and the ADRs in [`../docs/adr/`](../docs/adr/).

```
medrecsim/
├── packages/
│   ├── engine/          @medrecsim/engine — pure, headless simulation engine (no DOM, no clock):
│   │                    src/core (state, reducer, clock, dialogue, escalation, workspace,
│   │                    projection, persistence — evidence-only TS project), case-loader,
│   │                    session seam (EP-11); scoring/signature/debrief at EP-12
│   ├── schema/          @medrecsim/schema — Zod 4 content schema v0.1, types, invariant suite,
│   │                    exported JSON Schema (EP-9)
│   ├── content-tools/   dev-only CLI: validate · fixtures · compile · schema-export (EP-9);
│   │                    coverage (EP-20) · migrate (EP-34)
│   └── app/             the Svelte 5 + Vite application deployed to GitHub Pages;
│                        src/styles (design tokens, fonts), src/assets/fonts (vendored OFL
│                        faces), src/identity (banner/badge helpers) — EP-10
├── content/             CC BY 4.0; field guide in content/AUTHORING.md
│   ├── formulary/       versioned synthetic formulary package (scaffold; wave 1 at EP-13)
│   ├── universe/        fictional-universe registry (I-9; names coined and screened at EP-10)
│   └── cases/           hand-authored YAML case bundles (_exemplar scaffold; C01 at EP-14)
├── tests/
│   ├── synthetic-fixtures/  negative fixtures for the content validator (EP-9)
│   ├── golden/          golden-case regression snapshots (EP-12)
│   └── e2e/             Playwright keyboard-only smoke + axe (EP-15/EP-18)
└── scripts/             CI checks: bundle budget, no-network, SPDX, asset hygiene, claims, action
                         pins, layer separation, DCO, third-party notices
```

## Prerequisites

- Node.js **24.14.1** (LTS; pinned in `.nvmrc` and `engines`). Windows-native; no WSL or
  containers are needed.
- pnpm, provisioned by Corepack from the hash-pinned `packageManager` field — no global
  install: run `corepack enable` once, or prefix commands with `corepack pnpm`.

## Commands (run inside `medrecsim/`)

| Command                               | What it does                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`      | Install exactly the lockfile (install scripts are disabled)                                    |
| `pnpm dev`                            | Vite dev server for the app                                                                    |
| `pnpm build`                          | Production build → `packages/app/dist`                                                         |
| `pnpm lint` / `pnpm format`           | ESLint / Prettier                                                                              |
| `pnpm typecheck`                      | `tsc` per package, `svelte-check` for the app                                                  |
| `pnpm test`                           | Vitest (unit + property tests, component tests)                                                |
| `pnpm checks`                         | Post-build checks: bundle budget, no-network, SPDX, asset hygiene, claims, action pins, layers |
| `pnpm check:layers`                   | Layer separation: schema and engine evidence-only projects compile; the fixtures fail (TS6307) |
| `pnpm content:ci`                     | Content stage: validate --all · negative fixtures · schema drift · compile                     |
| `pnpm content:validate`               | Validate every bundle + formulary + universe (`--format pretty\|json\|github`)                 |
| `pnpm content:fixtures`               | Run the negative-fixture suite (each invariant must reject by name)                            |
| `pnpm content:compile`                | YAML → JSON chunks into `packages/app/src/content/generated/` (gitignored; `--include-drafts`) |
| `pnpm schema:export` / `schema:check` | Regenerate / drift-check `packages/schema/json-schema/` from the Zod source                    |
| `pnpm check:assets`                   | Asset hygiene: images/SVGs carry no EXIF or editor metadata (`pnpm content assets --fix`)      |
| `pnpm verify`                         | Everything CI runs, in CI order                                                                |
| `pnpm notices`                        | Regenerate `../THIRD-PARTY.md` from the lockfile                                               |
| `pnpm content <command>`              | Content CLI (`coverage` at EP-20, `migrate` at EP-34)                                          |

CI (`.github/workflows/ci.yml`) runs the same steps on Ubuntu and Windows; `pages.yml` deploys
`main` to GitHub Pages only after that workflow succeeds.

## Licensing

`packages/**`, `scripts/**`, and `tests/**` are code (MIT). `content/**` is content
(CC BY 4.0). Every source file carries an SPDX header; `pnpm check:spdx` enforces it.
