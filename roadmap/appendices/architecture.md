# Architecture — packages, engine, schema, validation, CI

This appendix is the canonical integrated technical-architecture specification for medrecsim v1,
implemented by EP-8 (toolchain + ADRs), EP-9 (schema v0 + validator core), EP-11 (engine core),
EP-12 (scoring/signature/debrief data + golden harness), EP-20 (coverage tool + full invariant
suite), EP-34 (content-at-scale gating & migrations), and the hardening portions of EP-36/EP-38.
Decisions cited as `D-*` resolve in [../../DECISIONS.md](../../DECISIONS.md); integrator
resolutions are cited as `I-n`; items ruled on at roadmap approval carry their `OQ-n` reference from
[open-questions.md](open-questions.md). Integrated 2026-08-23 from specialist planning; citations
carry access dates; time-sensitive facts reverify at execution.

## 1. Repository & package layout

Monorepo using pnpm-or-npm workspaces (decided in ADR-4, EP-8) with root manifests and all code
under the existing `medrecsim/` subdirectory (A-001; **I-1**: no rename — matches the
sibling-project pattern; reversible).

```
medrecsim/
├── packages/
│   ├── engine/           @medrecsim/engine — pure headless TS, zero DOM deps (D-ARCH-006)
│   ├── schema/           @medrecsim/schema — types + validators + invariant suite
│   │                     (shared by CLI and app)
│   ├── content-tools/    dev-only CLI: validate, coverage, compile, migrate
│   └── app/              UI package (Vite)
├── content/
│   ├── formulary/        versioned content directory (I-2: not an npm package;
│   │                     the EP-8 ADR may overturn)
│   └── cases/
│       ├── _exemplar/    annotated exemplar bundle (D-DATA-005)
│       └── <case-dir>/   case.yaml, evidence.yaml, reference.yaml, dialogue.yaml,
│                         teaching-notes.md, review-record.md, CHANGELOG.md (D-GOV-003)
└── tests/
    ├── golden/
    └── e2e/
```

Rejected alternatives (recorded): single package (weakens the D-ARCH-006 engine seam); code at
repo root (contradicts A-001); Turborepo/Nx (unnecessary supply-chain surface).

## 2. Engine design (D-ARCH-006; EP-11/EP-12)

**Modules:** case-loader · clock · evidence (projection layer; **never exposes the reference
layer**) · dialogue · escalation · actions (append-only action log = source of truth) ·
workspace (derives the three learner artifacts) · signature (returns structured blocking
reasons) · scoring · debrief · session (root reducer + versioned serialization).

**Event-sourced state model:** state = `fold(reduce, initial, actionLog)`. The action log is the
single source of truth; everything else is derivation.

**Determinism guarantees:** no `Date.now`, `Math.random`, or async anywhere in the reducer —
enforced by a dedicated lint rule *and* a property test (fast-check; EP-11 runs a
1000-action-log replay-equivalence property). Post-T0 immutability (D-MED-002): the reducer
**rejects with a typed error** any action that would mutate reconstructed pre-T0 state.

**localStorage envelope (D-ARCH-005):** persist the **action log**, not derived state, wrapped
in `{appVersion, schemaMajor.minor, caseId, caseContentVersion, engineStateVersion}`. Any
mismatch → polite discard (**I-4**: discard on *any* contentVersion bump — simplicity/safety).
"Clear all local data" enumerates a namespace prefix; every storage access is try/catch-guarded
(graceful when storage is blocked). Nothing ever leaves the machine.

**API seam:** `createSession(...)` → `{getState, getView, dispatch, canSign, sign, getDebrief,
serialize}`. Pre-signature view types **cannot reach the reference layer** — the two-layer
truth/action contract (D-MED-005) is enforced at this seam. Note the honesty framing: the
reference layer still ships to the client (static app); two-layer is an API-seam guarantee, not
secrecy — the charter explicitly disclaims answer obfuscation (D-GOV-003).

## 3. Content schema outlines (D-DATA-003, D-MED-005; EP-9)

### case.yaml (metadata)

`id` · `slug` · `title` · `schemaVersion` · `contentVersion` · `tier` ·
`recommendedSequenceIndex` · coverage declarations · `reviewRecordRef` + `preBriefBadge`
(D-RISK-003, rendered "physician-reviewed (single reviewer)") · `preBrief` · `estimatedMinutes`
· `formularyVersionRange`.

### evidence.yaml (learner-observable layer)

- `patient` + `T0`.
- `sources[]` — the seven D-WF-001 types, availability, `accessCostMinutes`.
- `claims[]` — `id`, `sourceId`, `formularyId` **or** sanctioned `unresolvedLabelText` (escape
  hatch, tension T-2), D-MED-001 `claimStatus`, dose/route/frequency/formulation, `eventTime` +
  `documentationTime` (D-MED-002), `asStatedText`.
- `allergyClaims[]` — discriminated union on `claimKind` (D-MED-003).
- `dialogueTrees[]` — nodes: `questionText`, `costMinutes`, `revealsClaimIds`, `responseText`,
  `unlocks`, `reliabilityModifier` (D-SIM-001).
