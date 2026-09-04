#!/usr/bin/env node
// SPDX-License-Identifier: MIT
/**
 * medrecsim content CLI — scaffold (EP-8). Runs directly under Node 24's native TypeScript
 * type stripping (`erasableSyntaxOnly` is enforced by tsconfig), so no loader dependency.
 *
 * Commands (architecture §5, D-DATA-005) and the EP that implements each:
 *   validate [--all] [--format pretty|json|github]   EP-9
 *   coverage [--format table|json|md] [--gate]       EP-20
 *   compile                                          EP-9  (ADR-3: YAML → JSON at build time)
 *   migrate <codemod-id> [--dry-run]                 EP-34
 */

const COMMANDS: Readonly<Record<string, string>> = {
  validate: 'EP-9',
  coverage: 'EP-20',
  compile: 'EP-9',
  migrate: 'EP-34',
};

function usage(): string {
  const rows = Object.entries(COMMANDS).map(
    ([name, ep]) => `  ${name.padEnd(10)} (arrives with ${ep})`,
  );
  return ['Usage: medrecsim-content <command> [options]', '', 'Commands:', ...rows].join('\n');
}

const [command] = process.argv.slice(2);

if (command === undefined || command === '--help' || command === '-h') {
  console.log(usage());
  process.exit(command === undefined ? 2 : 0);
}

const owner = COMMANDS[command];
if (owner === undefined) {
  console.error(`Unknown command: ${command}\n\n${usage()}`);
  process.exit(2);
}

console.error(`medrecsim-content ${command}: not implemented yet — arrives with ${owner}.`);
process.exit(2);
