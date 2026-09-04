// SPDX-License-Identifier: MIT
/**
 * Asset-hygiene demonstration on generated fixtures (EP-10 acceptance: "demonstrated on a
 * fixture"). The fixtures are built in memory so no binary and no metadata-bearing file is
 * ever committed: a PNG with a tEXt chunk, a JPEG with an Exif APP1 segment, a WebP with an
 * EXIF chunk, and an Inkscape-flavoured SVG.
 */
import { deflateSync, crc32 } from 'node:zlib';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  isPng,
  stripAsset,
  stripJpeg,
  stripPng,
  stripSvgText,
  stripWebp,
} from './asset-hygiene.ts';
import { runAssets } from './commands/assets.ts';
import { resolvePaths } from './workspace.ts';

const u32 = (n: number) =>
  new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const ascii = (s: string) => new TextEncoder().encode(s);
const cat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeAndData = cat(ascii(type), data);
  return cat(u32(data.length), typeAndData, u32(crc32(typeAndData)));
}

/** A valid 1×1 grey PNG carrying a tEXt "Software" chunk and a tIME chunk. */
function dirtyPng(): Uint8Array {
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = pngChunk('IHDR', cat(u32(1), u32(1), new Uint8Array([8, 0, 0, 0, 0])));
  const text = pngChunk(
    'tEXt',
    cat(ascii('Software'), new Uint8Array([0]), ascii('SYNTHETIC editor 1.0')),
  );
  const time = pngChunk('tIME', new Uint8Array([7, 234, 9, 4, 12, 0, 0]));
  const idat = pngChunk('IDAT', new Uint8Array(deflateSync(new Uint8Array([0, 128]))));
  const iend = pngChunk('IEND', new Uint8Array(0));
  return cat(signature, ihdr, text, time, idat, iend);
}

/** Structurally valid JPEG prefix: SOI, APP0 (JFIF), APP1 (Exif), COM, then SOS + EOI. */
function dirtyJpeg(): Uint8Array {
  const seg = (marker: number, payload: Uint8Array) =>
    cat(
      new Uint8Array([0xff, marker, ((payload.length + 2) >> 8) & 255, (payload.length + 2) & 255]),
      payload,
    );
  return cat(
    new Uint8Array([0xff, 0xd8]),
    seg(0xe0, cat(ascii('JFIF'), new Uint8Array([0, 1, 1, 0, 0, 1, 0, 1, 0, 0]))),
    seg(0xe1, cat(ascii('Exif'), new Uint8Array([0, 0]), ascii('SYNTHETIC-EXIF'))),
    seg(0xfe, ascii('SYNTHETIC comment')),
    seg(0xda, new Uint8Array([1, 1, 0, 0, 63, 0])),
    new Uint8Array([0x12, 0x34, 0xff, 0xd9]),
  );
}

function webpChunk(fourcc: string, data: Uint8Array): Uint8Array {
  const size = data.length;
  const header = cat(
    ascii(fourcc),
    new Uint8Array([size & 255, (size >> 8) & 255, (size >> 16) & 255, (size >>> 24) & 255]),
  );
  return cat(header, data, size & 1 ? new Uint8Array([0]) : new Uint8Array(0));
}

