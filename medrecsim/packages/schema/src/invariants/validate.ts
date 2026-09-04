// SPDX-License-Identifier: MIT
/**
 * Top-level validators: schema-parse every file (attributing shape errors to invariants), then
 * run the invariant suite when the bundle parsed. Pure — the CLI does all I/O.
 */
import type { z } from 'zod';
import { CaseDocument } from '../documents/case.ts';
import { CitationsDocument } from '../documents/citations-file.ts';
import { FormularyEntry, FormularyManifest } from '../documents/formulary.ts';
import { ReviewRecordDocument } from '../documents/review-record.ts';
import { UniverseDocument } from '../documents/universe.ts';
import { EvidenceDocument } from '../evidence/document.ts';
import { ReferenceDocument } from '../reference/document.ts';
import { SCHEMA_VERSION } from '../version.ts';
import { findingsFromZodError } from './attribution.ts';
import {
  CASE_INVARIANTS,
  brandDenylistChecks,
  checkMedicationRef,
  citationChecks,
  lintScopes,
  registryChecks,
  type CitationUse,
} from './case-invariants.ts';
import { spdxChecks } from './spdx.ts';
import {
  checkUniqueIds,
  finding,
  type CaseBundleInput,
  type ContentFile,
  type Finding,
  type FormularyIndex,
  type FormularyInput,
  type ParsedCaseBundle,
  type UniverseIndex,
  type UniverseInput,
  type ValidationContext,
} from './types.ts';

export interface ValidationResult<T> {
  findings: Finding[];
  parsed: T | null;
}

function parseFile<S extends z.ZodType>(
  file: ContentFile,
  schema: S,
  out: Finding[],
): z.infer<S> | null {
  if (file.parseError !== undefined) {
    out.push(finding('SCHEMA', 'error', file.name, [], `YAML parse error: ${file.parseError}`));
    return null;
  }
  const r = schema.safeParse(file.data);
  if (!r.success) {
    out.push(...findingsFromZodError(file.name, r.error));
    return null;
  }
  return r.data as z.infer<S>;
}

const REQUIRED_CASE_FILES = [
  'case.yaml',
  'evidence.yaml',
  'reference.yaml',
  'citations.yaml',
] as const;

export function validateCaseBundle(
  input: CaseBundleInput,
  ctx: ValidationContext,
): ValidationResult<ParsedCaseBundle> {
  const findings: Finding[] = [];
  findings.push(...spdxChecks('INV-SPDX-001', input.files.values(), ctx.expectedSpdx));

  const get = (name: string) => input.files.get(name);
  for (const name of REQUIRED_CASE_FILES) {
    if (!get(name))
      findings.push(
        finding(
          'INV-META-001',
          'error',
          name,
          [],
          `required bundle file ${name} is missing (D-GOV-003)`,
        ),
      );
  }
  const caseFile = get('case.yaml');
  const evidenceFile = get('evidence.yaml');
  const referenceFile = get('reference.yaml');
  const citationsFile = get('citations.yaml');
  const reviewFile = get('review-record.yaml');

  const caseDoc = caseFile ? parseFile(caseFile, CaseDocument, findings) : null;
  const evidence = evidenceFile ? parseFile(evidenceFile, EvidenceDocument, findings) : null;
  const reference = referenceFile ? parseFile(referenceFile, ReferenceDocument, findings) : null;
  const citations = citationsFile ? parseFile(citationsFile, CitationsDocument, findings) : null;
  const reviewRecord = reviewFile ? parseFile(reviewFile, ReviewRecordDocument, findings) : null;

  if (!caseDoc || !evidence || !reference || !citations) return { findings, parsed: null };
  const bundle: ParsedCaseBundle = { case: caseDoc, evidence, reference, citations, reviewRecord };
  for (const inv of CASE_INVARIANTS) findings.push(...inv.run(bundle, input, ctx));
  return { findings, parsed: bundle };
}

export interface ParsedFormulary {
  manifest: FormularyManifest;
  entries: FormularyEntry[];
  citations: CitationsDocument | null;
  index: FormularyIndex;
}