- `artifacts[]` — `kind`, `renderText` (including nonvisual cues), `labelClaims`,
  `examineCostMinutes`.
- `escalationChannels[]` — `channel`, `availabilityWindow`, `latencyMinutes`,
  `responseContent`, `unansweredBehavior` (D-CLIN-002).

### reference.yaml (author-only layer)

`referenceRegimen[]` · `actualUseState[]` with knowability marks (`knowable-via` paths |
`irreducibly-uncertain`) · `discrepancies[]` (five-axis enums + `detectabilityPaths[]` +
severity/reversibility/timeToHarm ordinals + `resolutionExpectation`) · `actionSets`
(accepted / partiallyAccepted / unsafe; `rationaleMenuKey`/`Text`; unsafe entries carry
`mechanismOfHarm`) · `expectedEscalations[]` · `hints[]` (nudge/directed/revealSource; located
here per **I-6** — spoiler-adjacent by design, the reference layer is public anyway; the schema
EP may refine) · teaching-note refs + `citations{source, tier, version, accessDate}`
(D-GOV-002). The debrief timeline is **computed, never authored**.

### Formulary entry (D-DATA-001/004)

`id` · `genericName` · `class` · `forms[]{form, strengths, concentrationNote}` ·
`combinationComponents` · `lasaPartners` (bidirectional) · `highAlert` · `timeCritical` ·
`monitoringNotes{text, citation}` · `pillAppearanceText` (nonvisual cue, D-UX-004) ·
`brandNamesFictional` (original coinages only) · `narrowTherapeuticIndex`. Package metadata:
`formularyVersion`, `schemaVersion`.

### Schema tensions for the schema EP (EP-9 resolves and records)

- **T-1** Relative vs absolute time — recommend: author relative, compile absolute.
- **T-2** Unresolved-label escape hatch vs D-DATA-004 "cases reference formulary IDs" — flag for
  ratification at EP-9.
- **T-3** Claim-reveal granularity (partial field reveals).
- **T-4** Detectability path AND/OR set encoding.
- **T-5** Shared vs per-case rationale menus.
- **T-6** Hint text location — resolved to reference layer by **I-6**; EP-9 may refine shape.

## 4. Invariant validators (17; D-DATA-003)

EP-9 lands the core subset {TIME-001, REF-001, TRUTH-001, DISC-001, ACT-001, META-001,
VERS-001}; EP-20 lands the remainder. All run in CI on every PR.

| ID | Rule |
|----|------|
| INV-TIME-001 | Every claim has both timestamps; documentationTime ≥ eventTime |
| INV-TIME-002 | Post-T0 actions never mutate pre-T0 state (D-MED-002) |
| INV-TIME-003 | Timeline satisfiability — escalation latencies answerable within the case |
| INV-REF-001 | Every formularyId resolves; unresolved labels carry the sanctioned escape flag |
| INV-REF-002 | LASA partners bidirectional; LASA-phenotype cases contain LASA-partner claims |
| INV-TRUTH-001 | Layer separation — no reference-layer data reachable from evidence types |
| INV-DISC-001 | Every discrepancy: all five axes + ≥1 detectability path + all three ordinals |
| INV-DISC-002 | Detectability-path reachability (graph check against sources/dialogue/artifacts) |
| INV-DISC-003 | Knowable ⇒ detectable; irreducible ⇒ no complete path AND accepted set includes unable-to-verify (D-MED-005, D-WF-004) |
| INV-ACT-001 | Nonempty accepted sets; rationale per entry; mechanismOfHarm per unsafe entry; harm-language lint (probability-token denylist; numbers require a citation ref; explicit `inevitabilityAuthored` flag) (D-SCOR-002/003) |
| INV-ACT-002 | Winnability solver — ≥1 action sequence passes signature entirely within accepted sets (fallback if solver proves complex: per-artifact checks + golden full-credit script as proof) |
| INV-CIT-001 | Citation per clinical rule (D-GOV-002) — warn-only until the EP-6 citation-format spec lands, then strict |
| INV-META-001 | Tier/coverage declarations match actual case metadata; review record parses |
| INV-HINT-001 | All three hint grades present per hinted target (D-PED-001) |
| INV-SCOPE-001 | No free-text learner-input fields; no real brand names (denylist); synthetic banner present |
| INV-VERS-001 | Schema stamps match the app's supported schema major (D-DATA-002) |
| INV-A11Y-001 | renderText and pillAppearanceText present wherever required (D-UX-004) |

## 5. Content CLI (D-DATA-005; content-tools package)

- `validate [--all] [--format pretty|json|github]` — schema + invariants; exit 1 on failure.
- `coverage [--format table|json|md] [--gate]` — prints the taxonomy coverage matrix
  (informative in R1; `--gate` turned on in CI at EP-34).
