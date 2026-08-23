# UX & accessibility — information architecture, interaction model, WCAG plan

This appendix is the canonical integrated UX/accessibility specification for medrecsim v1,
implemented by EP-10 (identity & originality pack), EP-15–EP-19 (shell, chart surfaces,
interview, workspace, picker/release), EP-21–EP-25 (phone/escalations, artifacts, interview
modes, debrief, hints), EP-36 (accessibility gate hardening), and EP-37 (usability evaluation).
Decisions cited as `D-*` resolve in [../../DECISIONS.md](../../DECISIONS.md); integrator
resolutions are cited as `I-n`; items ruled on at roadmap approval carry their `OQ-n` reference from
[open-questions.md](open-questions.md). Integrated 2026-08-23 from specialist planning; citations
carry access dates; time-sensitive facts reverify at execution.

## 1. Navigation model & sim-shell layout (D-UX-001)

App-level flow is linear and hash-addressable:

Landing/About → Case Picker → Pre-brief → Sim shell → Score → Debrief → back to Picker.

Browser Back never destroys signed work; in-sim Back is intercepted with a confirm dialog.
Mid-case resume is in scope (**I-8** — already decided by D-ARCH-005).

The sim shell is three persistent regions:

```
+--------------------------------------------------------------------------+
| Synthetic/educational banner (persistent, D-UX-006)                      |
| Patient header · Sim clock · Hints slot                                  |
+--------------------+------------------------------+----------------------+
| SOURCE NAV         | ACTIVE SOURCE VIEWER         | WORKSPACE            |
|                    |                              |                      |
| Chart tabs:        | (renders the selected        | Working med history  |
|   Snapshot         |  source: table, document,    | Discrepancy log      |
|   Imported Meds    |  transcript, artifact,       | Admission action     |
|   Documents        |  interview, phone call)      |   list               |
|   Allergies        |                              |                      |
| "Outside the       |                              | [Sign] (D-WF-004)    |
|  chart" channels:  |                              |                      |
|   Bedside          |                              | (collapsible; never  |
|   Phone            |                              |  loses data)         |
|   Artifacts        |                              |                      |
+--------------------+------------------------------+----------------------+
```

Non-chart channels are visually distinct from chart tabs (D-UX-001). A pane-cycle shortcut
(F6-style) plus Alt+1/2/3 jump directly to each region. The workspace pane is collapsible but
never loses data.

## 2. Screen inventory

| ID | Surface | Content |
|----|---------|---------|
| S-00 | Landing / About | Disclaimer block (canonical copy from the claims matrix), what-this-is/is-not |
| S-01 | Case picker | Tier groupings, recommended-sequence numbers (D-TAX-004), completion marks, review-badge summary |
| S-02 | Pre-brief | Objectives, role framing, brief neutral sensitive-content note (**I-17**: depth decided per case at authoring with the stigma checklist), review badge "physician-reviewed (single reviewer)" (D-RISK-003), Begin |
| S-03a | Snapshot | Minimal ED admission context |
| S-03b | Imported Meds | "External Records Exchange" table with staleness badges |
| S-03c | Documents | Discharge summary, outpatient note, filed call results; dual timestamps shown (D-MED-002) |
| S-03d | Allergies | Allergy claims with the same source-claim machinery (D-MED-003) |
| S-04 | Phone | Directory with availability windows + pre-disclosed time costs → transcript-style calls → results filed into Documents |
| S-05 | Artifact viewer | Synthetic image + first-class structured transcription + pill descriptors |
| S-06 | Interview | Question menus + transcript log (§6) |
| S-07 | Workspace | Med rows (drug/dose/status/confidence/claim chips), discrepancy log, action list with rationale menus (D-MED-004) |
| S-08 | Signature | Gap list rendered as links → attestation → confirm; reversible until final (D-WF-004) |
| S-09 | Score | Five subscore panels, no composite (D-SCOR-001), "what these are / are not" framing |
| S-10 | Debrief | Evidence-timeline centerpiece (D-PED-002) |
| S-11 | Settings | Clear-all-local-data (D-ARCH-005), reduced-motion, hint preferences |
| S-12 | Small-viewport notice | Shown below ~1024 px (D-UX-003) |

## 3. Claim chips: cite-forward / cite-backward

Every evidence surface decomposes into focusable **claim chips** carrying status, event/doc
time, and source.

- **Cite forward:** activate a chip → popover offering *add as new working-list row* / *attach
  to existing row* / *attach to a discrepancy* / *allergy list*; a polite announcement confirms
  the action.
- **Bulk-cite:** the imported med list can be bulk-cited once per case, seeding the working list
  as **unverified** rows — allowed and scoring-neutral per the **OQ-6** ruling (mirrors real
  workflow without giving answers).
- **Cite backward:** a chip on a workspace row navigates to, highlights, and focuses the source
  claim.
- **Contradiction marks:** rows with conflicting sources show "2 sources disagree" as text +
  visual mark (never color-only).
- No interaction is drag-only (WCAG 2.5.7).

## 4. Fragmentation source voices (D-UX-002)

"Fragmentation is fidelity; mechanical friction is not." All source voices are real HTML text —
never text-in-image.

