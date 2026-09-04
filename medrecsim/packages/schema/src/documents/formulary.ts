// SPDX-License-Identifier: MIT
/**
 * Formulary package (D-DATA-001, D-DATA-004): `content/formulary/formulary.yaml` is the package
 * manifest; each entry is one file under `content/formulary/entries/`. Real generic names,
 * original descriptions, fictional brand coinages only; pill appearance as text (D-UX-004).
 */
import { z } from 'zod';
import { CitationRefs } from '../common/citation.ts';
import { FormularyId, Kebab, Text } from '../common/ids.ts';
import { ContentVersion, SchemaVersionStamp } from '../common/versions.ts';

export const DOSAGE_FORMS = [
  'tablet',
  'capsule',
  'oral-solution',
  'oral-suspension',
  'injection',
  'pen',
  'inhaler',
  'patch',
  'cream',
  'ointment',
  'drops',
  'suppository',
  'other',
] as const;

export const FormularyManifest = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    id: Kebab.describe('Package id, e.g. medrecsim-formulary'),
    formularyVersion: ContentVersion,
    title: Text,
  })
  .describe('formulary.yaml — package manifest');
export type FormularyManifest = z.infer<typeof FormularyManifest>;

export const FormularyEntry = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    id: FormularyId,
    genericName: Text.describe('Real generic (INN/USAN) name; placeholders say so'),
    class: Text.describe('Pharmacologic class in the project’s own words'),
    forms: z
      .array(
        z.strictObject({
          form: z.enum(DOSAGE_FORMS),
          strengths: z.array(Text).min(1),
          concentrationNote: Text.optional().describe('e.g. U-500 vs U-100 hazard note'),
        }),
      )
      .min(1),
    combinationComponents: z
      .array(z.strictObject({ formularyId: FormularyId, strengthText: Text.optional() }))
      .optional(),
    lasaPartners: z
      .array(FormularyId)
      .default([])
      .describe('Look-alike/sound-alike partners (bidirectional; INV-REF-002 at EP-20)'),
    tallManName: Text.optional().describe('ISMP tall-man lettering, e.g. glipiZIDE'),
    highAlert: z.boolean(),
    timeCritical: z.boolean(),
    narrowTherapeuticIndex: z.boolean(),
    monitoringNotes: z
      .array(z.strictObject({ text: Text, citations: CitationRefs }))
      .default([])
      .describe('Cited monitoring notes; linted by INV-ACT-001'),
    pillAppearanceText: Text.describe(
      'Nonvisual cue: shape, colour, imprint in words (D-UX-004; INV-A11Y-001)',
    ),
    brandNamesFictional: z
      .array(Text)
      .default([])
      .describe('Original coinages only (INV-SCOPE-001 denylist)'),
    citations: CitationRefs.optional().describe('Required (warn at EP-9) when any flag is true'),
    placeholder: z
      .literal(true)
      .optional()
      .describe('Scaffold entry — not reviewed, never shipped'),
  })
  .describe('Formulary entry (one file per entry)');
export type FormularyEntry = z.infer<typeof FormularyEntry>;
export type FormularyEntryInput = z.input<typeof FormularyEntry>;
