/* ===========================================================================
 * COMPANY — ABOUT, GEOGRAPHY AND ORIGIN
 * ---------------------------------------------------------------------------
 * Replaces the Phase 2 placeholder `about.ts`.
 *
 * FACT INTEGRITY
 * Phoenix Rising has supplied four company facts and no more. They are
 * recorded in `approvedCompanyFacts` below with their source, and everything
 * on the About page is either one of those four, a statement about how
 * products and manufacturing work in general, or a statement about how this
 * company approaches the work. Nothing here asserts a founding date, a
 * headcount, a founder name, an address, a facility, a partner count, a
 * customer count or a production capability.
 *
 * `pendingCompanyInformation` is the other half of that record: the things a
 * stronger version of this page needs and does not have. Both lists are
 * asserted by tests/unit/company-story.test.ts, so neither can drift
 * silently and no fact can be added to the page without being added here
 * first.
 * ======================================================================== */

export type CompanyFact = {
  id: string
  statement: string
  /** Where the fact came from. Required — a fact with no source is invented. */
  source: string
}

/**
 * Everything Phoenix Rising has actually confirmed about itself.
 *
 * Note what is NOT here: the Round 1 brief mentioned Stockton specifically,
 * but the Phase 5 brief restated it as "a California/Stockton connection or
 * office" — an uncertainty about the nature of the presence, not just its
 * address. So `California` is published as the geographic anchor and Stockton
 * is held in `pendingCompanyInformation` until it is confirmed.
 */
export const approvedCompanyFacts: readonly CompanyFact[] = [
  {
    id: 'legal-entity',
    statement: 'The legal entity is Phoenix Rising Trading Company, LTD.',
    source: 'Client, 2026-09-15',
  },
  {
    id: 'guangzhou',
    statement: 'Phoenix Rising is based in Guangzhou, China.',
    source: 'Client brief — Round 1, restated Phase 5 (2026-09-16)',
  },
  {
    id: 'california',
    statement: 'There is a California connection or office.',
    source: 'Client brief — Round 1, restated Phase 5 (2026-09-16)',
  },
  {
    id: 'dual-perspective',
    statement:
      'The founding story connects an American perspective with a Guangzhou manufacturing perspective.',
    source: 'Client brief — Phase 5 (2026-09-16)',
  },
] as const

/** What the page would need in order to stop being restrained about people. */
export const pendingCompanyInformation: readonly string[] = [
  'Founder names, roles and biographies',
  'Founder portraits',
  'Founding date',
  'Whether the California presence is an office, and where — the Round 1 brief said Stockton, the Phase 5 brief said "connection or office"',
  'Street addresses for either location',
  'Team size and the disciplines represented',
  'Photography of people, places, facilities or products',
] as const

/* ---------------------------------------------------------------------------
 * HERO
 * ------------------------------------------------------------------------ */

export const aboutHero = {
  eyebrow: 'About',
  lines: ['One product.', 'Two worlds.'],
  lead: 'A product has to make sense in the market where it will be used, and in the manufacturing environment where it will be made. Phoenix Rising works between those two realities.',
  meta: [
    { label: 'Position', value: 'Between the market and the factory' },
    { label: 'Geography', value: 'California ↔ Guangzhou' },
    { label: 'Entity', value: 'Phoenix Rising Trading Company, LTD.' },
  ],
} as const

/* ---------------------------------------------------------------------------
 * THESIS — why the two realities have to stay connected
 * ------------------------------------------------------------------------ */

export const companyThesis = {
  eyebrow: 'The position',
  lines: ['Two realities,', 'one set of decisions.'],
  axisLabel: 'Customer ↔ Product ↔ Factory',
  body: [
    'Every product answers to two sets of expectations. One comes from the market: who it is for, what it has to do for them, what it can cost, what it has to feel like to own. The other comes from manufacturing: what it is made of, how it is assembled, what a production line can hold consistently, and what happens at the ten-thousandth unit rather than the first.',
    'Those two sets of expectations are usually handled by different people, in different companies, in different countries, at different times. The market side finishes its thinking and hands over a design. The manufacturing side receives it and adjusts it to suit what is actually possible. Everyone involved is acting reasonably, and the product still ends up somewhere neither of them chose.',
    'Phoenix Rising exists to keep those decisions in the same conversation. Not to move work from one place to another, but to keep the reasoning behind a product intact while it travels between the people defining it and the people responsible for building it.',
  ],
} as const

