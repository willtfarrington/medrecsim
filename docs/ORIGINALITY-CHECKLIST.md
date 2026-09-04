# Trade-dress originality checklist (D-UX-001, D-UX-006; EP-10)

**Status:** standing — applied to every UI, source-voice, screenshot and content EP from EP-15
onward, and re-run at every tag (RELEASE-CRITERIA.md gate G7 and the per-tag checklist) ·
**Instantiated:** 2026-09-04 (EP-10) from
[roadmap/appendices/ux-accessibility.md](../roadmap/appendices/ux-accessibility.md) §10 ·
**Owner of the rules:** the project owner (D-EXEC-003: naming and outward identity are
owner-only); an agent may append a dated record to §7 but not change a rule ·
**Evidence for:** [CLAIMS.md](CLAIMS.md) row C1 ("original and fictional").

medrecsim is a *fictional, vendor-neutral, EHR-like* interface. It must feel like a chart —
fragmented, contradictory, familiar in kind — without borrowing the look, names, or text of
any real product ("fragmentation is fidelity; mechanical friction is not", D-UX-002). This
file is the guard-rail: the rules, the comparison procedure that calibrates them, the name
and identifier conventions, the icon and asset rules, and the dated review records.

## 1. The checklist

Every item names how it is checked. "Grep" means the check is mechanical and runs in CI; the
others are human checks recorded in §7 at each UI EP and each tag.

| # | Rule | How it is checked |
|---|------|-------------------|
| 1.1 | **No vendor coinages or lookalike product names.** No real EHR product, module or feature name — and no near-miss of one — appears in the interface, the content, or the documentation as a label. Real vendor names may appear only in *this file's* §2 records, in the dependency/threat documents, and in citations. | Human review at each UI EP against the §2 vendor list; grep of `medrecsim/packages/app` and `medrecsim/content` for the §1.1 denylist at each tag. |
| 1.2 | **UI labels are descriptive-generic or original.** "Medication list", "Fill history", "Discharge summary", "Call the pharmacy" are generic and free to use. Any *coined* label (a product-like name for a pane, mode or feature) is screened per the fictional in-sim rule in [NAME-SCREEN.md](NAME-SCREEN.md) before it ships, and recorded in §3. | Screening record in §3 for every coined label. |
| 1.3 | **Composition-level originality.** The sim shell's composition is compared, at the level of layout regions, navigation model, header treatment, density and colour, against 3–4 major EHR vendors, using public material only, and ≥ 3 deliberate divergences are documented (§2). Each UI EP re-reads §2 before drawing a surface. | §2 procedure and record; re-run at EP-15, EP-22, EP-19 and the v1.0 audit. |
| 1.4 | **Never pixel-reference a real EHR.** No vendor screenshot, mock-up, icon, colour value, spacing measurement or type specimen is traced, sampled, or used as a reference image while designing. Desk reviews are *viewing only* and happen outside the repository. | Attestation in every §7 record; §6 asset hygiene. |
| 1.5 | **No real-EHR screenshots in this repository, ever.** Not in docs, not in tests, not in issues, not "for comparison". The only screenshots the project publishes are of medrecsim itself, taken from the Pages deployment (D-UX-006; RELEASE-CRITERIA G7). | Human review of every image added; the pre-commit asset check (§6) forces every image through a human `git add`. |
| 1.6 | **No reproduced EHR, discharge-summary, or vendor text.** Evidence-layer documents are written in original *source voices* (ux-accessibility appendix §4); no boilerplate, template, disclaimer or sample text is copied from a real product, hospital, or vendor manual. Clinical facts are cited; prose is written. | Human review at each case EP (clinical self-review checklist) and at EP-22. |
| 1.7 | **Icons are openly licensed or original.** An icon set enters only through the dependency policy (§6 checklist; OFL/MIT/ISC/CC-BY/CC0 only) with registry and THIRD-PARTY rows; original inline SVGs are preferred. No vendor icon is imitated. | DEPENDENCY-POLICY.md §6 for any set; §5 below. |
| 1.8 | **Fonts are self-hosted under the SIL Open Font License** with the licence file vendored and rows in [../THIRD-PARTY.md](../THIRD-PARTY.md) and [../source material/REGISTRY.md](../source%20material/REGISTRY.md). A runtime font CDN would violate D-ARCH-001. | Grep of the built `dist/` for any third-party origin (`scripts/check-no-network.mjs`) — zero; `font-src 'self'` in the CSP. |
| 1.9 | **Fictional identities live in the registry and are screened.** Every institution, program and recurring person is an entry in `medrecsim/content/universe/universe.yaml` with a screening record; every patient name is screened inside its case EP; nothing is "deidentified from memory". | Validator `INV-SCOPE-001` refuses unscreened entries and any grade ≥ L2; §3. |
| 1.10 | **Identifiers are visibly fictional** (§4): 555-01XX phone numbers, NPIs that start with 0 and fail the check digit, `000NN` postal codes, `SYN-` chart ids, barcodes that encode `SYNTHETIC`; never a DEA number, SSN, date of birth or insurance id. | Schema regexes + `INV-SCOPE-001` scan of all authored prose; pre-commit tripwire for SSN/DOB-like patterns. |
| 1.11 | **Assets carry no metadata.** Every image and SVG is stripped of EXIF, XMP, IPTC, timestamps and editor namespaces before it is committed; screenshots are additionally leak-screened (paths, usernames, e-mails, account names) before inclusion. | `pnpm check:assets` in CI; pre-commit hook layer 2d; §6. |

