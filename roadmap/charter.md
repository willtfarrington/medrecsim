# medrecsim Planning Charter — APPROVED 2026-08-23 (verbatim, no corrections)

Approved by the project owner with explicit authorization for roadmap planning, after six batches
of decision discovery (57 explicit owner decisions, none inferred from silence). Read together
with [../DECISIONS.md](../DECISIONS.md) — the binding decision ledger where every `D-XXX-NNN`
cited below resolves, along with parked items (P-*) and assumptions (A-*). Planning agents and
implementation sessions may not redefine intent, relax constraints, access restricted data, or
publish; the charter changes only by owner decision recorded in DECISIONS.md.

## 1. Product thesis & success

An original, fictional, vendor-neutral, EHR-like **medication-reconciliation simulation**: learners
reconstruct a best possible medication history (BPMH) from fragmented, time-stamped, contradictory
evidence, identify and resolve unintended discrepancies, and flag/escalate intentional-change
decisions — then learn from an evidence-timeline debrief. **v1 success = a publicly demonstrable,
expert-reviewed, honest, accessible simulation** explicitly NOT claiming validated learning
outcomes, clinical decision support, or competence certification.

## 2. Users & setting

Primary: PGY-1–2 residents; secondary: sub-I medical students. Adult general-medicine ED admission,
fictional US hospital. Self-study, formative only. Learner = admitting clinician; nurse/inpatient
pharmacist/senior are NPCs and escalation targets.

## 3. v1 scope (definitive; frozen at charter per D-RISK-002)

- **Competencies:** BPMH-taking + discrepancy identification/resolution assessed fully; intentional
  admission changes only as bounded flag/escalate/propose-with-rationale (D-PROD-002).
- **Evidence sources (7, D-WF-001):** structured interview, caregiver informant, physical artifacts
  (bottles/pillbox/paper), stale imported EHR list, prior discharge summary, community-pharmacy
  dispensing history, one outpatient note — all under a dual-timestamp (event/documentation) claim
  model anchored to admission T0 (D-MED-002) with the D-MED-001 claim-status vocabulary; allergies
  use the same source-claim machinery (D-MED-003).
- **Mechanics:** simulated case clock with authored action costs, no real-time pressure (D-WF-002);
  four scored escalation actions (community pharmacy, PCP/specialist office, inpatient pharmacist,
  senior/attending — D-CLIN-002); signature-based completion with first-class "unable to
  verify"/"deferred with follow-up plan" (D-WF-004); graduated non-punitive hints shown in debrief
  (D-PED-001); three linked learner artifacts — working med history, discrepancy log, admission
  action list — rationale menus, NO free text (D-MED-004).
- **Truth & scoring:** two-layer truth/action contract locked as schema requirement (D-MED-005);
  accepted/partially-accepted/unsafe authored action sets with rationales; five transparent
  subscores, NO composite number (D-SCOR-001); ordinal severity/reversibility/time-to-harm labels,
  no invented probabilities; plausible-vs-inevitable harm language rules (D-SCOR-003); unsafe
  actions never blocked in-sim, surfaced in debrief with mechanism (D-SCOR-002); evidence-timeline
  debrief with per-discrepancy reveal cards, citations, targeted-replay pointers (D-PED-002).
- **Content:** 8–12 deterministic authored cases (D-PROD-005, D-CASE-001; count confirmed by
  taxonomy coverage); five-axis discrepancy metadata (type × causal mechanism × detectability ×
  urgency × harm class — D-TAX-001); must-cover phenotypes (D-TAX-002): omission, commission, wrong
  dose/frequency/formulation, therapeutic + brand/generic duplication, LASA, prescribed-vs-actual
  (incl. one affordability-driven), restart gap, stale import, unit/concentration (insulin),
  allergy-list discrepancy; high-alert mix (D-TAX-003 + D-CONS-003): methadone (OTP verification),
  clozapine-or-lithium, ART restart-gap, anticoagulant (periprocedural hold/bridge as ESCALATION,
  not learner-managed), insulin basal-bolus w/ concentration hazard, Parkinson/levodopa
  time-critical clock case, corticosteroid restart/adrenal suppression; ≥2 record-is-wrong cases
  where patient/caregiver is correct (D-CASE-002); 1–2 authorized-surrogate cases (capacity
  assessment itself out of scope — D-CONS-001); 1 interpreter case, systems/access framing
  (D-CONS-002); 3 difficulty tiers with recommended sequence, free navigation (D-TAX-004); curated
  synthetic formulary ~150–250 meds, real generic names, own versioned package, cases reference
  formulary IDs only (D-DATA-001, D-DATA-004).
