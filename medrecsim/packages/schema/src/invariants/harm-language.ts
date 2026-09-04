// SPDX-License-Identifier: MIT
/**
 * Harm-language lint (D-SCOR-003; part of INV-ACT-001). Three rules over reference-layer
 * teaching text and formulary monitoring notes:
 *
 * 1. Probability-token denylist — no invented probabilities or statistics.
 * 2. Numbers require a citation reference on the carrying entry (CITATION-POLICY.md §1, §2e).
 * 3. Inevitability wording ("will cause", "always") is rejected unless the entry sets
 *    `inevitabilityAuthored: true` (only mechanism-of-harm text has that flag).
 *
 * The token lists are technical guards, editable as a reversible technical change; the owner
 * reviews wording at the clinical self-review checklist §9 regardless.
 */

export const PROBABILITY_TOKEN_RE =
  /%|\bpercent(?:age)?\b|\bprobab\w*|\blikel(?:y|ihood)\b|\bunlikely\b|\bchances?\b|\bodds\b|\b(?:\d+(?:\.\d+)?|two|three|four|five|six|seven|eight|nine|ten|several|many)[- ]?fold\b|\btimes (?:more|less|higher|lower)\b|\b(?:one|1) in (?:\d+|two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|hundred|thousand)\b|\brelative risk\b|\babsolute risk\b|\bnumber needed\b|\bincidence\b|\bprevalence\b/i;

export const INEVITABILITY_TOKEN_RE =
  /\bwill (?:cause|lead|result|produce|precipitate|kill|harm)\b|\balways\b|\binevitabl\w*|\bcertain(?:ly)? to\b|\binvariably\b|\bguaranteed\b|\bnever fails\b/i;

/** Tokens that contain digits but are not numeric claims (ids, ordinals, the T0 anchor). */
const NON_NUMERIC_DIGIT_TOKENS_RE =
  /\bcit-[a-z0-9-]+-\d{4}\b|\b[US]\d\b|\bP\d{1,2}\b|\bT0(?:[+-]\d+(?:mo|y|w|d|h|m))*\b/g;

export interface HarmLanguageReport {
  probabilityToken: string | null;
  inevitabilityToken: string | null;
  hasNumber: boolean;
}

export function lintHarmLanguage(text: string): HarmLanguageReport {
  const prob = PROBABILITY_TOKEN_RE.exec(text);
  const inev = INEVITABILITY_TOKEN_RE.exec(text);
  const stripped = text.replace(NON_NUMERIC_DIGIT_TOKENS_RE, '');
  return {
    probabilityToken: prob ? prob[0] : null,
    inevitabilityToken: inev ? inev[0] : null,
    hasNumber: /\d/.test(stripped),
  };
}
