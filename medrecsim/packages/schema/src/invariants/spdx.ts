// SPDX-License-Identifier: MIT
/**
 * INV-SPDX-001 (W4 cross-hook, D-DATA-006 / D-OSS-001): every YAML and Markdown file in a
 * content bundle carries the expected SPDX identifier within its first three lines. Mirrors
 * scripts/check-spdx.mjs (which covers the whole tree) so a bundle fails *by name* in the
 * content validator too.
 */
import { finding, type ContentFile, type Finding } from './types.ts';

export const SPDX_RE = /SPDX-License-Identifier:\s*([A-Za-z0-9.+-]+)/;

export function spdxChecks(
  invariant: string,
  files: Iterable<ContentFile>,
  expected: string,
): Finding[] {
  const out: Finding[] = [];
  for (const f of files) {
    if (!/\.(ya?ml|md)$/.test(f.name)) continue;
    const head = f.text.split(/\r?\n/, 3).join('\n');
    const m = SPDX_RE.exec(head);
    if (!m)
      out.push(
        finding(
          invariant,
          'error',
          f.name,
          [],
          `missing SPDX-License-Identifier header in the first three lines (expected ${expected})`,
        ),
      );
    else if (m[1] !== expected)
      out.push(
        finding(invariant, 'error', f.name, [], `SPDX identifier ${m[1]} but ${expected} expected`),
      );
  }
  return out;
}
