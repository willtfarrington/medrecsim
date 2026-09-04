# EP-9 handoff — Content schema v0 + validator core

**Status:** complete — all five owner decisions ruled 2026-09-04 (see "Owner decisions");
hosted CI read-back recorded below · **Date:** 2026-09-04 · **Brief:** roadmap/EP-9-schema.md ·
**Commits:** `19a8471` (schema, validator, fixtures, scaffold, docs, CI wiring, handoff draft),
plus the done-hash commit (roadmap Done column, this header, CI read-back).

## Completed scope IDs

All eight in-scope items; the pre-declared split point after item 3 was not needed.

1. **`@medrecsim/schema` v0.1** — Zod 4 schemas (ADR-2) for `case.yaml`, `evidence.yaml`,
   `reference.yaml`, `citations.yaml`, `review-record.yaml` (REVIEW-RECORD-TEMPLATE.md §1
   verbatim), the formulary package (manifest + per-entry files) and the fictional-universe
   registry (I-9); `SCHEMA_VERSION = "0.1"` with the D-DATA-002 stamp rule; the D-MED-001 status
   vocabulary (eleven tokens verbatim); allergy claims as a discriminated union on `claimKind`
   (D-MED-003); the seven D-WF-001 source types; the four escalation channels with the OQ-3
   token `outpatient-prescriber-program-office`; taxonomy enums imported verbatim from
   TAXONOMY.md §8 and **proven verbatim by a test that parses the document** (`vocab/taxonomy.test.ts`);
   `renderText` and `pillAppearanceText` required (INV-A11Y-001 fields exist); the
   ten-key citation record encoded exactly (CITATION-POLICY.md §1).
2. **Six schema tensions decided and logged** — ADR-7 (`docs/adr/ADR-7-content-schema-v0.md`),
   summarized below.
3. **Two-layer contract at the type level** — `src/evidence/` + `src/common/` + `src/vocab/` +
   `src/version.ts` compile in a *composite* TypeScript project (`tsconfig.evidence.json`, no
   Node types) whose file list excludes `src/reference/`; any import across the line is TS6307.
   **Compile-error fixture:** `packages/schema/layer-fixtures/evidence-imports-reference.ts`
   compiled through `tsconfig.layer-fixture.json` must fail with TS6307 naming a
   `src/reference/` file; `scripts/check-layer-separation.mjs` asserts both halves and runs in
   `pnpm checks` and CI. An ESLint boundary block gives the same message in the editor.
4. **`validate` CLI** (`packages/content-tools`): `validate [--all] [<dir>…] [--format
   pretty|json|github]`, exit 1 on any error, line-numbered findings (GitHub annotations from
   the YAML CST), plus `fixtures`, `compile [--out] [--include-drafts]`, and
   `schema-export [--check]`. Invariants shipped: **INV-TIME-001, INV-REF-001, INV-TRUTH-001,
   INV-DISC-001, INV-ACT-001 (with the harm-language lint: probability-token denylist,
   numbers-require-citation, explicit `inevitabilityAuthored`), INV-META-001, INV-VERS-001**,
   the W4 cross-hooks **INV-CIT-001 (warn-level), INV-SPDX-001, INV-REG-001** (registry row in
   `source material/REGISTRY.md` *and* CITATION-POLICY.md §7 per citation `source` key), the
   partial **INV-SCOPE-001** (real-brand denylist, synthetic-notice literal, synthetic chart id),
   and a package-local **INV-SHAPE-001** (unique ids, dangling-id, field co-requirements).
   Schema-shape errors are *attributed* to the owning invariant so fixtures fail by name.
5. **Negative fixtures** — 33 fixtures under `tests/synthetic-fixtures/negative/` (each a
   `# SYNTHETIC`-headed mutation spec applied to an in-memory copy of the exemplar) plus the
   unmodified exemplar as positive control; ≥1 per shipped invariant (a Vitest test asserts
   the coverage) and one for the A11Y field-presence check; CI runs them by name.
6. **Authoring doc + exemplar scaffold** — `content/AUTHORING.md` (schema-derived field guide,
   conventions, lint rules, deferred invariants) and `content/cases/_exemplar/` (seven files,
   structure complete, every clinical string `PLACEHOLDER — not reviewed`, `reviewStatus:
   draft-unreviewed`), with scaffold formulary (`content/formulary/`, two `placeholder: true`
   entries) and universe (`content/universe/universe.yaml`, three placeholder institutions).