| Source | Voice / treatment |
|--------|-------------------|
| Imported med list | Sterile table; "Received {time} from {org}"; staleness badge (icon + text) |
| Pharmacy dispensing history | Monospace fax/printout voice, fictional letterhead; CSS scan-edge decoration is aria-hidden |
| Handwritten list | Handwriting face on lined paper; `<del>` + "(crossed out)" text; plain-text toggle; contrast floor still met |
| Discharge summary / outpatient note | Formal document voice with heading navigation |
| Bottles / physical artifacts | Synthetic images with label fields; structured transcription + descriptors are the primary representation |
| Call / interview transcripts | Speaker-labeled logs; searchable; citable |

**Banned friction (never simulated):** fake spinners, fake logins, artificial pagination, buried
tabs, alert spam, real-time waits.

## 5. Clock UX (D-WF-002)

- Header display, text-first: "Sim time: Day 0 · 19:42 (T0 + 1h 12m)". The clock moves **only**
  on authored action costs.
- **Pre-action cost disclosure:** every time-costing control carries its cost in its visible and
  accessible name (e.g., "advances sim clock ~15 min"). Costs at or above an authored threshold
  get a confirm dialog restating consequences ("the 20:00 levodopa dose will pass").
- A single polite, batched announcement follows each clock advance.
- **Time-critical pressure (levodopa case C07):** a persistent, non-flashing status card updates
  on advances; threshold crossings are authored events producing a banner change plus **one
  assertive announcement** (**I-7**). Assertive live regions are reserved for exactly two
  events app-wide: time-critical threshold crossings and signature validation failure. The
  pressure is a planning problem, never a reflex test; there is no WCAG 2.2.1 timing dependence
  (rationale documented in the exceptions doc as N/A-with-rationale).

## 6. Interview UX (D-SIM-001)

Layout: left menu of grouped disclosure categories + right transcript log.

**Nine categories:** open question; walk-through of medications; recent changes; how actually
taken; access & cost; allergies; OTC/supplements; clarify-a-claim (contextual, launched from a
workspace row); close.

**Tracking:** follow-ups nest where authored; re-asking is allowed and degraded historians may
answer differently (both answers kept, both authored). Asked questions show a checkmark plus
visually-hidden "(asked)"; category counters count visible questions only; there is **no overall
completeness meter** (spoiler prevention).

**Four modes:**

1. **Interpreter** (C06, D-CONS-002): three programmatic turns Learner → Interpreter → Patient
   with text speaker labels; authored time cost disclosed in the pre-brief; ad-hoc family
   interpretation is faster but yields lower-confidence claims, surfaced in the debrief; no
   caricature — dialect is never performed.
2. **Surrogate** (C10, D-CONS-001): persistent authorization banner; third-person question
   menus; more unknown-to-source answers.
3. **Degraded historian:** authored fatigue closes the bedside channel for a sim-time interval;
   the cost is disclosed before the triggering action.
4. **Caregiver-by-phone:** availability windows and callback latency ride the phone channel.

## 7. WCAG 2.2 AA implementation commitments (D-UX-004; release gate)

Verified at planning: WCAG 2.2 is the current W3C Recommendation (2023-10-05, revised
2024-12-12); SC 4.1.1 removed; 3.3.8 N/A (no authentication). **Reverify SC levels at
execution.**

| Area | Commitment |
|------|-----------|
| Artifacts | alt text + real-HTML transcription + pill text descriptors (nonvisual cues) |
| Tables | True tables: caption, `th` scope, ≤2 interactive elements per row (overflow into a row menu), `aria-sort` |
| Color | Information never color-only: icon+text badges; shape coding on the timeline |
| 200% zoom / reflow | Designed mode (at EP-15, not retrofitted): workspace → overlay drawer, source nav → menu; only tables scroll internally; ≥1024 px floor documented (D-UX-003) |
| Keyboard | 100% operable; landmarks; skip links; pane-cycle shortcut |
| 2.4.11 focus-not-obscured | scroll-padding accounts for sticky panes |
| Target size | ≥24 px (2.5.8); no drag-only interactions (2.5.7) |
| Timing | No time limits anywhere (2.2.1 N/A by design, documented) |
| 3.2.6 consistent help | Plain-language chrome; Hints in a consistent header slot |
| 3.3.7 redundant entry | Citing is the mechanism — evidence is attached, never re-typed |
| 3.3.1/3.3.3 errors | Signature validation renders error links to the offending artifact rows |
| Widgets | Native-first elements; ARIA APG patterns where composite widgets are unavoidable |
| Live regions | A **single announcer service** owns one polite `role=status`, one `role=log` per transcript, and the two reserved assertive events (§5) |
| Dialogue menus | Nested button lists; asked-state is not `aria-pressed`; focus stays on the menu after activation |
| Debrief timeline | **Dual views**: accessible table = the conformance surface + keyboard-navigable SVG with focusable nodes |
| Focus management | Navigation targets get `tabindex="-1"` focus; focus restored on return; the workspace never steals focus |

## 8. NVDA + keyboard manual audit script (14 steps; per release, ×2 browsers)

