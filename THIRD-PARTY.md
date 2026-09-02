# Third-party notices

This file lists third-party software, fonts, and assets redistributed with medrecsim, with
their licenses. It is **regenerated at every release** by the toolchain's notice script (which
arrives with the toolchain bootstrap); the sections below are the hand-maintained stub until
then. External *reference* material that is consulted but not redistributed is catalogued
separately in [source material/REGISTRY.md](source%20material/REGISTRY.md).

Stub status: **no third-party code, fonts, or assets are redistributed yet.** The repository
currently contains only documentation, governance files, and repository tooling.

## Runtime dependencies (bundled into the application)

None yet. The runtime dependency allowlist is fixed at the toolchain bootstrap; additions are
owner-only.

## Fonts and visual assets

None yet. The planned design uses a system font stack and original inline SVG icons; if a
third-party font is adopted (an SIL Open Font License handwriting face is under consideration
for artifact rendering), it will receive a row here and in the registry.

## Development-time tooling (not redistributed)

Development and CI tooling is not bundled into the application and is not listed here; it is
recorded in the lockfile once one exists.

## Governance texts reused under their own licenses

| Item | Source | License | Use |
|------|--------|---------|-----|
| Contributor Covenant 3.0 | https://www.contributor-covenant.org/version/3/0/ | CC BY-SA 4.0 | Adapted as `CODE_OF_CONDUCT.md`, with attribution retained in that file |
| Developer Certificate of Origin 1.1 | https://developercertificate.org/ | Verbatim copies permitted; no modification | Reproduced unmodified in `CONTRIBUTING.md` |
