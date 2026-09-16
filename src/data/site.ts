/* ===========================================================================
 * PHOENIX RIZING — SITE CONTENT
 * ---------------------------------------------------------------------------
 * Every piece of editable copy, navigation and company detail lives in this
 * directory. Components read from here and never hard-code marketing copy.
 *
 * PLACEHOLDER CONVENTION
 * Anything not yet supplied by Phoenix Rizing is marked with `placeholder: true`
 * and/or uses obvious `XX` / `[ ... ]` token values. Search the codebase for
 * "placeholder: true" to find everything still awaiting real content.
 * ======================================================================== */

export const company = {
  name: 'Phoenix Rizing',
  wordmark: ['PHOENIX', 'RIZING'] as const,
  tagline: 'From idea to industry.',
  description:
    'Phoenix Rizing transforms ambitious product ideas into manufacturable, scalable products — from engineering and prototyping through production and delivery.',
  /* PLACEHOLDER — replace with the real registered entity + locations. */
  legalName: '[Phoenix Rizing — legal entity name]',
  placeholder: true,
} as const

export const contact = {
  /* PLACEHOLDER — all contact details below await real values. */
  placeholder: true,
  email: 'hello@phoenixrizing.example',
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
export const secondaryCta = { label: 'Explore our process', href: '/process' } as const

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
  headline: ['From idea', 'to industry.'],
  body: company.description,
  scrollHint: 'Scroll',
} as const

export const statement = {
  eyebrow: 'The gap nobody warns you about',
  lines: ["Great products aren't just designed.", "They're engineered to survive production."],
  body: [
    'A design that works once, in a studio, under ideal conditions, is not a product. A product is a design that survives tooling, tolerance stack-up, supplier variance, a night shift and its ten-thousandth unit.',
    'Phoenix Rizing lives in that gap — between an idea that works and a process that repeats. We engineer for the factory floor from the first sketch, so the expensive discoveries happen on a screen rather than in steel.',
  ],
} as const

export const reality = {
  eyebrow: 'Manufacturing reality',
  lines: ['A great prototype means nothing', "if you can't build it 10,000 times."],
  body: 'Phoenix Rizing designs products with production in mind from the beginning — helping identify manufacturing risks before they become expensive tooling, quality or delivery problems.',
  /* The four states the macro visual steps through as the section is pinned. */
  stages: [
    { id: 'prototype', label: 'Prototype', note: 'One unit. Proves the idea.' },
    { id: 'component', label: 'Component', note: 'Every part specified, sourced, toleranced.' },
    { id: 'assembly', label: 'Assembly', note: 'A repeatable sequence a line can run.' },
    { id: 'product', label: 'Packaged product', note: 'Ten thousand units. Identical.' },
  ],
} as const

export const finalCta = {
  lines: ['Have an idea?', "Let's build it."],
  body: 'Bring us the sketch, prototype, CAD file — or simply the problem you are trying to solve.',
  primary: { label: 'Start a project', href: '/contact' },
  secondary: { label: 'Talk to our team', href: '/contact#team' },
} as const

export const whyPhoenix = {
  eyebrow: 'Why Phoenix Rizing',
  headline: ['Manufacturing', 'without the black box.'],
  body: 'Most founders hand over a file and wait. You get a quote, a delay, and a box of parts you cannot interrogate. We run it the other way: every decision visible, every risk named, every supplier accountable.',
  pillars: [
    {
      id: 'engineering-first',
      title: 'Engineering first',
      body: 'Every commercial conversation is grounded in an engineering answer. We tell you what the part wants to be before we tell you what it costs.',
    },
    {
      id: 'transparent-communication',
      title: 'Transparent communication',
      body: 'Named contacts, shared schedules, and reporting you can read without a translator. You are never guessing what happened this week.',
    },
    {
      id: 'manufacturing-oversight',
      title: 'Manufacturing oversight',
      body: 'We are present where your product is made. Process audits, in-line checks and supplier management are part of the work, not an upsell.',
    },
    {
      id: 'quality-at-every-stage',
      title: 'Quality at every stage',
      body: 'Standards are written down before the first unit is built, then measured against at component, sub-assembly and finished-goods level.',
    },
    {
      id: 'built-for-scale',
      title: 'Built for scale',
      body: 'Decisions are made against your second and third production run, not just your first. Tooling, suppliers and documentation are set up to repeat.',
    },
  ],
} as const

export const seo = {
  titleTemplate: '%s — Phoenix Rizing',
  defaultTitle: 'Phoenix Rizing — From Idea to Industry',
  description: company.description,
  /* PLACEHOLDER — set the production domain before launch. */
  url: 'https://phoenixrizing.example',
  placeholder: true,
} as const
