<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# Authoring guide — content schema 0.1 (EP-9)

How to write a case bundle, a formulary entry, or a universe entry so that `pnpm content:validate`
accepts it. This guide is derived from the schemas in `packages/schema/src` (the source of truth;
the exported JSON Schemas in `packages/schema/json-schema/` give autocomplete in an editor — see
§9). Decisions cited as `D-*` are in `../../DECISIONS.md`; tensions T-1…T-6 are decided in
[ADR-7](../../docs/adr/ADR-7-content-schema-v0.md).

Everything in this tree is **synthetic** (no real patients, no deidentified anecdotes, no real
brand names) and **CC BY 4.0** (every file starts with the SPDX header). Clinical content —
accepted/unsafe sets, ordinals, teaching text — is authored and signed off by the project owner
only (D-EXEC-003); the scaffold in `cases/_exemplar/` shows the shapes with placeholder text.

## 1. Bundle layout (D-GOV-003)

```
content/cases/<cNN-slug>/
├── case.yaml            metadata, coverage declarations, review linkage, pre-brief
├── evidence.yaml        learner-observable layer (patient, T0, sources, claims, dialogue, artifacts, channels)
├── reference.yaml       author-only layer (regimen, actual use, discrepancies, action sets, escalations, hints)
├── citations.yaml       citation records (ten keys each), referenced by id from the other files
├── teaching-notes.md    prose notes; headings match reference.yaml teachingNoteRefs[].anchor
├── CHANGELOG.md         bundle changelog; a review record's changelogRef points into it
└── review-record.yaml   present only once reviewed (docs/clinical/REVIEW-RECORD-TEMPLATE.md)
```

Shared packages: `content/formulary/` (manifest + `entries/rx-*.yaml` + `citations.yaml`) and
`content/universe/universe.yaml`. Cases reference both by id.

## 2. Conventions that apply everywhere

- **Ids** are lowercase kebab-case with a fixed prefix: `src-` source · `clm-` claim · `alg-`
  allergy claim · `dlg-` dialogue tree · `q-` dialogue node · `art-` artifact · `esc-`
  escalation channel · `reg-` regimen entry · `use-` actual-use entry · `disc-` discrepancy ·
  `act-` action entry · `rat-` rationale key · `exp-` expected escalation · `hint-` · `tn-`
  teaching note · `rx-` formulary entry · `inst-` institution · `person-` · `cit-<slug>-<year>`
  citation. Case ids are `cNN-<slug>` (`c00` is the scaffold).
- **Reference-layer ids never appear in evidence.yaml**, not even inside prose (INV-TRUTH-001).
- **Time** (T-1): write `T0` plus signed offsets — `T0-2y`, `T0-6mo`, `T0-3d-4h`, `T0+20m`
  (units `y mo w d h m`, applied left to right) — or an absolute ISO-8601 with offset. `T0` itself
  is the absolute admission anchor in `evidence.yaml` and must be quoted. Interview and
  escalation claims are documented _after_ T0 (`T0+20m`): the event happened before, the
  documentation happens when the learner asks.
- **Both timestamps on every claim** (D-MED-002): `eventTime` (when the asserted state was true)
  and `documentationTime` (when the source recorded it, never earlier) — INV-TIME-001.
- **Medications** (T-2): `formularyId: rx-…` **or** `unresolvedLabel: {text, sanctioned: true,
reason}` with `reason` one of `patient-description-only`, `illegible-or-partial-label`,
  `non-formulary-product`, `informant-cannot-name`. Never both, never neither (INV-REF-001).
- **YAML gotchas**: quote any string containing `: ` (YAML reads it as a mapping) and the
  `schemaVersion: '0.1'` stamp (else it is the number 0.1); dates and times are quoted.
- **Text style** in the reference layer (D-SCOR-003; INV-ACT-001 lint): plausible-consequence
  phrasing with ordinal severity — "may cause", "can lead to". No `%`, "probability", "likely",
  "chance", "odds", "x-fold", "one in N", "incidence". No "will cause" / "always" unless the
  entry sets `inevitabilityAuthored: true`. **Any digit** in linted text needs a citation on the
  carrying entry (a dose in a rationale counts; write "the verified home dose" or cite).
- **No real brand names anywhere** (INV-SCOPE-001 denylist); the formulary's
  `brandNamesFictional` holds original coinages only.
