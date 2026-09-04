// SPDX-License-Identifier: MIT
/**
 * Loading content from disk: YAML → ContentFile (text + data + line resolver), bundle inputs,
 * the formulary and universe packages, and the citation registry keys. All I/O lives here;
 * @medrecsim/schema stays pure.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { LineCounter, parseDocument, type Document } from 'yaml';
import type {
  CaseBundleInput,
  ContentFile,
  FormularyInput,
  PathSegment,
  UniverseInput,
  ValidationContext,
} from '@medrecsim/schema';
import { toPosix, type Paths } from './workspace.ts';

export type LineResolver = (path: readonly PathSegment[]) => number | undefined;

export interface LoadedFile {
  file: ContentFile;
  lines: LineResolver;
}

export function loadYamlFile(absPath: string, name: string, reportPath: string): LoadedFile {
  const text = readFileSync(absPath, 'utf8');
  return fromYamlText(text, name, reportPath);
}

export function fromYamlText(text: string, name: string, reportPath: string): LoadedFile {
  const lineCounter = new LineCounter();
  const doc: Document = parseDocument(text, { lineCounter, prettyErrors: true });
  const parseError =
    doc.errors.length > 0 ? doc.errors.map((e) => e.message).join('; ') : undefined;
  const file: ContentFile = {
    name,
    path: reportPath,
    text,
    data: parseError === undefined ? doc.toJS() : undefined,
    ...(parseError !== undefined ? { parseError } : {}),
  };
  const lines: LineResolver = (path) => {
    // Walk to the deepest existing node so a "missing required field" lands on its parent.
    for (let n = path.length; n >= 0; n--) {
      const node =
        n === 0 ? doc.contents : doc.getIn(path.slice(0, n) as (string | number)[], true);
      const range = (node as { range?: [number, number, number] } | null)?.range;
      if (range) return lineCounter.linePos(range[0]).line;
    }
    return undefined;
  };
  return { file, lines };
}

export function loadTextFile(absPath: string, name: string, reportPath: string): LoadedFile {
  const text = readFileSync(absPath, 'utf8');
  return { file: { name, path: reportPath, text, data: undefined }, lines: () => 1 };
}

export interface LoadedCaseBundle {
  input: CaseBundleInput;
  lines: Map<string, LineResolver>;
}

const YAML_RE = /\.ya?ml$/;
const TEXT_RE = /\.md$/;

/** Loads every YAML and Markdown file directly inside a case bundle directory. */
export function loadCaseBundle(dir: string, paths: Paths): LoadedCaseBundle {
  const files = new Map<string, ContentFile>();
  const lines = new Map<string, LineResolver>();
  for (const entry of readdirSync(dir).sort()) {
    const abs = join(dir, entry);
    if (!statSync(abs).isFile()) continue;
    const reportPath = toPosix(relative(paths.repo, abs));
    let loaded: LoadedFile;
    if (YAML_RE.test(entry)) loaded = loadYamlFile(abs, entry, reportPath);
    else if (TEXT_RE.test(entry)) loaded = loadTextFile(abs, entry, reportPath);
    else continue;
    files.set(entry, loaded.file);
    lines.set(entry, loaded.lines);
  }
  return {
    input: { kind: 'case', dir: toPosix(relative(paths.repo, dir)), dirName: basename(dir), files },
    lines,
  };
}

export interface LoadedFormulary {
  input: FormularyInput;
  lines: Map<string, LineResolver>;
}

export function loadFormulary(paths: Paths): LoadedFormulary | null {
  const manifestPath = join(paths.formularyDir, 'formulary.yaml');
  if (!existsSync(manifestPath)) return null;
  const lines = new Map<string, LineResolver>();
  const rel = (p: string) => toPosix(relative(paths.repo, p));
  const manifest = loadYamlFile(manifestPath, 'formulary.yaml', rel(manifestPath));
  lines.set(manifest.file.name, manifest.lines);
  const entriesDir = join(paths.formularyDir, 'entries');
  const entries: ContentFile[] = [];
  if (existsSync(entriesDir)) {
    for (const entry of readdirSync(entriesDir).sort()) {
      if (!YAML_RE.test(entry)) continue;
      const abs = join(entriesDir, entry);
      const loaded = loadYamlFile(abs, `entries/${entry}`, rel(abs));
      entries.push(loaded.file);
      lines.set(loaded.file.name, loaded.lines);
    }
  }
  const citationsPath = join(paths.formularyDir, 'citations.yaml');
  let citations: ContentFile | null = null;
  if (existsSync(citationsPath)) {
    const loaded = loadYamlFile(citationsPath, 'citations.yaml', rel(citationsPath));
    citations = loaded.file;
    lines.set(loaded.file.name, loaded.lines);
  }
  return {
    input: {
      kind: 'formulary',
      dir: rel(paths.formularyDir),
      manifest: manifest.file,
      entries,
      citations,
    },
    lines,
  };
}

export interface LoadedUniverse {
  input: UniverseInput;
  lines: Map<string, LineResolver>;
}

export function loadUniverse(paths: Paths): LoadedUniverse | null {
  const filePath = join(paths.universeDir, 'universe.yaml');
  if (!existsSync(filePath)) return null;
  const loaded = loadYamlFile(filePath, 'universe.yaml', toPosix(relative(paths.repo, filePath)));
  return {
    input: {
      kind: 'universe',
      dir: toPosix(relative(paths.repo, paths.universeDir)),
      file: loaded.file,
    },
    lines: new Map([[loaded.file.name, loaded.lines]]),
  };
}

/** Case bundle directories under content/cases (any directory containing case.yaml). */
export function listCaseDirs(paths: Paths): string[] {
  if (!existsSync(paths.casesDir)) return [];
  return readdirSync(paths.casesDir)
    .sort()
    .map((d) => join(paths.casesDir, d))
    .filter((d) => statSync(d).isDirectory() && existsSync(join(d, 'case.yaml')));
}

/**
 * Source keys from the two pointer lists (W4 registry-row check). Registry rows start with
 * `| KEY |`; the policy's §7 rows start with `` | `KEY` | ``.
 */
export function loadCitationKeys(
  paths: Paths,
): Pick<ValidationContext, 'citationRegistryKeys' | 'citationPolicyKeys'> {
  const registry = existsSync(paths.registryFile) ? readFileSync(paths.registryFile, 'utf8') : null;
  const policy = existsSync(paths.citationPolicyFile)
    ? readFileSync(paths.citationPolicyFile, 'utf8')
    : null;
  const keysFrom = (text: string | null, re: RegExp) =>
    text === null ? null : new Set([...text.matchAll(re)].map((m) => m[1] as string));
  return {
    citationRegistryKeys: keysFrom(registry, /^\| ([A-Z0-9]+(?:-[A-Z0-9]+)*) \|/gm),
    citationPolicyKeys: keysFrom(policy, /^\| `([A-Z0-9]+(?:-[A-Z0-9]+)*)` \|/gm),
  };
}

export function expectedSpdxFor(absDir: string, paths: Paths): string {
  const rel = toPosix(relative(paths.workspace, absDir));
  return rel === 'content' || rel.startsWith('content/') ? 'CC-BY-4.0' : 'MIT';
}