Executed with NVDA and keyboard-only, plus a 200% zoom pass and an informative (non-gating,
**I-10**) forced-colors/high-contrast pass. Spike SP-6 (NVDA live-region behavior) precedes
EP-15.

1. Landmark/skip-link walk of the app frame.
2. Case picker: tier groups, badges, completion marks readable.
3. Pre-brief: badge and sensitive-content note announced; Begin reachable.
4. Sim shell: pane-cycle + Alt-shortcuts; region names announced.
5. Imported-meds table navigation + bulk-cite (allowed, scoring-neutral per the OQ-6 ruling).
6. Cite popover: focus trap in, restore out.
7. Interview, including each mode (interpreter turn labels, surrogate banner).
8. Artifact viewer: transcription-first reading; descriptor access.
9. Phone: pre-disclosed cost, call, clock-advance announcement.
10. Time-critical status card + threshold assertive announcement (single).
11. Workspace: logs, action list, rationale menus, provenance round-trip (cite-backward), 2.4.11
    check against sticky panes.
12. Signature: blocking-reason links, attestation, confirm, reversibility.
13. Debrief: both timeline views (table and SVG) fully traversable.
14. Settings + small-viewport notice.

Signed script logs are an EP-36 deliverable.

## 9. axe-in-CI policy (D-QA-001)

axe runs against a **state matrix**, not just routes — including popover-open,
signature-with-errors, and debrief-reveal-card states; each UI EP's definition of done extends
the matrix for its surfaces. CI fails on serious/critical findings. Exceptions live in a
versioned allowlist with per-entry justification **and expiry**; the public exception process is
`docs/a11y/exceptions.md` plus a conformance statement. At the EP-36 gate the allowlist must be
**empty** and v1.0 ships with zero open A/AA exceptions (N/A-with-rationale rows only).

## 10. Trade-dress originality checklist & fictional-identity guidelines (D-UX-001; EP-10)

Originality checklist:

- No vendor coinages or lookalike product names; UI labels are descriptive-generic or original,
  screened via the D-OSS-004 protocol.
- Original documented palette tokens; a composition-level comparison against 3–4 major EHR
  vendors documenting **≥3 deliberate divergences**; never pixel-reference a real EHR; no
  real-EHR screenshots in the repo, ever.
- Openly licensed or original icons; fonts **self-hosted** under OFL with THIRD-PARTY entries —
  a runtime font CDN would violate D-ARCH-001 (spike SP-8 verifies licenses; SP-9 is a
  trade-dress dry-run).
- No reproduced EHR, discharge-summary, or vendor boilerplate text.

Fictional-identity guidelines:

- A shared **fictional-universe registry** (institutions, providers, pharmacies reused across
  cases) lives as a content package beside the formulary; cases reference registry IDs (**I-9**).
- All invented names screened against real organizations and notable persons; respectful
  cross-cultural patient names; a condition is never "explained" by ethnicity or class.
- Visibly fictional identifiers: 555-01XX phone numbers, non-validating NPIs, synthetic MRNs,
  barcodes that encode SYNTHETIC.
- EXIF stripping is scripted in the content pipeline; SVG editor metadata scrubbed; screenshots
  are taken from the Pages deployment on a clean profile, metadata-stripped, and leak-screened
  (D-UX-006).

## 11. Usability protocol (D-UX-005; EP-37)

**Heuristic evaluation:** Nielsen's 10 heuristics plus seven project heuristics:

- CS-1 fidelity-without-friction (D-UX-002)
- CS-2 evidence traceability within ≤2 activations
- CS-3 honest uncertainty (unable-to-verify is a first-class path)
- CS-4 non-punitive safety (unsafe never blocked; hints never punished)
- CS-5 no cross-pane memory tax
- CS-6 simulation-boundary clarity (synthetic framing always visible)
- CS-7 clock transparency (costs disclosed before actions)

Severity scale 0–4; owner plus 1–2 colleagues evaluate independently, then merge.

**Think-aloud sessions:** 3–5 clinician colleagues, ~50 minutes each. Verbal preamble includes:
**no recording of any kind**; handwritten anonymized notes only, destroyed after synthesis;
verbal assent; explicit statement that no learning-outcome claims will be made. Tasks T1–T7:
orient → seed the working list → interview + cite → bottle discrepancy → pharmacy call → action
list + sign → debrief readback. Facilitation: neutral prompts only; 60-second struggle rule
before assisting; note template (code / task / surface / observation / breakdown / severity /
heuristic). At least one session is keyboard-only; the facilitator completes an NVDA
self-session first. Severity-3/4 findings are resolved or explicitly owner-accepted before
v1.0 (EP-37 gate).

**Targeted replay** from the debrief runs as an **unscored replay mode** from authored
checkpoints per the **OQ-7** ruling (no completion-mark overwrite).

## 12. Citations (accessed 2026-08-23)

W3C WCAG 2.2 TR page · W3C WAI WCAG 2 overview · NN/g 10 usability heuristics. Not fetched at
planning time — **reverify at execution**: ARIA Authoring Practices Guide, axe-core
documentation, ISMP/AHRQ usability-adjacent materials.
