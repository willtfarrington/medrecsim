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
repository holds the R0 foundation and governance pack; no application code, engine, schema,
or clinical content has been written.

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

### Content

- None. No case bundle, formulary entry, or teaching note exists yet; the content schema has
  not been defined.

[Unreleased]: https://github.com/willtfarrington/medrecsim/commits/main
