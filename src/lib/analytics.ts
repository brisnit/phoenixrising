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
