// SPDX-License-Identifier: MIT
/** Shared types for the invariant validators (D-DATA-003; architecture §4). */
import type { CaseDocument } from '../documents/case.ts';
import type { CitationsDocument } from '../documents/citations-file.ts';
import type { FormularyEntry } from '../documents/formulary.ts';
import type { ReviewRecordDocument } from '../documents/review-record.ts';
import type { EvidenceDocument } from '../evidence/document.ts';
import type { ReferenceDocument } from '../reference/document.ts';

export type FindingSeverity = 'error' | 'warning';

export type PathSegment = string | number;

export interface Finding {
  /** Invariant id (INV-…), or `SCHEMA` for a shape error no invariant claims. */
  invariant: string;
  severity: FindingSeverity;
  /** File name relative to the bundle directory (e.g. `evidence.yaml`). */
  file: string;
  /** Data path inside the file; empty for whole-file findings. */
  path: readonly PathSegment[];
  message: string;
}

/** One content file as loaded by the CLI: raw text (for header checks) and parsed YAML data. */
export interface ContentFile {
  /** Name relative to the bundle directory. */
  name: string;
  /** Absolute or workspace-relative path for reporting. */
  path: string;
  text: string;
  /** Parsed YAML (unknown until schema-validated); undefined when parsing failed. */
  data: unknown;
  /** Parse error message when the YAML itself is malformed. */
  parseError?: string;
}

export interface CaseBundleInput {
  kind: 'case';
  /** Bundle directory path for reporting. */
  dir: string;
  /** Directory basename (INV-META-001 compares it with the slug unless it starts with `_`). */
  dirName: string;
  files: ReadonlyMap<string, ContentFile>;
}

export interface FormularyInput {
  kind: 'formulary';
  dir: string;
  manifest: ContentFile;
  entries: readonly ContentFile[];
  citations: ContentFile | null;
}

export interface UniverseInput {
  kind: 'universe';
  dir: string;
  file: ContentFile;
}

export interface FormularyIndex {
  version: string;
  entries: ReadonlyMap<string, FormularyEntry>;
}

export interface UniverseIndex {
  version: string;
  institutionIds: ReadonlySet<string>;
  personIds: ReadonlySet<string>;
}

export interface ValidationContext {
  formulary: FormularyIndex | null;
  universe: UniverseIndex | null;
  /** Source keys present in `source material/REGISTRY.md`; null when not loaded. */
  citationRegistryKeys: ReadonlySet<string> | null;
  /** Source keys present in CITATION-POLICY.md §7; null when not loaded. */
  citationPolicyKeys: ReadonlySet<string> | null;
  /** SPDX identifier every bundle file must carry (CC-BY-4.0 under content/, MIT for test fixtures). */
  expectedSpdx: string;
}

export interface ParsedCaseBundle {
  case: CaseDocument;
  evidence: EvidenceDocument;
  reference: ReferenceDocument;
  citations: CitationsDocument;
  reviewRecord: ReviewRecordDocument | null;
}

export interface CaseInvariant {
  id: string;
  run(bundle: ParsedCaseBundle, input: CaseBundleInput, ctx: ValidationContext): Finding[];
}

export function finding(
  invariant: string,
  severity: FindingSeverity,
  file: string,
  path: readonly PathSegment[],
  message: string,
): Finding {
  return { invariant, severity, file, path, message };
}

export function pathToString(path: readonly PathSegment[]): string {
  let out = '';
  for (const seg of path) {
    if (typeof seg === 'number') out += `[${seg}]`;
    else out += out.length === 0 ? seg : `.${seg}`;
  }
  return out.length === 0 ? '(root)' : out;
}

/** Depth-first visit of every string value in parsed YAML data. */
export function walkStrings(
  data: unknown,
  visit: (value: string, path: readonly PathSegment[]) => void,
  path: PathSegment[] = [],
): void {
  if (typeof data === 'string') visit(data, path);
  else if (Array.isArray(data)) data.forEach((item, i) => walkStrings(item, visit, [...path, i]));
  else if (data !== null && typeof data === 'object') {
    for (const [k, v] of Object.entries(data as Record<string, unknown>))
      walkStrings(v, visit, [...path, k]);
  }
}

/** Reports duplicate `id`-like values inside one collection. */
export function checkUniqueIds(
  invariant: string,
  file: string,
  basePath: readonly PathSegment[],
  items: readonly { id?: string; key?: string }[],
  label: string,
): Finding[] {
  const seen = new Map<string, number>();
  const out: Finding[] = [];
  items.forEach((item, i) => {
    const id = item.id ?? item.key;
    if (id === undefined) return;
    const first = seen.get(id);
    if (first !== undefined)
      out.push(
        finding(
          invariant,
          'error',
          file,
          [...basePath, i],
          `${label} id "${id}" duplicates entry [${first}]`,
        ),
      );
    else seen.set(id, i);
  });
  return out;
}