### 1.1 denylist (labels that must never appear as interface or content labels)

Product and module names of the vendors reviewed in §2 and the other widely deployed US
systems, including their coined feature names. The list is illustrative, not exhaustive; the
rule is the *kind* of thing, and any coined label that sounds like a product is screened
(§1.2). Epic · Hyperspace · MyChart · Storyboard · SmartText · SmartPhrase · Chart Review (as a
proper name) · Cerner · Millennium · PowerChart · FirstNet · Oracle Health · MEDITECH ·
Expanse · Magic · athenaOne · athenaClinicals · eClinicalWorks · NextGen · Allscripts ·
Veradigm · Sunrise · TouchWorks · Practice Fusion · Greenway · CPRS · VistA · Evident · CPSI.
Generic terms shared by the field — MAR, BPMH, med rec, discharge summary, problem list, order
set, in-basket (as a generic noun) — are free to use.

## 2. Composition-level comparison (SP-9) — procedure and record

### 2.1 Procedure (re-run at each UI EP and each tag)

1. Pick 3–4 major EHR vendors. Use **public** material only: vendor marketing pages, public
   help/wiki pages, press screenshots, or public-domain government systems. View them in a
   browser or a scratch directory *outside the repository*; delete anything downloaded when
   the review ends. Never store, crop, trace, or colour-pick a vendor image.
2. For each vendor write **composition notes in your own words** — layout regions, where the
   navigation sits, how the patient header is treated, the density model (dashboard cards vs
   single reading column vs list boxes), the colour scheme at the level of "saturated band"
   or "neutral ground", the status-pill treatment, the clock/date treatment. Never copy
   labels or text.
3. Write the medrecsim composition in the same terms (D-UX-001 defines it: patient header;
   source-navigation pane with chart tabs *and* visually distinct non-chart channels;
   persistent workspace pane with the three learner artifacts).
4. Tabulate the **deliberate divergences** (≥ 3) and check that the design tokens and the
   surface being built honour them.
5. Record the review in §7 with date, vendors, sources viewed, the divergence table, and the
   attestation "nothing vendor-derived entered the tree".

### 2.2 Record — SP-9 dry run, 2026-09-04 (EP-10)

**Sources viewed (viewing only; nothing copied; scratch directory deleted at session end):**

| Vendor / system | What was viewed | Source kind |
|---|---|---|
| MEDITECH Expanse | Two public product screenshots on the vendor's Expanse page (a patient-summary view; a chart-search view) | Vendor marketing page |
| Oracle Health (Cerner heritage) | One public product screenshot of the ambulatory suite on a software-review site; the public PowerChart help wiki was blocked (HTTP 403) | Review-site listing |
| VA VistA CPRS | The public cover-sheet screenshot on Wikimedia Commons | US Government work (public domain) |
| Epic | **No screenshot was viewable** from a scripted session (vendor and reseller pages return 403); notes below come from public university training-page descriptions (top toolbar, activity tabs, a persistent left patient-summary sidebar) and are marked as textual. | Public training-page text |