- **Platform:** client-only static TypeScript web app, no backend/accounts/runtime network
  (D-ARCH-001/002); framework (Svelte-vs-React) + validation lib (Zod-vs-JSON-Schema) via EP-1 ADRs
  (D-ARCH-004, D-DATA-003); pure headless engine package, zero DOM deps (D-ARCH-006);
  schema-validated YAML case bundles, one directory per case incl. teaching notes + public review
  records (D-GOV-003, D-DATA-005); localStorage convenience only w/ clear-data control
  (D-ARCH-005); GitHub Pages deployment IS the demo, persistent synthetic/no-affiliation banner
  (D-UX-006); fictional-EHR chart IA with distinct non-chart channels + persistent workspace pane
  (D-UX-001); "fragmentation is fidelity; mechanical friction is not" (D-UX-002); desktop-first
  ≥~1024px, phones unsupported in v1 (D-UX-003); WCAG 2.2 AA release gate incl. nonvisual pill
  cues, keyboard + NVDA passes (D-UX-004); initial bundle ≤~300 KB gz, ~2018-laptop/4GB floor,
  no WebGL (D-ARCH-007); Windows-native toolchain, no WSL/containers (D-ARCH-003).
- **Versioning:** app semver 0.x until v1 criteria pass; content-schema major.minor stamped per
  bundle; per-bundle content versions; scripted in-repo codemod migrations; app supports one schema
  major (D-DATA-002, D-OSS-003).

## 4. v1.x / v2 conditional branches (entry-gated, not promised)

v1.x candidates: external-records exchange + claims-feed sources; transfer/periop settings;
facilitated mode; session export (privacy-gated); pharmacist dual review + lived-experience review
upgrades (named triggers — D-CLIN-001, D-GOV-004); transplant immunosuppressants; insulin pumps;
formal usability study; learner pilot (consent/IRB-gated); GUI authoring tool; LLM-assisted
authoring (gated, disclosed, human-adjudicated). v2: constrained procedural variation
(validation-gated); **MIMIC research adapter behind closed 4-step gate (D-MIMIC-001/002): written
goal+construct → then-current DUA/authorization/IRB verification → bounded feasibility spike →
explicit owner go. Never a v1 dependency; complete synthetic fallback permanent. Candidate goal:
aggregate disclosure-safe distributional realism to inform human authoring; per-case import
explicitly not a candidate. MIMIC does not contain BPMH ground truth, fill history, adherence, or
source-conflict labels; orders/prescriptions/administrations/actual use are different constructs.**

## 5. Non-goals (v1 and standing)

No runtime LLM; no LLM as clinical truth/judge ever (D-AI-001). No accounts, telemetry, backend,
stored performance, free-text input. No real PHI/employer data/recognizable trade dress/proprietary
references — ever. No summative/high-stakes assessment, CME, credentialing, patient-facing use,
live-EHR connection, or clinical-decision-support claims. No answer obfuscation (reference layers
public by design; summative integrity explicitly a non-goal — D-GOV-003). No phones in v1. No
calendar commitments in the roadmap (D-RISK-006).

## 6. Locked constraints (non-overridable in execution)

