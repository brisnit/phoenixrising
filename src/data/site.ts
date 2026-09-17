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

export type NavLink = { label: string; href: string }

export const navigation: readonly NavLink[] = [
  { label: 'How we develop products', href: '/how-we-develop' },
  { label: 'Capabilities', href: '/capabilities' },
  { label: 'Ideation workspace', href: '/ideate' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
]

/**
 * The two entry points are deliberately distinct.
 *
 * `primaryCta` is the structured project journey — Phase 3 turns /start into
 * the stage selector. `/contact` stays as the direct, manual path for anyone
 * who would rather just write to a person, and must never be redirected into
 * the structured flow.
 */
export const primaryCta = { label: 'Start a project', href: '/start' } as const
export const secondaryCta = { label: 'How we build', href: '/how-we-develop' } as const
export const directContact = { label: 'Contact', href: '/contact' } as const

/**
 * Reserved for Phase 8. The trigger is deliberately NOT rendered anywhere yet
 * — exposing it before the experience exists would promise a conversational
 * search that does not answer. The shape is settled so the header and mobile
 * menu can adopt it without rework.
 */
export const askPhoenix = {
  label: 'Ask Phoenix',
  hint: 'Ask us anything about developing, prototyping or manufacturing your product.',
  shortcut: '⌘K',
  /* Enabled in Phase 9, after DeepSeek was connected and the real evaluation
     run and read. This gates RENDERING only — the endpoint independently
     answers 503 when no provider is configured, so a deployment without the
     credential degrades to a truthful "not connected" state rather than a
     broken panel. */
  enabled: true,
} as const

/**
 * The footer carries more of the site than the header does: everything the
 * primary navigation deliberately leaves out still needs a route in.
 */
export const footerGroups: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'How we develop products', href: '/how-we-develop' },
      { label: 'Capabilities', href: '/capabilities' },
      { label: 'Projects', href: '/projects' },
      { label: 'Insights', href: '/insights' },
    ],
  },
  {
    title: 'Start',
    links: [
      { label: 'Start a project', href: '/start' },
      { label: 'Ideation workspace', href: '/ideate' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Onboarding', href: '/onboarding' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export const footerMeta: readonly NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

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
  /* `Start a project` is the structured journey and must point at /start.
     It pointed at /contact on ~20 routes until Phase 6 — a Round 1 leftover
     that survived the Phase 2 navigation split and quietly contradicted it.
     `tests/unit/navigation.test.ts` now fails if the pairing drifts again.

     The secondary is a genuine contact action and stays on /contact#team;
     that anchor exists on the contact page. */
  primary: { label: 'Start a project', href: '/start' },
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
