# medrecsim workspace

Code workspace for medrecsim (see the [repository README](../README.md) for what the project
is). Everything runnable lives here; governance and clinical documents live one level up.
Layout per `roadmap/appendices/architecture.md` §1 and the ADRs in [`../docs/adr/`](../docs/adr/).

```
medrecsim/
├── packages/
│   ├── engine/          @medrecsim/engine — pure, headless simulation engine (no DOM, no clock)
│   ├── schema/          @medrecsim/schema — content types + validators (filled at EP-9)
│   ├── content-tools/   dev-only CLI: validate · coverage · compile · migrate (EP-9/20/34)
│   └── app/             the Svelte 5 + Vite application deployed to GitHub Pages
├── content/
│   ├── formulary/       versioned synthetic formulary (EP-13)
│   └── cases/           hand-authored YAML case bundles (EP-14 onward)
├── tests/
│   ├── golden/          golden-case regression snapshots (EP-12)
│   └── e2e/             Playwright keyboard-only smoke + axe (EP-15/EP-18)
└── scripts/             CI checks: bundle budget, no-network, SPDX, claims, action pins, DCO,
                         third-party notices
```

## Prerequisites

- Node.js **24.14.1** (LTS; pinned in `.nvmrc` and `engines`). Windows-native; no WSL or
  containers are needed.
- pnpm, provisioned by Corepack from the hash-pinned `packageManager` field — no global
  install: run `corepack enable` once, or prefix commands with `corepack pnpm`.

## Commands (run inside `medrecsim/`)

| Command                          | What it does                                                            |
| -------------------------------- | ----------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Install exactly the lockfile (install scripts are disabled)             |
| `pnpm dev`                       | Vite dev server for the app                                             |
| `pnpm build`                     | Production build → `packages/app/dist`                                  |
| `pnpm lint` / `pnpm format`      | ESLint / Prettier                                                       |
| `pnpm typecheck`                 | `tsc` per package, `svelte-check` for the app                           |
| `pnpm test`                      | Vitest (unit + property tests, component tests)                         |
| `pnpm checks`                    | Post-build checks: bundle budget, no-network, SPDX, claims, action pins |
| `pnpm verify`                    | Everything CI runs, in CI order                                         |
| `pnpm notices`                   | Regenerate `../THIRD-PARTY.md` from the lockfile                        |
| `pnpm content <command>`         | Content CLI (placeholders until EP-9)                                   |

CI (`.github/workflows/ci.yml`) runs the same steps on Ubuntu and Windows; `pages.yml` deploys
`main` to GitHub Pages only after that workflow succeeds.

## Licensing

`packages/**`, `scripts/**`, and `tests/**` are code (MIT). `content/**` is content
(CC BY 4.0). Every source file carries an SPDX header; `pnpm check:spdx` enforces it.