7. **`compile` step** (ADR-3) — validates, then writes `index.json`, `formulary.json`,
   `universe.json`, `cases/<id>.json` to `packages/app/src/content/generated/` (gitignored);
   relative SimTimes resolved to absolute UTC instants (T-1); drafts and placeholders skipped
   unless `--include-drafts`.
8. **CI wiring** — `ci.yml` stage 5 now runs `content:validate --format github`,
   `content:fixtures --format github`, `schema:check`, `content:compile` before the build on
   both OSes; the layer-separation check joins stage 8. `pnpm verify` mirrors CI order.

## Tensions T-1…T-6 (decided; ADR-7 has the full text)

| | Decision | Rationale |
|---|---|---|
| T-1 | Author relative (`T0-2y`, `T0-3d-4h`, `T0+20m`; absolute ISO allowed), compile absolute UTC | Authors think in offsets; the engine and timeline need instants; one pure resolver serves both. |
| T-2 | Sanctioned escape ratified: `formularyId` xor `unresolvedLabel{text, sanctioned: true, reason∈4}` | D-DATA-004 holds where the formulary can name; "the little white pill" must be authorable but countable. |
| T-3 | Claim is the reveal atom; `visibility: with-source \| on-reveal`; no partial fields | Timeline triple is per claim; partial reveals have no v1 consumer; additive later (P-004). |
| T-4 | DNF: `detectabilityPaths[]` OR of `{detectability, requires[]}` AND-paths over `kind:id` refs | Plainest encoding for authors and for EP-20's reachability walk. |
| T-5 | Per-case `rationaleMenu[]`; entries carry `rationaleKey` or inline `rationaleText` | Bundle-scoped versioning and sign-off; shared registry parked (P-005). |
| T-6 | Reference layer (I-6), one `hints[]` record per target with `nudge`/`directed`/`revealSource{sourceRef}` | Hints name discrepancy ids the evidence layer may not hold; makes INV-HINT-001 a shape check. |

Claim-status vocabulary: the eleven D-MED-001 tokens adopted verbatim with operational
meanings in AUTHORING.md §4; `taking-differently ⇒ howTakingDifferently` (INV-SHAPE-001);
actual-use status = the set minus `unknown-to-source`. No tension decision changed clinical
semantics; none required a pause.

## Exact enum list imported from EP-7 (spelling-frozen; TAXONOMY.md §8, v1.0)

- **type (13):** `omission` `commission` `wrong-dose` `wrong-frequency-schedule` `wrong-route`
  `wrong-formulation` `wrong-strength-concentration` `therapeutic-duplication`
  `brand-generic-duplication` `wrong-drug-lasa` `restart-gap` `status-discrepancy`
  `allergy-record-discrepancy`
- **mechanism (14, flattened; strata kept as a documentation map):** `stale-record-propagation`
  `transcription-error` `lasa-confusion` `transition-communication-gap` `data-fragmentation`
  `auto-population-default-error` · `prescriber-change-undocumented` `hold-not-documented` ·
  `cost-access-barrier` `supply-interruption` `regimen-complexity-misunderstanding`
  `informed-self-adjustment` `language-access-barrier` · `informant-knowledge-limit`
- **detectability (7):** `single-source-explicit` `cross-source-conflict` `interview-elicited`
  `artifact-dependent` `escalation-dependent` `longitudinal-inference` `irreducible`
- **urgency:** `U1` `U2` `U3` `U4` · **severity:** `S0` `S1` `S2` `S3` `S4` ·
  **reversibility:** `self-limiting` `reversible-with-treatment` `irreversible` ·
  **timeToHarm:** `immediate` `hours-to-a-day` `days` `weeks-plus`

Field names chosen (EP-7 left them open): `type`, `mechanism` (+ optional
`secondaryMechanisms[]`), `detectabilityPaths[]`, `urgency`, `severity`, `reversibility`,
`timeToHarm`. Phenotype declarations use `P1`…`P10`.

## Invariants remaining for EP-20

INV-TIME-002 (post-T0 immutability — engine-side too), INV-TIME-003 (timeline satisfiability),
INV-REF-002 (LASA bidirectionality), INV-DISC-002 (path reachability; EP-9 checks only that every
referenced id exists), INV-DISC-003 (knowable ⇒ detectable; irreducible ⇒ unable-to-verify in
the accepted set), INV-ACT-002 (winnability), INV-CIT-001 strict, INV-HINT-001 (shape already
forces three grades), INV-SCOPE-001 full (no free-text learner fields), INV-A11Y-001 strict
(fields already required), and the `coverage` CLI.