export function validateFormulary(
  input: FormularyInput,
  ctx: ValidationContext,
): ValidationResult<ParsedFormulary> {
  const findings: Finding[] = [];
  const allFiles = [
    input.manifest,
    ...input.entries,
    ...(input.citations ? [input.citations] : []),
  ];
  findings.push(...spdxChecks('INV-SPDX-001', allFiles, ctx.expectedSpdx));

  const manifest = parseFile(input.manifest, FormularyManifest, findings);
  const entries: FormularyEntry[] = [];
  for (const f of input.entries) {
    const e = parseFile(f, FormularyEntry, findings);
    if (e) entries.push(e);
  }
  const citations = input.citations
    ? parseFile(input.citations, CitationsDocument, findings)
    : null;
  if (!manifest || entries.length !== input.entries.length) return { findings, parsed: null };

  findings.push(...checkUniqueIds('INV-REF-001', 'entries', [], entries, 'formulary entry'));
  const index: FormularyIndex = {
    version: manifest.formularyVersion,
    entries: new Map(entries.map((e) => [e.id, e])),
  };
  const localCtx: ValidationContext = { ...ctx, formulary: index };

  if (manifest.schemaVersion !== SCHEMA_VERSION)
    findings.push(
      finding(
        'INV-VERS-001',
        'error',
        input.manifest.name,
        ['schemaVersion'],
        `schemaVersion "${manifest.schemaVersion}" ≠ ${SCHEMA_VERSION}`,
      ),
    );
  if (citations && citations.bundleId !== manifest.id)
    findings.push(
      finding(
        'INV-META-001',
        'error',
        input.citations?.name ?? 'citations.yaml',
        ['bundleId'],
        `bundleId "${citations.bundleId}" ≠ formulary id "${manifest.id}"`,
      ),
    );

  const uses: CitationUse[] = [];
  input.entries.forEach((file, i) => {
    const e = entries[i];
    if (!e) return;
    const name = file.name;
    if (e.schemaVersion !== SCHEMA_VERSION)
      findings.push(
        finding(
          'INV-VERS-001',
          'error',
          name,
          ['schemaVersion'],
          `schemaVersion "${e.schemaVersion}" ≠ ${SCHEMA_VERSION}`,
        ),
      );
    if (e.placeholder)
      findings.push(
        finding(
          'INV-META-001',
          'warning',
          name,
          ['placeholder'],
          'placeholder formulary entry — not reviewed, excluded from compile unless --include-drafts',
        ),
      );
    e.lasaPartners.forEach((p, k) =>
      findings.push(
        ...checkMedicationRef(
          'INV-REF-001',
          name,
          ['lasaPartners', k],
          { formularyId: p },
          localCtx,
          false,
        ),
      ),
    );
    e.combinationComponents?.forEach((c, k) =>
      findings.push(
        ...checkMedicationRef(
          'INV-REF-001',
          name,
          ['combinationComponents', k],
          { formularyId: c.formularyId },
          localCtx,
          false,
        ),
      ),
    );
    findings.push(...brandDenylistChecks('INV-SCOPE-001', name, file.data));
    e.monitoringNotes.forEach((n, k) => {
      findings.push(
        ...lintScopes('INV-ACT-001', [
          {
            file: name,
            path: ['monitoringNotes', k, 'text'],
            text: n.text,
            cited: n.citations.length > 0,
          },
        ]),
      );
      uses.push({
        file: name,
        path: ['monitoringNotes', k],
        ids: n.citations,
        what: `monitoring note`,
        scored: true,
      });
    });
    const flagged =
      e.highAlert || e.timeCritical || e.narrowTherapeuticIndex || e.lasaPartners.length > 0;
    uses.push({
      file: name,
      path: ['citations'],
      ids: e.citations,
      what: `formulary entry ${e.id}${flagged ? ' (flags set)' : ''}`,
      scored: flagged,
    });
  });
  const records = citations?.citations ?? [];
  findings.push(...citationChecks('INV-CIT-001', records, uses));
  findings.push(...registryChecks('INV-REG-001', records, ctx));

  return { findings, parsed: { manifest, entries, citations, index } };
}

export interface ParsedUniverse {
  document: UniverseDocument;
  index: UniverseIndex;
}

export function validateUniverse(
  input: UniverseInput,
  ctx: ValidationContext,
): ValidationResult<ParsedUniverse> {
  const findings: Finding[] = [];
  findings.push(...spdxChecks('INV-SPDX-001', [input.file], ctx.expectedSpdx));
  const doc = parseFile(input.file, UniverseDocument, findings);
  if (!doc) return { findings, parsed: null };
  if (doc.schemaVersion !== SCHEMA_VERSION)
    findings.push(
      finding(
        'INV-VERS-001',
        'error',
        input.file.name,
        ['schemaVersion'],
        `schemaVersion "${doc.schemaVersion}" ≠ ${SCHEMA_VERSION}`,
      ),
    );
  findings.push(
    ...checkUniqueIds(
      'INV-SHAPE-001',
      input.file.name,
      ['institutions'],
      doc.institutions,
      'institution',
    ),
  );
  findings.push(
    ...checkUniqueIds('INV-SHAPE-001', input.file.name, ['people'], doc.people, 'person'),
  );
  findings.push(...brandDenylistChecks('INV-SCOPE-001', input.file.name, input.file.data));
  doc.institutions.forEach((inst, i) => {
    if (inst.placeholder)
      findings.push(
        finding(
          'INV-META-001',
          'warning',
          input.file.name,
          ['institutions', i],
          'placeholder institution — replace at EP-10',
        ),
      );
  });
  const index: UniverseIndex = {
    version: doc.universeVersion,
    institutionIds: new Set(doc.institutions.map((i) => i.id)),
    personIds: new Set(doc.people.map((p) => p.id)),
  };
  return { findings, parsed: { document: doc, index } };
}

export function hasErrors(findings: readonly Finding[]): boolean {
  return findings.some((f) => f.severity === 'error');
}
