/* ===========================================================================
 * ASK PHOENIX — WIRE SCHEMA AND VALIDATION
 * ---------------------------------------------------------------------------
 * Structured output, validated server-side. Nothing that can affect
 * application state is parsed out of model prose.
 *
 * Hand-written validators rather than a schema library: the shapes are small,
 * and adding a runtime dependency to validate four objects is not a trade
 * worth making in a repo with four production dependencies. If the schema
 * grows past this, swap in a library behind the same `parse*` functions.
 *
 * FAILS SAFE. Every validator returns `null` on anything unexpected — a
 * missing field, a wrong type, an unknown enum value, a suggestion targeting
 * a field that does not exist. The caller turns `null` into a visible error,
 * never into a partially-applied response.
 * ======================================================================== */

import { allIdeationFields } from '@/data/ideation'
import type { KnowledgeTopic } from '@/data/knowledge'

/* --------------------------------------------------------------- REQUEST */

export const LIMITS = {
  /** Longest single question. Generous for a paragraph, short of an essay. */
  message: 2_000,
  /** Total request body. */
  body: 32_000,
  /** Turns kept and sent. Older turns are dropped, not rejected. */
  historyTurns: 12,
  /** Longest project-context value forwarded per field. */
  contextValue: 1_500,
  /** Project-context fields forwarded at once. */
  contextFields: 40,
} as const

export type AskMode = 'understand' | 'develop'

export type AskTurn = { role: 'user' | 'assistant'; content: string }

/** The only project data the client may send, flattened and bounded. */
export type AskProjectContext = {
  section: string | null
  answers: { id: string; label: string; value: string; state: string }[]
  openQuestions: string[]
}

export type AskRequest = {
  message: string
  mode: AskMode
  /** Public route the panel was opened from. */
  route: string | null
  history: AskTurn[]
  /** Present only in `develop` mode, and only with explicit consent. */
  project: AskProjectContext | null
}

const isString = (v: unknown): v is string => typeof v === 'string'

const clamp = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s)

/**
 * Validates and bounds an incoming request.
 *
 * Returns `null` for anything malformed. Note what it does NOT do: it never
 * reads a system prompt, a model name, an instruction override or a knowledge
 * override from the client. Those are server-side decisions and a client that
 * sends them is ignored.
 */
export function parseAskRequest(raw: unknown): AskRequest | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>

  if (!isString(o.message)) return null
  const message = o.message.trim()
  if (message.length === 0 || message.length > LIMITS.message) return null

  const mode: AskMode = o.mode === 'develop' ? 'develop' : 'understand'
  const route = isString(o.route) ? clamp(o.route, 120) : null

  let history: AskTurn[] = []
  if (Array.isArray(o.history)) {
    history = o.history
      .filter(
        (t): t is AskTurn =>
          typeof t === 'object' &&
          t !== null &&
          ((t as AskTurn).role === 'user' || (t as AskTurn).role === 'assistant') &&
          isString((t as AskTurn).content),
      )
      .slice(-LIMITS.historyTurns)
      .map((t) => ({ role: t.role, content: clamp(t.content, LIMITS.message) }))
  }

  /* Project context is accepted ONLY in develop mode. A client asking a
     general question cannot smuggle project data into the request, which
     keeps the privacy boundary a server-side guarantee rather than a promise
     about client behaviour. */
  let project: AskProjectContext | null = null
  if (mode === 'develop' && typeof o.project === 'object' && o.project !== null) {
    const p = o.project as Record<string, unknown>
    const answers = Array.isArray(p.answers)
      ? p.answers
          .filter(
            (a): a is { id: string; label: string; value: string; state: string } =>
              typeof a === 'object' &&
              a !== null &&
              isString((a as { id: unknown }).id) &&
              isString((a as { value: unknown }).value),
          )
          .slice(0, LIMITS.contextFields)
          .map((a) => ({
            id: clamp(a.id, 80),
            label: clamp(isString(a.label) ? a.label : a.id, 120),
            value: clamp(a.value, LIMITS.contextValue),
            state: ['known', 'assumed', 'unknown'].includes(a.state) ? a.state : 'known',
          }))
      : []
    const openQuestions = Array.isArray(p.openQuestions)
      ? p.openQuestions.filter(isString).slice(0, 20).map((q) => clamp(q, 300))
      : []
    project = {
      section: isString(p.section) ? clamp(p.section, 60) : null,
      answers,
      openQuestions,
    }
  }

  return { message, mode, route, history, project }
}

