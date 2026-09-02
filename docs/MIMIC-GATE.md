# MIMIC gate (D-MIMIC-001, D-MIMIC-002)

> **Status: CLOSED. This document authorizes nothing.**
>
> No MIMIC or other restricted-dataset work exists in this project, is planned for v1 or v1.x,
> or may be started by reading this page. The document exists so that the closed gate is
> public, its conditions are written down before anyone is tempted to improvise them, and the
> hard rules in §5 are enforced now, while the gate is closed, against every agent session and
> every contributor. **Abandonment is the default trajectory** (§7).

**Current as of:** 2026-09-02 (EP-4) · **Owner:** repository owner (every step below is
owner-only under D-EXEC-003) · **Revisit trigger:** §8.

Related: [THREAT-MODEL.md](THREAT-MODEL.md) (asset A5, the absence-of-PHI guarantee),
[INCIDENT-PROCEDURE.md](INCIDENT-PROCEDURE.md) (an S2 incident is the failure mode of this
document), [SECURITY-BASELINE.md](SECURITY-BASELINE.md) (the tripwire hook that flags
restricted-dataset markers, row B4), and the parked branch **B-21** in
[roadmap/final-roadmap.md](../roadmap/final-roadmap.md).

## 1. What this document is and is not

- It **is** the public instantiation of the closed gate that D-MIMIC-001 requires, with the
  candidate goal from D-MIMIC-002 quoted verbatim, the four sequential steps that would have to
  be completed in order before any such work could begin, the hard rules that apply regardless,
  and the statement that the default outcome is that none of this ever happens.
- It **is not** a plan, a proposal, a feasibility study, an application for access, or a
  permission slip. Nothing in it obliges the owner to do anything, ever.
- It **binds** agent sessions and contributors immediately (§5), because the way a closed gate
  fails is not by being opened deliberately but by restricted material drifting into an
  authoring session "just to check something".

## 2. The candidate goal, verbatim from DECISIONS.md

> **D-MIMIC-002** — Named candidate gate goal: aggregate, disclosure-safe distributional realism
> to inform human authoring (polypharmacy counts, medication-class frequencies, admission-context
> patterns). Per-case data import is explicitly not a candidate. Recorded caveat: MIMIC does not
> contain BPMH ground truth, community fill history, adherence, or source-conflict labels;
> orders, prescriptions, administrations, and actual use are different constructs.

And the gate itself:

> **D-MIMIC-001** — MIMIC appears in the roadmap only as a closed gate; no MIMIC work packages in
> v1 or v1.x. A conditional v2 research-adapter track requires, in order: (1) written enrichment
> goal + construct definition; (2) verification of then-current PhysioNet release/DUA/training/
> permitted-purpose terms and whether IRB/legal review is needed; (3) a bounded feasibility spike;
> (4) explicit owner go. The complete synthetic pipeline is the permanent fallback.

Two consequences follow directly. First, the only thing that could ever be asked of the data is
*"what do realistic distributions look like?"*, and the only consumer of the answer is a human
author writing fictional cases. Second, the caveat means that even that answer is partial: the
constructs medrecsim teaches (best possible medication history, community fill history,
adherence, conflicting sources) are not in the dataset. The synthetic pipeline, which authors
those constructs directly with cited clinical sources, is not a stopgap but the design.

## 3. Why the gate is closed rather than absent

The charter forbids restricted datasets "anywhere near this repo, CI, or any agent context".
Writing the gate down does three things that silence would not:

1. It records that the idea was considered and *what* was considered, so that a future session
   does not re-invent a broader version.
2. It fixes the sequence, so that "let me just look at the tables" cannot happen before the
   memo, the terms check, and the owner decision.
3. It turns the hard rules into enforceable text that the pre-commit tripwire, CONTRIBUTING's
   attestations, and this project's agent instructions all point at.

## 4. The four steps (all required, strictly in order, all owner-executed)

No step may begin until the previous one is complete and recorded. Each step's output is
private (`.local/`, or wherever the owner keeps non-repository material) unless stated.

