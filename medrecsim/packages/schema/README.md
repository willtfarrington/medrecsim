# @medrecsim/schema

Content schema **v0.1** (EP-9): Zod 4 schemas as the single source of truth (ADR-2), inferred
TypeScript types, an exported draft-07 JSON Schema for editors, the taxonomy and status
vocabularies, and the core invariant validators (D-DATA-003).

```
src/
├── version.ts        SCHEMA_VERSION = "0.1" (+ instrument versions it encodes)
├── vocab/            plain constants, no Zod: taxonomy (TAXONOMY.md §8 verbatim), D-MED-001
│                     claim statuses, model enums, real-brand denylist
├── common/           ids, SimTime (T-1), citation record, evidence refs, versions, medication ref
├── evidence/         evidence.yaml — learner-observable layer         ┐ compiled by
├── reference/        reference.yaml — author-only layer               │ tsconfig.evidence.json
├── documents/        case.yaml, review-record.yaml, citations.yaml,   │ = evidence + common +
│                     formulary manifest/entry, universe.yaml          │   vocab + version ONLY
├── invariants/       attribution, harm-language lint, the invariant   ┘
│                     suite, top-level validate* functions
└── json-schema.ts    z.toJSONSchema export (committed under json-schema/)
```

## Rules this package keeps

- **Two-layer contract at the type level** (D-MED-005, INV-TRUTH-001). `src/evidence/` and the
  layer-neutral modules compile in a _composite_ TypeScript project whose file list excludes
  `src/reference/`; an import across the line is a compile error (TS6307).
  `layer-fixtures/evidence-imports-reference.ts` proves it: `pnpm check:layers` compiles it
  against `tsconfig.layer-fixture.json` and expects exactly that failure.
- **Refinements never carry semantics** (ADR-2). Every cross-field or cross-file rule lives in
  `src/invariants/`; Zod refinements are not used, because `z.toJSONSchema` drops them and the
  editor artifact would then lie. Schema-shape failures that belong to an invariant are
  _attributed_ to it (`invariants/attribution.ts`) so negative fixtures fail by name.
- **Taxonomy tokens are verbatim** from `docs/clinical/TAXONOMY.md` §8 (owner-approved,
  spelling-frozen). `vocab/taxonomy.test.ts` parses the document and compares list-vs-list.
- **No runtime consumer imports the Zod schemas.** The app and the engine may import types and
  `./vocab` constants; `zod` is not on the runtime allowlist (DEPENDENCY-POLICY.md §3) and ESLint
  refuses the import from those packages.

## Invariants shipped here (core subset + W4 hooks)

| Id                      | Checks                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV-TIME-001            | both timestamps present and resolvable; documentationTime ≥ eventTime; other SimTimes resolvable                                                                                                                 |
| INV-REF-001             | exactly one of formularyId / sanctioned unresolvedLabel; ids resolve in the formulary; LASA/combination refs resolve                                                                                             |
| INV-TRUTH-001           | evidence.yaml carries no reference-layer key (strict schema) and no reference-layer id in any string; plus the type-level project boundary                                                                       |
| INV-DISC-001            | five axes + ≥1 detectability path + three ordinals (schema-attributed); secondary ≠ primary; duplicate paths warn                                                                                                |
| INV-ACT-001             | accepted non-empty; rationale per entry (key resolves or inline text); mechanismOfHarm per unsafe; harm-language lint (probability tokens, uncited numbers, unflagged inevitability) over all teaching text      |
| INV-META-001            | caseId/bundleId consistency; coverage type/mechanism sets equal the reference layer; allergySubTask matches; review linkage (draft vs reviewed; badge = record; fixed review-model string); placeholder warnings |
| INV-VERS-001            | every `schemaVersion` stamp equals `SCHEMA_VERSION`; formulary/universe versions inside the declared ranges                                                                                                      |
| INV-CIT-001 (warn)      | scored rules cite (warning); cited ids resolve (error); ≥1 Tier A/B (warning); uncited records (warning)                                                                                                         |
| INV-SPDX-001            | SPDX header within three lines of every bundle YAML/Markdown file                                                                                                                                                |
| INV-REG-001             | every citation `source` key has a row in `source material/REGISTRY.md` and CITATION-POLICY.md §7                                                                                                                 |
| INV-SCOPE-001 (partial) | real-brand-name denylist over all content strings; synthetic notice literal; synthetic chart id                                                                                                                  |
| INV-SHAPE-001 (local)   | unique ids; every id reference resolves inside the bundle; field co-requirements (taking-differently ⇒ how, time-gated ⇒ availableFrom, frozen ⇒ note, knowability ⇔ knowableVia)                                |

Deferred to EP-20: TIME-002, TIME-003, REF-002, DISC-002, DISC-003, ACT-002, HINT-001 (shape
exists), A11Y-001 strict (fields exist and are required), CIT-001 strict, SCOPE-001 full.

## Commands (from `medrecsim/`)

`pnpm typecheck` (both projects) · `pnpm test` · `pnpm schema:export` / `pnpm schema:check` ·
`pnpm check:layers`. Authoring guidance for the YAML itself: `content/AUTHORING.md`.
