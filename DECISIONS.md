# medrecsim decision ledger

Binding product/planning decisions, made and approved by the project owner during roadmap
discovery (six question batches, 2026-08-23; all entries were explicit owner selections — every
recommendation was individually confirmed, none inferred from silence). The Planning Charter
([roadmap/charter.md](roadmap/charter.md)) was approved verbatim the same day.

**Change protocol:** a decision changes only by appending a new dated entry here (old entry marked
`superseded by D-…`), made by the owner. Agents may not modify this file's decisions. Reversibility
notes are recorded where they matter. IDs are stable and cited throughout the roadmap.

Domains: PROD product · CLIN clinical governance · WF workflow · CONS consent/sensitive ·
MED evidence model · TAX taxonomy · CASE cases · PED pedagogy · SCOR scoring · GOV content
governance · UX interface/accessibility · ARCH architecture · DATA data/content · AI ·
MIMIC · SEC security · QA quality · OSS governance/licensing · EXEC execution · RISK risk ·
ROAD planning process.

## Product

- **D-PROD-001** — Primary learners: PGY-1–2 interns/junior residents; senior medical students
  (sub-I) explicitly supported secondary. *(costly to reverse)*
- **D-PROD-002** — v1 teaches and assesses competency 1 (best possible medication history) and
  competency 2 (identifying/resolving unintended discrepancies) fully; competency 3 (intentional
  admission changes) appears only as bounded "flag & escalate / propose with rationale," never
  free-form order entry. *(costly)*
- **D-PROD-003** — Self-study, formative only. No accounts, stored performance, or facilitator
  tooling in v1.
- **D-PROD-004** — Setting: adult general-medicine admission from the ED of a fictional US
  hospital. Transfers/perioperative admissions are v1.x branches.
- **D-PROD-005** — 8–12 fully reviewed cases at v1 (provisional floor; final count derived from
  the taxonomy coverage matrix).
- **D-PROD-006** — v1 success = publicly demonstrable, expert-reviewed, honest simulation with
  explicit "not yet validated for learning outcomes" framing. Learner pilots are a v1.x gate with
  their own consent/IRB analysis.

## Clinical content governance

- **D-CLIN-001** — Review model: documented-equivalent path — owner-physician review + structured
  self-review checklist derived from ISMP/AHRQ sources + prominently disclosed single-reviewer
  limitation. Independent pharmacist/medication-safety dual review is a named upgrade trigger.
- **D-CLIN-002** — Four first-class scored escalation actions: call community pharmacy; contact
  PCP/specialist office; consult inpatient pharmacist; discuss with senior/attending. Authored
  availability/latency/response content per case; expected-escalation sets are scored.
- **D-GOV-001** — Content lifecycle: draft → automated validation (schema+invariants+coverage in
  CI) → clinical self-review checklist → stigma-safety checklist → versioned, dated, **public**
  review record committed beside the case → publish. Re-review triggers: annual review, issue
  reports, schema migrations touching clinical semantics.
- **D-GOV-002** — Every reference-layer clinical rule (accepted/unsafe sets, escalations, teaching
  notes) cites ≥1 authoritative source with version/access date. A spike defines citation format
  and approved-source tiers.
- **D-GOV-003** — One directory per case ("case bundle"): evidence layer + reference layer
  (schema-validated YAML/JSON), teaching notes, citations, review records, changelog; unit-
  validated; own version. Reference layers are public by design; summative integrity is an
  explicit non-goal.
- **D-GOV-004** — v1 makes no patient-experience claims; narratives pass the stigma-safety
  checklist; lived-experience review is a named upgrade trigger before any patient-perspective
  claims or features.

## Clinical workflow

- **D-WF-001** — Seven v1 evidence sources: (1) structured patient interview, (2) caregiver/family
  informant, (3) physical artifacts (bottles, pillbox, paper lists), (4) stale imported EHR med
  list, (5) prior discharge summary, (6) community-pharmacy dispensing history (with latency),
  (7) one outpatient note. Claims-like feeds and external-records exchange deferred to v1.x.