/* ---------------------------------------------------------------------------
 * SIGNATURE — CALIFORNIA ↔ GUANGZHOU
 * ------------------------------------------------------------------------ */

export type World = {
  id: string
  /** Rendered as the large label. A place, or the company, never a facility. */
  place: string
  role: string
  summary: string
  items: readonly string[]
}

export const twoWorlds = {
  eyebrow: 'The two worlds',
  /* Set as three lines so the arrow carries a line of its own at display
     size. The middle line is the whole idea of the company. */
  lines: ['California', '↔', 'Guangzhou'],
  lead: 'The two worlds are not a metaphor. Market thinking and manufacturing reality happen in different places, and the space between them is where products quietly lose their intent.',
  /* Read as three columns on a wide screen and top-to-bottom on a narrow one,
     which is the same story either way: market → product → manufacturing. */
  worlds: [
    {
      id: 'california',
      place: 'California',
      role: 'Market side',
      summary: 'What the product has to become for the people it is meant to serve.',
      items: [
        'Customer',
        'Intended user',
        'Sector',
        'Commercial objective',
        'Product experience',
        'Brand and market expectations',
        'Feedback',
        'Approval',
      ],
    },
    {
      id: 'phoenix-rising',
      place: 'Phoenix Rising',
      role: 'The product',
      summary: 'Where an intention becomes specific enough for someone to build it.',
      items: [
        'Requirements',
        'Decisions',
        'Specifications',
        'Prototypes',
        'Questions',
        'Approvals',
        'Production information',
      ],
    },
    {
      id: 'guangzhou',
      place: 'Guangzhou',
      role: 'Manufacturing side',
      summary: 'What the product has to become to be made the same way every time.',
      items: [
        'Materials',
        'Components',
        'Manufacturing processes',
        'Production requirements',
        'Quality criteria',
        'Packaging',
        'Repeatability',
        'Delivery considerations',
      ],
    },
  ] as readonly World[],
  /* Two clarifications the section cannot be read correctly without. Both are
     rendered, not merely commented: the left column is the most likely thing
     on this site to be mistaken for agency work, and the right column is the
     most likely to be mistaken for a claim of ownership. */
  clarifications: [
    {
      id: 'not-an-agency',
      label: 'On the market side',
      text: 'This is not marketing work. It is the part of development that decides what the product is for, before anything is designed around it.',
    },
    {
      id: 'no-ownership',
      label: 'On the manufacturing side',
      text: 'Phoenix Rising coordinates with manufacturing. Nothing here describes factories, production lines or personnel as its own.',
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * THE EXCHANGE — information moving in both directions
 * ------------------------------------------------------------------------ */

export type ExchangeDirection = 'outbound' | 'return'

export type Exchange = {
  index: string
  direction: ExchangeDirection
  /** Which world the information is sitting in at this beat. Matches a
      `World.id`, so the signature section can show the exchange passing
      THROUGH Phoenix Rising rather than merely past it — which is the
      difference between this company's position and a courier's. */
  at: string
  label: string
  note: string
}

export const informationFlow = {
  eyebrow: 'The exchange',
  lines: ['Information moves', 'both ways.'],
  lead: 'The common picture is a one-way street: a market decides what it wants, a design goes out, a factory builds it. Real products do not work like that. What manufacturing learns has to come back, while the product can still absorb it.',
  /* Direction is data, not decoration — the mobile layout and the assistive
     reading of this section both derive from it, so the story survives with
     no animation, no colour and no horizontal space. */
  exchanges: [
    {
      index: '01',
      direction: 'outbound',
      at: 'california',
      label: 'Customer need',
      note: 'Something a person in a real market actually has to solve.',
    },
    {
      index: '02',
      direction: 'outbound',
      at: 'phoenix-rising',
      label: 'Product requirement',
      note: 'The need restated as something the product must measurably do.',
    },
    {
      index: '03',
      direction: 'outbound',
      at: 'phoenix-rising',
      label: 'Technical decision',
      note: 'Material, geometry, process — the choices that make the requirement buildable.',
    },
    {
      index: '04',
      direction: 'outbound',
      at: 'guangzhou',
      label: 'Manufacturing information',
      note: 'What is needed in order to build it without anyone having to guess.',
    },
    {
      index: '05',
      direction: 'return',
      at: 'guangzhou',
      label: 'Factory question',
      note: 'A constraint, a cost, a tolerance, an alternative. Manufacturing answers back.',
    },
    {
      index: '06',
      direction: 'return',
      at: 'phoenix-rising',
      label: 'Product decision',
      note: 'The question resolved against the requirement rather than against the schedule.',
    },
    {
      index: '07',
      direction: 'return',
      at: 'california',
      label: 'Client approval',
      note: 'The change returns to the people who own the product, before it is built.',
    },
  ] as readonly Exchange[],
  directionLabels: {
    outbound: 'Toward manufacturing',
    return: 'Back toward the market',
  },
  closing:
    'Neither direction is a formality. A product that only travels outward arrives at a factory as an instruction, and a product that only travels back arrives at a market as a compromise.',
} as const

/* ---------------------------------------------------------------------------
 * THE DISTANCE
 * ------------------------------------------------------------------------ */

export const distanceStatement = {
  eyebrow: 'What is actually difficult',
  lines: ["The distance isn't", 'the hard part.'],
  pullQuote: 'A drawing can cross an ocean instantly. Understanding doesn’t.',
  body: [
    'The difficulty has never been logistics. It is preserving intent while decisions move between the people defining a product and the people responsible for making it.',
    'A tolerance is relaxed to suit a machine. A material is substituted for one that is easier to source. A finish is approximated. Every one of those changes is small, locally sensible, and made by someone who was never told what the product was supposed to be. Nobody makes a bad decision. The product still drifts.',
  ],
  closing: 'Continuity is the work. Everything else is scheduling.',
} as const

/* ---------------------------------------------------------------------------
 * ORIGIN
 * ------------------------------------------------------------------------ */

export const origin = {
  eyebrow: 'Origin',
  lines: ['Built from', 'both sides.'],
  body: [
    /* Sourced to `dual-perspective` and `guangzhou` above. Deliberately says
       nothing about how many founders there are, when the company was
       formed, or who anyone is — none of that has been supplied. */
    'Phoenix Rising Trading Company, LTD. came out of a working relationship that already spanned both worlds: an American perspective on what products have to be for the markets that buy them, and a Guangzhou perspective on what it actually takes to make them.',
    'That is the whole reason the company works the way it does. Neither view was added later as a service line to round out an offering. Both were present at the start, which is why market intent, development and manufacturing reality are treated here as one continuous conversation rather than three hand-offs between specialists.',
    'It is also why Phoenix Rising does not describe itself as a sourcing agent, a design studio or a trading intermediary. Each of those sits on one side of the exchange and passes things across it. This company’s work is the exchange itself.',
  ],
  question: 'Why does Phoenix Rising see product development this way?',
  answer:
    'Because it never saw the two halves separately. The company was assembled across the gap it now works in.',
} as const

/* ---------------------------------------------------------------------------
 * PEOPLE — structural seam only
 * ------------------------------------------------------------------------ */

export type Founder = {
  id: string
  name: string
  role: string
  bio: string
  /** Which side of the exchange this person's perspective comes from. */
  perspective: string
  /** Path under /public. Omit until a real portrait exists. */
  portrait?: string
}

/**
 * The founder seam.
 *
 * `people` is empty and `published` is false, so the About page renders no
 * people section at all. This is deliberate: a section containing invented
 * names, stock portraits or "Founder — coming soon" cards would be worse than
 * no section. Supply real entries, flip `published`, and the section appears
 * with no component work — the About page already branches on it.
 */
export const founders = {
  published: false,
  eyebrow: 'People',
  headline: 'The people',
  lead: 'Two perspectives, held by the people who brought them.',
  people: [] as readonly Founder[],
} as const

/* ---------------------------------------------------------------------------
 * LOCATIONS
 * ------------------------------------------------------------------------ */

export const locations = {
  eyebrow: 'Where the work happens',
  /* Places, never facilities. No square footage, no headcount, no "our
     production centre", no street address. */
  places: [
    {
      id: 'california',
      name: 'California',
      region: 'United States',
      role: 'Market side — customer, sector and commercial context.',
    },
    {
      id: 'guangzhou',
      name: 'Guangzhou',
      region: 'China',
      role: 'Manufacturing side — materials, processes and production reality.',
    },
  ],
  note: 'Two geographies because the work genuinely happens in two places, not because a second address reads well. Nothing on this page should be read as a claim to own or operate a factory, a production line or a warehouse.',
} as const

/* ---------------------------------------------------------------------------
 * CONSEQUENCES — what the model changes about the work itself
 * ------------------------------------------------------------------------ */

export const howThisChangesTheWork = {
  eyebrow: 'What this changes',
  lines: ['A position is only', 'worth having if it', 'changes the work.'],
  lead: 'Working between the two sides is not a philosophy the company holds and then sets aside once a project starts. It shows up in ordinary decisions.',
  items: [
    {
      index: '01',
      title: 'Development',
      body: 'Requirements arrive with their manufacturing consequences already attached. A specification that cannot be held in production is not a specification — it is a problem scheduled for later.',
    },
    {
      index: '02',
      title: 'Prototyping',
      body: 'A prototype is built to answer a question from one side or the other: does this satisfy the person buying it, or can this actually be made? Knowing which question is being asked decides how the prototype is built.',
    },
    {
      index: '03',
      title: 'Manufacturing',
      body: 'A question from the manufacturing side is treated as a product question, not an obstruction. It gets answered against what the product is for, by people who know what that is.',
    },
    {
      index: '04',
      title: 'Quality',
      body: 'What “acceptable” means is defined where the product is understood and enforced where it is built. Those are different places, which is exactly why it has to be written down rather than assumed.',
    },
    {
      index: '05',
      title: 'Communication',
      body: 'Two sides, one account of the product. The value is not translation between languages — it is that nothing has to be re-explained from scratch each time a decision crosses.',
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * CALLS TO ACTION AND CROSS-PAGE CONNECTIONS
 * ------------------------------------------------------------------------ */

export const aboutCta = {
  lines: ['Where is your project', 'right now?'],
  body: 'The right starting point depends on what already exists — an idea, a prototype, or a product that needs to be made repeatedly.',
  primary: { label: 'Start a project', href: '/start' },
  secondary: { label: 'How we develop products', href: '/how-we-develop' },
} as const

/**
 * Homepage teaser.
 *
 * Deliberately one short band: the homepage already argues the position in
 * the statement and why-us sections. This gives that argument a geography and
 * a door, and nothing else — the full story lives on /about.
 */
export const twoWorldsTeaser = {
  eyebrow: 'California ↔ Guangzhou',
  lines: ['Two worlds.', 'One product.'],
  body: 'Market thinking and manufacturing reality happen in different places. Phoenix Rising works in the exchange between them, so information moves in both directions instead of being handed across once and hoped for.',
  axis: ['California', 'Guangzhou'],
  cta: { label: 'Why Phoenix Rising', href: '/about' },
} as const

/** Restrained bridge from the development story to the company story. */
export const processBridge = {
  text: 'The decisions between design and delivery also move between markets and manufacturing environments.',
  cta: { label: 'About Phoenix Rising', href: '/about' },
} as const