## OQ-3 assumption restated

The four escalation-channel tokens are `community-pharmacy`,
`outpatient-prescriber-program-office`, `inpatient-pharmacist`, `senior-attending`; the second
follows the OQ-3 relabel ("outpatient prescriber/program office"). If the owner ever rules
otherwise it is a one-token rename plus a re-stamp.

## Changed files

**New:** `docs/adr/ADR-7-content-schema-v0.md`; `docs/handoffs/EP-9.md`; `.vscode/settings.shared.json`,
`.vscode/extensions.json` (un-ignored by EP-0 for exactly this); `medrecsim/content/AUTHORING.md`;
`medrecsim/content/cases/_exemplar/` (7 files); `medrecsim/content/formulary/{formulary.yaml,
citations.yaml, entries/rx-placeholder-{alpha,beta}.yaml}`; `medrecsim/content/universe/{universe.yaml,
README.md}`; `medrecsim/packages/schema/{src/** (37 files incl. 5 test files), json-schema/ (9
generated files), layer-fixtures/, tsconfig.evidence.json, tsconfig.layer-fixture.json,
vitest.config.ts, README.md}`; `medrecsim/packages/content-tools/src/{workspace,load,report,context}.ts`,
`commands/{validate,fixtures,compile,schema-export}.ts`, `cli.test.ts`, `vitest.config.ts`;
`medrecsim/scripts/check-layer-separation.mjs`; `medrecsim/tests/synthetic-fixtures/` (README + 33
fixtures).

**Modified:** `.github/workflows/ci.yml` (stage 5 + layer check), `.gitignore` (compiled
content), `CHANGELOG.md` (Unreleased intro, one Added bullet, Content note),
`docs/DEPENDENCY-POLICY.md` (status line; §4 rows for `zod`, `yaml`, `@types/node` scope),
`docs/adr/README.md` (ADR-7 row), `roadmap/final-roadmap.md` (P-003…P-005),
`medrecsim/{package.json, .prettierignore, eslint.config.js, vitest.config.ts, README.md,
pnpm-lock.yaml}`, `medrecsim/packages/schema/{package.json, tsconfig.json, src/index.ts}`,
`medrecsim/packages/content-tools/{package.json, src/cli.ts}`, `medrecsim/content/{cases,formulary}/README.md`.

Untouched by design: `DECISIONS.md`, `docs/CLAIMS.md`, `docs/clinical/**`, the roadmap briefs,
`README.md` (repo root), `THIRD-PARTY.md` (production closure unchanged: `pnpm notices --check`
current).

## Verification results (2026-09-04 — Windows 11, Node 24.14.1, pnpm 11.25.0)

| Check | Result |
|---|---|
| `pnpm install` | `zod` 4.5.4 (MIT) and `yaml` 2.9.0 (ISC) added; both older than `minimumReleaseAge`; 0 lifecycle scripts; lockfile passes supply-chain policies ✔ |
| `pnpm lint` (incl. new `medrecsim/schema-layer-boundary` block; `zod`/`yaml` refused in app and engine) | clean ✔ |
| `pnpm format:check` | clean ✔ |
| `pnpm typecheck` (schema main + evidence-only composite project; content-tools; engine; svelte-check) | 0 errors ✔ |
| `pnpm test` | 8 files, 44 tests passed: taxonomy-verbatim (parses TAXONOMY.md §8), SimTime, harm-language lint, attribution, citation/registry/SPDX/scope helpers, JSON-Schema export, CLI end-to-end (validate/fixtures/schema-check/compile/process exit codes) ✔ |
| `pnpm content:validate` | 3 bundles (formulary, universe, `_exemplar`), **0 errors**, 6 warnings (draft-unreviewed; placeholder entries and institutions) ✔ |
| `pnpm content:fixtures` | positive control clean; **33/33 negative fixtures rejected by their named invariant** (INV-TIME-001 ×2, REF-001 ×3, TRUTH-001 ×2, DISC-001 ×4, ACT-001 ×7, META-001 ×4, VERS-001 ×2, CIT-001 ×2 incl. one warn-level, SPDX-001, REG-001, SCOPE-001, SHAPE-001 ×3, A11Y-001) ✔ |
| Harm-language lint acceptance | fixture `act-001-probability-token` ("30% chance") and `act-001-uncited-number` ("48 hours", no citation) both rejected by INV-ACT-001; `act-001-inevitability-unflagged` ("will cause") rejected ✔. The lint also caught a meta-comment in my own exemplar draft ("no probabilities") — fixed by rewording, i.e. it bites. |
| `pnpm schema:check` | 9 generated files current ✔ |
| `pnpm content:compile` | 0 case chunks (the scaffold is a draft), formulary + universe + index written; `--include-drafts` compiles the exemplar with all times as absolute `…Z` instants ✔ |
| `pnpm build` + `pnpm checks` | bundle 10,780 B gz = 3.5 % (unchanged — nothing new is bundled); no-network, SPDX (126 files), claims, action pins, **layer separation** (evidence project compiles; fixture fails with TS6307) ✔ |
| `pnpm verify` (CI order, incl. `content:ci`) | green ✔ |
| Leak screen over new/modified files (paths, usernames, e-mail, AppData, `.local/`) | 0 hits beyond the pre-existing `.gitignore` line, CHANGELOG mentions and the public GitHub URL ✔ |
| Pre-commit tripwire patterns (SSN/MRN/DOB-like; mimic/physionet in data-like files) over new files | 0 hits; every file under `synthetic-fixtures/` starts with `# SYNTHETIC` ✔ |
| EOL / BOM | no CRLF, no BOM in new files ✔ |

