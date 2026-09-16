/* ===========================================================================
 * TESTIMONIALS
 * ---------------------------------------------------------------------------
 * ⚠️  PLACEHOLDERS ONLY. No Phoenix Rizing client has supplied a quote.
 * The copy below describes the *kind* of statement this component expects and
 * is written so it cannot be mistaken for a real endorsement. Replace the
 * quote, name, role and company, then set `placeholder: false`.
 * ======================================================================== */

export type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  company: string
  plate: 'burst' | 'wave' | 'grid'
  placeholder: boolean
}

export const testimonialsIntro = {
  eyebrow: 'Client perspective',
  headline: 'In their words.',
  note: 'Awaiting approved client quotes — placeholders shown.',
} as const

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      '[Placeholder quote — a client describing what changed once engineering and manufacturing were handled by the same team.]',
    name: '[Client name]',
    role: '[Role]',
    company: '[Company]',
    plate: 'burst',
    placeholder: true,
  },
  {
    id: 't2',
    quote:
      '[Placeholder quote — a client describing a manufacturing risk that was identified before it became a tooling or delivery problem.]',
    name: '[Client name]',
    role: '[Role]',
    company: '[Company]',
    plate: 'wave',
    placeholder: true,
  },
  {
    id: 't3',
    quote:
      '[Placeholder quote — a client describing the experience of visibility and communication across a production run.]',
    name: '[Client name]',
    role: '[Role]',
    company: '[Company]',
    plate: 'grid',
    placeholder: true,
  },
]
