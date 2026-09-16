/* ===========================================================================
 * PROOF / NUMBERS
 * ---------------------------------------------------------------------------
 * ⚠️  ALL VALUES BELOW ARE PLACEHOLDERS.
 * No Phoenix Rizing figures have been supplied, so nothing here is a claim.
 * To publish real numbers: set `value` to the number, `suffix` to '+' or '',
 * and flip `placeholder` to false. The counter animates only for real values;
 * placeholders render as static `XX` glyphs so they can never be mistaken for
 * a statistic.
 * ======================================================================== */

export type Stat = {
  id: string
  value: number | null
  suffix: string
  label: string
  note?: string
  placeholder: boolean
}

export const stats: Stat[] = [
  {
    id: 'products',
    value: null,
    suffix: '+',
    label: 'Products developed',
    note: 'Concept through production release',
    placeholder: true,
  },
  {
    id: 'partners',
    value: null,
    suffix: '',
    label: 'Manufacturing partners',
    note: 'Audited and actively managed',
    placeholder: true,
  },
  {
    id: 'experience',
    value: null,
    suffix: '+',
    label: 'Years combined experience',
    note: 'Across engineering and production',
    placeholder: true,
  },
  {
    id: 'markets',
    value: null,
    suffix: '',
    label: 'Markets served',
    note: 'Delivered and supported',
    placeholder: true,
  },
]

export const statsIntro = {
  eyebrow: 'By the numbers',
  headline: 'Measured, not claimed.',
  body: 'These figures are reserved for verified Phoenix Rizing data. They are shown as placeholders until real values are supplied.',
} as const