### Step 1: Written goal and construct memo

- **Entry:** the owner has decided, in DECISIONS.md, to *open step 1*. Opening step 1 is itself a
  dated ledger entry; the gate is otherwise closed.
- **Content:** the enrichment question in one sentence, mapped to D-MIMIC-002; the exact
  constructs and why the synthetic pipeline cannot answer the question (not "would be nicer
  with data" but "cannot"); the exact tables and columns that would be read; for every intended
  output, a disclosure-safety statement (aggregate only, minimum cell sizes, no rare
  combinations, no dates, no free text); what "done" looks like; what would make the owner stop.
- **Exit:** the memo exists and names the intended outputs exhaustively. Anything not named is
  out of scope for steps 2–4.

### Step 2: Then-current terms verification

- **Entry:** step 1 complete.
- **Content:** re-read and capture, with access dates, the current versions of: PhysioNet
  credentialing requirements; the required training course; the applicable Data Use Agreement;
  PhysioNet's guidance on responsible use with online services and language models; the
  permitted-purpose and citation terms for the specific dataset version; and a written
  determination (with reasoning, and with legal or institutional advice where the owner judges
  it necessary) of whether IRB or other review is required for the memo's purpose. Where the
  answer is "unclear", the gate stays closed.
- **Snapshot for orientation only** (recorded 2026-09-02 from the public PhysioNet pages; these
  will be stale by the time step 2 ever runs and must be re-verified then): the MIMIC-IV v3.1
  page (published 2024-10-11) lists the *PhysioNet Credentialed Health Data Use Agreement 1.5.0*
  and the *CITI Data or Specimens Only Research* course as requirements, with PhysioNet
  credentialing. PhysioNet's post "Responsible use of MIMIC data with online services like GPT"
  (2023-04-18) states that the credentialed DUA forbids sharing access with third parties,
  sending the data through third-party APIs, and using it in online platforms, and lists some
  enterprise services PhysioNet regards as compatible with the DUA under specific settings.
  **This project does not adopt that allowance**: rule 2 in §5 is zero-exception.
- **Exit:** every term captured with version and date; the IRB/legal determination written;
  no ambiguity outstanding. If anything in the terms conflicts with §5, the answer is that §5
  wins and the gate closes.

### Step 3: Bounded, read-only, aggregate-only feasibility spike

- **Entry:** steps 1 and 2 complete; the owner personally holds credentialed access obtained
  under their own name and account, and only the owner ever touches the data.
- **Bounds:** read-only; only the tables named in the memo; only the aggregate outputs named in
  the memo; time-boxed by the memo; performed on a machine and in a location that satisfies §5
  (no agent tooling, no repository clone, no cloud notebook, no LLM anywhere in the loop).
- **Disclosure-safety check, written per output before it leaves the analysis environment:**
  aggregate only; minimum cell size honoured (small cells suppressed, never published); no rare
  combinations of attributes; no dates or date-derived values; no free text; no
  patient-, admission-, or provider-level rows in any form; the output could not be linked to a
  record even by someone holding the dataset.
- **Exit:** a private spike report stating whether the question in the memo was answerable
  within the bounds, and whether the answer would change anything a human author does. "No" on
  either point ends the track.

### Step 4: Explicit owner go, scoped to the memo

- **Entry:** step 3 complete with a positive report.
- **Content:** a dated DECISIONS.md entry that names the memo, the dataset version, the DUA
  version, the IRB determination, the exact outputs approved for use in authoring, and how they
  will be handled (§5 rule 4: nonpublic by default, with any publication of a derived aggregate
  needing its own entry).
- **Exit:** the entry exists. Only then may a v2 work package be written, and it may use only
  what the entry names.

## 5. Hard rules (apply now, while the gate is closed, and at every step if it ever opens)

1. **Credentials, data, and derivatives never touch an agent-reachable path.** That includes
   this repository, its clones, its CI, its `.local/` directory (which is gitignored but is on
   the same machine and inside the same working tree that agent sessions operate in), the
   session scratchpad, chat context, screenshots, and any tool that an agent session can read.
   "Derivatives" includes counts, plots, notebooks, query results, and notes that quote values.
2. **No restricted data into any LLM, agent, or third-party API, ever. Zero exceptions.** This
   is deliberately stricter than PhysioNet's own guidance, which allows certain enterprise
   services under specific settings. medrecsim's authoring workflow is AI-assisted
   (CONTRIBUTING.md), which is precisely why the rule is absolute: a session that could see
   restricted data cannot be allowed to exist.
3. **Individual access only.** Credentialed access, if ever obtained, is the owner's personally;
   it is never shared, delegated, scripted for an agent, or exercised on the owner's behalf.
4. **Derivatives are nonpublic by default.** Nothing derived from restricted data enters this
   repository, its Pages deployment, an issue, a PR, or any public artefact unless a step-4
   entry names that specific aggregate and its disclosure-safety check. Case content remains
   fully synthetic regardless; a distribution may inform an author's choices, never populate a
   case.
5. **Any ambiguity closes the gate.** If a term is unclear, a safety check cannot be written, a
   reviewer is unsure whether something is a derivative, or an agent session cannot tell whether
   text in front of it originated from restricted data, the answer is stop and treat it as an
   incident (INCIDENT-PROCEDURE.md, class S2).
6. **Detection is mandatory, not optional.** The pre-commit tripwire blocks staged paths and
   data-like files carrying `mimic` / `physionet` markers (Markdown is exempt so that this
   document can exist). CONTRIBUTING's first attestation covers restricted datasets by name.
   Any weakening of either is an owner decision recorded in DECISIONS.md. No package, tool, or
   source-material entry may pull restricted data in through the side door either: the
   [DEPENDENCY-POLICY.md](DEPENDENCY-POLICY.md) classes and the `source material/REGISTRY.md`
   redistributability rules apply to data exactly as to code.

## 6. Side-by-side compatibility with D-MIMIC-001

| D-MIMIC-001 clause | Where this document carries it |
|--------------------|--------------------------------|
| "MIMIC appears in the roadmap only as a closed gate" | Status banner; §1; B-21 in final-roadmap.md |
| "no MIMIC work packages in v1 or v1.x" | Status banner; §7 |
| "(1) written enrichment goal + construct definition" | §4 step 1 |
| "(2) verification of then-current PhysioNet release/DUA/training/permitted-purpose terms and whether IRB/legal review is needed" | §4 step 2 |
| "(3) a bounded feasibility spike" | §4 step 3 (bounded, read-only, aggregate-only, with disclosure-safety checks) |
| "(4) explicit owner go" | §4 step 4 (dated DECISIONS.md entry scoped to the memo) |
| "The complete synthetic pipeline is the permanent fallback" | §2 closing paragraph; §7 |
| Charter: no restricted datasets "anywhere near this repo, CI, or any agent context" | §5 rules 1, 2, 6 |
| D-MIMIC-002 goal, non-candidate, and caveat | §2, quoted verbatim |

## 7. Exit statement

The expected outcome of this gate is that it never opens. The synthetic pipeline authors every
construct the simulation teaches, cites clinical sources for every rule, and is reviewed in
public; a distributional cross-check would at most adjust how many medications a fictional
patient takes. If that trade-off ever looks worth four steps of process, the owner may open
step 1 with a ledger entry. Until then, and by default forever, the gate is closed and the track
is abandoned.

## 8. Revisit triggers

- **Only a dated DECISIONS.md entry by the owner opens step 1.** No other event does.
- **EP-38 (gate 11)** and every tagged release: read-through for accuracy only (the status line
  must still say CLOSED; the snapshot in step 2 is not refreshed unless step 2 is running,
  because refreshing it would imply activity that is not happening).
- **Any S2 incident**: this document's §5 is re-read as part of the leak-prevention re-audit
  required before work resumes.
- **Any change to CONTRIBUTING's attestations or the pre-commit tripwire** that touches the
  restricted-dataset markers.