- **Every scored rule cites** ≥1 Tier A/B record (D-GOV-002; warning at 0.1, strict at EP-20).
  A cited id must exist in `citations.yaml` (error), and every record's `source` key must have
  a row in `source material/REGISTRY.md` and CITATION-POLICY.md §7 (INV-REG-001).

## 3. `case.yaml`

| Field                                                       | Meaning                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `schemaVersion`                                             | `'0.1'` — must equal the schema package (INV-VERS-001)                                                                                                                                                                                                       |
| `id`, `slug`, `title`                                       | `cNN-slug`; slug without the prefix                                                                                                                                                                                                                          |
| `contentVersion`                                            | semver of this bundle (D-DATA-002); the review record certifies one value                                                                                                                                                                                    |
| `tier`                                                      | `introductory` · `core` · `advanced` (D-TAX-004)                                                                                                                                                                                                             |
| `recommendedSequenceIndex`                                  | 1-based position in the recommended sequence                                                                                                                                                                                                                 |
| `coverage.types` / `.mechanisms`                            | must **equal** the sets carried by `reference.yaml` discrepancies (INV-META-001)                                                                                                                                                                             |
| `coverage.phenotypes`                                       | `P1`…`P10` predicates from TAXONOMY.md §6 (EP-20 re-derives them)                                                                                                                                                                                            |
| `coverage.highAlert` / `.recordIsWrong` / `.allergySubTask` | booleans; `allergySubTask` must match whether an `allergy-record-discrepancy` exists                                                                                                                                                                         |
| `coverage.sensitiveContent`                                 | optional tags (`opioid-use-disorder-therapy`, `psychiatric-medication`, `hiv-antiretroviral-therapy`, `impaired-capacity-surrogate`, `non-english-preferring`)                                                                                               |
| `reviewStatus`                                              | `draft-unreviewed` (no record, no badge; warning; not compiled) or `reviewed` (needs `reviewRecordRef: review-record.yaml` and `preBriefBadge` copied from the record: `label` fixed string, `recordVersion`, `reviewDate`, `staleAfter` = `reReview.dueBy`) |
| `preBrief`                                                  | `objectives[]`, `roleFramingText`, `syntheticNotice: true`                                                                                                                                                                                                   |
| `estimatedMinutes`                                          | positive integer                                                                                                                                                                                                                                             |
| `formularyVersionRange` / `universeVersionRange`            | `{min, maxExclusive?}`; the loaded package versions must fall inside                                                                                                                                                                                         |

## 4. `evidence.yaml` — the learner-observable layer

- `patient`: `displayName`, `age` (18–120), `preferredLanguage`, `interpreterNeeded`, `chartId`
  (`SYN-` + digits, visibly synthetic), `admissionContextText`, `capacity` (`{status: intact}` or
  `{status: impaired, assessmentText, surrogate{displayName, relationship, authorizationText}}`,
  D-CONS-001).
- `T0`: quoted absolute ISO-8601 with offset.
- `sources[]`: the seven D-WF-001 types (`patient-interview`, `caregiver-informant`,
  `physical-artifacts`, `imported-ehr-list`, `prior-discharge-summary`,
  `pharmacy-dispensing-history`, `outpatient-note`); `availability` `immediate` · `on-request` ·
  `time-gated` (+ `availableFrom`); `accessCostMinutes`; optional `institutionId`,
  `reliabilityNoteText`.
- `claims[]`: `sourceId`, medication (§2), `claimStatus`, optional `dose` / `route` /
  `frequency` / `formulation`, both timestamps, `asStatedText` (the words the learner sees),
  `visibility` (`with-source` default, or `on-reveal` when a dialogue node, artifact or
  escalation response must reveal it).

  **Claim statuses (D-MED-001, adopted verbatim)** — what the _source_ asserts about the
  medication, not the truth: `prescribed` (an order or prescription exists) · `dispensed`
  (a fill happened) · `taking-as-directed` · `taking-differently` (requires
  `howTakingDifferently`) · `held-by-clinician` (a clinician paused it, intent to resume) ·
  `self-discontinued` (the patient stopped it) · `stopped-by-clinician` (a clinician ended it) ·
  `course-completed` (a finite course finished) · `restarted` (resumed after a gap) ·
  `never-started` (prescribed or dispensed but never taken) · `unknown-to-source` (this source
  cannot say).

