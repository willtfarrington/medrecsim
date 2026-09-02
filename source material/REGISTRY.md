# Data and asset registry

The registry of every external reference input, dataset, font, icon set, or other asset that
medrecsim consults or redistributes (DECISIONS.md D-DATA-006). One row per asset. Rows are
added when an asset is first used and are kept current at every release, alongside
[THIRD-PARTY.md](../THIRD-PARTY.md), which lists what is actually redistributed.

## Rules

- Only **redistributable, license-verified, cited** material may be stored in this directory.
  Anything unvetted, login-gated, or private lives in `.local/` (gitignored) and appears here
  as a **pointer-only** row (bibliographic reference: URL, version, access date), never as a
  copy.
- **No restricted datasets, ever.** MIMIC and other credentialed datasets are not assets of
  this project and may not appear in this directory, in CI, or in any agent context. The gate
  document under `docs/` records the closed status.
- RxNorm and similar terminologies are consulted read-only during authoring and are
  **not bundled**; they get pointer-only rows.
- Every clinical source cited by a case or the formulary needs a row so the citation can be
  re-verified at the annual content review.
- Access dates are ISO (`YYYY-MM-DD`). "Update cadence" states when the row should be
  re-checked (for example "annual review", "per release", "on upstream version change").

## Registry

| ID | Asset | Type | Source URL | Version | Access date | License | Attribution? | Redistributable | Update cadence | Notes |
|----|-------|------|------------|---------|-------------|---------|--------------|-----------------|----------------|-------|
| | | | | | | | | | | |

Column key: **Type** = reference / dataset / terminology / font / icon / image / other ·
**Attribution?** = yes / no (whether the license requires attribution and where it is given) ·
**Redistributable** = yes / no / pointer-only.

*Registry is empty at this stage: no external assets have been adopted yet.*