- **D-WF-002** — Simulated case clock: each action advances simulated time by an authored amount;
  no real-time pressure anywhere; time-critical medications interact with the clock
  deterministically.
- **D-WF-003** — Learner plays the admitting clinician; nurse, inpatient pharmacist, and senior/
  attending are authored NPCs and escalation targets. Interprofessional learner roles are v1.x.
- **D-WF-004** — Cases end by explicit learner signature. At signature every medication carries a
  status — including first-class "unable to verify" and "deferred, with follow-up plan" — and
  unresolved discrepancies need an escalation or documented rationale. No forced time-out.

## Consent & sensitive context

- **D-CONS-001** — 1–2 cases with impaired-capacity patients and an authorized surrogate as
  primary informant; authorization explicit in-case; capacity assessment itself is authored fact,
  not a learner task.
- **D-CONS-002** — One case with a non-English-preferring patient; requesting the professional
  interpreter is the modeled-correct action; ad-hoc family interpretation modeled lower-
  reliability; systems/access framing with stigma-safety review emphasis.
- **D-CONS-003** — Sensitive-medication content in v1: opioid-use-disorder therapy (methadone
  continuation with OTP verification), psychiatric medications (clozapine or lithium), and an
  ART/HIV restart-gap case. Reproductive-health medications not in the v1 mix.

## Medication/evidence model

- **D-MED-001** — Working per-source claim-status vocabulary: prescribed / dispensed /
  taking-as-directed / taking-differently (with how) / held-by-clinician / self-discontinued /
  stopped-by-clinician / course-completed / restarted / never-started / unknown-to-source.
  Refinement delegated to the schema epic (ADR vs AHRQ/ISMP definitions).
- **D-MED-002** — Dual timestamps on every claim: event time + documentation time, anchored to
  admission T0; simulated clock advances past T0. Inpatient holds are post-T0 actions and can
  never overwrite reconstructed pre-admission state (schema-enforced).
- **D-MED-003** — Allergies/intolerances use the same source-claim machinery (agent, reaction,
  severity, timing, verification status, prior tolerance); allergy-list reconciliation is a scored
  sub-task in 1–2 cases.
- **D-MED-004** — Three linked learner artifacts: working medication history (per-med status,
  confidence, claim links); discrepancy log (classified, resolved-with-rationale or escalated);
  admission action list (continue/hold/needs-decision/escalate + justification chosen from
  authored rationale menus — no free text in v1). Signature validates all three.
- **D-MED-005** — Two-layer truth/action contract locked as a schema requirement: author-only
  reference layer (reference regimen, actual-use state, facts marked initially-known /
  conditionally-discoverable / inferable / intentionally-unknowable, accepted+unsafe action sets,
  expected escalations, irreducible uncertainty preserved) + learner-observable evidence layer.
  Scoring compares only against accepted-alternative sets; never a hidden single answer where
  authors marked uncertainty irreducible.

## Cases & taxonomy

- **D-TAX-001** — Five-axis discrepancy metadata: type × causal mechanism × detectability ×
  urgency × harm class; value-sets drafted in a taxonomy epic against AHRQ/ISMP/WHO sources
  (cited, dated); the case-mix coverage matrix derives from this metadata.
- **D-TAX-002** — Must-cover phenotypes (each ≥1 case): omission; commission; wrong dose/
  frequency/formulation; therapeutic + brand/generic duplication; look-alike/sound-alike; 
  prescribed-vs-actual mismatch (incl. one affordability/access-driven); restart gap; stale-import
  error; unit/concentration error (insulin); allergy-list discrepancy.
- **D-TAX-003** — High-alert classes in v1 (with D-CONS-003): anticoagulant (periprocedural
  hold/bridge handled as escalation, not learner-managed bridging), insulin basal-bolus with a
  concentration/unit hazard (pumps → v1.x), Parkinson/levodopa as the time-critical clock case,
  chronic corticosteroid restart (adrenal suppression). Transplant immunosuppressants → v1.x
  (review-capacity rationale).
