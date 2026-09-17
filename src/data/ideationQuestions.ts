/* ===========================================================================
 * QUESTIONS TO RESOLVE
 * ---------------------------------------------------------------------------
 * Deterministic. Small enough to read in one sitting. No AI, no scoring, no
 * inference about whether a product can be made.
 *
 * WHAT THESE ARE: questions a person would ask after reading the brief. They
 * exist to make gaps visible so the visitor knows what to think about next.
 *
 * WHAT THESE ARE NOT: findings, risks, recommendations, engineering issues or
 * feasibility conclusions. None of that can come from a rules file — it
 * requires a person who has read the actual product. The vocabulary is
 * enforced by `tests/unit/ideationQuestions.test.ts`, which fails if a rule
 * starts asserting instead of asking.
 *
 * EVERY RULE IS A QUESTION. If a rule's text does not end in a question mark,
 * the test fails. That constraint is doing real work: it is very hard to
 * smuggle a professional conclusion into something phrased as a question.
 * ======================================================================== */

import type { ProjectContext } from './projectContext'
import { answerState } from './projectContext'

export type IdeationQuestion = {
  id: string
  /** Always phrased as a question. Enforced by test. */
  question: string
  /** Why it is being asked. Plain, and never a claim about the product. */
  because: string
  /** Which workspace section it belongs to, for the jump-back link. */
  section: string
}

type Rule = {
  id: string
  question: string
  because: string
  section: string
  /** True when the question is worth asking. */
  when: (ctx: Ctx) => boolean
}

/** Read helpers, so rules stay one line each and obviously correct. */
type Ctx = {
  /** A field has a usable value and is not marked unknown. */
  has: (id: string) => boolean
  /** Any of these words appear in the visitor's own text or choices. */
  mentions: (...needles: string[]) => boolean
  /** A multi-select contains an option. */
  chose: (id: string, option: string) => boolean
}

function makeCtx(context: ProjectContext): Ctx {
  const raw = (id: string) => context.answers[id]

  const has = (id: string) => {
    const answer = raw(id)
    if (!answer) return false
    if (answerState(answer) === 'unknown') return false
    return Array.isArray(answer.value) ? answer.value.length > 0 : answer.value.trim().length > 0
  }

  const haystack = Object.values(context.answers)
    .map((a) => (Array.isArray(a.value) ? a.value.join(' ') : a.value))
    .join(' ')
    .toLowerCase()

  const mentions = (...needles: string[]) => needles.some((n) => haystack.includes(n))

  const chose = (id: string, option: string) => {
    const answer = raw(id)
    if (!answer || !Array.isArray(answer.value)) return false
    return answer.value.includes(option)
  }

  return { has, mentions, chose }
}

/**
 * The ruleset.
 *
 * Deliberately shallow: each rule looks at whether something is missing, or
 * at one thing the visitor said, and asks about it. No rule combines more
 * than two signals, because a rule that needs a paragraph of logic is a rule
 * that is starting to draw conclusions.
 */
