# Changelog

All notable changes to medrecsim are recorded here. The format follows
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html), staying at `0.x` until the v1.0
release criteria in [docs/RELEASE-CRITERIA.md](docs/RELEASE-CRITERIA.md) pass.

Categories are the standard six (Added, Changed, Deprecated, Removed, Fixed, Security) plus a
project-specific **Content** category for clinical content: case bundles, formulary entries,
teaching notes, review records, content-schema versions, and freeze or resolution patches
under the contested-scoring procedure. Content entries name the bundle and schema versions
they refer to, because the app version, the content-schema version, and per-bundle content
versions are three separate streams.

Every release entry also records the outcome of the claim–evidence check
([docs/CLAIMS.md](docs/CLAIMS.md)) and the live case counts.

## [Unreleased]

Pre-release; under active construction; nothing here is validated. No tag exists yet. The
repository holds the R0 foundation and governance pack and the R1 toolchain bootstrap (a
hello-world application); the content schema (v0.1) and its validator exist; the visual
identity is defined as tokens and fonts; the simulation engine's core (case loading, clock,
evidence projection, dialogue, escalation primitives, action log, persistence) exists without
scoring or signature; no clinical content has been written.

### Added

- Baseline floor: layered `.gitignore` with the private `.local/` zone first, LF policy,
  committed pre-commit hooks (gitleaks secret scan + tripwire grep for record-like patterns
  and restricted-dataset markers), MIT license for code and CC BY 4.0 notice for content.
- Server-side security baseline on the GitHub repository (secret scanning, push protection,
  private vulnerability reporting, Dependabot alerts, CodeQL default setup, rulesets on
  `main`, hardened Actions permissions) with a living checklist in
  `docs/SECURITY-BASELINE.md` and committed ruleset exports.
- Community and governance pack: README, CONTRIBUTING with Developer Certificate of Origin
  and the three synthetic-provenance attestations, Contributor Covenant 3.0, SECURITY.md,
  SUPPORT.md, issue forms and pull-request template, CODEOWNERS, `CITATION.cff`, Dependabot
  configuration, third-party notices stub, and the data/asset registry.
- Name and identity screening record (`docs/NAME-SCREEN.md`).
- Threat model, dependency policy, incident and correction procedures, and the closed MIMIC
  gate document under `docs/`.
- Claim–evidence matrix (`docs/CLAIMS.md`) with the standing-disclaimer canonical block,
  release criteria (`docs/RELEASE-CRITERIA.md`), and this changelog.
- Clinical governance instruments under `docs/clinical/` (each versioned 1.0): citation
  policy with approved-source tiers and the Joint Commission NPSG.03.06.01 → NPG.14.05.01
  transition rule, clinical self-review checklist, stigma-safety checklist, and the public
  review-record template with pre-brief badge fields. Pointer rows for the verified sources
  added to the data/asset registry.
- Discrepancy taxonomy v1.0 (`docs/clinical/TAXONOMY.md`): the five metadata axes every
  authored discrepancy will carry (type, causal mechanism, detectability, urgency, harm class
  with severity read as potential worst-credible outcome), the phenotype predicates the
  coverage tool will evaluate, divergence notes against the cited sources, the enum export the
  content schema imports verbatim, and a cited register of its sources. Twenty pointer rows
  added to the citation policy and the data/asset registry.
- Toolchain bootstrap under `medrecsim/`: pnpm workspace with engine, schema, content-tools,
  and app packages; TypeScript (strict), Vite, Vitest with fast-check, ESLint with an
  engine-determinism rule, Prettier; six architecture decision records under `docs/adr/`
  (Svelte 5, Zod 4 with exported JSON Schema, build-time content compile, pnpm, no UI state
  library, fast-check) each carrying measured spike evidence; continuous integration on Ubuntu
  and Windows with bundle-budget, no-network (Content-Security-Policy), SPDX-header, claims,
  action-pin, Developer Certificate of Origin, and dependency-review checks; GitHub Pages
  deployment from `main` gated on that workflow; a hello-world page rendering the standing
  disclaimer banner; third-party notices generated from the lockfile.
- Content schema v0.1 (`@medrecsim/schema`): Zod 4 schemas for case bundles (metadata, the
  learner-observable evidence layer, the author-only reference layer, citation records, review
  records), the formulary package, and the fictional-universe registry, with the taxonomy enums
  imported verbatim; the two-layer contract enforced at the TypeScript project level with a
  compile-error fixture; a content CLI (`validate`, `fixtures`, `compile`, `schema-export`)
  running the core invariant subset (timestamps, formulary references, layer separation,
  five-axis discrepancy metadata, action sets with the harm-language lint, metadata and review
  linkage, schema-version stamps) plus citation-presence, SPDX-header, and registry-row checks;
  a negative-fixture suite rejected by invariant name in CI; a structure-complete exemplar
  scaffold with placeholder text; build-time YAML-to-JSON compilation; an authoring guide; a
  seventh architecture decision record for the schema tensions.
- Visual identity and originality pack: original design tokens (palette in light and dark
  themes with a contrast test as the contract, type scale, spacing, focus and motion tokens);
  two self-hosted SIL Open Font License typefaces (Atkinson Hyperlegible Next for documents,
  Caveat for authored handwriting) subset to Latin with provenance, registry and notice rows;
  the trade-dress originality checklist (`docs/ORIGINALITY-CHECKLIST.md`) with a recorded
  composition-level desk review and seven documented divergences; the fictional-universe
  registry seeded with screened names (one fictional city, a hospital, a community pharmacy, a
  primary-care practice, five recurring clinicians) and visibly fictional identifier rules
  enforced by the validator; banner and review-badge component specs with a pure badge-text
  helper; an asset-hygiene check (EXIF, XMP, IPTC and SVG editor metadata) in CI and the
  pre-commit hook; an eighth architecture decision record.
- Engine core (`@medrecsim/engine`): a pure, headless, event-sourced session — state is a
  fold over an append-only log of learner actions (opening sources, examining artifacts,
  asking authored questions, escalating and awaiting responses, the three workspace
  artifacts) with typed rejections; a simulated clock in minutes since admission that parses
  and formats instants without the platform clock and fires authored threshold events
  deterministically on crossing; escalation availability windows evaluated on the case-local
  clock (the compile step now records the case's UTC offset); an evidence projection that
  shows only what the learner has earned and cannot name a reference-layer type (an
  evidence-only TypeScript project with a compile-error fixture, proven in CI beside the
  schema's); post-admission decisions structurally separated from the reconstructed
  pre-admission history with a typed error and a property test; a persistence adapter that
  stores the action log in a versioned envelope and discards it politely on any version or
  content mismatch; the session seam with fail-closed signature and debrief stubs pending the
  scoring work; the engine determinism lint rule made real; a 1000-log replay-equivalence
  property test; a ninth architecture decision record.

### Content

- None reviewed. The content schema is defined (v0.1); the only bundle is the placeholder
  exemplar scaffold (`draft-unreviewed`, not compiled), and the formulary holds two placeholder
  entries. No clinical content exists yet.

[Unreleased]: https://github.com/willtfarrington/medrecsim/commits/main