- **D-TAX-004** — Three difficulty tiers: introductory (1–2), core (majority), advanced (2–3);
  recommended sequence shown, free navigation allowed.
- **D-CASE-001** — v1 cases are fully authored and deterministic; no procedural variation
  (constrained variation is a v2 branch behind a validation gate).
- **D-CASE-002** — ≥2 cases where an electronic/dispensing source is wrong and the patient or
  caregiver is correct.

## Pedagogy & scoring

- **D-PED-001** — Per-case pre-brief (objectives, role framing, synthetic banner) + graduated
  hints (nudge → directed → reveal-source); hint use is shown in the debrief, never score-
  subtracting.
- **D-PED-002** — Evidence-timeline debrief is the centerpiece: what-was-knowable-when timeline,
  learner path vs reference overlay, per-discrepancy reveal cards (classification, ordinals,
  mechanism, cited teaching note), uncertainty rationale, targeted-replay pointers.
- **D-SCOR-001** — Five transparent subscores, no composite number: information seeking &
  prioritization; discrepancy detection (urgency/harm-weighted); action safety; uncertainty &
  escalation handling; documentation quality. Ordinal severity/reversibility/time-to-harm labels;
  no invented probabilities.
- **D-SCOR-002** — Accepted / partially-accepted / unsafe authored sets per scoreable action, each
  entry with a short rationale; unsafe actions are never blocked in-sim and are surfaced
  prominently in the debrief with mechanism-of-harm teaching.
- **D-SCOR-003** — Harm-language rule: plausible-consequence phrasing with ordinal severity;
  inevitable-harm claims only where authored as such; no fabricated statistics; any numbers come
  from cited teaching notes.

## UX & accessibility

- **D-UX-001** — Fictional-EHR "chart" home surface: patient header; source-navigation pane
  (chart tabs + visually distinct non-chart channels: phone-call dialogs, artifact viewer, bedside
  interview); persistent workspace pane with the three learner artifacts. Original visual
  identity, fictional institutions, trade-dress-originality checklist.
- **D-UX-002** — Principle: "fragmentation is fidelity; mechanical friction is not." Information
  is scattered/contradictory by design; controls are modern, consistent, accessible; no simulated
  slowness, dark patterns, or reproduced EHR bad habits.
- **D-UX-003** — Desktop/laptop browsers first-class (evergreen, last ~2 versions), fully
  keyboard-operable, functional to ~1024px; tablets best-effort; phones unsupported in v1 with a
  notice.
- **D-UX-004** — WCAG 2.2 AA is a v1 release gate: automated checks in CI + manual keyboard-only
  and NVDA screen-reader pass per release; 200% zoom/reflow; information never color-only;
  prefers-reduced-motion respected; nonvisual pill cues (authored text descriptors of appearance);
  plain-language chrome; no timing-dependent interactions; public documented-exception process.
- **D-UX-005** — v1 usability evidence: heuristic evaluation + informal think-aloud with 3–5
  colleagues (no data retention, no learning-outcome claims). Formal usability study is a v1.x
  gate.
- **D-UX-006** — The GitHub Pages deployment *is* the demo; persistent "fictional/synthetic —
  educational use only — personal project, no institutional affiliation" banner; README
  screenshots come from it after leak screening.

## Architecture

- **D-ARCH-001** — Client-only static web application: no backend, no accounts, no runtime
  network calls; cases ship as versioned content files; offline-capable; hostable on GitHub
  Pages. *(costly to reverse)*
- **D-ARCH-002** — TypeScript + a lightweight component framework + Vite; content as schema-
  validated YAML/JSON; no database. *(costly)*
- **D-ARCH-003** — Windows-native toolchain (Node LTS); no WSL2/containers/virtualization
  changes; CI on hosted runners.
- **D-ARCH-004** — Svelte-vs-React delegated to a written ADR in the first implementation
  session; criteria: accessibility/testing maturity, solo maintainability, bundle size,
  longevity, owner familiarity (none stated).
