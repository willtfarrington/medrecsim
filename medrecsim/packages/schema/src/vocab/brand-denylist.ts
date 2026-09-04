// SPDX-License-Identifier: MIT
/**
 * Real brand-name denylist for INV-SCOPE-001 (partial at EP-9; full check at EP-20).
 * D-DATA-001 / D-UX-001: the formulary carries real generic names and *original* fictional
 * brand coinages only; no real trade name may appear anywhere in content. This seed list holds
 * widely marketed US brand names for the drug classes the v1 roster touches (clinical-model
 * §2). It is a technical guard, not clinical content: extending it is a reversible technical
 * change; it never needs to be complete to be useful.
 *
 * Matching is case-insensitive on whole words.
 */
export const REAL_BRAND_DENYLIST = [
  // anticoagulants / antiplatelets
  'coumadin',
  'jantoven',
  'eliquis',
  'xarelto',
  'pradaxa',
  'savaysa',
  'plavix',
  'brilinta',
  'effient',
  // cardiovascular
  'norvasc',
  'lipitor',
  'crestor',
  'zocor',
  'zetia',
  'lasix',
  'toprol',
  'lopressor',
  'coreg',
  'diovan',
  'cozaar',
  'entresto',
  'microzide',
  // diabetes
  'glucophage',
  'amaryl',
  'glucotrol',
  'januvia',
  'jardiance',
  'farxiga',
  'ozempic',
  'trulicity',
  'humulin',
  'novolin',
  'humalog',
  'novolog',
  'lantus',
  'levemir',
  'tresiba',
  'basaglar',
  // thyroid, GI, analgesics, OTC
  'synthroid',
  'levoxyl',
  'unithroid',
  'prilosec',
  'nexium',
  'protonix',
  'tylenol',
  'advil',
  'motrin',
  'aleve',
  'naprosyn',
  // neurology / psychiatry
  'sinemet',
  'rytary',
  'comtan',
  'stalevo',
  'clozaril',
  'fazaclo',
  'versacloz',
  'lithobid',
  'zoloft',
  'prozac',
  'lexapro',
  'seroquel',
  // opioid-use-disorder therapy, HIV
  'dolophine',
  'methadose',
  'suboxone',
  'subutex',
  'sublocade',
  'biktarvy',
  'genvoya',
  'descovy',
  'truvada',
  'triumeq',
  'dovato',
  // antimicrobials, steroids, misc
  'augmentin',
  'amoxil',
  'bactrim',
  'septra',
  'keflex',
  'zithromax',
  'deltasone',
  'medrol',
  'flovent',
  'ventolin',
  'proair',
  'symbicort',
] as const;

const WORD_BOUNDARY_RE = new RegExp(
  `(?<![a-z0-9])(?:${REAL_BRAND_DENYLIST.map((b) => b.replaceAll('-', '\\-')).join('|')})(?![a-z0-9])`,
  'i',
);

/** Returns the first denylisted brand token found in `text`, or null. */
export function findRealBrandName(text: string): string | null {
  const m = WORD_BOUNDARY_RE.exec(text);
  return m ? m[0].toLowerCase() : null;
}
