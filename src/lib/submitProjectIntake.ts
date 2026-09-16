/**
 * PROJECT INTAKE SUBMISSION SEAM
 * -----------------------------------------------------------------------
 * The single place a real destination gets connected — a route handler, a
 * transactional email service, or a CRM.
 *
 * NOTHING IS DELIVERED TODAY, and the UI says so plainly. `delivered: false`
 * is not a failure state: it is the accurate description of a system with no
 * destination configured. The completion screen reads this flag rather than
 * assuming success, so wiring up a backend cannot accidentally leave the copy
 * claiming something untrue — and removing one cannot silently start lying
 * the other way either.
 *
 * To connect a destination:
 *   const res = await fetch('/api/project-intake', {
 *     method: 'POST',
 *     headers: { 'content-type': 'application/json' },
 *     body: JSON.stringify(serialiseProjectContext(context)),
 *   })
 *   return { ok: res.ok, delivered: res.ok }
 *
 * and update completionCopy in data/intake.ts at the same time.
 */

import {
  serialiseProjectContext,
  type ProjectContext,
  type SerialisedProjectContext,
} from '@/data/projectContext'

export type IntakeResult =
  | { ok: true; delivered: boolean; payload: SerialisedProjectContext }
  | { ok: false; delivered: false; error: string }

export async function submitProjectIntake(context: ProjectContext): Promise<IntakeResult> {
  const payload = serialiseProjectContext(context)

  if (process.env.NODE_ENV === 'development') {
     
    console.info('[project-intake] captured locally, not delivered:', payload)
  }

  /* No destination is configured. The summary is prepared and held in the
     browser; it has not been sent anywhere. */
  return { ok: true, delivered: false, payload }
}
