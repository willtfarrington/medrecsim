# ADR-4 — Package manager: pnpm workspaces, provisioned by Corepack

**Status:** accepted · **Date:** 2026-09-04 (EP-8) · **Implements:** D-ARCH-002/003 (monorepo
workspace on a Windows-native Node LTS toolchain), D-SEC-001/002 and DEPENDENCY-POLICY.md §5
(frozen lockfile, `ignore-scripts`, no unpinned execution) · **Reversibility:** moderate (a
lockfile swap plus CI edits; no code changes).

## Context

The architecture appendix §1 left "pnpm-or-npm workspaces" to this ADR and named pnpm's strict
isolation as a supply-chain criterion (§8). Both candidates satisfy the functional need (a
four-package workspace with one lockfile). The question is which one gives the dependency policy
the most enforcement for free. Build orchestrators (Turborepo, Nx) are rejected by the brief as
unnecessary supply-chain surface.

## Comparison

| Criterion | pnpm 11.25.0 | npm 11 workspaces |
|---|---|---|
| Phantom dependencies | Strict `node_modules` layout: a package can import only what it declares. Import mistakes surface immediately (seen during EP-8: `@eslint/js` and `globals` had to be declared explicitly). | Hoisted layout: any transitive package is importable from anywhere; undeclared imports go unnoticed until a hoisting change breaks them. |
| Lifecycle scripts | Blocked by default since pnpm 10; `allowBuilds: {}` keeps the allow-list explicit and empty. `.npmrc` `ignore-scripts=true` additionally applies. | `ignore-scripts=true` in `.npmrc` only. |
| Publication-age guard | `minimumReleaseAge` (default 1440 min in pnpm 11): a freshly published version — the window in which most registry compromises are caught — cannot be installed for a day. Set explicitly in `pnpm-workspace.yaml`. | No equivalent. |
| Lockfile | `pnpm-lock.yaml` v9, integrity hashes, supported by Dependabot (`package-ecosystem: npm`) and by `actions/dependency-review-action`. | `package-lock.json` v3. |
| Frozen install | `pnpm install --frozen-lockfile` (fails if the lockfile would change). | `npm ci`. |
| Provisioning | Not bundled with Node; provisioned by **Corepack** from the `packageManager` field, which pins the version *and* a SHA-512 of the tarball (`pnpm@11.25.0+sha512.5cde…`). Corepack ships with Node 24. | Bundled with Node. |
| Windows | Verified on the owner's Windows 11 machine (Git Bash and cmd shims); CI runs the windows lane. | n/a |
| Disk / speed | Content-addressable store; the 236-package workspace installs in ~10 s cold. | Comparable at this size. |

## Decision

**pnpm** (11.25.0, exact, hash-pinned in `medrecsim/package.json#packageManager`) with a single
workspace lockfile at `medrecsim/pnpm-lock.yaml`. Provisioned by Corepack (`corepack enable`
once per machine; CI runs `corepack enable` after `actions/setup-node`). No global pnpm install,
no third-party setup action.

Settings (all in `medrecsim/pnpm-workspace.yaml` and `medrecsim/.npmrc`):

- `minimumReleaseAge: 1440` — one-day publication age (pnpm 11 default, stated explicitly).
- `allowBuilds: {}` — no dependency may run install-time scripts; plus `ignore-scripts=true`.
- `engine-strict=true` with `engines.node >=24.14.1 <25` and `.nvmrc` = `24.14.1`.
- `save-exact=true` — direct dependencies are exact in every manifest.

## Consequences

- DEPENDENCY-POLICY.md §5.1 now reads `pnpm install --frozen-lockfile`; §8 records pnpm as a
  tool binary provisioned by Corepack (version + hash in the manifest, so it is not "unpinned
  execution").
- `.github/dependabot.yml`'s npm entry points at `/medrecsim`, where the lockfile lives.
- Pinning a version younger than one day fails the install by design; EP-8 therefore chose
  ESLint 10.9.1 and Vitest 4.1.11 over same-day releases. `minimumReleaseAgeExclude` exists for
  a deliberate exception and would be logged in the handoff that uses it.
- **Corepack revisit trigger:** Node 25 no longer bundles Corepack; when the project's LTS line
  moves past 24 (an R-phase boundary decision), provisioning switches to either the standalone
  Corepack package pinned in the lockfile or a hash-verified pnpm download in CI. Recorded in
  DEPENDENCY-POLICY.md §8.
- Local setup note (Windows): `corepack enable` writes shims next to `node.exe`; when Node is
  installed under *Program Files* that needs elevation, so the documented alternative is
  `corepack enable --install-directory <a user-writable directory on PATH>` (EP-8 used
  `%APPDATA%\npm`). Either way, `corepack pnpm …` works without enabling.
- The workspace root is `medrecsim/` (A-001, I-1); every pnpm command runs from there, and the
  CI workflows set it as the default working directory.

## Evidence at EP-8

Cold install from the committed lockfile on Windows 11 / Node 24.14.1: 236 packages, zero
lifecycle scripts run, `pnpm install --frozen-lockfile` re-run reports "Already up to date".
The full pipeline (`pnpm verify`) passes locally; the CI matrix result is recorded in the EP-8
handoff.
