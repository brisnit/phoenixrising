/* ===========================================================================
 * ONBOARDING — THE ENGAGEMENT PATH
 * ---------------------------------------------------------------------------
 * What happens between "here is my project" and actual development work.
 *
 * This page is EDUCATIONAL. It describes a human, business process. It is not
 * a signup, a contract, a payment page or a client portal, and it must never
 * imply that any of those exist.
 *
 * THREE RULES THIS FILE IS WRITTEN UNDER
 *
 * 1. No commercial terms. Phoenix Rising has supplied no fee, rate, minimum,
 *    deposit, payment schedule, cancellation or refund policy. The engagement
 *    stage acknowledges that commercial terms are AGREED — it never says what
 *    they are. A plausible-sounding number here would be an invention with
 *    financial consequences.
 *
 * 2. No promises about the outcome. The fit review is a conversation, not an
 *    application. Nothing here may promise acceptance, a response time, or
 *    eligibility criteria that were never defined.
 *
 * 3. No machine judgement. There is no fit score, no automated approval and
 *    no AI deciding whether a project is worth taking. Phoenix Intelligence
 *    may later help structure information; it does not make commercial
 *    acceptance decisions, and this page must not suggest otherwise.
 * ======================================================================== */

export const onboardingIntro = {
  eyebrow: 'Onboarding',
  lines: ['Before we build,', 'we define.'],
  lead: 'A productive manufacturing relationship starts with clarity: about the product, about where the work has actually reached, about what needs to happen next — and about whether Phoenix Rising is the right fit to help move it forward.',
  /* The phrase the whole page is organised around. */
  principle: 'Clarity before commitment.',
} as const

/* ---------------------------------------------------------------------------
 * FIT REVIEW — defined carefully, because the phrase does work
 * ------------------------------------------------------------------------ */

export const fitReview = {
  eyebrow: 'Fit review',
  lines: ['First, we determine', 'whether the work fits.'],
  definition:
    'A structured review of what is known about a project, so both sides can decide what the appropriate next conversation is.',
  body: [
    'Phoenix Rising reads what is available about the product: where it has reached, what it is meant to do, what the goals are, what the requirements look like and which questions are still open. Some of that usually arrives incomplete, which is normal and is part of what the review is for.',
    'The purpose is not to grade the project. It is to work out whether there is a sensible path forward together, and if there is, what the first part of it should be.',
  ],
  /* The five things this phrase is most likely to be mistaken for. Stated on
     the page, because "review" invites all of them. */
  isNot: [
    'A certification or an approval',
    'An engineering validation of the design',
    'A formal manufacturing or supplier audit',
    'A guaranteed feasibility study',
    'A score, a rating, or an automated decision',
  ],
  /* Deliberately not a promise. See rule 2 in the file header. */
  caveat:
    'This is a conversation between people, and it depends on what a project needs and what is going on at the time. Phoenix Rising does not publish eligibility criteria, response times or acceptance rates, because none has been set.',
} as const

/* ---------------------------------------------------------------------------
 * THE FIVE STAGES
 * ------------------------------------------------------------------------ */

export type EngagementStage = {
  id: string
  index: string
  title: string
  headline: readonly string[]
  lead: string
  /* What this stage covers. Topics, never deliverables or guarantees. */
  covers?: readonly string[]
  /* Where the copy stops short deliberately. */
  caveat?: string
  cta?: { label: string; href: string }
  /* Drives the assembling technical dossier beside the list. */
  objectState: { label: string; note: string }
}

