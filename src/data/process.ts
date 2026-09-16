/* ===========================================================================
 * DEVELOPMENT PROCESS — five stages
 * ---------------------------------------------------------------------------
 * How Phoenix Rising takes a product from an idea toward repeatable
 * manufacturing. Drives /how-we-develop and the compressed homepage preview.
 *
 * ON "OUTPUT": each stage names the conceptual result of that work — what the
 * project has become by the end of it — not a contractual deliverable. No
 * engagement is promised a specific document here; scope is agreed per
 * project. The `outputNote` says so on the page rather than only in this file.
 *
 * ON CLAIM INTEGRITY: this copy describes what the *work* involves at a
 * strategic level. It deliberately does not assert that Phoenix Rising
 * personally performs mould-flow simulation, formal tolerance stack-up
 * analysis, electronics or PCB design, firmware, tooling manufacture,
 * in-person supplier audits, in-line factory inspection or certification —
 * all of which remain unverified (see capabilities.ts). Where a manufacturing
 * concept matters to the story, it is explained as a concept, not claimed as
 * a service.
 * ======================================================================== */

import type { PlateVariant } from '@/components/media/plates'

export type ProcessStage = {
  index: string
  id: string
  title: string
  /** Editorial line for the stage. */
  headline: readonly string[]
  summary: string
  body: string
  /** What the work covers. Strategic level — not a service list. */
  covers: string[]
  /** The conceptual state the project reaches. Not a guaranteed artefact. */
  output: string
  /** Optional route into the matching Phase 3 journey. Used sparingly. */
  cta?: { label: string; href: string }
  plate: PlateVariant
}

export const processIntro = {
  eyebrow: 'How we develop products',
  lines: ['One product.', 'One continuous path.'],
  body: 'Design, engineering, prototyping, manufacturing and quality are not separate services handed between separate companies. They are one sequence of decisions, and the early ones determine what the later ones are allowed to be.',
  /* Stated once, up front, so the stage sequence cannot read as a fixed pipeline. */
  note: 'Projects join this at different points and rarely run it identically. What a given product needs depends on what already exists and where it is going.',
} as const

export const outputNote =
  'Each stage names what the project has become by the end of it — the conceptual result, not a fixed list of documents. What is actually produced is agreed per project.'

