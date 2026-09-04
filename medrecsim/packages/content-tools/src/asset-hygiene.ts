// SPDX-License-Identifier: MIT
/**
 * Asset hygiene (EP-10 item 7; D-UX-006; ORIGINALITY-CHECKLIST.md §6): strip camera/editor
 * metadata from raster images and editor namespaces from SVGs before they enter the tree.
 * Pure byte/string transforms live here (tested directly); the CLI command and the scripts
 * wrapper do the I/O.
 *
 *   PNG  — drops tEXt, zTXt, iTXt, eXIf, tIME chunks (authoring software, timestamps, EXIF).
 *   JPEG — drops APP1 (Exif / XMP), APP13 (Photoshop IPTC) and COM segments before SOS.
 *   WebP — drops EXIF and XMP chunks and clears the VP8X EXIF/XMP flag bits.
 *   SVG  — drops <metadata>, XML comments, editor-namespaced elements and attributes
 *          (inkscape, sodipodi, dc, cc, rdf, Adobe's i/x/graph, sketch, figma, serif, vectornator)
 *          and their xmlns declarations. Titles, descriptions and ids are kept (accessibility).
 *
 * Pixel data, colour profiles (iCCP / APP2 / ICCP) and JFIF/Adobe colour markers are never
 * touched: this changes nothing a viewer can see.
 */

export interface StripOutcome {
  /** New file content; equals the input when nothing was removed. */
  data: Uint8Array;
  /** Human-readable names of what was removed, in order. */
  removed: string[];
}

export const ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'] as const;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PNG_DROP = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME']);

function readU32(b: Uint8Array, at: number): number {
  return ((b[at]! << 24) | (b[at + 1]! << 16) | (b[at + 2]! << 8) | b[at + 3]!) >>> 0;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

export function isPng(b: Uint8Array): boolean {
  return b.length >= 8 && PNG_SIGNATURE.every((v, i) => b[i] === v);
}

export function stripPng(b: Uint8Array): StripOutcome {
  if (!isPng(b)) throw new Error('not a PNG');
  const parts: Uint8Array[] = [b.subarray(0, 8)];
  const removed: string[] = [];
  let at = 8;
  while (at + 8 <= b.length) {
    const len = readU32(b, at);
    const type = String.fromCharCode(b[at + 4]!, b[at + 5]!, b[at + 6]!, b[at + 7]!);
    const end = at + 12 + len;
    if (end > b.length) throw new Error(`truncated PNG chunk ${type}`);
    if (PNG_DROP.has(type)) removed.push(`PNG ${type} chunk`);
    else parts.push(b.subarray(at, end));
    at = end;
    if (type === 'IEND') break;
  }
  if (at < b.length) parts.push(b.subarray(at)); // trailing bytes, preserved verbatim
  return { data: removed.length ? concat(parts) : b, removed };
}

export function isJpeg(b: Uint8Array): boolean {
  return b.length >= 4 && b[0] === 0xff && b[1] === 0xd8;
}

const JPEG_DROP = new Map<number, string>([
  [0xe1, 'APP1 (Exif/XMP)'],
  [0xed, 'APP13 (IPTC)'],
  [0xfe, 'COM'],
]);

export function stripJpeg(b: Uint8Array): StripOutcome {
  if (!isJpeg(b)) throw new Error('not a JPEG');
  const parts: Uint8Array[] = [b.subarray(0, 2)];
  const removed: string[] = [];
  let at = 2;
  while (at + 4 <= b.length && b[at] === 0xff) {
    const marker = b[at + 1]!;
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      parts.push(b.subarray(at, at + 2)); // standalone markers
      at += 2;
      continue;
    }
    const len = (b[at + 2]! << 8) | b[at + 3]!;
    const end = at + 2 + len;
    if (end > b.length) throw new Error('truncated JPEG segment');
    if (marker === 0xda) {
      // Start of scan: entropy-coded data follows; copy the rest verbatim.
      parts.push(b.subarray(at));
      at = b.length;
      break;
    }
    const drop = JPEG_DROP.get(marker);
    if (drop) removed.push(`JPEG ${drop} segment`);
    else parts.push(b.subarray(at, end));
    at = end;
  }
  if (at < b.length) parts.push(b.subarray(at));
  return { data: removed.length ? concat(parts) : b, removed };
}

export function isWebp(b: Uint8Array): boolean {
  return (
    b.length >= 12 &&
    String.fromCharCode(...b.subarray(0, 4)) === 'RIFF' &&
    String.fromCharCode(...b.subarray(8, 12)) === 'WEBP'
  );
}

const WEBP_DROP = new Set(['EXIF', 'XMP ']);

