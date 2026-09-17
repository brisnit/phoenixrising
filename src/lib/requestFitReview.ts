/**
 * FIT REVIEW REQUEST SEAM
 * -----------------------------------------------------------------------
 * The typed shape of a future handoff, and nothing more.
 *
 * THIS FUNCTION DOES NOT SEND ANYTHING. It does not call an API, queue a job,
 * write a record or dispatch an email, and it never returns a success. It
 * exists so the boundary is a deliberate, documented decision rather than
 * something improvised later under deadline — and so the UI has a single
 * honest thing to read when deciding what to tell a visitor.
 *
 * `available: false` is the accurate description of a system with no
 * destination configured. It is not an error, and callers must not present it
 * as one: the visitor has not failed to do anything.
 *
 * The one rule for whoever connects this: change the UI copy in the SAME
 * commit. `completionCopy` in data/intake.ts and the notices in
 * data/onboarding.ts both describe the unconnected state in plain words.
 * Wiring a destination without rewriting them turns truthful copy into a lie
 * in the other direction.
 *
 * To connect a destination:
 *   const res = await fetch('/api/fit-review', {
 *     method: 'POST',
 *     headers: { 'content-type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   })
 *   return res.ok
 *     ? { available: true, received: true, reference: await res.text() }
 *     : { available: true, received: false, error: 'delivery failed' }
 */

import {
  serialiseProjectContext,
  type ProjectContext,
  type SerialisedProjectContext,
} from '@/data/projectContext'

export type FitReviewRequest = {
  context: SerialisedProjectContext
  /** Set by the caller when a destination exists. Never today. */
  requestedAt: string | null
}

export type FitReviewResult =
  /* No destination configured. The only result reachable today. */
  | { available: false; received: false; reason: string; payload: FitReviewRequest }
  /* Reserved for when delivery exists. Nothing returns these yet. */
  | { available: true; received: true; reference: string }
  | { available: true; received: false; error: string }

/**
 * Prepares a fit-review request and reports that it cannot be sent.
 *
 * Returns the payload so a caller can show the visitor exactly what WOULD be
 * sent — which is the honest version of a submit button when there is nothing
 * to submit to.
 */
export async function requestFitReview(context: ProjectContext): Promise<FitReviewResult> {
  const payload: FitReviewRequest = {
    context: serialiseProjectContext(context),
    requestedAt: null,
  }

  return {
    available: false,
    received: false,
    reason:
      'No fit review destination is configured. Nothing has been sent to Phoenix Rising.',
    payload,
  }
}

/**
 * Whether the site may describe a fit review as something that can be
 * requested from the browser.
 *
 * Components branch on this rather than hard-coding the copy, so connecting a
 * destination flips the language in one place instead of several.
 */
export const FIT_REVIEW_AVAILABLE = false
