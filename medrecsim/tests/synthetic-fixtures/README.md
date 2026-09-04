# SYNTHETIC

<!-- SPDX-License-Identifier: MIT -->

# tests/synthetic-fixtures

Negative fixtures for the content validator (EP-9 item 5; D-DATA-003). Every file under this
directory is synthetic test data: the first line is `# SYNTHETIC` (the EP-0 allowlist
convention that the pre-commit tripwire and `.gitleaks.toml` recognise), the second the SPDX
header.

`negative/<name>/fixture.yaml` describes one violation as a list of mutations applied to an
in-memory copy of `content/cases/_exemplar` and names the invariant that must reject the result:

```yaml
# SYNTHETIC
# SPDX-License-Identifier: MIT
name: time-001-documentation-before-event
expect: { invariant: INV-TIME-001 } # severity defaults to error
mutations:
  - { file: evidence.yaml, op: set, path: claims[0].documentationTime, value: T0-3y }
```

Mutation ops: `set` (path + value) · `delete` (path) · `strip-header-lines` (lines) ·
`set-file` (data; adds or replaces a whole file) · `delete-file`. Paths use `a.b[0].c`.

Run with `pnpm content:fixtures` (CI runs it with `--format github`). The suite also validates
the unmodified exemplar as a positive control and fails if it produces any error. Each shipped
invariant has at least one fixture here; the Vitest suite in `packages/content-tools` asserts
that coverage.
