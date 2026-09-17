/* ===========================================================================
 * CAPABILITIES — FOUR FAMILIES
 * ---------------------------------------------------------------------------
 * Phase 6 replaced the Round 1 service menu (four capabilities, ~26 named
 * technical disciplines, seven quarantined claims) with four families built
 * around the product journey: DEVELOP · PROTOTYPE · PRODUCE · DELIVER.
 *
 * THE RULE THIS FILE IS WRITTEN UNDER
 * These are families of work that has to happen to a physical product. They
 * are NOT a list of technical disciplines Phoenix Rising personally performs.
 * Copy here describes what the work requires and why it matters; it does not
 * assert who executes each underlying discipline, because that was never
 * confirmed and it varies per project.
 *
 * Practical consequence when editing: prefer "what has to be true" over "what
 * we do". If a sentence would be falsified by Phoenix Rising not having a
 * particular specialist in-house, it is the wrong sentence.
 *
 * `claimDispositions` records what happened to each Round 1 claim and why.
 * Nothing may be moved to an approved capability without client evidence —
 * see the note on `quarantinedClaims`.
 * ======================================================================== */

export type CapabilityFamilyId = 'develop' | 'prototype' | 'produce' | 'deliver'

export type CapabilityFamily = {
  id: CapabilityFamilyId
  index: string
  /** Single word, set at display scale. */
  title: string
  headline: readonly string[]
  lead: string
  /** What the family covers. Topics, not services rendered. */
  focus: readonly { label: string; note: string }[]
  /** The state the product reaches. Drives the progressive technical object. */
  objectState: { label: string; note: string }
  /** Where the copy would otherwise over-claim, it says so instead. */
  caveat?: string
  cta?: { label: string; href: string }
}

export const capabilitiesIntro = {
  eyebrow: 'Capabilities',
  lines: ['What has to happen', 'to a product.'],
  body: 'Every physical product passes through the same four kinds of work before it exists in someone’s hands. Not four services bought separately — four things that have to be true, and that have to stay connected to each other.',
  /* The organising principle of the whole phase, stated on the page rather
     than only in a commit message. */
  principle: {
    lines: ['Claim less.', 'Show more.'],
    body: 'A capability list is easy to write and proves nothing. What follows describes the work a product actually requires, and what Phoenix Rising can show of it. Where something depends on the specific product, this page says so instead of inventing a general answer.',
  },
} as const

