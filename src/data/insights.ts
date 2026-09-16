/* ===========================================================================
 * INSIGHTS
 * ---------------------------------------------------------------------------
 * Editorial articles. The entries below are real, general engineering and
 * manufacturing guidance — they contain no Phoenix Rising-specific claims,
 * client references or statistics. Dates are placeholders.
 * ======================================================================== */

export type Insight = {
  slug: string
  title: string
  category: string
  date: string
  readingTime: string
  excerpt: string
  /* Body is authored as an array of blocks so it can be swapped for a CMS. */
  body: { type: 'p' | 'h2' | 'list'; text?: string; items?: string[] }[]
  placeholder: boolean
}

export const insightsIntro = {
  eyebrow: 'Insights',
  lines: ['Notes from', 'the factory floor.'],
  body: 'Practical writing on engineering for production — what tends to go wrong, why it costs what it costs, and what to decide before it is expensive to change.',
} as const

export const insights: Insight[] = [
  {
    slug: 'what-dfm-actually-means',
    title: 'What design for manufacturability actually means',
    category: 'Engineering',
    date: '[Date]',
    readingTime: '6 min',
    excerpt:
      'DFM is not a review you book at the end. It is a set of decisions made continuously, each one trading a little freedom for a lot of predictability.',
    body: [
      {
        type: 'p',
        text: 'Design for manufacturability is routinely described as a checkpoint — a report someone produces once the CAD is finished. That framing is the reason it so often fails to help. By the time a design is finished, the decisions that determine whether it can be built economically have already been made, and unmaking them is expensive.',
      },
      { type: 'h2', text: 'It is a sequence of trades, not a gate' },
      {
        type: 'p',
        text: 'Every manufacturing process has a grain. Injection moulding wants uniform wall sections, generous draft and a parting line it can reach. Sheet metal wants bend reliefs and a minimum flange. Machining wants tool access and internal radii that match a real cutter. Designing with the grain costs almost nothing. Designing across it costs cycle time, tool complexity, scrap, or all three.',
      },
      {
        type: 'p',
        text: 'The useful question at any point in a design is not "can this be made?" — almost anything can be made. It is "what does this geometry cost, and is the thing it buys worth that?" Sometimes it clearly is. A visible surface, a sealing face, a load path: these earn their complexity. Most geometry does not.',
      },
      { type: 'h2', text: 'Tolerance is where the money hides' },
      {
        type: 'p',
        text: 'Tolerances are the most commonly over-specified property in hardware. A drawing that carries tight tolerances everywhere communicates nothing about what actually matters, and prices every feature as though it were critical. The alternative is deliberate: identify the dimensions that control fit, function and appearance, tighten those, and open everything else.',
      },
      {
        type: 'p',
        text: 'This requires an actual stack-up analysis rather than an instinct. When several parts mate, the accumulated variation — not the individual tolerance — determines whether a gap stays flush or a button binds. That analysis is cheap while the design is in CAD and impossible to retrofit once tooling exists.',
      },
      { type: 'h2', text: 'What good DFM produces' },
      {
        type: 'list',
        items: [
          'A written record of which features are critical and why',
          'Process selection confirmed by simulation, not assumption',
          'A tolerance stack-up across every functional interface',
          'Material choices validated against lead time and availability',
          'A costed BOM that reflects the design as it stands today',
          'A risk register naming what could still go wrong in tooling',
        ],
      },
      {
        type: 'p',
        text: 'None of that is glamorous. All of it is the difference between a programme that tools once and a programme that tools twice.',
      },
    ],
    placeholder: false,
  },
  {
    slug: 'before-you-cut-steel',
    title: 'Questions to answer before you cut steel',
    category: 'Tooling',
    date: '[Date]',
    readingTime: '5 min',
    excerpt:
      'Tooling is the first genuinely irreversible commitment in a hardware programme. These are the questions worth closing out first.',
    body: [
      {
        type: 'p',
        text: 'Up to the moment a mould is cut, almost every decision in a hardware programme is reversible. Afterwards, very few are. A tool represents weeks of lead time and a large fixed cost, and modifying one is constrained by an uncomfortable rule: you can remove steel easily and add it back only with difficulty.',
      },
      { type: 'h2', text: 'Has the design stopped changing?' },
      {
        type: 'p',
        text: 'Not "is it finished" — designs are never finished — but has it been stable through a full round of physical testing without a change that affects geometry? If the last prototype round produced dimensional changes, the next one probably will too.',
      },
      { type: 'h2', text: 'Do you know your real production volume?' },
      {
        type: 'p',
        text: 'Tool specification follows volume. Cavitation, steel grade, hardening and cooling design are all chosen against an expected total. A tool built for fifty thousand units is a different object from one built for five thousand, and building the wrong one is expensive in either direction — either you overpay up front or you pay again when demand arrives.',
      },
      { type: 'h2', text: 'Have you tested the material you will actually use?' },
      {
        type: 'p',
        text: 'Machined or printed prototypes rarely behave like moulded parts. Stiffness, surface finish, shrinkage and impact response differ, sometimes substantially. If a functional conclusion was reached on a prototype in a different material or process, it is provisional.',
      },
      { type: 'h2', text: 'Is the assembly sequence proven by a person?' },
      {
        type: 'p',
        text: 'A design can be perfectly manufacturable at part level and still be a poor product to assemble. Someone should build it by hand, in order, with the intended fasteners and adhesives, and time it. Problems found here are drawing revisions. The same problems found after tooling are tool modifications.',
      },
      { type: 'h2', text: 'Is the quality standard written down?' },
      {
        type: 'p',
        text: 'Acceptance criteria agreed before production is a specification. Agreed after a disputed shipment, it is a negotiation. Write down what a defect is, which classes are acceptable at what rate, and how each is measured — before there is a commercial reason to argue about it.',
      },
    ],
    placeholder: false,
  },
  {
    slug: 'reading-a-manufacturing-quote',
    title: 'How to read a manufacturing quote',
    category: 'Sourcing',
    date: '[Date]',
    readingTime: '7 min',
    excerpt:
      'Two quotes for the same part can differ by a factor of three and both be honest. The difference is usually in what was not quoted.',
    body: [
      {
        type: 'p',
        text: 'Comparing manufacturing quotes is harder than it looks, because a quote is a response to an interpretation of your drawing. Two suppliers reading the same package can price very different objects — and the cheaper one is frequently the one that assumed less.',
      },
      { type: 'h2', text: 'Establish what volume the price assumes' },
      {
        type: 'p',
        text: 'A unit price is meaningless without its quantity and its schedule. A price at ten thousand units delivered across a year is a different commitment from ten thousand in one batch. Ask for a price break table rather than a single number, and confirm whether tooling amortisation is inside or outside the figure.',
      },
      { type: 'h2', text: 'Find out what is excluded' },
      {
        type: 'list',
        items: [
          'Tooling, fixtures and their maintenance over tool life',
          'First-article inspection and sample rounds',
          'Packaging, labelling and palletisation',
          'Compliance testing and certification',
          'Freight, duties and insurance',
          'Rework or scrap allowance',
        ],
      },
      {
        type: 'p',
        text: 'Each of these is a legitimate line item. A quote that omits all of them is not cheaper — it is less complete, and the difference will arrive later as a variation.',
      },
      { type: 'h2', text: 'Check what quality level was priced' },
      {
        type: 'p',
        text: 'Cosmetic standards, sampling plan and acceptable defect rates materially change cost. If your drawing did not specify them, the supplier assumed something. It is worth knowing what.',
      },
      { type: 'h2', text: 'Ask what they would change' },
      {
        type: 'p',
        text: 'The most informative question you can put to a supplier is which single feature adds the most cost and what they would do about it. A capable manufacturer will have an immediate, specific answer. The quality of that answer tells you more about the partner than the number on the quote.',
      },
    ],
    placeholder: false,
  },
  {
    slug: 'prototype-to-production-gap',
    title: 'The gap between a prototype and a product',
    category: 'Production',
    date: '[Date]',
    readingTime: '5 min',
    excerpt:
      'A working prototype proves an idea is possible. It says almost nothing about whether it is repeatable.',
    body: [
      {
        type: 'p',
        text: 'The most dangerous moment in a hardware programme is the one immediately after a prototype works. It feels like the hard part is over. In terms of engineering effort, roughly half of it is still ahead.',
      },
      { type: 'h2', text: 'One unit hides variation' },
      {
        type: 'p',
        text: 'A prototype is usually built by the person who designed it, adjusted as it goes, with parts selected from whatever fitted best. Every one of those acts absorbs variation that production will not absorb. At volume, parts arrive at the limits of their tolerance, assembled by someone who has not seen the CAD, on a schedule.',
      },
      { type: 'h2', text: 'Process introduces its own behaviour' },
      {
        type: 'p',
        text: 'Moulded parts shrink, and not uniformly. Painted surfaces build thickness. Adhesives cure at a rate that depends on temperature and humidity. None of these appear in a single hand-built unit, and all of them appear in a production run.',
      },
      { type: 'h2', text: 'Closing the gap' },
      {
        type: 'list',
        items: [
          'Build a pilot run using the real sequence and real fixtures',
          'Assemble deliberately from parts at tolerance extremes',
          'Have someone unfamiliar with the design build it from the instructions',
          'Record process parameters so they can be held, not rediscovered',
          'Define and measure yield before it matters commercially',
        ],
      },
      {
        type: 'p',
        text: 'The goal is a process where quality comes from the system rather than from supervision — because supervision does not scale, and the second production run rarely gets as much of it as the first.',
      },
    ],
    placeholder: false,
  },
]

export const insightBySlug = (slug: string) => insights.find((i) => i.slug === slug)