export const engagementPath: readonly EngagementStage[] = [
  {
    id: 'start',
    index: '01',
    title: 'Start',
    headline: ['Tell us where the', 'project is today.'],
    lead: 'An idea, a prototype, or a product that needs to be made repeatedly. Where a project has actually reached decides almost everything about what should happen next, so it is the first thing worth establishing.',
    covers: ['An idea', 'A design or prototype', 'Ready for production'],
    objectState: {
      label: 'Scattered',
      note: 'Information exists, in pieces, in no particular order.',
    },
    cta: { label: 'Start a project', href: '/start' },
  },
  {
    id: 'fit-review',
    index: '02',
    title: 'Fit review',
    headline: ['First, we determine', 'whether the work fits.'],
    lead: fitReview.definition,
    covers: [
      'What the product is and what it has to do',
      'Where the work has reached',
      'Goals and constraints',
      'Requirements, as far as they exist',
      'Open questions and unknowns',
    ],
    caveat:
      'A review, not an application. Phoenix Rising does not publish acceptance criteria or response times, and nothing about this step is decided by software.',
    objectState: {
      label: 'Grouped',
      note: 'The pieces sort into what is known, what is assumed and what is missing.',
    },
  },
  {
    id: 'define-engagement',
    index: '03',
    title: 'Define the engagement',
    headline: ['Define the work', 'before doing the work.'],
    lead: 'If there is a fit, the next step is to agree what the engagement actually is. Both sides should understand the shape of the work before any of it begins — including the parts that are still unknown.',
    covers: [
      'Scope',
      'Responsibilities on each side',
      'Known requirements',
      'Open questions',
      'Decisions that will need making',
      'Commercial terms',
      'Timing',
      'How communication works',
      'What information or materials are needed',
    ],
    /* Acknowledges commercial terms without specifying any. See rule 1. */
    caveat:
      'Commercial terms are part of that conversation and are agreed per project. Nothing about fees, rates, minimums or payment is published on this site, because what an engagement involves depends entirely on the product and the stage it arrives at.',
    objectState: {
      label: 'Bounded',
      note: 'Edges appear. What is in the work, and what is not.',
    },
  },
  {
    id: 'onboard',
    index: '04',
    title: 'Onboard',
    headline: ['Get the right', 'information in one place.'],
    lead: 'Onboarding is the work of preparing a project so it can actually start — gathering what already exists, identifying what does not, and making sure the people who need to decide things are part of the conversation.',
    covers: [
      'Project brief',
      'Requirements',
      'Reference material',
      'Drawings',
      'CAD',
      'Specifications',
      'Samples',
      'Existing supplier or manufacturing information',
      'Who the decision-makers are',
      'Communication expectations',
    ],
    /* Forecloses the client-portal reading. See §14 of the brief. */
    caveat:
      'How that material is exchanged is arranged per project. There is no client portal on this site, and nothing can be uploaded here — this describes the preparation, not a piece of software.',
    objectState: {
      label: 'Organised',
      note: 'Assembled, labelled, and in one place instead of six.',
    },
  },
  {
    id: 'begin',
    index: '05',
    title: 'Begin the work',
    headline: ['Then the project', 'moves forward.'],
    lead: 'From here the project joins the development path. Where it joins depends entirely on what already exists — the sequence is a typical shape, not a queue everyone has to start at the front of.',
    objectState: {
      label: 'Resolved',
      note: 'A defined project, entering the path at the right point.',
    },
    cta: { label: 'How we develop products', href: '/how-we-develop' },
  },
] as const

export const stageById = (id: string) => engagementPath.find((s) => s.id === id)

/* ---------------------------------------------------------------------------
 * WHERE A PROJECT ENTERS THE DEVELOPMENT PATH
 * ------------------------------------------------------------------------ */

export const entryPoints = {
  eyebrow: 'Where a project joins',
  lines: ['Nobody starts', 'at the beginning.'],
  body: 'Define, develop, prove, produce. A project that already has a working prototype does not go back to defining what the product is, and one that is ready for production does not restart at ideation.',
  points: [
    {
      stage: 'An idea',
      enters: 'Define',
      note: 'What the product is has to be settled before anything can be engineered around it.',
    },
    {
      stage: 'A design or prototype',
      enters: 'Develop',
      note: 'Something exists. The question is what stands between it and something that can be built repeatedly.',
    },
    {
      stage: 'Ready for production',
      enters: 'Produce',
      note: 'The product is resolved. The work is turning it into a process that repeats.',
    },
  ],
  note: 'These are typical entry points, not rules. What a project needs depends on what it already has.',
} as const

/* ---------------------------------------------------------------------------
 * WHAT DOES NOT EXIST — stated, not implied
 * ------------------------------------------------------------------------ */

/**
 * Rendered on the page.
 *
 * A page describing a five-stage engagement process reads, by default, as a
 * page belonging to a company with software behind it. Saying plainly what is
 * not here costs one paragraph and removes the whole misreading.
 */
export const onboardingNotice = {
  label: 'What this page is',
  body: 'This explains how Phoenix Rising works, not a system you sign into. There is no account to create, nothing to upload and nothing to pay for here. Starting a project sends nothing automatically — the structured intake prepares a summary in your browser, and reaching Phoenix Rising is still a direct conversation.',
  cta: { label: 'Contact Phoenix Rising', href: '/contact' },
} as const

/* ---------------------------------------------------------------------------
 * FUTURE STATE — copy used at the end of the Phase 3 intake
 * ------------------------------------------------------------------------ */

/**
 * Shown on the intake completion screen.
 *
 * Every sentence is conditional on delivery existing. The completion screen
 * already says plainly that nothing has been sent; this adds what the summary
 * would be FOR, without implying it is on its way anywhere.
 */
export const fitReviewHandoff = {
  eyebrow: 'Next',
  lines: ['Fit review.'],
  /* Future-state, and marked as such in the copy itself. */
  body: 'When project delivery is connected, a summary like this one becomes the starting context for a fit review — so the conversation begins from what you have already written down rather than making you repeat it.',
  /* The present-tense truth, stated straight after. */
  present:
    'That is not connected yet. Nothing here has reached Phoenix Rising, and no review has started.',
  primary: { label: 'Contact Phoenix Rising', href: '/contact' },
  secondary: { label: 'How onboarding works', href: '/onboarding' },
} as const