const RULES: readonly Rule[] = [
  /* --- Missing information ------------------------------------------- */
  {
    id: 'no-user',
    question: 'Who is the primary user?',
    because: 'Almost every later decision — size, cost, durability, how it is sold — resolves differently depending on who it is for.',
    section: 'person',
    when: (c) => !c.has('person.user'),
  },
  {
    id: 'no-problem',
    question: 'What problem does this solve, and for whom?',
    because: 'Without it, there is no way to judge which trade-offs are acceptable later.',
    section: 'problem',
    when: (c) => !c.has('problem.statement'),
  },
  {
    id: 'no-function',
    question: 'What is the one thing the product must do?',
    because: 'The essential function is what everything else gets traded against.',
    section: 'product',
    when: (c) => !c.has('product.function'),
  },
  {
    id: 'no-quantity',
    question: 'What production volume should this eventually be planned around?',
    because: 'Quantity changes process, tooling and cost more than almost any other single decision.',
    section: 'reality',
    when: (c) => !c.has('reality.quantity'),
  },
  {
    id: 'no-price',
    question: 'Is there a target retail price or unit-cost constraint?',
    because: 'A cost ceiling set later usually arrives after the decisions that determined the cost.',
    section: 'reality',
    when: (c) => !c.has('reality.price'),
  },
  {
    id: 'no-environment',
    question: 'Where will the product actually be used?',
    because: 'Environment drives material, sealing and durability decisions early.',
    section: 'person',
    when: (c) => !c.has('person.environment'),
  },

  /* --- Prompted by something the visitor said ------------------------ */
  {
    id: 'electronics-power',
    question: 'How is the product expected to be powered?',
    because: 'You mentioned electronics. How power arrives — battery, mains, charging — shapes size, cost and certification early.',
    section: 'product',
    when: (c) =>
      (c.chose('product.elements', 'Electronics') || c.mentions('electronic', 'circuit', 'pcb')) &&
      !c.chose('product.elements', 'A battery or power source') &&
      !c.mentions('battery', 'rechargeable', 'mains', 'usb', 'plug', 'powered by'),
  },
  {
    id: 'food-contact-materials',
    question: 'Which materials are acceptable for the parts that touch food or drink?',
    because: 'You mentioned food or drink contact. Material choice there is usually constrained before design begins.',
    section: 'reality',
    when: (c) =>
      (c.chose('product.elements', 'Contact with food or drink') ||
        c.mentions('coffee', 'espresso', 'food', 'drink', 'kitchen')) &&
      !c.has('reality.regulatory'),
  },
  {
    id: 'skin-contact',
    question: 'How long is the product in contact with skin, and how is it cleaned?',
    because: 'You mentioned skin or body contact. Duration and cleaning drive material and finish decisions.',
    section: 'product',
    when: (c) =>
      c.chose('product.elements', 'Contact with skin or body') ||
      c.mentions('wearable', 'worn', 'strap', 'on the wrist'),
  },
  {
    id: 'liquids-sealing',
    question: 'What does the product need to keep out, or keep in?',
    because: 'You mentioned liquids. Sealing is one of the earliest decisions that is expensive to change.',
    section: 'product',
    when: (c) =>
      c.chose('product.elements', 'Liquids') || c.mentions('waterproof', 'water resistant', 'ip67'),
  },
  {
    id: 'outdoor-conditions',
    question: 'What conditions does it have to survive outdoors?',
    because: 'You described outdoor use. Temperature, moisture and UV each pull material choice in different directions.',
    section: 'person',
    when: (c) => c.mentions('outdoor', 'camping', 'camper', 'hiking', 'trail', 'field use'),
  },
  {
    id: 'app-scope',
    question: 'What does the software have to do that the product cannot do on its own?',
    because: 'You mentioned software or an app. Its scope is usually decided much later than it should be.',
    section: 'product',
    when: (c) =>
      c.chose('product.elements', 'Software or an app') || c.mentions('app', 'bluetooth', 'firmware'),
  },
  {
    id: 'prototype-learning',
    question: 'What has the prototype already proven or disproven?',
    because: 'Something physical already exists. What it settled decides where development should pick up.',
    section: 'current-state',
    when: (c) =>
      (c.chose('state.artifacts', 'A prototype') ||
        c.chose('state.artifacts', 'A functional prototype')) &&
      !c.has('state.notes'),
  },
  {
    id: 'supplier-commitments',
    question: 'What has already been agreed with the suppliers involved?',
    because: 'Existing supplier conversations can constrain design decisions that have not been made yet.',
    section: 'reality',
    when: (c) => c.chose('state.artifacts', 'Supplier conversations') && !c.has('reality.existing'),
  },
  {
    id: 'nonnegotiable',
    question: 'What must not be lost to cost or manufacturing?',
    because: 'Naming it early is what protects it when trade-offs start.',
    section: 'product',
    when: (c) => c.has('product.function') && !c.has('product.nonnegotiable'),
  },
  {
    id: 'assumptions-to-confirm',
    question: 'Which of the assumptions recorded here need confirming first?',
    because: 'Some answers are marked as assumptions rather than facts. Which ones matter most is worth deciding deliberately.',
    section: 'reality',
    when: (c) => c.has('__assumed__'),
  },
]

/**
 * Derives the questions worth asking from what the visitor has written.
 *
 * Deduplicated by rule id by construction — each rule contributes at most one
 * question — and returned in a stable order so the brief does not reshuffle
 * while someone is reading it.
 */
export function deriveQuestions(context: ProjectContext): IdeationQuestion[] {
  const ctx = makeCtx(context)
  /* `__assumed__` is a synthetic signal rather than a field: it is true when
     any answer was marked as an assumption. Kept here so the rules stay a
     flat list of one-line predicates. */
  const hasAssumption = Object.values(context.answers).some((a) => answerState(a) === 'assumed')
  const augmented: Ctx = {
    ...ctx,
    has: (id: string) => (id === '__assumed__' ? hasAssumption : ctx.has(id)),
  }

  const seen = new Set<string>()
  const out: IdeationQuestion[] = []
  for (const rule of RULES) {
    if (seen.has(rule.id)) continue
    if (!rule.when(augmented)) continue
    seen.add(rule.id)
    out.push({
      id: rule.id,
      question: rule.question,
      because: rule.because,
      section: rule.section,
    })
  }
  return out
}

/** Exposed for the test that asserts every rule asks rather than concludes. */
export const questionRules = RULES.map((r) => ({
  id: r.id,
  question: r.question,
  because: r.because,
  section: r.section,
}))

export const questionsCopy = {
  eyebrow: 'Questions to resolve',
  lines: ["What don't", 'we know yet?'],
  lead: 'These come from what you have written — nothing here is a Phoenix Rising conclusion about your product. They are things worth thinking about, and good material for a first conversation.',
  empty: 'Nothing outstanding from what you have entered so far. Adding more detail will usually surface more questions, not fewer.',
} as const
