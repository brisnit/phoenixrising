import type { IntakeStep } from '@/data/intake'
import type { ProjectContext } from '@/data/projectContext'

/**
 * Validation for one step.
 *
 * Deliberately minimal: only required fields and email shape. The intake asks
 * about projects that are, by definition, not yet fully defined — inventing
 * precision the visitor does not have is the failure mode to avoid, so
 * "Not sure" is a valid answer everywhere it is offered and nothing else is
 * policed.
 */
export type Errors = Record<string, string>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateStep(step: IntakeStep, context: ProjectContext): Errors {
  const errors: Errors = {}

  for (const field of step.fields) {
    const raw = context.answers[field.id]?.value
    const isEmpty =
      raw === undefined || (Array.isArray(raw) ? raw.length === 0 : String(raw).trim() === '')

    if (field.required && isEmpty) {
      errors[field.id] =
        field.type === 'radio' || field.type === 'multi'
          ? 'Choose an option to continue'
          : 'This one we do need'
      continue
    }

    if (field.type === 'email' && !isEmpty && !EMAIL.test(String(raw).trim())) {
      errors[field.id] = 'That does not look like an email address'
    }
  }

  return errors
}

export const hasErrors = (errors: Errors): boolean => Object.keys(errors).length > 0