- `allergyClaims[]` (D-MED-003): `claimKind` `allergy` · `intolerance` (both: `agent`
  `{kind: formulary, formularyId}` or `{kind: class-or-text, text}`, `severity` `mild` ·
  `moderate` · `severe` · `anaphylaxis` · `unknown`, optional `reactionText`, `onsetTimingText`,
  `priorToleranceText`) · `tolerated-exposure` (`agent`, `exposureText`) · `no-known-allergies`;
  all carry `verificationStatus`, both timestamps, `asStatedText`.
- `dialogueTrees[]` (D-SIM-001): `sourceId`, `interlocutor`, `baselineReliability`
  (`reliable` · `lower-reliability` · `unknown`), `viaInterpreter` (`none` · `professional` ·
  `ad-hoc-family`), `nodes[]` with `entry: true` on the opening questions, `questionText`,
  `costMinutes`, `responseText`, `revealsClaimIds`, `revealsAllergyClaimIds`, `unlocks`
  (same-tree node ids), optional `reliabilityModifier`.
- `artifacts[]`: `sourceId`, `kind` (`pill-bottle`, `pillbox`, `handwritten-list`, …),
  `title`, **`renderText`** (complete textual rendering incl. nonvisual cues, D-UX-004),
  `labelClaims`, `examineCostMinutes`.
- `escalationChannels[]` (D-CLIN-002; OQ-3): `channel` one of `community-pharmacy`,
  `outpatient-prescriber-program-office`, `inpatient-pharmacist`, `senior-attending`; `label`;
  `availabilityWindow` `{kind: always}` or `{kind: hours, opens, closes, days?}`;
  `latencyMinutes`; `responseContent{text, revealsClaimIds, revealsAllergyClaimIds}`;
  `unansweredBehavior` `{kind: voicemail-callback, callbackLatencyMinutes}` ·
  `{kind: retry-later, retryAfterMinutes}` · `{kind: closed-until-window}`.

## 5. `reference.yaml` — the author-only layer

- `referenceRegimen[]`: what was intended before admission — medication, `dose`, `route`,
  `frequencyText`, optional `formulationText`, `indicationText`, `prescriberText`, `notesText`.
- `actualUseState[]`: what was really happening — medication, optional `regimenId`, `status`
  (the claim-status set minus `unknown-to-source`), `detailText`, `knowability` `{mark,
knowableVia?}` with marks `initially-known` · `conditionally-discoverable` · `inferable`
  (each needs `knowableVia[]` evidence refs) · `irreducibly-uncertain` (no `knowableVia`;
  D-MED-005), optional `lastTakenTime`.
- `evidenceYield[]` (optional): `{ref, yield}` with `critical` · `corroborating` · `low-yield`
  (subscore 1).
- `discrepancies[]` (D-TAX-001; tokens verbatim from TAXONOMY.md §8): `title`, `type`,
  `mechanism` (primary; optional `secondaryMechanisms[]`), `detectabilityPaths[]` in DNF (T-4:
  each `{detectability, requires[]}` is an AND; the list is an OR), `urgency` `U1`–`U4`,
  `severity` `S0`–`S4`, `reversibility`, `timeToHarm`, `involves{medication, claimIds,
allergyClaimIds, regimenId, actualUseId}`, `resolutionExpectation{kind, detailText}` with
  kinds `resolve-with-rationale` · `escalate` · `unable-to-verify` · `defer-with-plan`
  (D-WF-004), optional `acceptedClassifications[]`, `scoring` (`scored` default or
  `discussion-item-not-scored` + `freezeNoteText`, D-RISK-004), `citations`, `teachingNoteId`.
- **Evidence references** (`requires`, `knowableVia`, `evidenceYield.ref`, `hints.sourceRef`)
  are `kind:id` strings: `source:` · `claim:` · `allergy-claim:` · `dialogue-node:` ·
  `artifact:` · `escalation-channel:`; every one must exist in `evidence.yaml`.
