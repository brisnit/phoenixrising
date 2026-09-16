/* ===========================================================================
 * FEATURED WORK
 * ---------------------------------------------------------------------------
 * ⚠️  EVERY PROJECT BELOW IS A STRUCTURAL PLACEHOLDER.
 * These are illustrative product *categories* with generic engineering
 * narratives — they are NOT Phoenix Rising case studies, and they contain no
 * invented clients, revenue, backer counts, awards or launch figures.
 *
 * To publish a real case study: replace the copy, set `placeholder: false`,
 * and add real imagery via the `image` field on each gallery slot.
 * ======================================================================== */

import type { PlateVariant } from '@/components/media/plates'

export type Project = {
  slug: string
  name: string
  category: string
  year: string
  /* One-line hook used on the index rail. */
  excerpt: string
  challenge: string
  solution: string
  result: string
  services: string[]
  /* Coded compositions stand in for photography until assets are supplied. */
  gallery: { plate: PlateVariant; caption: string; image?: string }[]
  plate: PlateVariant
  placeholder: boolean
}

export const workIntro = {
  eyebrow: 'Selected work',
  lines: ['Ideas,', 'made real.'],
  body: 'Programmes shown as placeholders until client approval is in place. Each follows the same structure: the constraint, the engineering decision, the outcome.',
} as const

export const projects: Project[] = [
  {
    slug: 'consumer-enclosure-programme',
    name: '[Project One]',
    category: 'Consumer electronics',
    year: '[20XX]',
    excerpt: 'A sealed handheld enclosure taken from concept to tooled production.',
    challenge:
      '[PLACEHOLDER] A sealed consumer enclosure needed to hold an ingress rating while remaining serviceable, slim and economical to mould — three requirements that pull against each other. The incoming concept resolved none of them.',
    solution:
      '[PLACEHOLDER] The split line was relocated to move sealing off the visible surface, wall sections were rebalanced for consistent cooling, and the gasket moved to a compression profile that survives repeated opening. Tolerance stack-up across the mating halves was closed before tooling.',
    result:
      '[PLACEHOLDER — replace with a verified outcome. Do not publish performance, sales or funding figures unless they can be substantiated.]',
    services: ['Design for manufacturability', 'Prototyping + tooling', 'Production'],
    gallery: [
      { plate: 'caliper', caption: '[Placeholder — CAD / tolerance study]' },
      { plate: 'mold', caption: '[Placeholder — tooling detail]' },
      { plate: 'grid', caption: '[Placeholder — finished assembly]' },
    ],
    plate: 'caliper',
    placeholder: true,
  },
  {
    slug: 'precision-hardware-programme',
    name: '[Project Two]',
    category: 'Precision hardware',
    year: '[20XX]',
    excerpt: 'A machined mechanism re-engineered for volume without losing feel.',
    challenge:
      '[PLACEHOLDER] A mechanism validated as a fully machined prototype could not be produced at the required volume or cost. Converting it to moulded and formed parts risked losing the tactile quality that defined the product.',
    solution:
      '[PLACEHOLDER] Load paths were isolated so only two components remained machined, with the rest converted to moulded assemblies. Detent geometry and damping were re-tuned against the new materials and verified against a physical benchmark at each iteration.',
    result:
      '[PLACEHOLDER — replace with a verified outcome.]',
    services: ['Design for manufacturability', 'Prototyping + tooling', 'Quality + delivery'],
    gallery: [
      { plate: 'lattice', caption: '[Placeholder — mechanism study]' },
      { plate: 'wave', caption: '[Placeholder — surface and finish]' },
      { plate: 'caliper', caption: '[Placeholder — inspection]' },
    ],
    plate: 'lattice',
    placeholder: true,
  },
  {
    slug: 'housewares-programme',
    name: '[Project Three]',
    category: 'Housewares',
    year: '[20XX]',
    excerpt: 'A high-volume moulded product costed down without visible compromise.',
    challenge:
      '[PLACEHOLDER] Unit economics did not support the intended retail price. The design carried cost in places the customer would never perceive — cavitation, cycle time and an over-specified finish.',
    solution:
      '[PLACEHOLDER] Tooling was re-specified for higher cavitation, wall sections were thinned where structurally permissible to reduce cycle time, and the finish specification was tightened only on surfaces a user touches or sees.',
    result:
      '[PLACEHOLDER — replace with a verified outcome.]',
    services: ['Design for manufacturability', 'Production', 'Quality + delivery'],
    gallery: [
      { plate: 'mold', caption: '[Placeholder — cavitation layout]' },
      { plate: 'burst', caption: '[Placeholder — material study]' },
      { plate: 'grid', caption: '[Placeholder — packed goods]' },
    ],
    plate: 'mold',
    placeholder: true,
  },
  {
    slug: 'outdoor-equipment-programme',
    name: '[Project Four]',
    category: 'Outdoor equipment',
    year: '[20XX]',
    excerpt: 'A load-bearing assembly validated against real-world abuse.',
    challenge:
      '[PLACEHOLDER] A load-bearing assembly passed bench testing but failed in field conditions, where combined loading, temperature and grit behaved nothing like the lab.',
    solution:
      '[PLACEHOLDER] Failure modes were reproduced on a purpose-built rig, the load path was redistributed through a revised bracket, and material was changed to a grade with better cold-temperature toughness. Validation criteria were rewritten to reflect field conditions.',
    result:
      '[PLACEHOLDER — replace with a verified outcome.]',
    services: ['Design for manufacturability', 'Prototyping + tooling', 'Production', 'Quality + delivery'],
    gallery: [
      { plate: 'wave', caption: '[Placeholder — load analysis]' },
      { plate: 'lattice', caption: '[Placeholder — revised assembly]' },
      { plate: 'route', caption: '[Placeholder — field validation]' },
    ],
    plate: 'wave',
    placeholder: true,
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
