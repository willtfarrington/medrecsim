# Traceability — requirement → decision → work → acceptance

Every product requirement and approved constraint traces to decisions (D-*), the EPs that
implement it, and where its acceptance is verified. Non-goals trace to their standing statement.
Verified at EP-38 (gate 1 of the release audit). Planning-process prose (how the roadmap itself
was produced) is deliberately not traced — only product requirements and constraints are.

## Product & pedagogy

| Requirement | Decision(s) | Implementing EPs | Acceptance lives in |
|---|---|---|---|
| BPMH + discrepancy competencies taught/assessed separately; competency 3 bounded to flag/escalate | D-PROD-002 | EP-12 (subscores), EP-18 (action list), all case EPs | Golden-case tests; case review records |
| PGY-1–2 primary audience; formative self-study | D-PROD-001/003 | EP-19 (pre-brief framing), case EPs (difficulty) | Review records; claims matrix C4 |
| ED admission setting, fictional US hospital | D-PROD-004 | EP-14, case EPs | Case bundles; identity registry |
| 8–12 reviewed cases, count coverage-derived | D-PROD-005, OQ-2 | EP-26–32, EP-35 | `coverage` output at EP-35 |
| Honest success framing, no validation claims | D-PROD-006, D-QA-002 | EP-2, EP-5, EP-19, EP-38 | Claims matrix pass at every release |
| Three learner artifacts, no free text | D-MED-004 | EP-18 | Playwright smoke; INV-SCOPE-001 |
| Signature completion w/ unable-to-verify/deferred | D-WF-004 | EP-12, EP-18 | Signature-gate unit tests; golden runs |
| Five subscores, no composite, ordinal harm labels | D-SCOR-001/003 | EP-12, EP-18, EP-24 | Golden snapshots; harm-language lint |
| Accepted/partial/unsafe sets; unsafe never blocked | D-SCOR-002, D-MED-005 | EP-9 (schema), EP-12, case EPs | INV-ACT-001/002; review checklist §7 |
| Graduated non-punitive hints | D-PED-001 | EP-12 (recording), EP-25 (UI), EP-24 (display) | INV-HINT-001; debrief render check |
| Evidence-timeline debrief w/ reveal cards + citations | D-PED-002, D-RISK-003 | EP-12 (data), EP-24 (UI) | Debrief-data golden; EP-24 acceptance |
| Simulated clock, authored costs, no real-time pressure | D-WF-002 | EP-11, EP-15 (display), EP-21 (latency) | Determinism property tests; INV-TIME-003 |
| Four scored escalation actions | D-CLIN-002, OQ-3 | EP-9, EP-21, case EPs | Escalation golden scripts |
| Seven evidence sources | D-WF-001 | EP-16/17/21/22/23 (UI), case EPs (content) | Coverage declarations; EP acceptance |
| Structured-dialogue interview; interpreter/surrogate/caregiver modes | D-SIM-001, D-CONS-001/002 | EP-17, EP-23, EP-26, EP-31 | Case review records; mode acceptance |
| Learner = admitting clinician; nurse/pharmacist/senior as NPCs & escalation targets | D-WF-003 | EP-17 (NPC dialogue), EP-21 (escalation NPCs), case EPs | Case bundles; escalation golden scripts |
| Claim-status vocabulary (single versioned enum, three usages) | D-MED-001 | EP-7 (refinement vs AHRQ/ISMP), EP-9 (schema enum module) | Taxonomy doc sign-off; INV enum validation |
| Sensitive content (OUD/psych/ART) stigma-safe | D-CONS-003, D-GOV-004 | EP-6 (checklist), EP-29/30/32, EP-35 (aggregate audit) | Stigma-safety records per case + roster audit |
| ≥2 record-is-wrong cases | D-CASE-002 | EP-14 (C01), EP-26 (C06), EP-30 (C09), EP-31 (C10) | Coverage matrix row |
| Deterministic authored cases, replayable | D-CASE-001 | EP-11, EP-12 | Determinism property + golden tests |
| Allergy claims via same machinery; scored sub-tasks | D-MED-003 | EP-9, EP-26 (C06), EP-31 (C10) | Schema; case review records |
| Dual timestamps; post-T0 never overwrites pre-T0 | D-MED-002 | EP-9, EP-11 | INV-TIME-001/002; reducer typed-error test |
| Two-layer truth contract; irreducible uncertainty preserved | D-MED-005 | EP-9, EP-11 (API seam), EP-12 | INV-TRUTH-001, INV-DISC-003 |
| Five-axis taxonomy metadata; coverage matrix derived | D-TAX-001/002 | EP-7, EP-9, EP-20, EP-35 | INV-DISC-001; `coverage --gate` |
| High-alert mix incl. escalation-only anticoagulant | D-TAX-003 | EP-27–32, EP-13 (flags) | EP-27 validator proof; review checklist §4 |
| Difficulty tiers + recommended sequence | D-TAX-004 | EP-19 (picker), case EPs | Case metadata; INV-META-001 |

## Content governance & clinical safety