- **D-ARCH-005** — localStorage for convenience only (resume in-progress case, settings,
  completion marks) with a "clear all local data" control; graceful when storage is blocked;
  nothing leaves the machine; no export or history dashboard in v1.
- **D-ARCH-006** — The simulation engine is a pure, headless TypeScript package (case loading,
  clock, evidence resolution, action recording, scoring, debrief-data generation) with zero DOM
  dependencies; the UI package consumes it; property/invariant and golden-case tests run against
  the engine directly.
- **D-ARCH-007** — Public hardware floor: ~2018 laptop/Chromebook, 4 GB RAM, integrated graphics.
  Budgets: initial JS bundle ≤ ~300 KB gz (case content lazy-loaded), interactive < 3 s on floor
  hardware, no WebGL; CI bundle-size check enforces.

## Data & content engineering

- **D-DATA-001** — Curated in-repo synthetic formulary (~150–250 medications): real generic
  names, original descriptions, no bundled external terminology; RxNorm consulted read-only
  during authoring. Includes LASA pairs, formulations, combination products.
- **D-DATA-002** — Three version streams: app (semver), content-schema (major.minor stamped in
  every bundle), per-bundle content versions. App supports exactly one schema major; migrations
  ship as scripted in-repo codemods migrating all bundles in the same change; local convenience
  state is versioned and politely discarded on mismatch.
- **D-DATA-003** — Schema validation (Zod-or-JSON-Schema, same ADR as D-ARCH-004) + custom
  invariant validators for charter semantics (post-T0 holds immutable pre-T0 state; five-axis
  metadata + ≥1 detectability path per discrepancy; rationale per action-set entry; citation per
  clinical rule; timeline consistency; tier/coverage/review-record declarations). All in CI;
  golden-case snapshots pin engine behavior.
- **D-DATA-004** — The formulary is its own versioned content package (id, generic name, class,
  forms/strengths, LASA partner refs, high-alert + time-critical flags, cited monitoring notes,
  pill-appearance text descriptors); cases reference formulary IDs, never free-text drug names.
- **D-DATA-005** — Hand-authored YAML case bundles supported by an annotated exemplar case,
  schema-derived authoring docs, and a CLI validator (`validate`, `coverage` — prints the
  taxonomy coverage matrix). No GUI authoring tool in v1.
- **D-DATA-006** — `source material/` holds only redistributable, license-verified, cited
  reference material or a pointer bibliography (URL/version/access date); the data/asset registry
  lives there; anything unvetted or private lives in `.local/` (gitignored).

## Algorithms & AI

- **D-AI-001** — No runtime LLM in v1; an LLM is never clinical truth or final judge. LLM-assisted
  authoring is a separately gated v1.x question (necessity, cost/privacy/offline/fallback
  analysis, strict schemas, deterministic checks, expert review, disclosure).
- **D-SIM-001** — Patient interview = structured dialogue: authored question menus with tracked
  information-seeking cost/order, authored responses keyed to the case's source-claim model.

## MIMIC boundary

- **D-MIMIC-001** — MIMIC appears in the roadmap only as a closed gate; no MIMIC work packages in
  v1 or v1.x. A conditional v2 research-adapter track requires, in order: (1) written enrichment
  goal + construct definition; (2) verification of then-current PhysioNet release/DUA/training/
  permitted-purpose terms and whether IRB/legal review is needed; (3) a bounded feasibility spike;
  (4) explicit owner go. The complete synthetic pipeline is the permanent fallback.
- **D-MIMIC-002** — Named candidate gate goal: aggregate, disclosure-safe distributional realism
  to inform human authoring (polypharmacy counts, medication-class frequencies, admission-context
  patterns). Per-case data import is explicitly not a candidate. Recorded caveat: MIMIC does not
  contain BPMH ground truth, community fill history, adherence, or source-conflict labels;
  orders, prescriptions, administrations, and actual use are different constructs.

