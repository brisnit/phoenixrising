/* ===========================================================================
 * ANALYTICS EVENTS
 * ---------------------------------------------------------------------------
 * Typed event architecture with no vendor attached.
 *
 * `track` is a no-op by default. Connecting a provider later means
 * implementing one function — every call site is already in place and
 * type-checked, so nothing has to be hunted down or retrofitted.
 *
 * Events are named for what the visitor did, not for what a component
 * rendered, so they stay meaningful if the UI changes.
 * ======================================================================== */

export type AnalyticsEvent =
  | { name: 'START_PROJECT_OPENED' }
  | { name: 'PROJECT_STAGE_SELECTED'; stage: 'idea' | 'prototype' | 'production' }
  | { name: 'PROTOTYPE_INTAKE_STARTED' }
  | { name: 'PROTOTYPE_INTAKE_COMPLETED'; answered: number; total: number }
  | { name: 'PRODUCTION_INTAKE_STARTED' }
  | { name: 'PRODUCTION_INTAKE_COMPLETED'; answered: number; total: number }
  | { name: 'INTAKE_REVIEW_EDITED'; step: string }
  | { name: 'MANUAL_CONTACT_SELECTED'; from: string }
  /* Phase 9 — Ask Phoenix.
     NOTE: none of these carries project content or conversation text. An
     analytics payload is the easiest place for a visitor's product idea to
     leak out of the browser, so these record only that something happened,
     where, and how big. */
  | { name: 'ASK_PHOENIX_OPENED'; route: string; mode: 'understand' | 'develop' }
  | { name: 'ASK_PHOENIX_QUESTION_SENT'; mode: 'understand' | 'develop'; length: number }
  | { name: 'ASK_PHOENIX_RESPONSE_RECEIVED'; boundary: string; sources: number }
  | { name: 'ASK_PHOENIX_ERROR'; error: string }
  | { name: 'ASK_PHOENIX_SOURCE_OPENED'; sourceId: string }
  | { name: 'IDEATION_AI_CONTEXT_ENABLED' }
  | { name: 'IDEATION_SUGGESTION_ACCEPTED'; fieldId: string }
  | { name: 'IDEATION_SUGGESTION_EDITED'; fieldId: string }
  | { name: 'IDEATION_SUGGESTION_DISMISSED'; fieldId: string }

type Sink = (event: AnalyticsEvent) => void

/* Replace via `setAnalyticsSink` when a provider is chosen. Deliberately not
   reading from window or a global so there is nothing to mock in tests. */
let sink: Sink | null = null

export function setAnalyticsSink(next: Sink | null): void {
  sink = next
}

export function track(event: AnalyticsEvent): void {
  if (!sink) return
  try {
    sink(event)
  } catch {
    /* Analytics must never be able to break the page it is measuring. */
  }
}
