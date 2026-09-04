// SPDX-License-Identifier: MIT
import disclaimer from './disclaimer.json' with { type: 'json' };

/** The standing disclaimer, verbatim from docs/CLAIMS.md (see disclaimer.json). */
export const DISCLAIMER: string = disclaimer.text;

/** Short banner line shown beside the disclaimer (D-UX-006). Claim-free wording. */
export const BANNER_LEAD = 'Fictional, synthetic simulation for educational use only.';