## Security & quality

- **D-SEC-001** — EP-0 security baseline before substantive pushes: secret scanning + push
  protection; Dependabot alerts + dependency review; CodeQL; branch protection on `main` (no
  force-push, CI green); least-privilege workflow tokens; SHA-pinned actions; restricted
  forked-PR workflows (no secrets to forks; Pages deploys from `main` only); layered `.gitignore`
  (leading with `.local/`); synthetic-fixture allowlist convention; pre-commit secret/data scan.
- **D-SEC-002** — Written threat model (supply chain, malicious contributions, CI/token
  compromise, Pages integrity) + dependency policy (minimal deps, lockfile, no unreviewed
  postinstall scripts, reviewed-not-auto-merged updates) + incident/correction procedure incl.
  sensitive-commit response (history rewrite + rotate + document). Revisit trigger: any v1.x
  feature accepting input or hosting state.
- **D-QA-001** — Test pyramid on the engine seam: engine unit + property/invariant tests; golden-
  case regression (full run snapshots incl. scoring/debrief = the accepted-alternative
  regression); component tests; Playwright keyboard-only end-to-end smoke; axe accessibility
  checks; bundle-budget check. CI on ubuntu (primary) + windows (parity). Visual regression
  deferred to the polish phase.
- **D-QA-002** — Public claim–evidence matrix mapping every outward claim to its evidence or
  softening; checked at every release; new claims require a row; lists all standing disclaimers.

## OSS, licensing & portfolio

- **D-OSS-001** — Code: MIT. Content (case bundles, formulary, teaching notes, docs): CC BY 4.0.
  Split declared in LICENSE + content-license notice + README explanation. *(costly to reverse)*
- **D-OSS-002** — Issues welcome; PRs accepted narrowly (no new clinical cases initially); PR
  template requires DCO sign-off + attestations (no PHI, no real-patient-derived content, no
  proprietary material, synthetic provenance, rights to contribute); SECURITY.md with private
  vulnerability reporting; Contributor Covenant; best-effort/no-SLA support statement.
- **D-OSS-003** — Semver with 0.x during construction; v1.0.0 only when release criteria pass;
  fix the README's premature "v1.0.0" tagline in EP-0; tagged releases + Keep-a-Changelog;
  CITATION.cff; honest-portfolio README; third-party notices + data/asset registry; issue/PR
  templates.
- **D-OSS-004** — Name/identity screening spike near EP-0: search "medrecsim" and invented
  fictional names for collisions (GitHub, npm, PyPI, domains, obvious trademark/common-law hits);
  document with "not legal advice" note; response = rename before the v1 visibility push.

## Execution

- **D-EXEC-001** — Release skeleton: **R0** foundation & governance → **R1** vertical slice v0.1
  (one complete introductory case end-to-end, Pages-deployed) → **R2** depth & breadth (full
  source set, complete workspace, debrief, reviewed case mix, coverage satisfied) → **R3**
  hardening → v1.0.
- **D-EXEC-002** — One EP brief per session; phase tables with size/depends/done-hash;
  implementation EPs leave `main` runnable and green; public-safe handoff records; sessions
  resume from repository state only; read order: CLAUDE.md → DECISIONS.md → roadmap/README.md →
  the one assigned brief.
- **D-EXEC-003** — Agents may decide reversible technical matters (logged). Owner-only, never
  delegated: clinical sign-off on every case; changes to accepted/unsafe sets or scoring
  semantics; new outward claims; runtime dependencies beyond the EP-1 allowlist; license/legal/
  naming; charter changes; publishing beyond repo/Pages.
- **D-EXEC-004** — First three implementation sessions: EP-0 baseline & governance; EP-1
  toolchain bootstrap (monorepo, ADRs, CI skeleton, Pages hello-world); EP-2 schema v0 +
  formulary schema v0 + validator CLI + annotated exemplar case + golden-test harness.

## Risk posture

