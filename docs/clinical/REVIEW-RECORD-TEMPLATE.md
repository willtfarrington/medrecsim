# Review-record template and pre-brief badge fields (D-GOV-001, D-RISK-003)

**Instrument version:** 1.0 · **Date:** 2026-09-02 · **Instantiated by:** EP-6 ·
**Used by:** every case bundle from EP-14 onward and every formulary wave; the content schema
(EP-9) encodes the YAML below as `review-record.yaml` and the `preBriefBadge` fields of
`case.yaml`; the app renders the badge in every pre-brief (EP-19) · **Changes:** owner-only;
version bump logged in §6.

A review record is the **public, versioned, dated** artifact that closes the content lifecycle
(D-GOV-001): it proves that a specific content version passed the clinical self-review checklist
and the stigma-safety checklist at a specific date under the disclosed review model. It is
committed beside the case (D-GOV-003), is CC BY 4.0 content, and is the source of the in-app
badge (D-RISK-003). It contains nothing private: no employer, institution, contact detail,
or path.

## 1. The record (`review-record.yaml`)

```yaml
# review-record.yaml — public review record for one content version of one bundle.
# Every field is required unless marked optional. Dates are ISO YYYY-MM-DD.

recordVersion: 1                 # integer; bumps on every new review of this bundle
bundleId: c01-three-lists        # matches case.yaml id (or formulary package id)
contentVersionReviewed: 1.0.0    # the bundle contentVersion this record certifies
schemaVersion: "0.1"             # content-schema major.minor stamped in the bundle
reviewDate: 2026-11-15

reviewModel: physician-reviewed (single reviewer)   # fixed string; the only permitted value
reviewer:
  role: project owner
  credential: physician          # public-safe statement chosen by the owner; no institution

checklistVersions:
  clinicalSelfReview: "1.0"      # docs/clinical/CLINICAL-SELF-REVIEW-CHECKLIST.md
  stigmaSafety: "1.0"            # docs/clinical/STIGMA-SAFETY-CHECKLIST.md
  citationPolicy: "1.0"          # docs/clinical/CITATION-POLICY.md

disposition: approved            # approved | approved-with-changes | returned | frozen-items
changesMade: []                  # required when approved-with-changes: one line per change
frozenItems: []                  # required when frozen-items: item ids marked
                                 #   "discussion item — not scored" (D-RISK-004)

sourcesVerified:                 # citation ids opened on the review date
  - cit-tjc-npg-14-05-01-2026
  - cit-ismp-high-alert-acute-2024

findings:                        # one entry per check that was not a plain pass, plus SS-06.1
  - check: CSR-03.2
    result: n/a
    note: no subspecialist prescriber in this case; domain omitted deliberately
  - check: SS-06.1
    result: recorded
    note: <demographic assignment line for the EP-35 roster audit>

reReview:
  triggers:                      # fixed list from D-GOV-001; do not edit
    - annual
    - issue-report
    - clinical-semantics-migration
  dueBy: 2027-11-15              # reviewDate + 12 months
  supersedes: null               # previous recordVersion, or null for the first review

changelogRef: CHANGELOG.md#1.0.0 # the bundle changelog entry that published this version
```

Rules:

- **One record per review.** A new review — annual, after an issue report, or after a schema
  migration touching clinical semantics — produces `recordVersion: N+1` with `supersedes: N`.
  Old records are kept in the bundle (`review-records/` history) so the public trail is
  complete.
- **`reviewModel` is a fixed string.** It is the project's canonical review descriptor
  (docs/CLAIMS.md row C3) and the per-tag copy-rule grep depends on it being exact.
- **A `returned` record is still committed** (the content is not published, but the record of
  the review is), so that history shows what was reviewed and sent back.
- **`frozen-items`** is the disposition for a case published with one or more items under the
  contested-scoring freeze (D-RISK-004); the case changelog carries the dispute and the
  resolution patch produces the next record.

## 2. Badge fields in `case.yaml` (D-RISK-003)

```yaml
reviewRecordRef: review-record.yaml          # path relative to the bundle root
preBriefBadge:
  label: physician-reviewed (single reviewer) # fixed string; rendered verbatim
  recordVersion: 1                            # copied from the record
  reviewDate: 2026-11-15                      # copied from the record
  staleAfter: 2027-11-15                      # = reReview.dueBy; the amber rule below
```

Rendering rules for the pre-brief (EP-19) and the case picker summary (EP-15/19):

- The badge shows, as text (never color-only, D-UX-004): the label, "record v{recordVersion}",
  and the review date. Example: **physician-reviewed (single reviewer) · record v1 ·
  reviewed 2026-11-15**.
- **Amber staleness rule** (recommended by the governance appendix under D-RISK-005; adopted
  here as the default): when the viewing date is past `staleAfter`, the badge adds the text
  "re-review due" and an amber state; the case stays playable. Staleness is thus self-evident
  without any service.
- The badge links (in-app) to the rendered public record and to the case changelog.
- Validator INV-META-001 checks that `preBriefBadge` fields equal the referenced record's
  values and that `label` and `reviewModel` are the fixed string.

## 3. Rendered public record (Markdown)

The app and the repository render the YAML as a short page. Suggested shape (EP-19 may adjust
layout, not content):

> **Review record — {bundle title} — record v{recordVersion}**
> Content version {contentVersionReviewed} (schema {schemaVersion}) · reviewed {reviewDate}
> **Review model:** physician-reviewed (single reviewer). Independent pharmacist or
> medication-safety dual review is a named future upgrade, not something that has happened.
> **Checklists:** clinical self-review v{…}; stigma-safety v{…}; citation policy v{…}.
> **Disposition:** {disposition}{; changes / frozen items listed}
> **Sources verified on the review date:** {list}
> **Findings:** {table}
> **Next re-review due:** {dueBy} (or earlier on an issue report or a clinical-semantics
> schema migration).
> {standing disclaimer block from docs/CLAIMS.md, verbatim}

## 4. Field coverage against `case.yaml` (EP-9 acceptance)

| `case.yaml` need (architecture appendix §3) | Supplied by |
|---|---|
| `reviewRecordRef` | §2 — path to `review-record.yaml` |
| `preBriefBadge` rendered "physician-reviewed (single reviewer)" | §2 `label` (fixed) + `recordVersion` + `reviewDate` + `staleAfter` |
| Review-record version + date (D-RISK-003) | `recordVersion`, `reviewDate` |
| Checklist versions used | `checklistVersions` (three instruments) |
| Content version reviewed | `contentVersionReviewed` + `schemaVersion` |
| Disposition | `disposition` (+ `changesMade` / `frozenItems`) |
| Re-review triggers (D-GOV-001) | `reReview.triggers` (fixed list), `dueBy`, `supersedes` |
| Parseable record (INV-META-001) | the whole YAML; EP-9 derives the JSON Schema from §1 |

## 5. Formulary waves

A formulary package uses the same record with `bundleId` set to the package id and
`contentVersionReviewed` to the package version; §2 badge fields are not applicable (the
formulary has no pre-brief), but the picker's "about" surface may show the formulary's latest
record version and date.

## 6. Instrument log

| Date | Version | Change |
|---|---|---|
| 2026-09-02 | 1.0 | Instantiated (EP-6). Record fields, fixed review-model string, four dispositions, badge fields with the amber staleness default, rendered-record shape, EP-9 coverage table. |