- `compile` — YAML → JSON chunks at build time; **the runtime never parses YAML** (ADR-3;
  YAML remains the authored source of truth, so D-GOV-003's "YAML bundles" holds).
- `migrate <codemod-id> [--dry-run]` — scripted in-repo codemods (D-DATA-002).

## 6. Golden harness (D-QA-001, D-DATA-003; EP-12)

Per golden case: authored action scripts (≥3 at EP-12 — full-credit, hint-using, and
unsafe-path) replayed through the engine → snapshot of `{workspace artifacts, five subscores,
debrief data, action-log hash}` via a stable serializer. Golden snapshots are the
accepted-alternative regression: any diff is a scoring-semantics change. Snapshot updates run
through `--update`, which the PR template flags as a scoring-semantics change requiring owner
review — the update-guard mechanism is the PR-template flag per the **OQ-8** ruling (CI
hard-block remains available if drift is observed); it touches the owner-only scoring-review
path (D-EXEC-003).

## 7. CI pipeline (D-QA-001, D-SEC-001; EP-8 skeleton, grown through R1–R3)

`ci.yml` runs with **no secrets** (forked PRs safe), stages in order:

1. install (frozen lockfile)
2. lint/format — including the engine determinism lint
3. typecheck
4. unit + property tests (Vitest, fast-check)
5. content `validate` + `coverage`
6. golden harness
7. component tests
8. build + bundle-budget check (≤ ~300 KB gz initial, D-ARCH-007)
9. Playwright keyboard-only smoke + @axe-core/playwright (fail on serious/critical)
10. gitleaks + synthetic-fixture allowlist scan

**Matrix policy (I-5, satisfying D-QA-001 "windows parity"):** stages 1–8 run on
ubuntu **and** windows for every PR; Playwright e2e runs ubuntu-on-PR plus a windows **nightly**
job. Revisit if windows-only e2e bugs ever appear. Also: `codeql.yml` (default setup);
Dependabot updates reviewed, never auto-merged; `pages.yml` deploys from `main` only with
scoped permissions, gated on CI green; `.gitattributes` forces LF from EP-0 (win/linux
divergence guard; no ambient-timezone reliance in tests).

## 8. ADR decision frames (written at EP-8; six ADRs)

| ADR | Decision | Frame |
|-----|----------|-------|
| ADR-1 | Svelte 5 vs React 19 (D-ARCH-004) | Measure bundle floor both ways (spike SP-4); a11y/testing ecosystem maturity; longevity; solo/agent maintainability; owner familiarity (none stated) |
| ADR-2 | Zod 4 vs JSON Schema + Ajv 8 (D-DATA-003) | Runtime weight moot given build-time compile; key axis = TS type inference vs editor autocomplete (yaml-language-server `$schema`, spike SP-5). Hybrid candidate sanctioned by **I-3**: Zod source-of-truth + `z.toJSONSchema` export (one schema lib + generated artifact, no drift) |
| ADR-3 | Build-time content compile (recommended) | YAML lib dev-only; runtime consumes JSON chunks |
| ADR-4 | pnpm vs npm workspaces | pnpm's strict isolation is a supply-chain win |
| ADR-5 | No UI state library | Engine owns state (D-ARCH-006); `useSyncExternalStore`/framework stores over any facade |
| ADR-6 | Property-test library | fast-check (presumptive) |

Verified tool versions at planning time (2026-08-23) — **all reverify at execution**:
Svelte 5.56.10 · React 19.2.x · Zod 4.x · Ajv 8.20.0 · Vite 8.0.x · Vitest 4.1.x ·
Playwright 1.62.1 · @axe-core/playwright 4.13.0 · yaml v2 · pnpm 11.23.0.

## 9. Versioning & migration mechanics (D-DATA-002; EP-9/EP-34)

- `SCHEMA_VERSION` constant lives in @medrecsim/schema; **minor = additive only; major =
  codemod required**.
- CI fails if the schema version is bumped while any bundle stamp lags (INV-VERS-001) —
  migrations ship as in-repo codemods migrating **all** bundles in the same change.
- Every migration file declares itself **clinical-semantics-preserving or
  clinical-semantics-changing**; the latter gates the affected cases back through the D-GOV-001
  re-review lifecycle.
- Any `contentVersion` bump discards matching localStorage sessions politely (**I-4**).
- EP-34 exercises the migration runner with a real no-op codemod before the case wave scales,
  and turns `coverage --gate` on in CI.

## 10. Architecture risks (carried into the [risk register](risk-register.md))

Bundle-budget erosion (budget enforced from day 1) · schema churn (exemplar-first; ≤2 cases
authored until the vertical slice ships; early codemod demo) · winnability-solver complexity
(fallback documented in INV-ACT-002) · Windows/Linux divergence (.gitattributes, no ambient TZ)
· determinism leaks (engine owns all persisted state) · supply chain (runtime-dependency
allowlist fixed at EP-8, D-EXEC-003). Related spikes: SP-4 (bundle floor), SP-5
(yaml-language-server autocomplete), SP-6 (NVDA live-region behavior, joint with UX). The EP-6
citation spike gates INV-CIT-001 strictness; the EP-3 name screen gates the npm scope.
