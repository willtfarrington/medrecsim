# Security policy

## Reporting a vulnerability

Report security vulnerabilities **privately** through GitHub's private vulnerability reporting
for this repository:

<https://github.com/willtfarrington/medrecsim/security/advisories/new>

Please **do not** open a public issue for a vulnerability. Public issues describing a
vulnerability may be closed with a request to use the private flow.

Include what you can: the affected file or component, steps to reproduce, and your assessment
of impact. You will receive an acknowledgement when the report is read. Response is
best-effort with no service-level commitment; this is a single-maintainer personal project. If
a report is confirmed, the fix and a dated public note are committed to this repository, and
you will be credited if you wish.

## Supported versions

During 0.x construction only the `main` branch and its GitHub Pages deployment are supported.
Once tagged releases exist, only the latest release is supported.

## In scope

- Cross-site scripting or other injection **via content files** (case bundles, formulary,
  teaching notes) rendered by the application.
- **Supply chain**: dependency, lockfile, install-script, or build-pipeline compromise.
- **Continuous integration and deployment**: workflow permissions, token exposure, fork
  pull-request handling, GitHub Pages deployment integrity.
- **Secrets or sensitive material** committed to the repository. If you believe real patient
  information or restricted data has been committed, that is also in scope and urgent: report
  it privately the same way.
- The absence-of-network guarantee: any runtime request leaving the user's machine.

## Out of scope

- **Clinical content disputes** (a discrepancy classification, an accepted or unsafe action
  set, a teaching note, a citation). These are not security issues. Use the
  *clinical content concern* issue template, which feeds the documented correction path: a
  credibly contested item is marked "discussion item — not scored" until re-adjudicated.
- Reports that require a real backend, accounts, or stored data, none of which exist. The
  application is static, client-only, and stores only local convenience state in the browser.
- Denial-of-service against GitHub-hosted infrastructure.
- Issues in third-party services (GitHub, browsers) that are not caused by this repository.

## Baseline

The repository's security settings (secret scanning, push protection, private vulnerability
reporting, Dependabot alerts, code scanning, branch rulesets, workflow-permission defaults) are
recorded with verification dates in [docs/SECURITY-BASELINE.md](docs/SECURITY-BASELINE.md).
The written threat model is [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md); the dependency
policy is [docs/DEPENDENCY-POLICY.md](docs/DEPENDENCY-POLICY.md); what happens when a control
fails, including the sensitive-commit runbook and the clinical correction path, is
[docs/INCIDENT-PROCEDURE.md](docs/INCIDENT-PROCEDURE.md).
