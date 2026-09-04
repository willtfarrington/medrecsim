// SPDX-License-Identifier: MIT
// No-network invariant (THREAT-MODEL.md boundary B7; CLAIMS.md row C7). Static check over the
// built bundle: (1) the production index.html carries the same-origin CSP meta tag with the
// required directives; (2) no built JS/CSS/HTML contains a network-capable API call or an
// off-origin URL outside a small documented allow-list. Runtime verification (Playwright network
// interception) is EP-15/EP-19's job; this check fails the build early.
// Usage: node scripts/check-no-network.mjs [dist-dir]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const dist = resolve(process.argv[2] ?? join(import.meta.dirname, '../packages/app/dist'));

const REQUIRED_DIRECTIVES = [
  "default-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "base-uri 'self'",
];

// Network-capable APIs that must not appear in the shipped code.
const FORBIDDEN_APIS = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bsendBeacon\b/,
  /\bEventSource\b/,
  /\bRTCPeerConnection\b/,
  /\bimportScripts\s*\(/,
  /\bnavigator\.serviceWorker\b/,
];

// Off-origin URLs are forbidden except these documented, non-fetched string constants.
const URL_ALLOWLIST = [
  /^https?:\/\/www\.w3\.org\//, // XML namespaces (SVG, XHTML)
  /^https:\/\/svelte\.dev\//, // Svelte runtime error-message links (text only)
  /^https:\/\/github\.com\/willtfarrington\/medrecsim/, // repository link in the footer
  /^https:\/\/creativecommons\.org\//, // licence links (text only)
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const failures = [];
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const cspMatch = /<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/i.exec(html);
// Vite HTML-escapes attribute values (' → &#39;); browsers decode them, so decode before comparing.
const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
if (!cspMatch) {
  failures.push('index.html: Content-Security-Policy meta tag missing');
} else {
  const csp = decodeEntities(cspMatch[1]);
  for (const d of REQUIRED_DIRECTIVES) {
    if (!csp.includes(d)) failures.push(`index.html: CSP lacks directive "${d}"`);
  }
}
if (/<form\b/i.test(html))
  failures.push('index.html: <form> element present (form-action is none)');

for (const file of walk(dist)) {
  if (!/\.(js|mjs|css|html)$/.test(file)) continue;
  const rel = relative(dist, file).replaceAll('\\', '/');
  const text = readFileSync(file, 'utf8');
  for (const re of FORBIDDEN_APIS) {
    if (re.test(text)) failures.push(`${rel}: forbidden network API ${re}`);
  }
  for (const m of text.matchAll(/\bhttps?:\/\/[^\s"'`)<>]+/g)) {
    const url = m[0];
    if (!URL_ALLOWLIST.some((re) => re.test(url))) failures.push(`${rel}: off-origin URL ${url}`);
  }
  if (/\.(js|mjs)$/.test(file) && /\bimport\s*\(\s*["'`]https?:/.test(text)) {
    failures.push(`${rel}: dynamic import from an off-origin URL`);
  }
}

if (failures.length > 0) {
  console.error('No-network invariant FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(
  `No-network invariant PASS: CSP present with ${REQUIRED_DIRECTIVES.length} required directives; no network APIs or off-origin URLs in ${relative(process.cwd(), dist) || '.'}.`,
);