export const capabilityFamilies: readonly CapabilityFamily[] = [
  {
    id: 'develop',
    index: '01',
    title: 'Develop',
    headline: ['Define what', 'needs to exist.'],
    lead: 'Before anything can be designed, someone has to decide what the product actually has to do — for the person buying it, and for the people who will have to build it. Most of what goes wrong later is decided, or left undecided, here.',
    focus: [
      {
        label: 'Product definition',
        note: 'What the product is, who it is for and what it has to do — settled before anything is styled around it.',
      },
      {
        label: 'Requirements',
        note: 'The intent restated as things that can be checked rather than argued about later.',
      },
      {
        label: 'Intended customer and use',
        note: 'Where the product will be used, by whom, and under what conditions it has to keep working.',
      },
      {
        label: 'Design direction',
        note: 'The form the product takes, chosen against its constraints rather than ahead of them.',
      },
      {
        label: 'Development planning',
        note: 'What has to be resolved, in what order, and what each step is meant to answer.',
      },
      {
        label: 'Technical questions',
        note: 'The things nobody yet knows — named early, while there is still time for the answers to matter.',
      },
      {
        label: 'Materials considerations',
        note: 'What the product could be made from, and what each choice commits it to downstream.',
      },
      {
        label: 'Manufacturing considerations',
        note: 'How the product would be made, brought into the conversation while the design can still absorb it.',
      },
      {
        label: 'Commercial constraints',
        note: 'What it has to cost, when it has to exist, and what volume it is meant to reach.',
      },
    ],
    objectState: {
      label: 'Idea',
      note: 'A line. An intention with no dimensions yet.',
    },
    /* Reframes the quarantined mechanical-engineering and manufacturing-
       feasibility claims: the questions are named, the execution is not. */
    caveat:
      'Engineering questions — structure, fit, how a part behaves in use, whether it can be made the way the design assumes — belong in this stage, because naming them early is what makes them answerable at all. Which of them a given product needs, and who answers them, is agreed per project rather than listed here as a standing service.',
    cta: { label: 'Explore your idea', href: '/ideate' },
  },
  {
    id: 'prototype',
    index: '02',
    title: 'Prototype',
    headline: ['Make the idea', 'testable.'],
    lead: 'A prototype is not a smaller version of the product. It is an instrument built to answer a specific question, and the question decides how it is made, what it is made from, and how much it is worth spending on.',
    focus: [
      {
        label: 'Concept',
        note: 'Does this make sense as an object at all? Size, form, layout, and how it reads in a hand.',
      },
      {
        label: 'Function',
        note: 'Does it do what it is supposed to do, under the conditions it will actually meet?',
      },
      {
        label: 'Production direction',
        note: 'Could this be made repeatedly? Fit, assembly and the decisions production will depend on.',
      },
      {
        label: 'Form',
        note: 'Proportion and presence, which arguments about renderings rarely settle.',
      },
      {
        label: 'Use',
        note: 'What happens when a real person handles it without being told how.',
      },
      {
        label: 'Materials',
        note: 'How a chosen material behaves once it is a part rather than a specification.',
      },
      {
        label: 'Assembly',
        note: 'Whether the parts go together in an order someone can repeat.',
      },
    ],
    objectState: {
      label: 'Defined form',
      note: 'Dimensioned. Specific enough to disagree with.',
    },
    caveat:
      'No single prototype answers all of these. One built to test how a product feels in the hand will not tell you whether it can be assembled on a line, and one built to prove assembly will not tell you whether anyone wants it. Asking a prototype for more than it was built for is how confidence gets misplaced.',
    cta: { label: 'Continue development', href: '/start/prototype' },
  },
  {
    id: 'produce',
    index: '03',
    title: 'Produce',
    headline: ['Turn definition', 'into repeatability.'],
    lead: 'Making one is a different problem from making the same thing again. Production is the work of turning a resolved design into a process that produces the same result without anyone standing over it.',
    focus: [
      {
        label: 'Production requirements',
        note: 'What has to be true of the product, the parts and the process before a run can begin.',
      },
      {
        label: 'Factory communication',
        note: 'Keeping the intent of the design intact in the conversation with the people building it.',
      },
      {
        label: 'Production planning',
        note: 'Sequence, dependencies, and what has to be decided before anything is committed.',
      },
      {
        label: 'Repeatability',
        note: 'The difference between one good batch and a process that produces good batches.',
      },
      {
        label: 'Quality criteria',
        note: 'What “acceptable” means, written down while it can still be discussed rather than disputed.',
      },
      {
        label: 'Packaging requirements',
        note: 'How the product is protected, presented and handled once it physically exists.',
      },
      {
        label: 'Production changes',
        note: 'What happens when something has to change after a process is already running.',
      },
      {
        label: 'Volume considerations',
        note: 'How quantity moves every other decision — process, cost and risk all travel with it.',
      },
    ],
    objectState: {
      label: 'Production object',
      note: 'Made the same way twice. The process, not the attention, produces it.',
    },
    /* Reframes the quarantined production-tooling claim and forecloses the
       MOQ / capacity / lead-time / owned-factory vocabulary entirely. */
    caveat:
      'Tooling is the point where a design stops being adjustable, which is why it is treated as a decision rather than a step. What tooling a product needs, what a run costs, how long it takes and which manufacturing arrangements apply all depend on the specific product — so none of it is published here as a general answer.',
    cta: { label: 'Discuss production', href: '/start/production' },
  },
  {
    id: 'deliver',
    index: '04',
    title: 'Deliver',
    headline: ['The product still', 'has to arrive.'],
    lead: 'A finished product is not a delivered one. What happens after production shapes decisions made long before it — and a product that cannot survive the journey was not finished in the first place.',
    focus: [
      {
        label: 'Packaging',
        note: 'Protection and presentation, decided against how the product will actually travel.',
      },
      {
        label: 'Handling',
        note: 'What the product has to survive between the line and the person who opens it.',
      },
      {
        label: 'Destination requirements',
        note: 'What a market expects of a product arriving in it, which is rarely only a label.',
      },
      {
        label: 'Delivery planning',
        note: 'When things have to exist, and what that means for every decision upstream.',
      },
      {
        label: 'Repeat orders',
        note: 'What changes, and what must not, the second and tenth time a product is made.',
      },
      {
        label: 'Changes over time',
        note: 'Products and their requirements both move. Neither stays finished.',
      },
    ],
    objectState: {
      label: 'Packaged product',
      note: 'Protected, labelled, and ready to be somewhere else.',
    },
    /* §5: the single most likely misreading of this family. */
    caveat:
      'This is about how delivery requirements shape product and packaging decisions. Phoenix Rising is not a freight forwarder or a logistics company, and which delivery functions a given project involves — and who performs them — is agreed per project rather than claimed here.',
  },
] as const

