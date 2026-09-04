// SPDX-License-Identifier: MIT
/** Workspace and repository paths for the content CLI. */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Paths {
  /** `medrecsim/` — the pnpm workspace root. */
  workspace: string;
  /** Repository root (parent of the workspace). */
  repo: string;
  contentDir: string;
  casesDir: string;
  formularyDir: string;
  universeDir: string;
  fixturesDir: string;
  jsonSchemaDir: string;
  compiledDir: string;
  registryFile: string;
  citationPolicyFile: string;
}

export function resolvePaths(workspaceOverride?: string): Paths {
  const here = dirname(fileURLToPath(import.meta.url));
  const workspace = workspaceOverride ? resolve(workspaceOverride) : resolve(here, '../../..');
  if (!existsSync(join(workspace, 'pnpm-workspace.yaml')))
    throw new Error(`not a medrecsim workspace: ${workspace}`);
  const repo = resolve(workspace, '..');
  return {
    workspace,
    repo,
    contentDir: join(workspace, 'content'),
    casesDir: join(workspace, 'content', 'cases'),
    formularyDir: join(workspace, 'content', 'formulary'),
    universeDir: join(workspace, 'content', 'universe'),
    fixturesDir: join(workspace, 'tests', 'synthetic-fixtures'),
    jsonSchemaDir: join(workspace, 'packages', 'schema', 'json-schema'),
    compiledDir: join(workspace, 'packages', 'app', 'src', 'content', 'generated'),
    registryFile: join(repo, 'source material', 'REGISTRY.md'),
    citationPolicyFile: join(repo, 'docs', 'clinical', 'CITATION-POLICY.md'),
  };
}

export function toPosix(p: string): string {
  return p.replaceAll('\\', '/');
}
