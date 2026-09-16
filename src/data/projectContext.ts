/* ===========================================================================
 * PROJECT CONTEXT
 * ---------------------------------------------------------------------------
 * The shared shape of what we know about a visitor's project.
 *
 * This is deliberately not form state. The intake forms populate it, the
 * review screen reads it, and Phoenix Intelligence will eventually both read
 * and extend it — so answers must not be trapped in component-local state.
 *
 * PROVENANCE is the load-bearing idea. Every field records where its value
 * came from, so a suggestion can never be mistaken for something the visitor
 * told us. Phase 3 produces only `user` and `unknown`; `ai` exists so that
 * when the Ideation Workspace lands it has somewhere truthful to put its
 * output rather than silently blending into user-supplied fact.
 * ======================================================================== */

export type Provenance = 'user' | 'ai' | 'unknown'

export type Answer<T = string | string[]> = {
  value: T
  provenance: Provenance
}

/** Which of the three journeys the visitor selected. */
export type ProjectStage = 'idea' | 'prototype' | 'production'

export type ProjectContext = {
  /** Selected at /start. Determines which intake, if any, follows. */
  stage: ProjectStage | null
  /** Keyed by field id. Sparse — absent means never answered. */
  answers: Record<string, Answer>
  /** Set when the visitor reaches the review step. */
  startedAt: string | null
  updatedAt: string | null
}

export function createProjectContext(stage: ProjectStage | null = null): ProjectContext {
  return { stage, answers: {}, startedAt: null, updatedAt: null }
}

export function setAnswer(
  context: ProjectContext,
  id: string,
  value: string | string[],
  provenance: Provenance = 'user',
): ProjectContext {
  const isEmpty = Array.isArray(value) ? value.length === 0 : value.trim() === ''
  const answers = { ...context.answers }

  if (isEmpty) delete answers[id]
  else answers[id] = { value, provenance }

  return {
    ...context,
    answers,
    startedAt: context.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function getAnswer(context: ProjectContext, id: string): string | string[] | undefined {
  return context.answers[id]?.value
}

/** Display helper — "Not sure" and unanswered are different things. */
export function describeAnswer(context: ProjectContext, id: string): string {
  const answer = context.answers[id]
  if (!answer) return 'Not provided'
  return Array.isArray(answer.value) ? answer.value.join(', ') : answer.value
}

/** Everything the visitor did not answer, for the brief's open-questions list. */
export function unansweredFields(context: ProjectContext, fieldIds: string[]): string[] {
  return fieldIds.filter((id) => !(id in context.answers))
}

/**
 * Serialisable form, for the submission seam and for session persistence.
 * Kept explicit rather than JSON.stringify of the whole object so the wire
 * shape is a deliberate decision rather than an implementation detail.
 */
export type SerialisedProjectContext = {
  stage: ProjectStage | null
  answers: { id: string; value: string | string[]; provenance: Provenance }[]
  startedAt: string | null
  updatedAt: string | null
}

export function serialiseProjectContext(context: ProjectContext): SerialisedProjectContext {
  return {
    stage: context.stage,
    answers: Object.entries(context.answers).map(([id, answer]) => ({
      id,
      value: answer.value,
      provenance: answer.provenance,
    })),
    startedAt: context.startedAt,
    updatedAt: context.updatedAt,
  }
}

export function deserialiseProjectContext(raw: SerialisedProjectContext): ProjectContext {
  return {
    stage: raw.stage,
    answers: Object.fromEntries(
      raw.answers.map((entry) => [entry.id, { value: entry.value, provenance: entry.provenance }]),
    ),
    startedAt: raw.startedAt,
    updatedAt: raw.updatedAt,
  }
}
