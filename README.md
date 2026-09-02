# medrecsim

A fully synthetic, client-only medication-reconciliation simulation for junior residents and
senior medical students: reconstruct a best possible medication history from fragmented,
contradictory evidence, find and resolve the discrepancies, and learn from the debrief.

> pre-release; under active construction; nothing here is validated

<!-- maintenance-status: reserved slot (D-RISK-005). Leave empty while the project is actively maintained. -->

## What this is

- **A training simulation, not a product.** Learners play the admitting clinician for an adult
  general-medicine admission from the emergency department of a fictional US hospital. They
  gather evidence from seven kinds of sources (interview, caregiver, bottles and lists, a stale
  imported medication list, a prior discharge summary, community-pharmacy dispensing history,
  an outpatient note), build a working medication history, log discrepancies, and decide what
  to continue, hold, escalate, or defer, then sign.
- **A fictional, vendor-neutral, EHR-like interface** with an original visual identity. The
  fragmentation of information is deliberate; mechanical friction is not.
- **An evidence-timeline debrief** that shows what was knowable when, compares the learner's
  path with a reviewed reference, and explains each discrepancy with cited teaching notes.
- **Formative and transparent.** Five separate subscores, no composite number. Reference
  answers and scoring rules are public by design.
- **Static and private.** A client-only web app on GitHub Pages: no accounts, no backend, no
  telemetry, no runtime network calls, no language model at runtime. Nothing leaves your
  machine.

## What this is not

- Not medical advice, not clinical decision support, and never connected to a live EHR.
- Not validated for learning outcomes, not a certification of competence, and not a claim of
  safety improvement. It is designed to teach; it is not proven to teach.
- Not affiliated with any employer, hospital, EHR vendor, pharmacy, or payer.
- Not a source of real data. Every patient, clinician, institution, record, and anecdote is
  synthetic and fictional. No real patient information, employer material, or restricted dataset
  is used anywhere in this repository or its tooling.
- Not summative or high-stakes. Answers are not hidden and there is no anti-cheating design.

## Screenshot

*Placeholder.* Screenshots will be taken from the public GitHub Pages deployment once the first
playable case exists, and screened for paths, usernames, and metadata before inclusion. No
mock-ups stand in for them.

## Quickstart

*Placeholder.* The toolchain is not bootstrapped yet. When it is, this section will hold the
Pages URL for learners and the clone / install / run steps for contributors (Windows-native
Node LTS toolchain; no containers or virtualization required).

## Design principles

- **Fragmentation is fidelity; mechanical friction is not.** Evidence is scattered and
  contradictory on purpose; the controls are modern, consistent, and accessible.
- **Two-layer truth.** Every case has an author-only reference layer (the reference regimen,
  what the patient actually takes, what is knowable and when, accepted and unsafe action sets)
  and a learner-observable evidence layer. Scoring compares only against accepted alternatives,
  never against a hidden single answer where authors marked uncertainty as irreducible.
- **Unsafe actions are never blocked in the simulation.** They are surfaced prominently in the
  debrief with the mechanism of harm explained.
- **Time is simulated, not real.** Each action advances a case clock by an authored amount.
  There is no real-time pressure and no timing-dependent interaction.
- **Uncertainty is first-class.** "Unable to verify" and "deferred, with a follow-up plan" are
  legitimate outcomes, and escalation is a scored skill, not a failure.
- **Harm language is careful.** Plausible-consequence phrasing with ordinal severity labels; no
  invented probabilities or statistics.
- **Every clinical rule cites an authoritative source** with its version and access date, and
  every case ships with a public, dated review record.
- **Accessible by design.** WCAG 2.2 AA is a release gate: fully keyboard-operable, screen-reader
  tested, information never conveyed by color alone, reduced motion respected.
- **Complete at rest.** No services, recurring costs, or scheduled obligations beyond an annual
  content re-review. Review badges make staleness self-evident.

## Limitations and disclaimers

Clinical content is **physician-reviewed (single reviewer)**. Independent pharmacist or
medication-safety dual review is a named future upgrade, not something that has happened.
The complete list of outward claims and the evidence or softening behind each one lives in
[docs/CLAIMS.md](docs/CLAIMS.md); the release criteria every tag is checked against live in
[docs/RELEASE-CRITERIA.md](docs/RELEASE-CRITERIA.md). The standing disclaimer, reproduced
unmodified everywhere the project speaks:

> Educational use only. All patients, clinicians, institutions, and records are synthetic and
> fictional; no real data of any kind. Not validated for learning outcomes; not a certification
> of competence; no claim of safety improvement. Clinical content is physician-reviewed
> (single reviewer). Personal project with no institutional, employer, or vendor affiliation;
> not "HIPAA compliant" because no real health information is processed. Drug information may
> become outdated — each case shows its review date; verify against current sources before any
> clinical use.

## Non-affiliation

This is a personal project of the repository owner. It has no institutional, employer,
hospital, EHR-vendor, pharmacy, or payer affiliation, sponsorship, or endorsement. Fictional
institution names and the visual identity are original; any resemblance to real organizations
or products is unintended.

## License

Split license (see [LICENSE-CONTENT.md](LICENSE-CONTENT.md) for the directory map and
attribution string):

- **Code** (application and engine source) is licensed under the [MIT License](LICENSE).
- **Content** (case bundles, the synthetic formulary, teaching notes, and educational
  documentation) is licensed under
  [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Repository-level SPDX expression: `MIT AND CC-BY-4.0`. Project names, fictional institution
names, and visual identity are not licensed under either license. Third-party components are
listed in [THIRD-PARTY.md](THIRD-PARTY.md); external reference material is catalogued in
[source material/REGISTRY.md](source%20material/REGISTRY.md).

## Contributing, security, and support

- [CONTRIBUTING.md](CONTRIBUTING.md): narrow intake (bugs, typos, accessibility, tooling),
  Developer Certificate of Origin sign-off, and the three synthetic-provenance attestations
  every pull request carries. New clinical cases are not accepted as pull requests; content
  ideas go through issues. That file also describes how AI-assisted authoring is used here.
- [SECURITY.md](SECURITY.md): report vulnerabilities privately through GitHub's advisory
  flow, never in a public issue.
- [SUPPORT.md](SUPPORT.md): best-effort support through GitHub Issues only; no service level.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md): Contributor Covenant 3.0.
- Clinical content concerns have their own issue template and a documented freeze procedure:
  a credibly contested item is marked "discussion item — not scored" until re-adjudicated.

## Roadmap

The build plan lives in [roadmap/README.md](roadmap/README.md) with its binding decision
ledger in [DECISIONS.md](DECISIONS.md). The roadmap carries sizes and dependency order but
**no calendar dates, by design**. Releases: R0 foundation and governance, R1 vertical slice
(one complete introductory case, deployed), R2 depth and breadth, R3 hardening, then v1.0.
Versions stay at 0.x until the v1.0 release criteria pass.

## Citing

See [CITATION.cff](CITATION.cff), or use the "Cite this repository" control on the GitHub
repository page.