/* -------------------------------------------------------------- RESPONSE */

/**
 * Which knowledge an answer rests on.
 *
 * `phoenix`  — grounded in the approved corpus. May state Phoenix facts.
 * `general`  — general product-development education. Must NOT be read as a
 *              description of Phoenix's service offering.
 * `mixed`    — both, with the parts distinguished in the answer.
 * `unknown`  — Phoenix has not published this. The answer says so.
 */
export type AnswerBoundary = 'phoenix' | 'general' | 'mixed' | 'unknown'

export const BOUNDARIES: readonly AnswerBoundary[] = ['phoenix', 'general', 'mixed', 'unknown']

export type KnowledgeSource = { id: string; label: string; route: string }

/**
 * A proposed change to the visitor's project context.
 *
 * `requiresApproval` is the literal `true`, matching the Phase 8 seam: a
 * suggestion cannot be expressed in a form that skips the visitor.
 */
export type AskSuggestedUpdate = {
  fieldId: string
  label: string
  value: string
  rationale: string
  requiresApproval: true
}

export type AskPhoenixResponse = {
  answer: string
  boundary: AnswerBoundary
  knowledgeSources: KnowledgeSource[]
  suggestedQuestions: string[]
  suggestedUpdates: AskSuggestedUpdate[]
}

/**
 * Validates model output.
 *
 * The strict part is `suggestedUpdates`: a suggestion naming a field that does
 * not exist in the ideation schema is dropped, so a model cannot invent a
 * place to write. Everything else degrades gracefully — a missing
 * `suggestedQuestions` becomes an empty list rather than a failed response.
 */
export function parseModelResponse(raw: unknown, allowedSourceIds: Set<string>): AskPhoenixResponse | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>

  if (!isString(o.answer) || o.answer.trim().length === 0) return null

  const boundary = BOUNDARIES.includes(o.boundary as AnswerBoundary)
    ? (o.boundary as AnswerBoundary)
    : null
  if (!boundary) return null

  /* Sources must be entries we actually retrieved. A model citing a page it
     was never given is inventing a provenance trail. */
  const knowledgeSources = Array.isArray(o.knowledgeSources)
    ? o.knowledgeSources
        .filter(
          (s): s is KnowledgeSource =>
            typeof s === 'object' &&
            s !== null &&
            isString((s as KnowledgeSource).id) &&
            allowedSourceIds.has((s as KnowledgeSource).id),
        )
        .slice(0, 6)
        .map((s) => ({
          id: s.id,
          label: clamp(isString(s.label) ? s.label : s.id, 80),
          route: isString(s.route) && s.route.startsWith('/') ? clamp(s.route, 120) : '/',
        }))
    : []

  const suggestedQuestions = Array.isArray(o.suggestedQuestions)
    ? o.suggestedQuestions.filter(isString).slice(0, 3).map((q) => clamp(q, 160))
    : []

  const validFieldIds = new Set(allIdeationFields.map((f) => f.id))
  const suggestedUpdates = Array.isArray(o.suggestedUpdates)
    ? o.suggestedUpdates
        .filter(
          (u): u is { fieldId: string; value: string; rationale?: string } =>
            typeof u === 'object' &&
            u !== null &&
            isString((u as { fieldId: unknown }).fieldId) &&
            validFieldIds.has((u as { fieldId: string }).fieldId) &&
            isString((u as { value: unknown }).value) &&
            (u as { value: string }).value.trim().length > 0,
        )
        .slice(0, 3)
        .map((u) => ({
          fieldId: u.fieldId,
          label: allIdeationFields.find((f) => f.id === u.fieldId)?.label ?? u.fieldId,
          value: clamp(u.value, LIMITS.contextValue),
          rationale: clamp(isString(u.rationale) ? u.rationale : '', 300),
          requiresApproval: true as const,
        }))
    : []

  return {
    answer: clamp(o.answer.trim(), 6_000),
    boundary,
    knowledgeSources,
    suggestedQuestions,
    suggestedUpdates,
  }
}

export type AskPhoenixError = {
  error: 'not-configured' | 'invalid-request' | 'too-large' | 'upstream' | 'timeout' | 'malformed'
  message: string
}

/** Topics, exported for the UI's starter questions. */
export type { KnowledgeTopic }