### Post-push (2026-09-04, hosted runners; `gh` read-backs)

| Item | Evidence |
|---|---|
| **CI green on both OSes on `main`** for `19a8471` | Pages run **33921781430**: `ci / build-test (ubuntu-latest)` success · `ci / build-test (windows-latest)` success · `deploy` success (`dco` and `dependency-review` skipped by design on push events) ✔ |
| **Content stage ran on both lanes** | Steps "Content validate (schema + core invariants, D-DATA-003)", "Content negative fixtures (each invariant rejects by name)", "JSON Schema export is current (ADR-2 drift check)", "Content compile (YAML → JSON chunks, ADR-3)" and "Layer separation (evidence types cannot reach the reference layer, D-MED-005)" all `success` on ubuntu and windows (job step read-back) ✔ |
| **Pages** | Redeployed the unchanged hello-world; no compiled content is imported by the app yet (EP-15/16) ✔ |

## Owner decisions (presented interactively 2026-09-04; outcomes recorded)

1. **Claim-status vocabulary** — adopt the eleven D-MED-001 tokens verbatim at schema 0.1 with
   operational (non-clinical) meanings in AUTHORING.md §4, deferring any AHRQ/ISMP-informed
   rewording to the EP-14 review. Options: adopt verbatim now (recommended); hold and refine
   first. **Owner ruling: adopt verbatim now.** Recorded in ADR-7.
2. **Numbers-require-citation scope** — INV-ACT-001 rejects *any digit* in reference-layer
   teaching text (rationale menu items, inline rationales, shortfalls, mechanisms of harm,
   resolution expectations, escalation reasons, teaching summaries, formulary monitoring notes)
   unless the carrying entry cites; dose strings count; hints are exempt. Options: keep strict
   (recommended); exempt dose strings; downgrade to warning. **Owner ruling: keep strict.**
   Recorded in AUTHORING.md §2 and `invariants/harm-language.ts`.
3. **Shared editor files** at the repository root (`.vscode/settings.shared.json` YAML-schema
   mapping; `.vscode/extensions.json`), the two paths EP-0 un-ignored. Options: keep both
   (recommended); keep settings only; drop both. **Owner ruling: keep both.**
4. **Outward-text edits** (CHANGELOG Unreleased intro, Added bullet and Content note;
   `medrecsim/README.md`; DEPENDENCY-POLICY status line and §4 rows). Options: keep all
   (recommended); keep all except CHANGELOG; revert all. **Owner ruling: keep all.** No new
   outward claim; copy rule and disclaimer check pass.
5. **Commit and push to `main`** (two-commit pattern; no AI co-author trailer). Options: commit
   and push (recommended); commit locally only; hold. **Owner ruling: commit and push.** Hashes
   in the header once made; hosted CI read-back below.

## Decisions logged (reversible technical, D-EXEC-003)

- **`zod` declared as a `dependency` of the private `@medrecsim/schema` package** (not a
  devDependency) because the package cannot function without it; the runtime allowlist (§3) is
  unchanged and ESLint refuses the import from `packages/app` and `packages/engine`. Any future
  runtime validation with Zod is an owner allowlist decision (ADR-2 consequence).
