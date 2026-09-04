#!/usr/bin/env node
// SPDX-License-Identifier: MIT
/**
 * medrecsim content CLI (D-DATA-005; architecture §5). Runs directly under Node 24's native
 * TypeScript type stripping (`erasableSyntaxOnly` is enforced), so no loader dependency.
 *
 * Commands and the EP that implements each:
 *   validate [--all] [<bundle-dir>...] [--format pretty|json|github]   EP-9
 *   fixtures [--format pretty|json|github]                             EP-9 (negative suite)
 *   compile [--out <dir>] [--include-drafts]                           EP-9 (ADR-3)
 *   schema-export [--check]                                            EP-9 (ADR-2 drift check)
 *   coverage [--format table|json|md] [--gate]                         EP-20
 *   migrate <codemod-id> [--dry-run]                                   EP-34
 *
 * Exit codes: 0 ok · 1 validation failure · 2 usage error.
 */
import { runCompile } from './commands/compile.ts';
import { runFixtures } from './commands/fixtures.ts';
import { runSchemaExport } from './commands/schema-export.ts';
import { runValidate } from './commands/validate.ts';
import { parseFormat } from './report.ts';
import { resolvePaths } from './workspace.ts';

const PENDING: Readonly<Record<string, string>> = { coverage: 'EP-20', migrate: 'EP-34' };

function usage(): string {
  return [
    'Usage: medrecsim-content <command> [options]',
    '',
    'Commands:',
    '  validate [--all] [<bundle-dir>...] [--format pretty|json|github]',
    '  fixtures [--format pretty|json|github]',
    '  compile [--out <dir>] [--include-drafts] [--format pretty|json|github]',
    '  schema-export [--check]',
    '  coverage    (arrives with EP-20)',
    '  migrate     (arrives with EP-34)',
    '',
    'Global: --workspace <dir> (defaults to the workspace this CLI lives in)',
  ].join('\n');
}

interface Args {
  command: string | undefined;
  flags: Map<string, string | true>;
  positional: string[];
}

function parseArgs(argv: readonly string[]): Args {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | true>();
  const positional: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i] as string;
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) flags.set(a.slice(2, eq), a.slice(eq + 1));
      else {
        const next = rest[i + 1];
        const takesValue = ['format', 'out', 'workspace'].includes(a.slice(2));
        if (takesValue && next !== undefined && !next.startsWith('--')) {
          flags.set(a.slice(2), next);
          i++;
        } else flags.set(a.slice(2), true);
      }
    } else positional.push(a);
  }
  return { command, flags, positional };
}

function main(argv: readonly string[]): number {
  const { command, flags, positional } = parseArgs(argv);
  if (command === undefined || command === '--help' || command === '-h') {
    console.log(usage());
    return command === undefined ? 2 : 0;
  }
  const pending = PENDING[command];
  if (pending !== undefined) {
    console.error(`medrecsim-content ${command}: not implemented yet — arrives with ${pending}.`);
    return 2;
  }
  const str = (k: string) => {
    const v = flags.get(k);
    return typeof v === 'string' ? v : undefined;
  };
  const paths = resolvePaths(str('workspace'));
  switch (command) {
    case 'validate': {
      const all = flags.get('all') === true;
      if (!all && positional.length === 0) {
        console.error('validate: pass --all or at least one bundle directory\n\n' + usage());
        return 2;
      }
      const r = runValidate(paths, { all, dirs: positional, format: parseFormat(str('format')) });
      console.log(r.output);
      return r.ok ? 0 : 1;
    }
    case 'fixtures': {
      const r = runFixtures(paths, parseFormat(str('format')));
      console.log(r.output);
      return r.ok ? 0 : 1;
    }
    case 'compile': {
      const r = runCompile(paths, {
        out: str('out'),
        includeDrafts: flags.get('include-drafts') === true,
        format: parseFormat(str('format')),
      });
      console.log(r.output);
      return r.ok ? 0 : 1;
    }
    case 'schema-export': {
      const r = runSchemaExport(paths, flags.get('check') === true);
      console.log(r.output);
      return r.ok ? 0 : 1;
    }
    default:
      console.error(`Unknown command: ${command}\n\n${usage()}`);
      return 2;
  }
}

try {
  process.exit(main(process.argv.slice(2)));
} catch (err) {
  console.error(`medrecsim-content: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(2);
}
