// SPDX-License-Identifier: MIT
/**
 * Visibly fictional identifier conventions (EP-10; ux-accessibility appendix §10;
 * docs/ORIGINALITY-CHECKLIST.md §4). Layer-neutral: plain constants and pure functions, no Zod.
 *
 * - Phone / fax numbers are always in the reserved fictional range `555-01XX`.
 * - NPI-like numbers start with `0` (never issued) *and* fail the NPI check digit.
 * - Postal codes use the pattern `000NN` (no such ZIP codes exist).
 * - Chart identifiers are `SYN-<digits>` (evidence/patient.ts).
 * - Barcodes, when rendered, encode a payload that begins with the literal word `SYNTHETIC`.
 */

/** A phone or fax number as authored: exactly `555-01` followed by two digits. */
export const FICTIONAL_PHONE_RE = /^555-01\d{2}$/;

/** A synthetic NPI: ten digits, first digit 0 (real NPIs begin with 1 or 2). */
export const SYNTHETIC_NPI_RE = /^0\d{9}$/;

/** A synthetic postal code: `000` plus two digits. */
export const SYNTHETIC_POSTAL_CODE_RE = /^000\d{2}$/;

/** Prefix every rendered barcode payload must carry. */
export const BARCODE_PAYLOAD_PREFIX = 'SYNTHETIC';

/**
 * NPI check-digit test (Luhn over the constant prefix 80840 plus the first nine digits).
 * Returns true when the tenth digit is the valid check digit — i.e. when the number could be
 * mistaken for a real NPI. Synthetic NPIs must return false.
 */
export function npiCheckDigitValid(npi: string): boolean {
  if (!/^\d{10}$/.test(npi)) return false;
  const digits = `80840${npi.slice(0, 9)}`;
  let sum = 0;
  let double = true;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(npi[9]);
}

/** True when a ten-digit NPI is visibly synthetic: leading 0 and an invalid check digit. */
export function isSyntheticNpi(npi: string): boolean {
  return SYNTHETIC_NPI_RE.test(npi) && !npiCheckDigitValid(npi);
}

/** True when a phone number as written is in the fictional `555-01XX` range. */
export function isFictionalPhone(phone: string): boolean {
  return FICTIONAL_PHONE_RE.test(phone);
}

export interface IdentifierHit {
  kind: 'phone' | 'npi';
  value: string;
}

// Ten-digit US phone forms inside prose: (555) 555-0100 · 555-555-0100 · 555.555.0100.
const PHONE_IN_TEXT_RE = /(?:\(\d{3}\)\s?|\b\d{3}[-.\s])\d{3}[-.\s]\d{4}\b/g;
// An NPI label followed by ten digits.
const NPI_IN_TEXT_RE = /\bNPI\b[^0-9\n]{0,12}(\d{10})\b/g;

/**
 * Scans free text for identifiers that could pass as real: any ten-digit phone number whose
 * last seven digits are not `555-01XX`, and any NPI-labelled ten-digit number that is not
 * visibly synthetic. Seven-digit numbers are not scanned (too many dose and quantity
 * false positives); authors write phone numbers in the ten-digit form only when a fictional
 * area code is needed, and the local part must still be `555-01XX`.
 */
export function findRealLookingIdentifiers(text: string): IdentifierHit[] {
  const hits: IdentifierHit[] = [];
  for (const m of text.matchAll(PHONE_IN_TEXT_RE)) {
    const digits = m[0].replace(/\D/g, '');
    const local = digits.slice(-7);
    if (!/^55501\d{2}$/.test(local)) hits.push({ kind: 'phone', value: m[0] });
  }
  for (const m of text.matchAll(NPI_IN_TEXT_RE)) {
    const npi = m[1] as string;
    if (!isSyntheticNpi(npi)) hits.push({ kind: 'npi', value: npi });
  }
  return hits;
}