**Composition notes (in the reviewer's words):**

- *MEDITECH Expanse.* A black icon toolbar across the very top (home, chart, document,
  orders, sign, more); beneath it a saturated **blue title band** carrying the product name and
  the patient demographics line; a **left vertical menu** of chart sections; the main area is
  a **dashboard grid of summary cards** (encounters, problems, medications, allergies,
  diagnostics, immunisations, providers), each with a colour-filled "Active/Completed" pill and
  a "View all" link. The search view shows a left rail with patient name and tools, a search
  box with result-type tabs, and a scanned-document viewer.
- *Oracle Health ambulatory suite.* A **dark-teal header band** with the calendar date, a
  message field and a status control; a schedule list of patient rows with portrait
  thumbnails, age/sex/date-of-birth, and visit type; a **bottom tab strip** (schedule, message
  centre). Dense, card-per-patient rows on a light ground.
- *VA VistA CPRS.* Classic Windows chrome: a menu bar; a **patient/visit header strip** with a
  yellow highlighted patient box; the cover sheet is a **grid of list boxes** (problems,
  allergies, postings, medications, reminders, labs, vitals, appointments); a **bottom tab
  strip** (cover sheet, problems, meds, orders, notes, …).
- *Epic (textual).* Publicly described as a top toolbar with activity tabs, a persistent
  left-hand patient-summary sidebar, and a search-driven navigation model.

**Shared vendor pattern.** A saturated or dark horizontal band at the top that carries the
patient identity; navigation as a top icon toolbar plus either a left section menu or a
bottom tab strip; the landing view is a *dashboard of widgets* (cards or list boxes); status
shown as colour-filled pills; the wall-clock date in the header; system UI typefaces.

**The medrecsim composition (D-UX-001).** Three columns on a warm paper ground: a
source-navigation pane on the left that groups *chart tabs* under one heading and *non-chart
channels* (phone calls, physical artifacts, bedside interview) under another, each channel with
its own hue, icon and label; a single reading column in the middle where one source at a time is
read and its claims are cited into the workspace; a persistent workspace pane on the right with
the three learner artifacts (working history, discrepancy log, action list) and the simulated
case clock. The patient header is a flat bordered card in ink on paper.

**Deliberate divergences (design-token level):**

| # | Vendors (composition) | medrecsim (tokens / rule) |
|---|---|---|
| D-1 | Saturated or dark title band across the top carrying patient identity (blue, dark teal, Windows-yellow strip) | **No coloured band.** Ground is warm paper (`--color-canvas #f4f1ea`); the patient header is a bordered flat card in `--color-ink`; colour is reserved for channel identity and semantic states. |
| D-2 | Navigation as a top icon toolbar plus a left section menu or a bottom tab strip | **One left source-navigation pane, two groups** (chart tabs; non-chart channels with `--color-channel-*` hue + icon + text label); no top icon toolbar, no bottom tab strip. |
| D-3 | Landing view is a dashboard grid of widgets (cards, list boxes) with drop shadows and "view all" links | **No dashboard.** One reading column (`--layout-reading-max: 72ch`) showing a single source in its own voice; flat, bordered surfaces, `--radius-sm/md` 2–4 px, no elevation tokens at all. Fragmentation is by *source*, never by widget. |
| D-4 | Status as colour-filled rounded pills ("Active", "Completed") | **Outlined status chips with a text label and, where relevant, an icon**; never colour-only (D-UX-004); chip radius 4 px, not pill-shaped; semantic tokens always pair `-ink` with `-bg`. |
| D-5 | System UI typefaces (Segoe/Arial/Roboto-class), small dense text | **Atkinson Hyperlegible Next** for documents (distinguishable I/l/1, 0/O — matters for dose strings and drug names) on a 16 px base; **Caveat** for authored handwriting at ≥ 22 px, weight 600, on a `--color-paper` ground with a 7:1 contrast floor. |
| D-6 | Wall-clock date/time in the header | **Simulated case clock** in the workspace pane, shown as elapsed time since admission (D-WF-002); no real date anywhere in the sim shell. |
| D-7 | Persistent patient-summary sidebar / cover sheet as the default | **The workspace pane holds what the *learner* has built**, not a system summary; there is no system-generated summary of the patient at all — that is the point of the exercise. |

**Attestation.** No vendor screenshot, asset, colour value, text, or measurement entered the
repository; the reviewed images lived in a session scratch directory outside the tree and were
deleted; the notes above are the reviewer's own composition-level words. The checklist is
calibrated: every rule in §1 was tested against what the review found.

## 3. Names: screening rule and log

The fictional in-sim rule in [NAME-SCREEN.md](NAME-SCREEN.md) (last section) applies to every
institution, program, provider, patient and coined UI label. The registry
(`medrecsim/content/universe/universe.yaml`) stores the screening record next to each name;
`INV-SCOPE-001` refuses a registry entry without one or with a grade of L2 or higher. Patient
names are screened inside their case EP and additionally pass the stigma-safety checklist
(respectful cross-cultural names; a condition is never "explained" by ethnicity or class).

### Log — EP-10 registry seed, 2026-09-04

| Name | Kind | Venues | Grade | Note |
|---|---|---|---|---|
| Corrowell (city) | locality | web · rdap · uspto-mirror | L0 | No place, organisation or person found; three `.com` variants unregistered; 0 marks. |
| ~~Halvern~~ (city) | locality | web | — | **Rejected**: a real populated place inside Hayward, California (rule 1 → rename). Never used. |
| Corrowell General Hospital | hospital | web · rdap · uspto-mirror | L0 | No hits; domains unregistered; 0 marks. |
| Quillbrook Pharmacy | community pharmacy | web · rdap · uspto-mirror | L1 | No pharmacy of that name; `quillbrookpharmacy.com` unregistered; the bare `quillbrook.com` is registered (2020) and serves a 404 — not a healthcare organisation. 0 marks. |
| Tessary Family Medicine | clinic | web · rdap · uspto-mirror | L1 | No hits; `tessaryfamilymedicine.com` unregistered; the bare `tessary.com` is a drop-caught parked domain (2025). 0 marks. |
| Anneliese Okafor, MD | person (PCP) | web · stigma-safety | L0 | Exact full name: no notable person. |
| Rafael Ibarra-Quan, PharmD | person (community pharmacist) | web · stigma-safety | L0 | Exact hyphenated name: no hits. |
| Devika Marchetti, PharmD | person (inpatient pharmacist) | web · stigma-safety | L0 | Exact full name: no hits. |
| Simone Adebayo-Kessler, MD | person (attending) | web · stigma-safety | L0 | Exact full name: no hits. |
| Marcus Lindqvist, RN | person (nurse) | web · stigma-safety | L0 | Exact full name with RN/nurse: no notable person. |

Coined UI labels: none yet (EP-15 adds the first surfaces and appends here).

## 4. Visibly fictional identifiers

| Identifier | Convention | Enforced by |
|---|---|---|
| Phone / fax | `555-01XX` (555-0100 … 555-0199), written as the local part | schema regex on registry fields; `INV-SCOPE-001` scans every ten-digit number in prose |
| NPI | ten digits, **first digit 0**, and the Luhn check digit (80840 prefix) must be **wrong** | schema regex + check-digit test on registry fields; `INV-SCOPE-001` scans `NPI`-labelled numbers in prose |
| Postal code | `000NN` | schema regex |
| Chart / record id | `SYN-` + 4–6 digits | `patient.chartId` schema |
| Barcode payload (EP-22) | begins with the literal `SYNTHETIC` | EP-22 renderer + this rule |
| DEA number · SSN · date of birth · insurance id | never rendered; no schema field exists | pre-commit tripwire (SSN/DOB-like patterns), schema strictness |
| Real place names | never: one fictional city, no state or county | registry `locality`; case EPs |

## 5. Icons and imagery

- Prefer **original inline SVGs** drawn for medrecsim (stroke-based, 24-unit grid, currentColor).
- An icon *set* may be adopted only through DEPENDENCY-POLICY.md §6 with an open licence
  (MIT, ISC, OFL, CC-BY 4.0, CC0), a `source material/REGISTRY.md` row, and a THIRD-PARTY.md
  row. No icon imitates a vendor's.
- Pill and packaging imagery is **never** a photograph of a real product; pill appearance is
  authored *text* (`pillAppearanceText`, D-UX-004) and, if ever drawn, an original schematic.
- No stock photography of real people, hospitals, or documents.

## 6. Asset hygiene and screenshots

- `pnpm check:assets` (CI, stage 8) and pre-commit layer 2d run
  `medrecsim/scripts/strip-asset-metadata.mjs --check` over `content/**`,
  `packages/app/src/assets/**`, `packages/app/public/**`, `docs/**` and `.github/**`. It strips
  PNG text/time/EXIF chunks, JPEG Exif/XMP/IPTC/comment segments, WebP EXIF/XMP chunks, and SVG
  metadata, comments and editor namespaces. `--fix` rewrites in place. The content CLI exposes
  the same as `pnpm content assets [--fix] [paths]`.
- Screenshots (EP-19 onward) are taken from the **public Pages deployment on a clean browser
  profile**, stripped with the script, then leak-screened by hand for paths, usernames,
  e-mails, account names and window chrome before inclusion (D-UX-006; RELEASE-CRITERIA G7).
- Fonts and other binary assets carry provenance (source, commit, hash, licence) in a README
  beside them (`medrecsim/packages/app/src/assets/fonts/README.md`).

## 7. Review log (dated records)

| Date | EP | What was reviewed | Outcome |
|---|---|---|---|
| 2026-09-04 | EP-10 | SP-9 desk-review dry run (§2.2): MEDITECH Expanse, Oracle Health, VA VistA CPRS viewed; Epic from public text only. Design tokens (`medrecsim/packages/app/src/styles/tokens.css`) written against divergences D-1…D-7. Registry seed screened (§3). | Checklist calibrated; 7 divergences documented; nothing vendor-derived entered the tree. |

---
*Informal screening and desk review; not legal advice. Vendor names appear here only to
document what medrecsim deliberately does not resemble.*
