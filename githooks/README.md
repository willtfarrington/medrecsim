# githooks/

Committed git hooks (EP-0, D-SEC-001). Not active by default — after cloning, activate with:

```
git config core.hooksPath githooks
```

`pre-commit` runs a gitleaks v8 secret scan of staged changes (fails closed if gitleaks is
not installed: `winget install Gitleaks.Gitleaks`) plus a tripwire grep for staged `.local/`
paths, MRN/SSN/DOB-like patterns, and restricted-dataset markers. Configuration lives in
[.gitleaks.toml](../.gitleaks.toml); its only allowlist is the `synthetic-fixtures/`
convention (files there begin with a `# SYNTHETIC` header line).