export function stripWebp(b: Uint8Array): StripOutcome {
  if (!isWebp(b)) throw new Error('not a WebP');
  const removed: string[] = [];
  const chunks: Uint8Array[] = [];
  let at = 12;
  while (at + 8 <= b.length) {
    const fourcc = String.fromCharCode(...b.subarray(at, at + 4));
    const size = (b[at + 4]! | (b[at + 5]! << 8) | (b[at + 6]! << 16) | (b[at + 7]! << 24)) >>> 0;
    const padded = size + (size & 1);
    const end = Math.min(at + 8 + padded, b.length);
    if (WEBP_DROP.has(fourcc)) removed.push(`WebP ${fourcc.trim()} chunk`);
    else chunks.push(new Uint8Array(b.subarray(at, end)));
    at = end;
  }
  if (removed.length === 0) return { data: b, removed };
  for (const c of chunks) {
    if (String.fromCharCode(...c.subarray(0, 4)) === 'VP8X') {
      c[8] = c[8]! & ~(0x08 | 0x04); // clear EXIF and XMP flag bits
    }
  }
  const body = concat(chunks);
  const header = new Uint8Array(12);
  header.set(b.subarray(0, 4));
  const riffSize = 4 + body.length;
  header[4] = riffSize & 0xff;
  header[5] = (riffSize >>> 8) & 0xff;
  header[6] = (riffSize >>> 16) & 0xff;
  header[7] = (riffSize >>> 24) & 0xff;
  header.set(b.subarray(8, 12), 8);
  return { data: concat([header, body]), removed };
}

/** Namespace prefixes that identify editor-private markup. */
export const SVG_EDITOR_PREFIXES = [
  'inkscape',
  'sodipodi',
  'dc',
  'cc',
  'rdf',
  'i', // Adobe Illustrator (i:pgf)
  'x', // Adobe XMP
  'graph', // Adobe
  'sketch',
  'figma',
  'serif', // Affinity
  'vectornator',
  'adobe',
] as const;

export function stripSvgText(text: string): { data: string; removed: string[] } {
  const removed: string[] = [];
  let out = text;
  const drop = (re: RegExp, label: string) => {
    const before = out;
    out = out.replace(re, '');
    if (out !== before) removed.push(label);
  };
  drop(/<metadata\b[^>]*>[\s\S]*?<\/metadata\s*>/gi, 'SVG <metadata>');
  drop(/<metadata\b[^>]*\/>/gi, 'SVG <metadata/>');
  drop(/<!--[\s\S]*?-->/g, 'SVG XML comment');
  const prefixes = SVG_EDITOR_PREFIXES.join('|');
  drop(
    new RegExp(
      `<(?:${prefixes}):[a-zA-Z0-9_.-]+\\b[^>]*>[\\s\\S]*?<\\/(?:${prefixes}):[a-zA-Z0-9_.-]+\\s*>`,
      'g',
    ),
    'SVG editor-namespaced element',
  );
  drop(
    new RegExp(`<(?:${prefixes}):[a-zA-Z0-9_.-]+\\b[^>]*/>`, 'g'),
    'SVG editor-namespaced element',
  );
  drop(
    new RegExp(`\\s+xmlns:(?:${prefixes})\\s*=\\s*"[^"]*"`, 'g'),
    'SVG editor xmlns declaration',
  );
  drop(
    new RegExp(`\\s+xmlns:(?:${prefixes})\\s*=\\s*'[^']*'`, 'g'),
    'SVG editor xmlns declaration',
  );
  drop(
    new RegExp(`\\s+(?:${prefixes}):[a-zA-Z0-9_.-]+\\s*=\\s*"[^"]*"`, 'g'),
    'SVG editor attribute',
  );
  drop(
    new RegExp(`\\s+(?:${prefixes}):[a-zA-Z0-9_.-]+\\s*=\\s*'[^']*'`, 'g'),
    'SVG editor attribute',
  );
  drop(/\s+data-name\s*=\s*"[^"]*"/g, 'SVG data-name attribute (Illustrator)');
  drop(/<\?xpacket[\s\S]*?\?>/g, 'SVG XMP packet');
  return { data: out, removed };
}

/** Dispatch on content, not extension; returns null for an unsupported file. */
export function stripAsset(name: string, bytes: Uint8Array): StripOutcome | null {
  const lower = name.toLowerCase();
  if (isPng(bytes)) return stripPng(bytes);
  if (isJpeg(bytes)) return stripJpeg(bytes);
  if (isWebp(bytes)) return stripWebp(bytes);
  if (lower.endsWith('.svg')) {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const r = stripSvgText(text);
    return {
      data: r.removed.length ? new TextEncoder().encode(r.data) : bytes,
      removed: r.removed,
    };
  }
  return null;
}