| Requirement | Decision(s) | Implementing EPs | Acceptance |
|---|---|---|---|
| Documented-equivalent review; "physician-reviewed (single reviewer)" wording | D-CLIN-001 | EP-6 (checklists), every case EP, EP-2/5 (copy) | Public review records; claims matrix C3 |
| Content lifecycle w/ public review records + re-review triggers | D-GOV-001 | EP-6, case EPs, annual process | Review records in bundles; INV-META-001 |
| Citation per clinical rule, tiered sources | D-GOV-002 | EP-6 (format), EP-9/20 (INV-CIT-001), case EPs | Validator; review checklist §10 |
| Case-bundle packaging, public reference layer | D-GOV-003 | EP-9, EP-14 | Bundle validation; layout in repo |
| Review-status badge in pre-brief; citations rendered in debrief | D-RISK-003 | EP-19, EP-24 | UI acceptance criteria |
| Contestable-scoring freeze | D-RISK-004 | EP-4 (procedure), EP-2 (issue template), schema freezability | INCIDENT-PROCEDURE; schema supports per-item freeze |
| Synthetic-only, no PHI ever | charter locked; D-SEC-001 | EP-0 (hooks), EP-2 (attestations), EP-4 | gitleaks + tripwire; PR template; claims C2 |
| Formulary as versioned cited package; formulary-ID references | D-DATA-001/004 | EP-13, EP-33 | INV-REF-001/002; sign-off on flags |

## Platform, accessibility, quality

| Requirement | Decision(s) | Implementing EPs | Acceptance |
|---|---|---|---|
| Static client-only app; no runtime network; Pages demo | D-ARCH-001, D-UX-006 | EP-8, EP-19 | CI no-network invariant; Pages deploy |
| Headless engine seam | D-ARCH-006 | EP-8 (layout), EP-11/12 | Zero-DOM package; engine-only tests |
| localStorage convenience only + clear-data | D-ARCH-005 | EP-11 (envelope), EP-15 (settings) | Resume-discard tests; settings acceptance |
| WCAG 2.2 AA release gate incl. nonvisual pill cues | D-UX-004 | EP-10, EP-15–25 (per-slice DoD), EP-36 | axe CI matrix; NVDA script logs; empty exception list |
| Fragmentation-is-fidelity principle | D-UX-002 | EP-16, EP-22 | Heuristic CS-1 in EP-37 eval |
| Desktop-first; phones unsupported notice | D-UX-003 | EP-15 | Viewport-notice acceptance |
| Original identity, no trade dress | charter; D-OSS-004 | EP-3, EP-10 | NAME-SCREEN.md; originality checklist records |
| Bundle/perf budgets, 2018 floor | D-ARCH-007 | EP-8 (check), EP-36 (floor test) | CI budget gate; throttled-profile timing |
| Test pyramid, golden regression, both-OS CI | D-QA-001 | EP-8, EP-12, EP-20 | CI green definition in each brief |
| TypeScript + lightweight framework + Vite; YAML/JSON content, no DB | D-ARCH-002 | EP-8 (toolchain + ADR-1) | ADR merged; CI build green |
| Windows-native toolchain; no WSL/containers; hosted-runner CI | D-ARCH-003 | EP-8 (toolchain), all implementation EPs | CI matrix config; no container files in repo |
| Framework & validation-lib choices via written ADRs | D-ARCH-004 | EP-8 (ADR-1/ADR-2 + SP-4/SP-5) | ADR files merged with measured evidence |
| Hand-authored YAML + exemplar + authoring docs + validator CLI | D-DATA-005 | EP-9 (CLI + docs + exemplar scaffold), EP-14 (annotated exemplar) | CLI commands work; authoring doc generated |
| Usability evidence: heuristic eval + informal think-alouds, no retention | D-UX-005 | EP-37 | Findings triaged; no-retention rule in public record |
| Three version streams + codemod migrations | D-DATA-002 | EP-8/9, EP-34 | INV-VERS-001; exercised codemod |
| Security baseline before substantive pushes | D-SEC-001 | EP-0, EP-1 | SECURITY-BASELINE.md dated rows |
| Threat model, dependency policy, incident procedures | D-SEC-002 | EP-4 | Docs exist, cross-referenced; EP-38 revisit |
| Claims–evidence matrix at every release | D-QA-002 | EP-5, EP-19, EP-38 | Matrix pass recorded per release |
| MIT + CC BY split; governance/community files | D-OSS-001/002/003 | EP-0, EP-2 | Files exist; community-standards checklist green |
| MIMIC closed gate only | D-MIMIC-001/002 | EP-4 (gate doc); branch B-21 | MIMIC-GATE.md matches charter verbatim |
| No runtime LLM / no LLM judge | D-AI-001 | standing non-goal | No EP introduces one; claims matrix |
| No calendar dates; S/M/L sizing | D-RISK-006 | roadmap structure | This roadmap |
| Public during construction w/ status line | D-RISK-001 | EP-0 (line), EP-38 (removal) | README state per release |
| Complete-at-rest v1 | D-RISK-005 | EP-38; no-service architecture | Release audit gate 11 |

## Non-goals (standing; no implementing work by design)

Summative/high-stakes assessment, CME, credentialing · patient-facing use · live-EHR
integration/CDS claims · accounts/telemetry/backend/free-text input · answer obfuscation ·
phone support in v1 · real PHI or restricted data anywhere · runtime LLM — all per charter §5;
the claims matrix (EP-5) is the enforcement surface for their outward wording.