All safety/authorization/privacy/legal/data-use boundaries from the owner's originating brief, plus
as decided: CPU-only baseline, GPU never needed; EP-0 security baseline before substantive pushes
(D-SEC-001); layered leak prevention with `.local/` private zone (D-DATA-006, D-ROAD-002); every
reference-layer clinical rule cites an authoritative source with version/access date (D-GOV-002);
content lifecycle draft → CI validation → clinical self-review checklist (ISMP/AHRQ-derived) →
stigma-safety checklist → versioned dated PUBLIC review record → publish; re-review triggers:
annual, issue reports, clinical-semantics migrations (D-GOV-001); single-clinician-review
limitation disclosed everywhere incl. in-app pre-brief badges (D-CLIN-001, D-RISK-003);
contestable-scoring freeze procedure (D-RISK-004); harm-language rules (D-SCOR-003); claim–evidence
matrix at every release (D-QA-002); non-affiliation + synthetic labeling on every outward surface;
stigma-safety + trade-dress-originality checklists; v1 makes no patient-experience claims
(D-GOV-004); repo public during construction with status line (D-RISK-001); complete-at-rest
maintenance posture (D-RISK-005).

## 7. Delegated decisions & approved spikes

Delegated (logged, reversible): framework + validation-lib ADRs (EP-1); claim-vocabulary refinement
(schema epic, vs AHRQ/ISMP definitions); taxonomy axis value-sets (taxonomy epic); UX visual detail
(UX epic). Approved spikes: citation-format & approved-source tiers; name/identity screening
(D-OSS-004); taxonomy source review (AHRQ/ISMP/WHO, cited/dated). Specialist research uses current
primary/authoritative sources with access dates; unresolved empirical issues become explicit
spikes, never preferences.

## 8. Governance/OSS pack (decided)

MIT code + CC BY 4.0 content dual licensing (D-OSS-001); narrow PR intake, DCO + no-PHI/synthetic-
provenance/rights attestations, SECURITY.md private vuln reporting, Contributor Covenant,
best-effort support (D-OSS-002); semver/releases/CITATION.cff/THIRD-PARTY + data registry/templates
+ README honesty fix ("v1.0.0" → "working toward v1") (D-OSS-003); threat model + dependency policy
+ incident procedure (D-SEC-002); test pyramid on engine seam incl. golden-case regression,
keyboard-only Playwright smoke, axe, bundle budget; CI ubuntu + windows parity (D-QA-001).

## 9. Execution frame

Releases: **R0 foundation/governance → R1 vertical slice v0.1 (one complete intro case end-to-end,
Pages-deployed) → R2 depth & breadth (full sources, workspace, debrief, reviewed case mix, coverage
satisfied) → R3 hardening → v1.0** (D-EXEC-001). One EP brief per agent session; sibling-repo
conventions (phase tables, size/depends/done-hash, self-contained briefs, _TEMPLATE.md); main stays
runnable+green after implementation EPs; public-safe handoffs; resume from repo state only; read
order CLAUDE.md → DECISIONS.md → roadmap/README.md → the one EP brief (D-ROAD-001, D-EXEC-002).
Agent autonomy boundaries per D-EXEC-003 (clinical sign-off always owner; scoring semantics,
claims, deps beyond allowlist, license/legal/name, charter changes, publishing = owner-only).
First sessions: EP-0 baseline/governance, EP-1 toolchain bootstrap, EP-2 schema v0 + exemplar
(D-EXEC-004). Sizes S/M/L, no dates (D-RISK-006).

## 10. Specialist workstreams authorized

W1 clinical education & cases · W2 technical/data architecture · W3 UX & accessibility ·
W4 governance/security/OSS/portfolio. Each returns: recommendations w/ alternatives,
assumptions/confidence, charter conflicts, new material questions (batched, not acted on),
risks/dependencies/spikes, proposed EP slices w/ acceptance criteria, citations w/ access dates.
Then: lead integration → independent adversarial review → remediation → roadmap package written to
`roadmap/` (+ sanitized DECISIONS.md, CLAUDE.md read-order stub). Docs only; no implementation,
commits, or publishing without separate owner authorization.
