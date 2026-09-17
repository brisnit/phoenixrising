/* ===========================================================================
 * IDEATION WORKSPACE
 * ---------------------------------------------------------------------------
 * Eight sections that turn "I have an idea" into something a person can hand
 * to a developer and be understood.
 *
 * THIS IS NOT AN INTAKE FORM. /start collects what Phoenix Rising needs to
 * know. This collects what the VISITOR needs to work out, and the artifact
 * belongs to them — it stays in their browser and they can copy it and walk
 * away. The difference shows up in the prompts: every one is a question a
 * person would actually ask while thinking, and every field can be left empty
 * or marked as not yet known without it being an error.
 *
 * THREE RULES
 *
 * 1. Nothing here is a Phoenix Rising conclusion. Answers are the visitor's
 *    own words. The workspace organises them; it does not validate them,
 *    score them, or judge whether the product can be made.
 *
 * 2. Unknown is a real answer. A brief that admits what nobody knows yet is
 *    more useful than one that quietly implies everything is settled.
 *
 * 3. No AI. Every prompt and every derived question is deterministic and
 *    small enough to read — see `ideationQuestions.ts`.
 * ======================================================================== */

export type IdeationFieldType = 'longtext' | 'text' | 'choice' | 'multi'

export type IdeationField = {
  id: string
  label: string
  type: IdeationFieldType
  /** Shown under the label. Examples to think with, never required. */
  hint?: string
  placeholder?: string
  options?: readonly string[]
  /** Offers an explicit "I don't know yet" alongside the input. */
  unknownable?: boolean
  /** Offers "this is an assumption" — only where a guess is likely. */
  assumable?: boolean
  /** Which brief section this feeds. */
  brief: BriefSectionId
}

export type IdeationSection = {
  id: string
  index: string
  /** Short label for the workspace navigation. */
  nav: string
  /** Display prompt, set large on the thinking surface. */
  prompt: readonly string[]
  lead: string
  fields: readonly IdeationField[]
}

export type BriefSectionId =
  | 'idea'
  | 'problem'
  | 'user'
  | 'product'
  | 'experience'
  | 'constraints'
  | 'state'

export const workspaceIntro = {
  eyebrow: 'Ideation workspace',
  lines: ['Start with', 'what you know.'],
  lead: 'You do not need a finished specification to begin. Describe the idea as you understand it today — the workspace organises what is known, what is assumed, and what still has to be figured out.',
  start: 'Start with the idea',
  resume: 'Continue where you left off',
  /* §25 — visible, understandable, not a wall of legal copy. */
  privacy: {
    label: 'Local session',
    body: 'Everything you write stays in this browser session. Phoenix Rising cannot see it, nothing is sent anywhere, and closing the tab clears it.',
  },
} as const

