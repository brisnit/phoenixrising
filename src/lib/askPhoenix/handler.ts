/* ===========================================================================
 * ASK PHOENIX — REQUEST HANDLER
 * ---------------------------------------------------------------------------
 * The whole server-side pipeline, kept out of the route file so it can be
 * tested directly against a mock provider without standing up a server.
 *
 * ORDER MATTERS. Size is checked before parsing, parsing before retrieval,
 * retrieval before the model call. A malformed or oversized request must
 * never reach a paid endpoint.
 * ======================================================================== */

import { allIdeationFields } from '@/data/ideation'
import { defaultRetriever, type KnowledgeRetriever } from '@/lib/knowledge/retriever'
import {
  buildKnowledgeBlock,
  buildProjectBlock,
  buildSystemInstruction,
  buildUserBlock,
} from './instructions'
import type { ModelProvider, ProviderMessage } from './provider'
import { resolveProvider } from './provider'
import {
  LIMITS,
  parseAskRequest,
  parseModelResponse,
  type AskPhoenixError,
  type AskPhoenixResponse,
} from './schema'

export type HandlerOutcome =
  | { status: 200; body: AskPhoenixResponse }
  | { status: 400 | 413 | 502 | 503 | 504; body: AskPhoenixError }

/** Server-side ceiling on how long a visitor waits. */
const TIMEOUT_MS = 25_000

/**
 * Output ceiling.
 *
 * Raised from 900 after the first real evaluation: every high-risk question
 * (material choice, safety, compliance, manufacturability) returned 502
 * `malformed`, because a careful hedged answer plus the JSON envelope — the
 * boundary, the sources array, the suggested questions — ran past 900 tokens
 * and the reply was clipped mid-string. The same questions succeeded when
 * the visitor forced brevity, which is what identified the cause.
 *
 * The instruction now also asks for concision, so this is headroom rather
 * than a licence to write essays.
 */
const MAX_OUTPUT_TOKENS = 1_600

export type HandlerDeps = {
  provider?: ModelProvider | null
  retriever?: KnowledgeRetriever
  now?: () => number
}

export async function handleAsk(rawBody: string, deps: HandlerDeps = {}): Promise<HandlerOutcome> {
  /* 1 — size, before anything is parsed. */
  if (rawBody.length > LIMITS.body) {
    return {
      status: 413,
      body: { error: 'too-large', message: 'That request is too large.' },
    }
  }

  /* 2 — shape. Note the client cannot supply instructions, a model name or
     knowledge; `parseAskRequest` simply does not read such fields. */
  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return { status: 400, body: { error: 'invalid-request', message: 'Malformed request.' } }
  }

  const request = parseAskRequest(json)
  if (!request) {
    return { status: 400, body: { error: 'invalid-request', message: 'Malformed request.' } }
  }

  /* 3 — provider. Checked before retrieval so an unconfigured deployment
     does no work and returns a truthful, specific status. */
  const provider = deps.provider === undefined ? resolveProvider() : deps.provider
  if (!provider) {
    return {
      status: 503,
      body: {
        error: 'not-configured',
        message: 'Ask Phoenix is not connected yet.',
      },
    }
  }

  /* 4 — retrieval over the approved corpus only. */
  const retriever = deps.retriever ?? defaultRetriever
  const retrieval = retriever.retrieve({
    text: request.message,
    route: request.route ?? undefined,
  })

  const allowedSourceIds = new Set(retrieval.hits.map((h) => h.entry.id))

  const messages: ProviderMessage[] = [
    { role: 'system', content: buildSystemInstruction(request.mode) },
    { role: 'system', content: buildKnowledgeBlock(retrieval.hits) },
  ]

  if (request.mode === 'develop' && request.project) {
    messages.push({
      role: 'system',
      content: buildProjectBlock(
        request.project,
        allIdeationFields.map((f) => f.id),
      ),
    })
  }

  for (const turn of request.history) {
    messages.push({ role: turn.role, content: turn.content })
  }
  messages.push({ role: 'user', content: buildUserBlock(request.message) })

  /* 5 — the call, with a hard timeout. */
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let result
  try {
    result = await provider.complete({
      messages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      signal: controller.signal,
    })
  } catch {
    /* A throwing provider is an upstream failure, never a stack trace to the
       visitor. */
    return { status: 502, body: { error: 'upstream', message: 'Ask Phoenix could not answer.' } }
  } finally {
    clearTimeout(timer)
  }

  if (!result.ok) {
    if (result.reason === 'timeout') {
      return { status: 504, body: { error: 'timeout', message: 'Ask Phoenix took too long to answer.' } }
    }
    /* Truncation is our ceiling, not the provider's failure. It surfaces to
       the visitor the same way — there is no partial answer worth showing —
       but it is reported distinctly so it stays diagnosable. */
    return result.reason === 'truncated'
      ? { status: 502, body: { error: 'malformed', message: 'Ask Phoenix could not answer.' } }
      : { status: 502, body: { error: 'upstream', message: 'Ask Phoenix could not answer.' } }
  }

  /* 6 — structured output, validated. Prose is never parsed for actions. */
  let parsed: unknown
  try {
    parsed = JSON.parse(stripCodeFence(result.text))
  } catch {
    return { status: 502, body: { error: 'malformed', message: 'Ask Phoenix could not answer.' } }
  }

  const response = parseModelResponse(parsed, allowedSourceIds)
  if (!response) {
    return { status: 502, body: { error: 'malformed', message: 'Ask Phoenix could not answer.' } }
  }

  /* Suggestions are an ideation-only affordance. Dropping them here rather
     than trusting the instruction means a model that ignores the rule still
     cannot put a write-target in front of a visitor who never opted in. */
  if (request.mode !== 'develop') {
    response.suggestedUpdates = []
  }

  /* A model answering with no retrieved knowledge must not be claiming
     Phoenix facts. If it says it is, the claim is unsupported by definition. */
  if (retrieval.empty && (response.boundary === 'phoenix' || response.boundary === 'mixed')) {
    response.boundary = 'unknown'
    response.knowledgeSources = []
  }

  return { status: 200, body: response }
}

/** Models often wrap JSON in ```json fences even when told not to. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim()
  if (!trimmed.startsWith('```')) return trimmed
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim()
}
