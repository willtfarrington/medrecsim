// SPDX-License-Identifier: MIT
/**
 * JSON Schema export (ADR-2, I-3 hybrid): draft-07 documents generated from the Zod source of
 * truth for editor support (yaml-language-server). Committed under packages/schema/json-schema/
 * and kept current by `content schema-export --check` in CI. Refinements never carry semantics
 * (they are dropped on export); every cross-field rule lives in the invariant suite.
 */
import { z } from 'zod';
import { CaseDocument } from './documents/case.ts';
import { CitationsDocument } from './documents/citations-file.ts';
import { FormularyEntry, FormularyManifest } from './documents/formulary.ts';
import { ReviewRecordDocument } from './documents/review-record.ts';
import { UniverseDocument } from './documents/universe.ts';
import { EvidenceDocument } from './evidence/document.ts';
import { ReferenceDocument } from './reference/document.ts';
import { SCHEMA_VERSION } from './version.ts';

export interface ExportedSchema {
  /** File stem, e.g. `case` → `case.schema.json`. */
  name: string;
  /** Glob (relative to the workspace) the editor mapping binds this schema to. */
  fileMatch: string[];
  schema: Record<string, unknown>;
}

const DOCUMENTS: readonly { name: string; fileMatch: string[]; zod: z.ZodType }[] = [
  { name: 'case', fileMatch: ['content/cases/*/case.yaml'], zod: CaseDocument },
  { name: 'evidence', fileMatch: ['content/cases/*/evidence.yaml'], zod: EvidenceDocument },
  { name: 'reference', fileMatch: ['content/cases/*/reference.yaml'], zod: ReferenceDocument },
  {
    name: 'citations',
    fileMatch: ['content/cases/*/citations.yaml', 'content/formulary/citations.yaml'],
    zod: CitationsDocument,
  },
  {
    name: 'review-record',
    fileMatch: ['content/cases/*/review-record.yaml'],
    zod: ReviewRecordDocument,
  },
  {
    name: 'formulary-manifest',
    fileMatch: ['content/formulary/formulary.yaml'],
    zod: FormularyManifest,
  },
  { name: 'formulary-entry', fileMatch: ['content/formulary/entries/*.yaml'], zod: FormularyEntry },
  { name: 'universe', fileMatch: ['content/universe/universe.yaml'], zod: UniverseDocument },
];

export function exportJsonSchemas(): ExportedSchema[] {
  return DOCUMENTS.map((d) => {
    const schema = z.toJSONSchema(d.zod, {
      target: 'draft-7',
      io: 'input',
      unrepresentable: 'any',
    }) as Record<string, unknown>;
    return {
      name: d.name,
      fileMatch: d.fileMatch,
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: `https://medrecsim.invalid/schema/${SCHEMA_VERSION}/${d.name}.schema.json`,
        title: `medrecsim ${d.name} (content schema ${SCHEMA_VERSION})`,
        ...schema,
      },
    };
  });
}