- **Layer boundary by composite-project file list** (TS6307) rather than `rootDir` (TS6059) or a
  separate npm package: zero new packages, and the evidence project doubles as a "no Node types"
  guarantee for the learner-observable layer.
- **Schema-error attribution table** (`invariants/attribution.ts`): shape failures name the
  invariant that owns the rule; unclaimed failures report as `SCHEMA`.
- **Package-local invariant ids** `INV-SHAPE-001`, `INV-SPDX-001`, `INV-REG-001` beside the
  17-entry catalogue.
- **Negative fixtures as mutation specs** over the exemplar (not 33 copied bundles): each
  fixture is one small `# SYNTHETIC` YAML file; the runner overlays and validates in memory.
- **SPDX expectation by path**: `CC-BY-4.0` under `content/`, `MIT` elsewhere (mirrors
  `scripts/check-spdx.mjs`); fixtures under `tests/` carry MIT.
- **Dialogue trees inside `evidence.yaml`** (no separate `dialogue.yaml` at 0.1).
- **`reviewStatus` field** on `case.yaml`; drafts warn and are excluded from `compile` (also any
  directory starting with `_`); `--include-drafts` for local development.
- **Compiled output** at `packages/app/src/content/generated/` (gitignored, prettier-ignored);
  the app does not import it yet (EP-15/16). Compile runs in CI so a malformed bundle fails
  before the build (ADR-3).
- **Exported JSON Schema** committed under `packages/schema/json-schema/` (prettier-ignored,
  drift-checked byte-for-byte); editor binding via the shared workspace mapping rather than
  per-file modelines (keeps content YAML clean).
- **Real-brand denylist** seeded with ~80 US brand names for the roster's drug classes
  (`vocab/brand-denylist.ts`); extending it is a technical change.
- **Harm-language token lists** (`invariants/harm-language.ts`) follow the EP-7 lint precedent
  with additions ("x-fold", "one in N", "relative/absolute risk", "incidence", "prevalence");
  "risk of" deliberately not denied (ordinary plausible-consequence phrasing).
- **Citation records for the scaffold** copy bibliographic fields from CITATION-POLICY.md §7 and
  say so in `notes`; their `claim` text is a placeholder and was not verified.
- **`@types/node` added to the schema package** for its tests only; the evidence project
  compiles with `types: []`.

## Risks / notes for the next session

- **YAML colon trap:** any string containing `: ` must be quoted or YAML reads a mapping; the
  scaffold's objectives hit this. AUTHORING.md §2 records it; the validator reports it as a
  schema error at the right line.
- **Numbers-require-citation is strict** (decision 2): EP-14 will feel it first; if doses in
  rationale menus become painful, the reversible fix is a citation on the menu item or an
  owner-approved exemption pattern.
- **INV-DISC-002 reachability is not yet checked** — a detectability path can name an evidence
  unit that exists but cannot be reached in play. EP-20.
- **`compile` writes into the app's source tree** (gitignored). If EP-15 prefers a different
  import location, move `compiledDir` in `workspace.ts`.
- **Placeholder formulary entries** are excluded from `formulary.json`; EP-13 replaces them and
  bumps `formularyVersion` to 0.1.0 (the exemplar's range `min: 0.0.1, maxExclusive: 1.0.0`
  still fits).
- **Universe names are placeholders** until EP-10; the exemplar references them by id.
- **`REFERENCE_ID_PREFIXES` scan is prefix-based** (`disc-`, `use-`, …); an evidence source id
  like `src-discount-pharmacy` is safe, but prose in evidence must not quote reference ids.
- **Vitest for content-tools spawns the CLI** (one test); ~2 s locally.

## Parked → final-roadmap.md

P-003 claims-feed source types (B-1), P-004 partial-field claim reveals (T-3), P-005 shared
rationale-menu registry (T-5) — noted as comments in the schema, never implemented.

## Next eligible EPs

**EP-10** (visual identity; depends on EP-3 + EP-8) and, once this packet is committed,
**EP-11** (engine core), **EP-13** (formulary wave 1), **EP-16** (chart surfaces; also needs
EP-15) and **EP-20** (coverage tool + full invariant suite) become eligible. EP-11 inherits the
compiled-JSON contract (`index.json` + `cases/<id>.json`, absolute times); EP-13 inherits
`FormularyEntry` and the brand denylist; EP-20 inherits the invariant interface
(`CaseInvariant`), the attribution table, and the fixture runner.
