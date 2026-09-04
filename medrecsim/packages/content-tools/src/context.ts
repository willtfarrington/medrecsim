// SPDX-License-Identifier: MIT
/** Builds the shared ValidationContext (formulary index, universe index, registry keys). */
import {
  validateFormulary,
  validateUniverse,
  type FormularyIndex,
  type UniverseIndex,
  type ValidationContext,
} from '@medrecsim/schema';
import {
  expectedSpdxFor,
  loadCitationKeys,
  loadFormulary,
  loadUniverse,
  type LoadedFormulary,
  type LoadedUniverse,
} from './load.ts';
import { annotate, type BundleReport } from './report.ts';
import type { Paths } from './workspace.ts';

export interface SharedPackages {
  formulary: LoadedFormulary | null;
  universe: LoadedUniverse | null;
  formularyIndex: FormularyIndex | null;
  universeIndex: UniverseIndex | null;
  reports: BundleReport[];
  ctx: ValidationContext;
  /** Parsed formulary/universe data for the compile step. */
  parsedFormulary: ReturnType<typeof validateFormulary>['parsed'];
  parsedUniverse: ReturnType<typeof validateUniverse>['parsed'];
}

export function loadSharedPackages(paths: Paths): SharedPackages {
  const keys = loadCitationKeys(paths);
  const baseCtx: ValidationContext = {
    formulary: null,
    universe: null,
    ...keys,
    expectedSpdx: 'CC-BY-4.0',
  };
  const reports: BundleReport[] = [];

  const formulary = loadFormulary(paths);
  let parsedFormulary: SharedPackages['parsedFormulary'] = null;
  if (formulary) {
    const r = validateFormulary(formulary.input, {
      ...baseCtx,
      expectedSpdx: expectedSpdxFor(paths.formularyDir, paths),
    });
    parsedFormulary = r.parsed;
    reports.push({
      dir: formulary.input.dir,
      findings: annotate(r.findings, formulary.lines, (n) =>
        fileReportPath(formulary.input.dir, n),
      ),
    });
  }

  const universe = loadUniverse(paths);
  let parsedUniverse: SharedPackages['parsedUniverse'] = null;
  if (universe) {
    const r = validateUniverse(universe.input, {
      ...baseCtx,
      expectedSpdx: expectedSpdxFor(paths.universeDir, paths),
    });
    parsedUniverse = r.parsed;
    reports.push({
      dir: universe.input.dir,
      findings: annotate(r.findings, universe.lines, (n) => fileReportPath(universe.input.dir, n)),
    });
  }

  const formularyIndex = parsedFormulary?.index ?? null;
  const universeIndex = parsedUniverse?.index ?? null;
  return {
    formulary,
    universe,
    formularyIndex,
    universeIndex,
    reports,
    ctx: { ...baseCtx, formulary: formularyIndex, universe: universeIndex },
    parsedFormulary,
    parsedUniverse,
  };
}

export function fileReportPath(bundleDir: string, fileName: string): string {
  return `${bundleDir}/${fileName}`;
}
