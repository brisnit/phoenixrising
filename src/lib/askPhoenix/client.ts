/**
 * ASK PHOENIX — CLIENT
 * -----------------------------------------------------------------------
 * The browser half. Sends a question, gets a validated answer or a typed
 * failure. Holds no key, chooses no model, and sends no project data unless
 * the caller explicitly passes it in `develop` mode.
 */

import { track } from '@/lib/analytics'
import type {
  AskMode,
  AskPhoenixResponse,
  AskProjectContext,
  AskTurn,
} from './schema'

export type AskOutcome =
  | { ok: true; response: AskPhoenixResponse }
  | { ok: false; kind: 'not-configured' | 'error'; message: string }

export type AskArgs = {
  message: string
  mode: AskMode
  route: string
  history: AskTurn[]
  /** Only ever passed when the visitor has turned project awareness on. */
  project?: AskProjectContext | null
}

/** Client-side ceiling, so a hung request cannot leave the UI spinning. */
const CLIENT_TIMEOUT_MS = 30_000

export async function askPhoenix({
  message,
  mode,
  route,
  history,
  project = null,
}: AskArgs): Promise<AskOutcome> {
  track({ name: 'ASK_PHOENIX_QUESTION_SENT', mode, length: message.length })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS)

  try {
    const res = await fetch('/api/ask-phoenix', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      /* Project context is included only in develop mode. The server enforces
         this too — this is the belt, that is the braces. */
      body: JSON.stringify({
        message,
        mode,
        route,
        history,
        project: mode === 'develop' ? project : null,
      }),
      signal: controller.signal,
    })

    if (res.status === 503) {
      track({ name: 'ASK_PHOENIX_ERROR', error: 'not-configured' })
      return { ok: false, kind: 'not-configured', message: 'Ask Phoenix is not connected yet.' }
    }

    if (!res.ok) {
      track({ name: 'ASK_PHOENIX_ERROR', error: String(res.status) })
      return { ok: false, kind: 'error', message: 'Ask Phoenix could not answer.' }
    }

    const response = (await res.json()) as AskPhoenixResponse
    track({
      name: 'ASK_PHOENIX_RESPONSE_RECEIVED',
      boundary: response.boundary,
      sources: response.knowledgeSources.length,
    })
    return { ok: true, response }
  } catch {
    /* Abort, offline, DNS — all the same to a visitor. */
    track({ name: 'ASK_PHOENIX_ERROR', error: 'network' })
    return { ok: false, kind: 'error', message: 'Ask Phoenix could not answer.' }
  } finally {
    clearTimeout(timer)
  }
}
