/* ===========================================================================
 * PROJECT STAGES
 * ---------------------------------------------------------------------------
 * The three entry points offered at /start.
 *
 * The routing rule that matters: a production-ready visitor must never be
 * sent through ideation, and an idea-stage visitor must never be asked for
 * specifications they do not have. Each stage therefore owns its destination
 * outright rather than funnelling into one shared form.
 * ======================================================================== */

import type { PlateVariant } from '@/components/media/plates'
import type { ProjectStage } from './projectContext'

export type StageDefinition = {
  id: ProjectStage
  index: string
  title: string
  /** Spoken in the visitor's own voice — they should recognise themselves. */
  statement: string
  detail: string
  /** What typically exists at this stage. Not a checklist to satisfy. */
  signals: string[]
  action: string
  href: string
  /** What happens next, stated plainly before they commit to the click. */
  outcome: string
  plate: PlateVariant
}

export const startIntro = {
  eyebrow: 'Start a project',
  lines: ['Where are you', 'right now?'],
  body: "Every product starts somewhere different. Tell us what you have today, and we'll help you identify the right next step.",
} as const

export const stages: StageDefinition[] = [
  {
    id: 'idea',
    index: '01',
    title: 'I have an idea',
    statement: 'I know what I want to create, but I still need help defining the product.',
    detail:
      'The idea is clear enough to describe and not yet specific enough to build. What it has to do, who it is for and what it can cost still need to be drawn out before anything can be engineered or costed.',
    signals: [
      'A sketch, a reference or a written description',
      'A problem you want to solve',
      'An intended customer in mind',
      'A rough sense of the features that matter',
    ],
    action: 'Explore my idea',
    href: '/ideate',
    outcome: 'Takes you to the ideation workspace, where the idea gets structured.',
    plate: 'burst',
  },
  {
    id: 'prototype',
    index: '02',
    title: 'I have a design or prototype',
    statement:
      "I've already started developing the product and need help determining what it will take to move toward production.",
    detail:
      'Something physical or digital already exists. The open question is what stands between it and a product that can be built repeatedly — and what that will take.',
    signals: [
      'CAD, drawings or a design package',
      'A concept, functional or production-intent prototype',
      'Early testing or user feedback',
      'Open engineering or manufacturing questions',
    ],
    action: 'Continue development',
    href: '/start/prototype',
    outcome: 'A short set of questions about what exists today and what you need next.',
    plate: 'caliper',
  },
  {
    id: 'production',
    index: '03',
    title: "I'm ready for production",
    statement:
      'I have developed specifications, an existing product, or production information and need manufacturing support.',
    detail:
      'The product is defined. The conversation is about making it — process, quality, quantities, timing, and what a manufacturing relationship needs to look like.',
    signals: [
      'Engineering drawings and a bill of materials',
      'Material and quality requirements',
      'Existing samples, tooling or a current supplier',
      'A volume and a date you are working toward',
    ],
    action: 'Discuss production',
    href: '/start/production',
    outcome: 'Questions about what is already defined — no ideation, no rework.',
    plate: 'lattice',
  },
]

export const stageById = (id: ProjectStage) => stages.find((stage) => stage.id === id)

/**
 * The wider relationship, shown compactly at /start.
 *
 * Educational only. Engagements do not all run this sequence, and the copy
 * says so rather than implying a fixed pipeline.
 */
export const compactJourney = {
  eyebrow: 'How a project usually runs',
  note: 'A typical shape, not a fixed sequence. Where a project joins depends on what already exists.',
  /* `href` is set only where a step has somewhere real to explain itself.
     Linking every word would turn an educational strip into a nav bar. */
  steps: [
    { label: 'Explore', note: 'Understand what you are building' },
    { label: 'Define', note: 'Turn it into something specific' },
    {
      label: 'Fit review',
      note: 'Decide together whether it is a fit',
      href: '/onboarding#fit-review',
    },
    {
      label: 'Onboard',
      note: 'Agree scope before work starts',
      href: '/onboarding#onboard',
    },
    { label: 'Develop', note: 'Engineering and design decisions' },
    { label: 'Prototype', note: 'Physical proof before commitment' },
    /* "inspect" removed in Phase 7: Phase 6 retired every inspection claim,
       and this strip was the last place the site still implied one. */
    { label: 'Produce', note: 'Manufacture at volume and deliver' },
  ] as readonly { label: string; note: string; href?: string }[],
} as const