- **D-RISK-001** — Repo stays public during construction; prominent README status line
  ("pre-release; under active construction; nothing here is validated") from EP-0 until v1.0.
- **D-RISK-002** — Hard parking rule: mid-build feature ideas go to the roadmap's parked list
  (`final-roadmap.md`), never into a running EP; v1 scope changes only via a new entry here.
- **D-RISK-003** — Every case shows its review-status badge (review-record version + date +
  "single-clinician review") in the in-app pre-brief; debrief teaching notes always render their
  citations.
- **D-RISK-004** — Contestable-scoring freeze: any credible challenge to an accepted/unsafe
  classification freezes that item ("discussion item — not scored" via content patch) until
  re-adjudicated through the D-GOV-001 lifecycle; the case changelog records dispute and
  resolution.
- **D-RISK-005** — v1 is designed complete-at-rest: no services, recurring costs, or scheduled
  obligations except the annual content re-review; staleness is self-evident via review badges;
  a maintenance-status README line is added if the owner steps away.
- **D-RISK-006** — The roadmap carries S/M/L sizes and dependency order, no calendar dates;
  time-sensitive facts are marked "reverify at execution."

## Planning process

- **D-ROAD-001** — Roadmap artifact system: `roadmap/README.md` master index with phase tables;
  self-contained `EP-N-*.md` briefs sized to one agent session; `_TEMPLATE.md`; this ledger;
  defined read order.
- **D-ROAD-002** — Private planning state lives in `.local/planning/` (gitignored, first line of
  `.gitignore`); nothing private is committed; public artifacts carry only sanitized content.

## Roadmap-integration rulings (owner decisions, 2026-08-23)

At roadmap approval the owner accepted the planning recommendation on all twelve open questions
(OQ-1…OQ-12 in [roadmap/appendices/open-questions.md](roadmap/appendices/open-questions.md));
briefs that stated an OQ assumption now stand on a decided fact. Rulings:

- **OQ-1** — C11's psychiatric high-alert medication is **clozapine** (lithium remains a drop-in
  variant if ever revisited).
- **OQ-2** — Roster size **11** (2 introductory / 6 core / 3 advanced) approved as the
  coverage-derived D-PROD-005 count.
- **OQ-3** — Escalation channel relabeled **"outpatient prescriber/program office"** (still
  exactly four scored actions; amends D-CLIN-002's label only).
- **OQ-4** — P-001 and P-002 **deferred to v1.x** (P-002's alert-fatigue lesson taught in
  debrief text at v1).
- **OQ-5** — Formulary sized to a **150–250 target band**; roster realism plus distractors
  decide; outcome recorded at EP-33.
- **OQ-6** — Bulk-cite ("seed working list as unverified rows") **allowed and scoring-neutral**.
- **OQ-7** — Targeted replay runs as an **unscored replay mode** (no completion-mark overwrite).
- **OQ-8** — Golden-snapshot updates guarded by the **PR-template flag + owner review**
  (CI hard-block available if drift is observed).
- **OQ-9** — **Contributor Covenant 3.0.**
- **OQ-10** — **No defensive domain registration**; the Pages URL is canonical.
- **OQ-11** — v1 carries the README narrative arc; a **standalone case-study doc is v1.x**
  (branch B-13).
- **OQ-12** — A short owner-approved **AI-assisted-authoring disclosure paragraph** ships in
  CONTRIBUTING/README (wording approved at EP-2).

## Parked (adjudicated 2026-08-23 via OQ-4 — deferred to v1.x)

- **P-001** — Authored end-trigger pressure variant ("you're paged to the next admission") —
  deferred to v1.x; see roadmap/final-roadmap.md.
- **P-002** — Dismissible authored "pharmacy flag" interruption as alert-fatigue teaching —
  deferred to v1.x; the lesson is taught in debrief text at v1.

## Assumptions

- **A-001** — `medrecsim/` subdirectory is the future code workspace; `source material/` holds
  vetted reference inputs (sibling-project pattern; low consequence if wrong; confirmed by owner
  approval of the charter).
