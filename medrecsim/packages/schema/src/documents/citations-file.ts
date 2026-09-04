// SPDX-License-Identifier: MIT
/** `citations.yaml` — the bundle-level store of citation records (CITATION-POLICY.md §4). */
import { z } from 'zod';
import { CitationRecord } from '../common/citation.ts';
import { Kebab } from '../common/ids.ts';
import { SchemaVersionStamp } from '../common/versions.ts';

export const CitationsDocument = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    bundleId: Kebab.describe('case.yaml id or formulary package id'),
    citations: z.array(CitationRecord),
  })
  .describe('citations.yaml — citation records for one bundle');
export type CitationsDocument = z.infer<typeof CitationsDocument>;
