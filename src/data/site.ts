/* ===========================================================================
 * PHOENIX RISING — SITE CONTENT
 * ---------------------------------------------------------------------------
 * Every piece of editable copy, navigation and company detail lives in this
 * directory. Components read from here and never hard-code marketing copy.
 *
 * PLACEHOLDER CONVENTION
 * Anything not yet supplied by Phoenix Rising is marked with `placeholder: true`
 * and/or uses obvious `XX` / `[ ... ]` token values. Search the codebase for
 * "placeholder: true" to find everything still awaiting real content.
 * ======================================================================== */

export const company = {
  name: 'Phoenix Rising',
  wordmark: ['PHOENIX', 'RISING'] as const,
  tagline: 'From idea to industry.',
  description:
    'Phoenix Rising connects product thinking, engineering and manufacturing to turn ideas into products built for the markets they are meant to serve.',
  /* Confirmed by the client, 2026-09-15. */
  legalName: 'Phoenix Rising Trading Company, LTD.',
} as const

export const contact = {
  /* PLACEHOLDER — all contact details below await real values. */
  placeholder: true,
  email: 'hello@phoenixrising.example',
  phone: '[+1 (000) 000-0000]',
  offices: [
    { label: 'Studio', lines: ['[Street address]', '[City, Region, Postcode]'] },
    { label: 'Production', lines: ['[Production office address]', '[City, Region]'] },
  ],
  hours: '[Mon–Fri, 09:00–18:00 local]',
} as const

export const social = [
  /* PLACEHOLDER — swap hrefs for real channels, delete rows you do not use. */
  { label: 'LinkedIn', href: '#', placeholder: true },
  { label: 'Instagram', href: '#', placeholder: true },
  { label: 'YouTube', href: '#', placeholder: true },
] as const

export const navigation = [
  { label: 'About', href: '/about' },
  { label: 'Capabilities', href: '/capabilities' },
  { label: 'Process', href: '/process' },
  { label: 'Work', href: '/work' },
  { label: 'Insights', href: '/insights' },
] as const

export const primaryCta = { label: 'Start a project', href: '/contact' } as const

/* Points at the current process route until Phase 2 establishes
   /how-we-develop. The label is already the Round 2 wording so the
   destination can move without the copy changing again. */
export const secondaryCta = { label: 'How we build', href: '/process' } as const

export const footerNav = [
  ...navigation,
  { label: 'Contact', href: '/contact' },
] as const

export const footerMeta = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const

export const hero = {
  index: 'Product development & manufacturing',
  headline: ['From idea', 'to reality.'],
  body: company.description,
  scrollHint: 'Scroll',
} as const

export const statement = {
  eyebrow: 'How we think about products',
  lines: ['A product has to work', 'in two worlds.'],
  body: [
    'It has to make sense to the people who will buy it and live with it — the sector it serves, the problem it solves, the price it has to meet. And it has to make sense to the people who have to build it: at volume, on a schedule, to a standard, thousands of times over.',
    'Most products are developed for one of those worlds and then handed to the other. Phoenix Rising works between them, so the decisions that satisfy a customer and the decisions a factory can actually execute are made together, by the same people, while both are still cheap to change.',
  ],
  /* Oversized background word. Introduces the customer ↔ product ↔ factory
     axis typographically before the section that will carry it fully. */
  driftWord: 'Market and factory',
  /* Technical annotation in the left column — the first explicit statement of
     the axis the whole site is being repositioned around. */
  axisLabel: 'Customer ↔ Product ↔ Factory',
} as const

export const reality = {
  eyebrow: 'Manufacturing reality',
  lines: ['A great prototype means nothing', "if you can't build it 10,000 times."],
  body: 'Phoenix Rising designs products with production in mind from the beginning — helping identify manufacturing risks before they become expensive tooling, quality or delivery problems.',
  /* The four states the macro visual steps through as the section is pinned. */
  stages: [
    { id: 'prototype', label: 'Prototype', note: 'One unit. Proves the idea.' },
    { id: 'component', label: 'Component', note: 'Every part specified, sourced, toleranced.' },
    { id: 'assembly', label: 'Assembly', note: 'A repeatable sequence a line can run.' },
    { id: 'product', label: 'Packaged product', note: 'Ten thousand units. Identical.' },
  ],
} as const

export const finalCta = {
  lines: ['Any stage.', "Let's build it."],
  body: 'Whether you have an idea, a prototype or a product ready for production, the right starting point depends on where your project is today. Tell us where you are.',
  primary: { label: 'Start a project', href: '/contact' },
  secondary: { label: 'Talk to our team', href: '/contact#team' },
} as const

export const whyPhoenix = {
  eyebrow: 'Why Phoenix Rising',
  headline: ['Built between', 'market and factory.'],
  body: 'A product that satisfies its customer but cannot be built is not finished. Neither is one that manufactures perfectly but was never shaped around the people meant to buy it. We work on both sides of that line at once.',
  /* Principles, not capability claims. Nothing here asserts a specific
     technical service — see src/data/claim.ts and the quarantined entries in
     capabilities.ts and process.ts. */
  pillars: [
    {
      id: 'understand-the-customer',
      title: 'Understand the customer',
      body: 'Who the product is for, the sector it serves, the problem it solves and what it has to cost belong in the earliest technical conversations — not as feedback once the design is already fixed.',
    },
    {
      id: 'understand-the-product',
      title: 'Understand the product',
      body: 'An idea becomes buildable when it becomes specific. Requirements, material and process decisions, prototypes and specifications a factory can work from without having to guess what was intended.',
    },
    {
      id: 'understand-the-factory',
      title: 'Understand the factory',
      body: 'Manufacturing brings constraints, questions and decisions of its own. Those belong inside development, where they can still shape the design — not surfacing for the first time once it is finished.',
    },
  ],
} as const

export const seo = {
  titleTemplate: '%s — Phoenix Rising',
  defaultTitle: 'Phoenix Rising — From Idea to Reality',
  description: company.description,
  /* PLACEHOLDER — set the production domain before launch. */
  url: 'https://phoenixrising.example',
  placeholder: true,
} as const