export const ideationSections: readonly IdeationSection[] = [
  {
    id: 'idea',
    index: '01',
    nav: 'Idea',
    prompt: ['What are you', 'thinking about making?'],
    lead: 'However you would describe it to someone over a table. It does not have to be tidy — this is the raw version, and everything after it is a way of making it more specific.',
    fields: [
      {
        id: 'idea.description',
        label: 'The idea',
        type: 'longtext',
        hint: 'What is it? What does it roughly do? What made you think of it? Answer as much or as little as is true.',
        placeholder: 'A portable espresso maker for people who camp…',
        brief: 'idea',
      },
      {
        id: 'idea.exists',
        label: 'What already exists like this',
        type: 'longtext',
        hint: 'Products you would compare it to, or that you think do it badly. Leave empty if you are not sure.',
        unknownable: true,
        brief: 'idea',
      },
    ],
  },
  {
    id: 'problem',
    index: '02',
    nav: 'Problem',
    prompt: ['Why should', 'this exist?'],
    lead: 'A product that solves nothing is hard to make decisions about. Being specific here is what makes every later trade-off answerable.',
    fields: [
      {
        id: 'problem.statement',
        label: 'The problem it solves',
        type: 'longtext',
        hint: 'What is difficult or annoying today, and for whom?',
        brief: 'problem',
      },
      {
        id: 'problem.alternative',
        label: 'What people do instead today',
        type: 'longtext',
        hint: 'The product, workaround or habit this would replace, improve or avoid.',
        unknownable: true,
        brief: 'problem',
      },
      {
        id: 'problem.change',
        label: 'What changes if it works',
        type: 'longtext',
        hint: 'The thing that is true afterwards that is not true now.',
        unknownable: true,
        brief: 'problem',
      },
    ],
  },
  {
    id: 'person',
    index: '03',
    nav: 'Person',
    prompt: ['Who is this', 'really for?'],
    lead: 'Not a demographic profile. The actual person who would use it, and the person who would pay for it, which are not always the same.',
    fields: [
      {
        id: 'person.user',
        label: 'Intended user',
        type: 'longtext',
        hint: 'Who picks it up and uses it.',
        brief: 'user',
      },
      {
        id: 'person.buyer',
        label: 'Who buys it, if different',
        type: 'text',
        hint: 'Sometimes the same person. Sometimes a business, a parent, a procurement team.',
        unknownable: true,
        brief: 'user',
      },
      {
        id: 'person.environment',
        label: 'Where it gets used',
        type: 'longtext',
        hint: 'Indoors, outdoors, a workshop, a kitchen, a vehicle, a hospital. Environment drives more engineering decisions than almost anything else.',
        unknownable: true,
        brief: 'user',
      },
      {
        id: 'person.sector',
        label: 'Sector or market',
        type: 'text',
        hint: 'Consumer, outdoor, medical, industrial, hospitality — however you would categorise it.',
        unknownable: true,
        assumable: true,
        brief: 'user',
      },
    ],
  },
  {
    id: 'product',
    index: '04',
    nav: 'Product',
    prompt: ['What does it', 'need to do?'],
    lead: 'What the product has to achieve, in your words. These are your requirements — the workspace records them as stated, and does not assess whether they are achievable.',
    fields: [
      {
        id: 'product.function',
        label: 'Essential function',
        type: 'longtext',
        hint: 'The one thing it must do. If it did only this, would it still be worth making?',
        brief: 'product',
      },
      {
        id: 'product.features',
        label: 'Other things it should do',
        type: 'longtext',
        hint: 'Important, but not the reason it exists.',
        unknownable: true,
        brief: 'product',
      },
      {
        id: 'product.physical',
        label: 'Physical characteristics you have in mind',
        type: 'longtext',
        hint: 'Size, weight, how it is held or carried, materials — anything you already picture.',
        unknownable: true,
        assumable: true,
        brief: 'product',
      },
      {
        id: 'product.elements',
        label: 'Does it involve any of these?',
        type: 'multi',
        hint: 'Rough is fine. This only shapes which questions are worth asking later.',
        options: [
          'Electronics',
          'A battery or power source',
          'Software or an app',
          'Moving or mechanical parts',
          'Heating or cooling',
          'Contact with food or drink',
          'Contact with skin or body',
          'Liquids',
          'None of these',
        ],
        brief: 'product',
      },
      {
        id: 'product.nonnegotiable',
        label: 'What cannot be compromised',
        type: 'longtext',
        hint: 'The thing that, if it were lost to cost or manufacturing, would make the product not worth doing.',
        unknownable: true,
        brief: 'product',
      },
    ],
  },
  {
    id: 'experience',
    index: '05',
    nav: 'Experience',
    prompt: ['What should it', 'feel like to use?'],
    lead: 'Products fail on this more often than on engineering. How something reads in a hand, and whether a person understands it without being told, are decisions — and they are cheaper to make now than later.',
    fields: [
      {
        id: 'experience.encounter',
        label: 'How someone first encounters it',
        type: 'longtext',
        hint: 'On a shelf, online, handed to them at work, unboxed at home.',
        unknownable: true,
        brief: 'experience',
      },
      {
        id: 'experience.character',
        label: 'What it should feel like',
        type: 'longtext',
        hint: 'Simple, rugged, precise, warm, technical, quiet, obvious. Your words are more useful here than the right words.',
        brief: 'experience',
      },
      {
        id: 'experience.easy',
        label: 'What has to feel effortless',
        type: 'longtext',
        hint: 'The moment where friction would lose the user.',
        unknownable: true,
        brief: 'experience',
      },
      {
        id: 'experience.disappointing',
        label: 'What would make it disappointing',
        type: 'longtext',
        hint: 'Often the most useful answer in this whole section.',
        unknownable: true,
        brief: 'experience',
      },
    ],
  },
  {
    id: 'reality',
    index: '06',
    nav: 'Reality',
    prompt: ['What reality does', 'it have to live in?'],
    lead: 'Everything here is genuinely optional. If you do not know, say so — a brief that records an open question is more useful than one that records a guess as a fact.',
    fields: [
      {
        id: 'reality.price',
        label: 'Target price, if you have one in mind',
        type: 'text',
        hint: 'A range is fine. So is "no idea".',
        unknownable: true,
        assumable: true,
        brief: 'constraints',
      },
      {
        id: 'reality.quantity',
        label: 'Rough quantity you imagine making',
        type: 'text',
        hint: 'Hundreds, thousands, tens of thousands. Volume changes almost every manufacturing decision.',
        unknownable: true,
        assumable: true,
        brief: 'constraints',
      },
      {
        id: 'reality.timing',
        label: 'Timing that matters',
        type: 'text',
        hint: 'A season, a trade show, a funding round, a deadline you have been given.',
        unknownable: true,
        brief: 'constraints',
      },
      {
        id: 'reality.regulatory',
        label: 'Regulatory or certification concerns you already know about',
        type: 'longtext',
        hint: 'Only what you already know. The workspace will not guess what applies to your product.',
        unknownable: true,
        brief: 'constraints',
      },
      {
        id: 'reality.existing',
        label: 'Suppliers, components or partners already involved',
        type: 'longtext',
        hint: 'Anything already chosen or already committed to.',
        unknownable: true,
        brief: 'constraints',
      },
      {
        id: 'reality.budget',
        label: 'Budget context, if you want to note it',
        type: 'text',
        hint: 'Entirely optional, and only your own context — nothing here is a quote or a price from Phoenix Rising.',
        unknownable: true,
        brief: 'constraints',
      },
    ],
  },
  {
    id: 'current-state',
    index: '07',
    nav: 'Current state',
    prompt: ['How far has the', 'idea already moved?'],
    lead: 'Not every idea starts at zero. What already exists decides where a development conversation should actually begin.',
    fields: [
      {
        id: 'state.artifacts',
        label: 'What exists today',
        type: 'multi',
        hint: 'Everything that applies.',
        options: [
          'The idea only',
          'Sketches',
          'Reference products',
          'Industrial design',
          'CAD',
          'A prototype',
          'A functional prototype',
          'Written specifications',
          'Supplier conversations',
          'Samples',
          'Production information',
        ],
        brief: 'state',
      },
      {
        id: 'state.notes',
        label: 'Anything worth knowing about what exists',
        type: 'longtext',
        hint: 'What a prototype proved or disproved, what a supplier said, what a drawing does not yet cover.',
        unknownable: true,
        brief: 'state',
      },
    ],
  },
]

