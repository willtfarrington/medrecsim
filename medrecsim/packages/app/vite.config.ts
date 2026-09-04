// SPDX-License-Identifier: MIT
import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * Content-Security-Policy delivered with the Pages bundle (THREAT-MODEL.md boundary B7,
 * CLAIMS.md row C7). GitHub Pages cannot set response headers, so the policy ships as a
 * `<meta http-equiv>` tag injected into the production `index.html` only (the dev server injects
 * styles at runtime, which `style-src 'self'` would block). `frame-ancestors` is not honoured in
 * meta form and is therefore omitted. `scripts/check-no-network.mjs` asserts these directives
 * are present in the built HTML.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function cspMeta(): Plugin {
  return {
    name: 'medrecsim:csp-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ],
    },
  };
}

/**
 * Records which npm packages actually end up in the built chunks (`dist/bundle-manifest.json`)
 * so `scripts/gen-third-party.mjs` can mark bundled packages in THIRD-PARTY.md and the
 * runtime allowlist can be audited against reality (DEPENDENCY-POLICY.md §3).
 */
function bundleManifest(): Plugin {
  const PKG_RE =
    /node_modules[\\/](?:\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?((?:@[^\\/]+[\\/])?[^\\/]+)/;
  return {
    name: 'medrecsim:bundle-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      const packages = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const id of output.moduleIds) {
          const m = PKG_RE.exec(id);
          if (m?.[1]) packages.add(m[1].replaceAll('\\', '/'));
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: 'bundle-manifest.json',
        source: JSON.stringify({ bundledPackages: [...packages].sort() }, null, 2) + '\n',
      });
    },
  };
}

export default defineConfig({
  // Relative base: works at https://<owner>.github.io/medrecsim/ and under `vite preview`.
  base: './',
  plugins: [svelte(), cspMeta(), bundleManifest()],
  build: {
    target: 'es2022',
    sourcemap: false,
    reportCompressedSize: false,
    // Evergreen browsers (D-UX-003) support <link rel="modulepreload">; the polyfill is the only
    // code path in a default Vite build that calls fetch(), so it stays off (boundary B7).
    modulePreload: { polyfill: false },
  },
});
