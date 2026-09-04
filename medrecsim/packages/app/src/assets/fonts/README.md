<!-- SPDX-License-Identifier: MIT -->

# Self-hosted fonts (EP-10, spike SP-8)

Two faces, both under the SIL Open Font License 1.1, vendored here so that the application
never loads a font from a third-party origin (D-ARCH-001; the Content-Security-Policy's
`font-src 'self'`). Each directory holds the subset font and the upstream `OFL.txt` verbatim.
Registry rows: `source material/REGISTRY.md` (`FONT-ATKINSON-HYPERLEGIBLE-NEXT`, `FONT-CAVEAT`);
notices: `THIRD-PARTY.md` "Fonts and visual assets". Design rationale and the contrast/size
rules for each face: `docs/design/DESIGN-TOKENS.md`.

| Directory                     | Family                     | Role                                                           | Axis           | Upstream                                                                                                                                        | Version |
| ----------------------------- | -------------------------- | -------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `atkinson-hyperlegible-next/` | Atkinson Hyperlegible Next | document face (`--font-document`)                              | `wght` 200–800 | github.com/googlefonts/atkinson-hyperlegible-next @ `7925f50f649b3813257faf2f4c0b381011f434f1`, via google/fonts `ofl/atkinsonhyperlegiblenext` | 2.001   |
| `caveat/`                     | Caveat                     | handwriting face for authored artifacts (`--font-handwriting`) | `wght` 400–700 | github.com/googlefonts/caveat @ `59745e818ef7973e11e70cb1358d0e902b56c5fc`, via google/fonts `ofl/caveat`                                       | 2.000   |

## Provenance and the subset step

Fetched 2026-09-04 from `https://raw.githubusercontent.com/google/fonts/main/ofl/<family>/`
(the variable TTF, `OFL.txt`, `METADATA.pb`, `upstream_info.md`). Upstream SHA-256 of the
variable TTFs as fetched:

- `AtkinsonHyperlegibleNext[wght].ttf` — `5a455d1cfa099b601ab70751bb9673e8fe1854dc4500c80e1a220d0d75e31745` (114,552 bytes)
- `Caveat[wght].ttf` — `0bdb6b660482d31531b3945849fba5916b3ef8695da7024a9e6b9ee3c4157988` (403,648 bytes)

The files shipped here are **Modified Versions** in OFL terms: subset to the Latin range and
converted to WOFF2 with fontTools 4.64.0 (`pyftsubset`, Brotli 1.2.0), keeping every OpenType
layout feature and every `name` record (copyright, licence description and URL stay inside
the font):

```
pyftsubset "<Family>[wght].ttf" \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" \
  --flavor=woff2 --layout-features='*' --name-IDs='*' --name-legacy --name-languages='*' \
  --output-file=<family>-latin-wght.woff2
```

Neither upstream `OFL.txt` declares a Reserved Font Name, so the family names are kept. The
subsetting tool is a one-off local step (a Python virtual environment outside the repository),
not a project dependency; re-running the command above on the same upstream files reproduces
the same glyph set.

| Shipped file                                                             |  Bytes | SHA-256                                                            |
| ------------------------------------------------------------------------ | -----: | ------------------------------------------------------------------ |
| `atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght.woff2` | 34,080 | `48da16605c3774f487ac2f8d844d800358f7133f5abf25fed27acb076097d5d6` |
| `caveat/caveat-latin-wght.woff2`                                         | 77,480 | `ced8096c0bf4ee63533241c70453f4f07009293405a3b4f2566a33c12bfe701f` |

Fonts are not JavaScript and do not count against the initial-JS budget (D-ARCH-007); the
document face is requested on first paint, the handwriting face only when an artifact uses it.
Italic and non-Latin subsets are not shipped; adding one is a new row here, in the registry,
and in the notices.