/** A RIFF/WEBP container: VP8X with the EXIF flag set, an EXIF chunk, and a stub VP8L chunk. */
function dirtyWebp(): Uint8Array {
  const vp8x = webpChunk('VP8X', new Uint8Array([0x08, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  const exif = webpChunk('EXIF', ascii('SYNTHETIC-EXIF'));
  const vp8l = webpChunk('VP8L', new Uint8Array([0x2f, 0, 0, 0, 0]));
  const body = cat(ascii('WEBP'), vp8x, exif, vp8l);
  const n = body.length;
  return cat(
    ascii('RIFF'),
    new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255]),
    body,
  );
}

const dirtySvg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with SYNTHETIC editor -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" width="10" height="10" inkscape:version="1.3">
  <title>Pill</title>
  <sodipodi:namedview id="namedview1" inkscape:zoom="2" />
  <metadata id="metadata1"><rdf:RDF><cc:Work xmlns:cc="http://creativecommons.org/ns#"/></rdf:RDF></metadata>
  <rect id="r" width="10" height="10" inkscape:label="Rect" data-name="Layer 1" />
</svg>
`;

describe('asset hygiene: pure strippers', () => {
  it('PNG: drops tEXt and tIME, keeps IHDR/IDAT/IEND, stays a valid PNG and is idempotent', () => {
    const r = stripPng(dirtyPng());
    expect(r.removed).toEqual(['PNG tEXt chunk', 'PNG tIME chunk']);
    expect(isPng(r.data)).toBe(true);
    const text = new TextDecoder('latin1').decode(r.data);
    expect(text).not.toContain('SYNTHETIC editor');
    expect(text).toContain('IHDR');
    expect(text).toContain('IDAT');
    expect(text).toContain('IEND');
    expect(stripPng(r.data).removed).toEqual([]);
  });
  it('JPEG: drops APP1 and COM, keeps JFIF APP0 and everything from SOS on', () => {
    const r = stripJpeg(dirtyJpeg());
    expect(r.removed).toEqual(['JPEG APP1 (Exif/XMP) segment', 'JPEG COM segment']);
    const text = new TextDecoder('latin1').decode(r.data);
    expect(text).toContain('JFIF');
    expect(text).not.toContain('SYNTHETIC');
    expect(r.data[r.data.length - 2]).toBe(0xff);
    expect(r.data[r.data.length - 1]).toBe(0xd9);
    expect(stripJpeg(r.data).removed).toEqual([]);
  });
  it('WebP: drops the EXIF chunk, clears the VP8X flag and rewrites the RIFF size', () => {
    const r = stripWebp(dirtyWebp());
    expect(r.removed).toEqual(['WebP EXIF chunk']);
    const text = new TextDecoder('latin1').decode(r.data);
    expect(text).not.toContain('SYNTHETIC');
    expect(text).toContain('VP8L');
    const riffSize = r.data[4]! | (r.data[5]! << 8) | (r.data[6]! << 16) | (r.data[7]! << 24);
    expect(riffSize).toBe(r.data.length - 8);
    const vp8xFlags = r.data[12 + 8]!;
    expect(vp8xFlags & 0x08).toBe(0);
    expect(stripWebp(r.data).removed).toEqual([]);
  });
  it('SVG: drops metadata, comments, editor elements/attributes/xmlns; keeps title, ids, geometry', () => {
    const r = stripSvgText(dirtySvg);
    expect(r.removed.length).toBeGreaterThan(0);
    expect(r.data).not.toMatch(/inkscape|sodipodi|rdf|SYNTHETIC|metadata|data-name/);
    expect(r.data).toContain('<title>Pill</title>');
    expect(r.data).toContain('<rect id="r" width="10" height="10" />');
    expect(r.data).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(stripSvgText(r.data).removed).toEqual([]);
  });
  it('dispatches on content and returns null for unsupported files', () => {
    expect(stripAsset('x.png', dirtyPng())?.removed.length).toBe(2);
    expect(stripAsset('x.svg', new TextEncoder().encode(dirtySvg))?.removed.length).toBeGreaterThan(
      0,
    );
    expect(stripAsset('x.txt', new TextEncoder().encode('hello'))).toBeNull();
  });
});

describe('assets command (check / fix)', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'medrecsim-assets-'));
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));
  const paths = resolvePaths();

  it('--check fails on a dirty fixture directory, --fix cleans it, --check then passes', () => {
    writeFileSync(join(tmp, 'dirty.png'), dirtyPng());
    writeFileSync(join(tmp, 'dirty.jpg'), dirtyJpeg());
    writeFileSync(join(tmp, 'dirty.webp'), dirtyWebp());
    writeFileSync(join(tmp, 'dirty.svg'), dirtySvg);
    writeFileSync(
      join(tmp, 'clean.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"><title>ok</title></svg>',
    );
    const check = runAssets(paths, { fix: false, targets: [tmp], format: 'json' });
    expect(check.ok).toBe(false);
    const report = JSON.parse(check.output) as { files: { file: string; removed: string[] }[] };
    expect(report.files.filter((f) => f.removed.length > 0)).toHaveLength(4);

    const fix = runAssets(paths, { fix: true, targets: [tmp], format: 'json' });
    expect(fix.ok).toBe(true);
    expect(readFileSync(join(tmp, 'dirty.svg'), 'utf8')).not.toContain('inkscape');

    const again = runAssets(paths, { fix: false, targets: [tmp], format: 'json' });
    expect(again.ok, again.output).toBe(true);
  });

  it('the repository’s own asset paths are clean', () => {
    const r = runAssets(paths, { fix: false, targets: [], format: 'json' });
    expect(r.ok, r.output).toBe(true);
  });
});
