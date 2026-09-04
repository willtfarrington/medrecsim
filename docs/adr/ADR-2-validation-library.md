# ADR-2 — Validation library: Zod 4 as source of truth, JSON Schema exported for editors

**Status:** accepted · **Date:** 2026-09-04 (EP-8) · **Decides:** D-DATA-003 ("Zod-or-JSON-Schema,
same ADR as D-ARCH-004") · **Integrator resolution applied:** I-3 (hybrid is an acceptable
outcome) · **Reversibility:** moderate until EP-9 freezes schema v0; costly afterwards.

## Context

D-DATA-003 requires schema validation plus custom invariant validators for the charter's
semantics, all in CI. The two candidates were Zod 4 (TypeScript-first, types inferred from the
schema) and hand-written JSON Schema validated by Ajv 8 (editor autocomplete through
`yaml-language-server`, the standard `$schema` mechanism). Runtime weight is moot because content
is compiled at build time (ADR-3). The deciding axis named in the architecture appendix §8 was
therefore **TypeScript type inference versus editor autocomplete** — and whether one library can
provide both without drift (spike SP-5).

## Spike SP-5 — `z.toJSONSchema` fidelity and editor autocomplete

**Method.** A claim-shaped Zod 4.5.4 schema was written to the architecture appendix §3 outline:
a discriminated union on `claimKind` (`medication` | `allergy`), the D-MED-001 status vocabulary
as an enum, D-MED-002 dual ISO-8601 timestamps (`z.iso.datetime({ offset: true })`), regex-shaped
ids, optional fields, `.describe()` documentation, `.strict()` objects, and a document wrapper
with `schemaVersion` and a non-empty `claims` array. A cross-field refinement
(`documentationTime >= eventTime`, i.e. INV-TIME-001) was added to observe export behaviour.

*Part A — fidelity.* The schema was exported with `z.toJSONSchema(schema, { target, io: 'input' })`
for `draft-7` and `draft-2020-12`, then compiled by Ajv 8.20.0 (+ `ajv-formats` 3.0.1 for
`date-time`). Ten fixtures were validated by both Zod and Ajv.

| Fixture | Zod | Ajv (exported draft-7) | Agree |
|---|---|---|---|
| valid medication claim | accept | accept | ✔ |
| valid allergy claim | accept | accept | ✔ |
| wrong enum value (`claimStatus: taking`) | reject | reject | ✔ |
| missing required (`documentationTime`) | reject | reject | ✔ |
| extra property (strict object) | reject | reject | ✔ |
| bad date-time (`10/01/2026`) | reject | reject | ✔ |
| id not matching the regex | reject | reject | ✔ |
| empty `claims` array | reject | reject | ✔ |
| unknown discriminator (`claimKind: lab`) | reject | reject | ✔ |
| `schemaVersion` not `major.minor` | reject | reject | ✔ |

Export of the discriminated union, enums, regex patterns, `format: date-time`, `minItems`,
`additionalProperties: false`, and descriptions succeeded for both targets. **The refinement was
silently dropped on export, even with `unrepresentable: 'throw'`** (Zod 4.5.4 treats refinements
as non-representable metadata rather than an error). This is the one documented fidelity gap.

*Part B — autocomplete.* `yaml-language-server` 1.24.0 was driven over its stdio LSP interface
(initialize → didOpen a YAML document carrying the
`# yaml-language-server: $schema=<file-url>` modeline → completion and diagnostics requests).
Results:

- Property completion inside a `medication` claim returned the schema's property names
  (`sourceId`, `eventTime`, `documentationTime`, `asStatedText`, `formularyId`,
  `unresolvedLabelText`, `howTakingDifferently`, `dose`, `route`, `frequency`, `formulation`)
  plus the server's generic `object` snippet — **working autocomplete**.
- Value completion after `claimStatus:` returned exactly the eleven D-MED-001 tokens.
- Diagnostics flagged the invalid enum value ("Value is not accepted. Valid values: …") and
  each missing required property.

Exit criterion "working autocomplete demo or documented failure": **working demo**.

## Decision

**Zod 4 is the single source of truth** for every content schema in `@medrecsim/schema`
(types are inferred from it; the validator CLI and the engine consume it). **A JSON Schema
(draft-07) is exported from it with `z.toJSONSchema`**, committed beside the package, and used
only for editor support (`$schema` modelines / workspace mapping for `yaml-language-server`).
This is the I-3 hybrid: one schema library, one generated artifact, no hand-maintained
duplicate. Hand-written JSON Schema + Ajv is rejected because it forfeits type inference and
would have to be kept in sync with the TypeScript types by hand.

## Consequences

- **Refinements never carry semantics alone.** Every cross-field or cross-file rule lives in
  the invariant validators (INV-TIME-001 and the rest of D-DATA-003's catalogue), which is where
  the architecture already puts them. Refinements on Zod schemas are allowed only as a
  convenience mirror of an invariant, never as the only check. EP-9 records this in the schema
  package README.
- EP-9 commits the exported JSON Schema files and adds a CI drift check (regenerate and diff)
  so the editor artifact cannot lag the Zod source.
- EP-9 chooses between the modeline and a shared workspace mapping
  (`.vscode/settings.shared.json` is already un-ignored by EP-0's `.gitignore` for that purpose).
- Zod enters the workspace at EP-9 as a **build/dev dependency** of `packages/schema` and
  `packages/content-tools` (it is not installed at EP-8; the spike used a scratch install).
  Whether the runtime bundle validates compiled JSON or the
  localStorage envelope with Zod (or `zod/mini`) is decided at EP-9/EP-11 as a runtime-allowlist
  addition — owner-only under D-EXEC-003 — with its gzipped contribution measured.
- Ajv and `ajv-formats` were spike instruments only and are **not** dependencies of the
  workspace.

## Reverified version facts (2026-09-04, npm registry)

Zod 4.5.4 (MIT) · Ajv 8.20.0 · `ajv-formats` 3.0.1 · `yaml-language-server` 1.24.0 · `yaml`
2.9.0. Planning-time facts (2026-08-23) named Zod 4.x and Ajv 8.20.0 — unchanged in substance.
