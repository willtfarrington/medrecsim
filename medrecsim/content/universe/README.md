<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# content/universe

The fictional-universe registry (integrator resolution I-9): the shared content package beside
the formulary that names the fictional hospital, pharmacies, prescriber offices, programs and
recurring people. Cases reference entries by id (`inst-…`, `person-…`) so every invented name
lives in one place for the trade-dress originality checklist
([docs/ORIGINALITY-CHECKLIST.md](../../../docs/ORIGINALITY-CHECKLIST.md), D-UX-001). CC BY 4.0.

## What is in `universe.yaml`

| Block            | Purpose                                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locality`       | The one fictional city (Corrowell) every institution sits in; no state, county or real place is ever named.                                                             |
| `institutions[]` | Hospital, community pharmacy, primary-care practice at EP-10; opioid-treatment program, specialty offices, urgent care and others arrive with the cases that need them. |
| `people[]`       | Recurring non-player characters and escalation targets (D-WF-003): the PCP, the community pharmacist, the inpatient pharmacist, the attending, the admitting nurse.     |

**Patients are never registered here.** A patient name belongs to one case and is authored,
screened and stigma-reviewed inside that case bundle (`evidence.yaml` `patient.displayName`).

## Screening: every name proves it was checked

Every non-placeholder entry carries a `screening` record — `date`, `venues`, `grade`, `note` —
produced by the fictional in-sim rule in [docs/NAME-SCREEN.md](../../../docs/NAME-SCREEN.md):
web search for the exact name (plus "hospital", "pharmacy", "clinic", "MD", "RN" as fits), an
RDAP check of `<name>.com` for institutions, a USPTO-mirror query on the distinctive word, and
the stigma-safety guidance for person names. Grades follow NAME-SCREEN.md: **L0** nothing found ·
**L1** adjacency only (a registered but unrelated domain, an unrelated person sharing a
surname) · **L2 / L3** a real organisation or notable person of the same kind — the name is
**renamed**, never published. The validator (`INV-SCOPE-001`) refuses an unscreened entry and
any grade of L2 or above. A name that fails after publication is changed in a content patch
with a changelog entry.

## Visibly fictional identifiers

Rendered identifiers must be unmistakably fake even to a reader who ignores the banner. The
conventions are enforced by the schema and the validator (`INV-SCOPE-001`) and apply to
_every_ content file, not just this one:

| Identifier                                   | Convention                                                             | Why it cannot be real                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Phone / fax                                  | `555-01XX` (`555-0100`…`555-0199`), written as the local part only     | The 555-01XX block is reserved for fiction in the North American Numbering Plan |
| NPI                                          | ten digits, first digit `0`, and the check digit must be **wrong**     | Real NPIs begin with 1 or 2 and pass the Luhn check with the 80840 prefix       |
| Postal code                                  | `000NN`                                                                | No ZIP code begins with 000                                                     |
| Chart / record id                            | `SYN-` + digits (`patient.chartId`)                                    | Never MRN-like; the prefix says synthetic                                       |
| Barcode payload (EP-22)                      | begins with the literal word `SYNTHETIC`                               | A scanner reads the word before anything else                                   |
| DEA number, SSN, date of birth, insurance id | **never rendered**                                                     | No field exists for them; the pre-commit tripwire blocks SSN/DOB-like patterns  |
| Dates                                        | simulated case dates from `T0` (relative in YAML, absolute at compile) | Tied to the fictional admission, not a calendar person                          |

Ten-digit phone numbers in prose are scanned too: anything whose local part is not `555-01XX`
is an error, as is any `NPI`-labelled number that passes the check-digit test.

## Versioning

`universeVersion` is the package's own content version (D-DATA-002). Cases declare a
`universeVersionRange`; adding an entry is a minor bump, renaming or removing one is a major
bump with a codemod (EP-34).
