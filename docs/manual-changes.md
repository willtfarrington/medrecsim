# medrecsim — changes since the last phase's close

Since the file's creation (2026-11-25), before the first manual. Each brief that changes what a
user sees or does adds its section; EP-19a folds them into the first manual
([manual.md](manual.md)) and empties this file, and after it each re-plan checkpoint does the
same.

## EP-11b — Node 26 and pnpm without Corepack (2026-11-27)

For the manual's "Install and start" (running the app from a clone): the toolchain is now Node
26.13.1, the version in `medrecsim/.nvmrc`, and an install on another Node line stops with an
"Unsupported engine" error. pnpm no longer comes from `corepack enable`, which Node 26 lacks.
From `medrecsim/`, run `node scripts/provision-pnpm.mjs` once per machine, and again when the
pinned pnpm changes: it downloads pnpm 11.25.0, checks it against the SHA-512 pinned in
`package.json`, installs it and confirms that `pnpm --version` answers 11.25.0. pnpm refuses to
run at any other version and names the one it expects. On a machine where Corepack was once
enabled, its old `pnpm` and `pnpx` files may still sit in npm's global folder (on Windows
`%APPDATA%\npm`); npm then stops with `EEXIST` and names the file, and the script asks for
those files to be removed before it runs again. `pnpm install --frozen-lockfile`, `pnpm verify`
and `pnpm dev` work as before.