export const sectionById = (id: string) => ideationSections.find((s) => s.id === id)

/** Every field, flattened — used by the brief, the questions and the tests. */
export const allIdeationFields: readonly IdeationField[] = ideationSections.flatMap(
  (s) => s.fields,
)

export const fieldById = (id: string) => allIdeationFields.find((f) => f.id === id)

/* ---------------------------------------------------------------------------
 * BRIEF
 * ------------------------------------------------------------------------ */

export const briefSections: readonly { id: BriefSectionId; title: string; note: string }[] = [
  { id: 'idea', title: 'The idea', note: 'What you are thinking about making.' },
  { id: 'problem', title: 'The problem', note: 'Why it should exist.' },
  { id: 'user', title: 'Intended user', note: 'Who it is for, and where it gets used.' },
  { id: 'product', title: 'Product intent', note: 'What it has to do.' },
  { id: 'experience', title: 'Experience intent', note: 'What it should be like to use.' },
  { id: 'constraints', title: 'Known constraints', note: 'The reality it has to fit into.' },
  { id: 'state', title: 'Current development state', note: 'What already exists.' },
]

export const briefCopy = {
  eyebrow: 'Project brief',
  lines: ['Your idea', 'has a shape now.'],
  lead: 'This organises what you know today and the questions that still need answering. It is a starting point for a product-development conversation — not a technical specification, and not an assessment of whether the product can be made.',
  /* §18 — future state, then the present-tense correction, in that order. */
  future:
    'When project delivery is connected, a brief like this one can become the starting context for a Phoenix Rising fit review, so the conversation begins from what you have already worked out.',
  present:
    'That connection is not active yet. Phoenix Rising has not received this brief, and no review has started.',
  primary: { label: 'Contact Phoenix Rising', href: '/contact' },
  secondary: { label: 'How fit review works', href: '/onboarding#fit-review' },
  copy: 'Copy brief',
  copied: 'Brief copied to clipboard',
  empty: 'Nothing recorded here yet.',
  unknownLabel: 'Not yet known',
  assumedLabel: 'Assumed',
} as const

export const resetCopy = {
  action: 'Reset workspace',
  title: 'Clear this workspace?',
  body: 'This removes everything you have written in this browser session. It cannot be undone, and nothing is stored anywhere else. Any project information you entered at /start is separate and is not affected.',
  confirm: 'Clear the workspace',
  cancel: 'Keep my work',
} as const