export const processStages: ProcessStage[] = [
  {
    index: '01',
    id: 'ideation-definition',
    title: 'Ideation + definition',
    headline: ['Start with', 'the problem.'],
    summary: 'Define what actually needs to exist before deciding how to build it.',
    body: 'The first question is not how something will be manufactured. It is what the product has to be — for whom, against what problem, at what cost, under what constraints. A product defined only as a shape is a product that will be redefined later, expensively.',
    covers: [
      'What is being created, and what it has to do',
      'Who it is for, and the sector it serves',
      'The problem it solves and how it will be used',
      'Desired features and what matters most among them',
      'Commercial objectives and known constraints',
      'What already exists and how far it has been taken',
    ],
    output: 'Development brief',
    cta: { label: 'Explore your idea', href: '/ideate' },
    plate: 'burst',
  },
  {
    index: '02',
    id: 'engineering-rd',
    title: 'Engineering + R&D',
    headline: ['Turn the idea into', 'questions we can answer.'],
    summary: 'Convert intent into technical direction, and name what is still unknown.',
    body: 'An idea becomes a project when its uncertainties are written down. This stage is about establishing what the product requires technically, what remains unresolved, and which of those unknowns have to be settled before anything can be committed to.',
    covers: [
      'Design refinement against real constraints',
      'Mechanical requirements and how the product holds together',
      'Material considerations and what properties actually matter',
      'Component requirements, and what must be specified rather than assumed',
      'Technical unknowns and the questions behind them',
      'Manufacturing considerations that should shape the design now',
      'Cost implications of the decisions being taken',
      'Areas that will need validation before they can be relied on',
    ],
    output: 'Defined technical direction',
    plate: 'caliper',
  },
  {
    index: '03',
    id: 'prototype-readiness',
    title: 'Prototype + production readiness',
    headline: ['Make it', 'tangible.'],
    summary: 'Physical proof, and an honest account of what is still undefined.',
    body: 'Prototypes answer questions that drawings cannot, but they answer them one at a time. A concept visual shows what a product might look like. A functional prototype lets behaviour and experience be evaluated. Neither, on its own, makes a product ready to manufacture — readiness is a separate question about how much has actually been defined.',
    covers: [
      'Concept visual — what might it look like',
      'Functional prototype — can the intended behaviour and experience be evaluated',
      'Production-ready direction — what still has to be defined before manufacturing decisions can responsibly be made',
      'Specifications, materials and components',
      'Quality criteria, and what acceptable is going to mean',
      'Approvals that need to come back to the product owner',
      'Manufacturing requirements and the questions still open',
    ],
    output: 'Production decision package',
    cta: { label: 'Continue development', href: '/start/prototype' },
    plate: 'wave',
  },
  {
    index: '04',
    id: 'short-run',
    title: 'Short-run production',
    headline: ['Prove the', 'process.'],
    summary: 'An initial run exposes what prototypes cannot.',
    body: 'A prototype is usually built once, carefully, by someone who understands it. Production is built repeatedly, at pace, by people working from documentation. A limited first run is where the difference between those two things becomes visible — in assembly, in consistency, in the things nobody thought to write down.',
    covers: [
      'Repeatability — does the second one match the first',
      'Assembly sequence and whether it can be followed as written',
      'The production process itself, observed rather than assumed',
      'Quality criteria applied to real output',
      'Packaging and how the product survives handling',
      'Observations that change what happens at larger volume',
    ],
    /* No quantity, MOQ, timing or guarantee — all product-specific and none
       supplied. Stated explicitly on the page, not just omitted. */
    output: 'Validated production direction',
    plate: 'lattice',
  },
  {
    index: '05',
    id: 'long-run',
    title: 'Long-run manufacturing',
    headline: ['Build for', 'repeatability.'],
    summary: 'From a proven process to production that holds over time.',
    body: 'Repeatable manufacturing is not a phase that begins after development ends. It is the accumulated result of every decision taken earlier — what was specified, what was left open, what was approved and what was assumed. Products stay consistent when those decisions were made deliberately.',
    covers: [
      'Approved specifications as the reference everything measures against',
      'Production planning against volume and timing',
      'Quality expectations agreed before, not negotiated after',
      'Repeat orders and what has to stay identical between them',
      'Factory coordination and keeping intent intact',
      'Changes over the life of the product, and how they are controlled',
    ],
    output: 'Scalable manufacturing path',
    cta: { label: 'Discuss production', href: '/start/production' },
    plate: 'route',
  },
]

/**
 * Short-run realities, stated plainly on the page.
 *
 * Quantity, tooling, cost, lead time and factory requirements are all
 * product-specific, and none have been supplied for Phoenix Rising. Rather
 * than omit the subject and leave an impression, the page says so.
 */
export const shortRunCaveat =
  'Quantity, tooling, cost, lead time and factory requirements depend on the specific product and the manufacturing path it takes. There is no standard run and no standard timeline.'

/**
 * Quality as a thread through the process, not a final gate.
 *
 * A principle about how manufacturing works — deliberately not a claim about
 * Phoenix Rising's inspection services, which remain unverified.
 */
export const qualityPrinciple = {
  eyebrow: 'Quality',
  lines: ['Quality starts', 'before production.'],
  body: 'You cannot inspect quality into a product at the end if it was never defined at the beginning. What "acceptable" means has to be decided while the product is still being designed — because by the time something is being built at volume, the decisions that determine whether it can be built well have already been made.',
  touchpoints: [
    { label: 'Requirements', note: 'What the product has to do, and how well' },
    { label: 'Materials', note: 'Properties that matter, and why they matter' },
    { label: 'Specifications', note: 'What is defined versus left to interpretation' },
    { label: 'Prototype evaluation', note: 'What is actually being judged, against what' },
    { label: 'Production planning', note: 'What the process has to hold consistently' },
    { label: 'Inspection criteria', note: 'What acceptable means, agreed in advance' },
    { label: 'Packaging', note: 'Arriving in the condition it left in' },
  ],
} as const

/** Compressed model for the homepage. Same sequence, four beats. */
export const processPreview = {
  eyebrow: 'How we develop products',
  lines: ['Define. Develop.', 'Prove. Produce.'],
  body: 'One continuous path from a defined problem to repeatable manufacturing, with customer requirements and manufacturing reality informing every stage rather than arriving at the end.',
  beats: [
    { label: 'Define', note: 'What the product has to be' },
    { label: 'Develop', note: 'Technical direction and open questions' },
    { label: 'Prove', note: 'Physical proof, then a real run' },
    { label: 'Produce', note: 'Manufacturing that repeats' },
  ],
  cta: { label: 'How we build', href: '/how-we-develop' },
} as const