- `actionSets` (D-SCOR-002; T-5): `defaultBandForUnlisted` (`accepted` · `partially-accepted`
  · `unsafe`), `rationaleMenu[]` `{key: rat-…, text, citations?}`, `accepted[]` (non-empty),
  `partiallyAccepted[]` (+ `shortfallText`), `unsafe[]` (+ `mechanismOfHarm{text,
inevitabilityAuthored, citations?}`). Each entry: `target{medication?, discrepancyId?}`,
  `action` (`continue` · `hold` · `needs-decision` · `escalate` · `propose-with-rationale` ·
  `unable-to-verify` · `defer-with-plan`), `rationaleKey` or `rationaleText`, `citations?`,
  `scoring`.
- `expectedEscalations[]`: `channelId` (an `esc-` id from evidence), `required`, `whyText`,
  optional `byTime`, `discrepancyIds`, `citations`.
- `hints[]` (T-6; D-PED-001): `targetDiscrepancyId`, `nudge{text}`, `directed{text}`,
  `revealSource{text, sourceRef}` — all three grades in one record.
- `teachingNoteRefs[]`: `anchor` (heading slug in `teaching-notes.md`), `title`, `summaryText`,
  `citations` (required).

## 6. `citations.yaml`

`{schemaVersion, bundleId, citations[]}`; each record has exactly the ten keys of
CITATION-POLICY.md §1: `id`, `claim`, `source`, `publisher`, `title`, `version-or-date`, `url`,
`accessed` (ISO date the session actually opened it), `tier` (`A`–`D`), `notes` (may be empty).
Where citations are required and where they live: policy §4.

## 7. Formulary entries and the universe registry

`entries/rx-<generic>.yaml`: `id`, `genericName` (real INN/USAN), `class`, `forms[]`
`{form, strengths[], concentrationNote?}`, `combinationComponents?`, `lasaPartners[]`
(bidirectional — INV-REF-002 at EP-20), `tallManName?`, `highAlert`, `timeCritical`,
`narrowTherapeuticIndex`, `monitoringNotes[]` `{text, citations}`, **`pillAppearanceText`**
(D-UX-004), `brandNamesFictional[]`, `citations?` (expected when any flag is set),
`placeholder: true` for scaffold entries only. The manifest `formulary.yaml` carries
`formularyVersion`.

`universe/universe.yaml` (I-9): `institutions[]` `{id: inst-…, name, kind, descriptionText}`
and `people[]` `{id: person-…, displayName, role}`; `universeVersion`.

## 8. Review records and the badge

Follow `docs/clinical/REVIEW-RECORD-TEMPLATE.md` §1 exactly (the schema encodes it). When the
record exists: set `reviewStatus: reviewed`, `reviewRecordRef: review-record.yaml`, and copy
`recordVersion`, `reviewDate`, and `reReview.dueBy` (as `staleAfter`) into `preBriefBadge` —
INV-META-001 checks they are equal and that `contentVersionReviewed` equals `contentVersion`.

## 9. Validating, compiling, editing

From `medrecsim/`:

```
pnpm content:validate                 # everything; --format pretty|json|github
pnpm content validate content/cases/c01-three-lists
pnpm content:fixtures                 # the negative suite (must stay green)
pnpm content:compile                  # YAML → JSON chunks (drafts skipped; --include-drafts)
pnpm schema:export                    # after any schema change; CI runs schema:check
```

Findings name their invariant (`INV-TIME-001 …`), file, line, and data path. Warnings do not
fail the build; errors do. For editor autocomplete, copy the `yaml.schemas` mapping from
`.vscode/settings.shared.json` into your own `.vscode/settings.json` and install the
recommended YAML extension.

## 10. What the validator checks at 0.1 and what comes later

Shipped (EP-9): INV-TIME-001, INV-REF-001, INV-TRUTH-001, INV-DISC-001, INV-ACT-001 (incl. the
harm-language lint), INV-META-001, INV-VERS-001, INV-CIT-001 (warn), INV-SPDX-001, INV-REG-001,
INV-SCOPE-001 (denylist), INV-SHAPE-001 (ids and co-requirements). See
`packages/schema/README.md` for the per-invariant table.

Deferred (EP-20): post-T0 immutability (TIME-002), timeline satisfiability (TIME-003), LASA
bidirectionality (REF-002), detectability reachability (DISC-002), knowable ⇒ detectable and
irreducible ⇒ unable-to-verify accepted (DISC-003), winnability (ACT-002), strict citations
(CIT-001), three hint grades (HINT-001 — the shape already forces them), full scope (SCOPE-001),
strict accessibility fields (A11Y-001 — fields already required).
