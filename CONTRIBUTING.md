# Contributing to medrecsim

Thank you for your interest. This is a personal, single-maintainer project with a deliberately
narrow contribution intake. Please read this page before opening a pull request; the
attestations below are load-bearing for the project's core guarantee that **everything here is
synthetic**.

## What is accepted

Pull requests are welcome for:

- **Bugs** in the application, engine, or tooling.
- **Typos and wording fixes** in documentation and non-clinical interface text.
- **Accessibility fixes** (keyboard operability, screen-reader behavior, contrast, reflow,
  reduced motion). Please describe the assistive technology and browser you tested with.
- **Tooling and CI** improvements that do not add runtime dependencies.

Pull requests are **not** accepted for:

- **New clinical cases, formulary entries, or teaching notes.** Clinical content sign-off
  belongs to the project owner alone and is never delegated. If you have a case idea, a
  discrepancy pattern worth teaching, or a source worth citing, open an issue with the feature
  request template and it will be considered for the roadmap's parked list.
- **Changes to accepted, partially-accepted, or unsafe action sets, scoring semantics, or
  teaching content.** If you believe an existing classification is wrong, use the
  *clinical content concern* issue template; it feeds a documented freeze-and-re-adjudicate
  procedure rather than a pull request.
- **New runtime dependencies**, license or naming changes, or new outward claims about what
  the project is or does. These are owner-only decisions.

Scope is frozen during construction. Ideas that fall outside the current plan are recorded in
the roadmap's parked list rather than added to work in progress.

## Before you open a pull request

1. Open or find an issue first so the change is agreed before you spend effort on it.
2. Keep pull requests small and single-purpose.
3. Enable the committed pre-commit hooks in your clone:

   ```
   git config core.hooksPath githooks
   ```

   They run a secret scan and a tripwire grep for patient-record-like patterns. See
   [githooks/README.md](githooks/README.md).
4. Make sure continuous integration is green. `.github/workflows/ci.yml` runs lint, format,
   typecheck, tests, the build, and the bundle-budget, no-network, SPDX, claims, and
   action-pin checks on Ubuntu and Windows; a pull request additionally runs the Developer
   Certificate of Origin check (every commit signed off) and a dependency review. You can run
   the same steps locally with `pnpm verify` inside `medrecsim/`.
5. Sign off every commit and complete the pull-request template, including the attestations
   below.

## Developer Certificate of Origin

Every commit must carry a `Signed-off-by:` line with your real name and an email address you
control (`git commit -s` adds it). By signing off you certify the Developer Certificate of
Origin, version 1.1, reproduced here from <https://developercertificate.org/>:

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

Code contributions are licensed under the [MIT License](LICENSE); content contributions
(should any ever be accepted) under [CC BY 4.0](LICENSE-CONTENT.md).

## The three attestations

Every pull request must affirm all three. They appear as checkboxes in the pull-request
template; a pull request with any box unchecked will not be merged.

1. **No PHI, no real-patient-derived content, no restricted data.** This contribution contains
   no protected health information, no content derived from any real patient (including cases
   "de-identified from memory"), no employer or institutional data or screenshots, and no
   material from restricted datasets, including MIMIC or any other credentialed dataset.
2. **Synthetic provenance and AI-assistance disclosure.** All content in this contribution is
   fictional and synthetic. If an AI tool assisted in producing any part of it, I have said so
   in the pull-request description.
3. **Rights to contribute.** I have the right to submit this work under the project's licenses;
   it is not encumbered by third-party rights, contains no proprietary material, and reproduces
   no third-party trade dress, branding, or interface design.

## Clinical sign-off is owner-only

Clinical content sign-off belongs to the project owner alone. Agents, contributors, and
reviewers never author or alter accepted or unsafe action sets, scoring semantics, or clinical
teaching content without an explicit owner review recorded in the public per-case review
record. Clinical content is **physician-reviewed (single reviewer)**; that limitation is
disclosed on every case.

## Support expectations

Support is best-effort with no service-level commitment. Issues are read and triaged when the
maintainer has time; there is no guaranteed response time. See [SUPPORT.md](SUPPORT.md).

## How AI-assisted authoring is used in this repository

The owner uses AI coding assistants (large language models operated through agent tooling) to
draft code, documentation, tests, and planning material in this repository, working from
written briefs and a binding decision ledger. Every clinical statement, case reference state,
scoring rule, and outward claim is authored or reviewed and signed off by the owner, a
physician, before it is published; no model output is accepted as clinical truth, and no
model runs inside the application. AI-assisted work is done only on synthetic material: no
real patient information, institutional data, or restricted dataset is ever placed in front of
a model. Contributors are asked to disclose AI assistance in their own pull requests the same
way.

## Code of conduct

Participation is governed by the [Contributor Covenant 3.0](CODE_OF_CONDUCT.md).
