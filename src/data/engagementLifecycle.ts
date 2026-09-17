/* ===========================================================================
 * ENGAGEMENT LIFECYCLE — FUTURE-STATE MODEL
 * ---------------------------------------------------------------------------
 * ⚠️  NOTHING IN THIS FILE DESCRIBES THE CURRENT SYSTEM.
 *
 * This is a separate file precisely so that distinction cannot blur. The
 * lifecycle below is what a Phoenix Rising engagement will eventually move
 * through once there is a server, a record and a human process behind it.
 * None of that exists.
 *
 * WHAT ACTUALLY EXISTS TODAY is in `projectContext.ts`: answers a visitor
 * typed, held in one browser tab, delivered nowhere. That is not a project
 * record and it has no lifecycle state. `CURRENT_RUNTIME_STATE` below names
 * the only truthful description of it, and `assertNoServerState` exists so a
 * future edit cannot quietly start asserting otherwise.
 *
 * The rule: a type in this file may be referenced by documentation and by
 * tests. It may NOT be used to label anything a visitor sees, because every
 * value except the first would be a claim about a process that has not
 * happened.
 * ======================================================================== */

/**
 * The stages a real engagement will move through.
 *
 * Ordered. Each value is a state a HUMAN process puts a project into — none
 * is computed, and none is reachable from the browser today.
 */
export const ENGAGEMENT_LIFECYCLE = [
  /** Visitor is still filling things in. The only state reachable today. */
  'draft',
  /** Visitor has finished a summary. Still local — nothing has been sent. */
  'ready-for-review',
  /** A person at Phoenix Rising is reading it. Requires delivery to exist. */
  'fit-review',
  /** Both sides are agreeing what the work is. Requires a conversation. */
  'engagement-definition',
  /** Project information is being organised before work starts. */
  'onboarding',
  /** Development or manufacturing work is under way. */
  'active',
] as const

export type EngagementLifecycleState = (typeof ENGAGEMENT_LIFECYCLE)[number]

/**
 * The only state the shipped product can truthfully be in.
 *
 * A browser-local intake can reach `draft` and, once the visitor completes a
 * summary, `ready-for-review` — but `ready-for-review` describes the
 * VISITOR'S document, not a queue Phoenix Rising is working through. Every
 * later state requires something that does not exist.
 */
export const CURRENT_RUNTIME_STATE = {
  reachable: ['draft', 'ready-for-review'] as const,
  /** Needs delivery, a record and a person before it can be asserted. */
  requiresBackend: [
    'fit-review',
    'engagement-definition',
    'onboarding',
    'active',
  ] as const,
  description:
    'Answers held in one browser tab. Not delivered, not stored by Phoenix Rising, and not a project record.',
} as const

/** True when a state would claim something the current system cannot do. */
export const requiresBackend = (state: EngagementLifecycleState): boolean =>
  (CURRENT_RUNTIME_STATE.requiresBackend as readonly string[]).includes(state)

/* ---------------------------------------------------------------------------
 * FIT REVIEW CONTEXT — what a future human review would want to understand
 * ------------------------------------------------------------------------ */

/**
 * Where a piece of information came from.
 *
 * Extends the Phase 3 `Provenance` idea to the two values a review process
 * will eventually add. `ai-suggested` and `phoenix-reviewed` are declared so
 * they have somewhere truthful to live later — NOTHING PRODUCES THEM TODAY,
 * and a test asserts that.
 */
export type FitReviewProvenance =
  | 'user-provided'
  | 'unknown'
  | 'ai-suggested'
  | 'phoenix-reviewed'

/** Provenances the shipped system can actually produce. */
export const PRODUCIBLE_PROVENANCE: readonly FitReviewProvenance[] = [
  'user-provided',
  'unknown',
]

export type FitReviewField<T = string> = {
  value: T
  provenance: FitReviewProvenance
}

/**
 * The shape a human fit review would want in front of them.
 *
 * Every field is optional: the whole point of a fit review is that it happens
 * on incomplete information. A model that required a full picture would only
 * be satisfiable by inventing one.
 */
export type FitReviewContext = {
  project: {
    stage?: FitReviewField
    productDescription?: FitReviewField
    sector?: FitReviewField
    intendedCustomer?: FitReviewField
    targetMarket?: FitReviewField
  }
  currentState: {
    whatExists?: FitReviewField
    prototypeState?: FitReviewField
    productionState?: FitReviewField
    availableInformation?: FitReviewField<string[]>
  }
  goals: {
    needs?: FitReviewField<string[]>
    targetTiming?: FitReviewField
    expectedQuantity?: FitReviewField
    budgetContext?: FitReviewField
  }
  /** What nobody knows yet. Often the most useful part of the review. */
  openQuestions: {
    unknownInformation?: FitReviewField<string[]>
    missingDecisions?: FitReviewField<string[]>
    needsDiscussion?: FitReviewField<string[]>
  }
}
