// SPDX-License-Identifier: MIT
/**
 * Stable JSON serialization: object keys sorted, arrays in order, `undefined` members
 * dropped (as JSON does). Two structurally equal states serialize to the same string on
 * every platform — the basis of the determinism property test and of EP-12's action-log hash.
 */
export function stableStringify(value: unknown): string {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'number':
      return Number.isFinite(value) ? JSON.stringify(value) : 'null';
    case 'boolean':
      return value ? 'true' : 'false';
    case 'undefined':
    case 'function':
    case 'symbol':
    case 'bigint':
      return 'null';
    case 'object':
      break;
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => (v === undefined ? 'null' : stableStringify(v))).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((k) => record[k] !== undefined)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(record[k])}`).join(',')}}`;
}