export const capabilityById = (id: string) => capabilityFamilies.find((f) => f.id === id)

/* ---------------------------------------------------------------------------
 * CLAIM DISPOSITIONS
 * ------------------------------------------------------------------------ */

export type ClaimDisposition = 'removed' | 'reframed' | 'quarantined'

/**
 * What happened to each Round 1 claim quarantined in Phase 0.
 *
 * `verified` is deliberately not a value this file can express. Verification
 * requires client evidence and is not a judgement that can be made from
 * context, industry norms, comparable companies or a previous draft.
 */
export const claimDispositions: readonly {
  id: string
  claim: string
  disposition: ClaimDisposition
  rationale: string
}[] = [
  {
    id: 'mechanical-engineering',
    claim: 'Mechanical engineering — structure, fastening, sealing, thermal and assembly strategy worked through in CAD.',
    disposition: 'reframed',
    rationale:
      'Engineering is central to the positioning, but asserting that Phoenix Rising performs CAD engineering in-house was never confirmed. DEVELOP now names the engineering questions a product has to answer without stating who answers them.',
  },
  {
    id: 'tolerance-analysis',
    claim: 'Tolerance analysis and the tolerance stack-up deliverable (two markers, one claim).',
    disposition: 'removed',
    rationale:
      'A specific technical service, unnecessary to a four-family architecture organised around the product journey. Both markers deleted; the vocabulary is now forbidden by test.',
  },
  {
    id: 'manufacturing-feasibility',
    claim: 'Manufacturing feasibility including mould-flow simulation, sink, warpage and knit lines.',
    disposition: 'reframed',
    rationale:
      'Whether a design can be made the way it assumes is a real and necessary question, so the concept survives in DEVELOP. The named simulation services do not — they asserted specific analysis capability that was never confirmed.',
  },
  {
    id: 'production-tooling',
    claim: 'Production tooling — hardened steel moulds built, benched and trialled under supervision.',
    disposition: 'reframed',
    rationale:
      'Tooling matters to the story as the moment a design stops being adjustable, and PRODUCE says that. The claim of supervised tool manufacture asserted a physical presence that remains unconfirmed and is gone.',
  },
  {
    id: 'supplier-audit',
    claim: 'Supplier identification and audit — partners audited in person rather than trusted on a profile.',
    disposition: 'removed',
    rationale:
      'An in-person audit claim is an assertion about physical presence and inspection activity, neither of which is supported. PRODUCE covers factory communication, which is what the positioning actually requires.',
  },
  {
    id: 'certification-support',
    claim: 'Certification support — coordination of market testing and documentation.',
    disposition: 'quarantined',
    rationale:
      'Plausibly relevant to real projects and worth asking the client about, but unconfirmed. Held in `quarantinedClaims` below and rendered nowhere on the site, so it cannot be read as an approved capability.',
  },
] as const

/**
 * Claims held for client verification.
 *
 * NOT RENDERED ANYWHERE. Phase 0 through 5 kept quarantined claims on the page
 * behind a visible "Unverified" marker, which was the right call while they
 * were load-bearing content. Under "claim less, show more" they are not
 * load-bearing at all, so the safer treatment is simply not to publish them —
 * a marker still puts the words in front of a reader.
 *
 * A test asserts this vocabulary appears in no rendered copy.
 */
export const quarantinedClaims: readonly {
  id: string
  claim: string
  needs: string
}[] = [
  {
    id: 'certification-support',
    claim: 'Coordination of the testing and documentation a target market requires.',
    needs:
      'Confirmation of whether Phoenix Rising coordinates certification, which markets, and with which testing partners.',
  },
] as const
