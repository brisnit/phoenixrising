/* ===========================================================================
 * MODEL PROVIDER BOUNDARY — DEEPSEEK
 * ---------------------------------------------------------------------------
 * DeepSeek, reached through its OpenAI-compatible chat-completions endpoint.
 *
 * DIRECT HTTP, NO SDK. One POST with a JSON body is the whole integration.
 * Adding the OpenAI package to reach a compatible endpoint would pull a
 * dependency, its transitive tree and its own retry/streaming opinions into a
 * repo with four production dependencies, to save roughly fifteen lines. The
 * DeepSeek-specific parts — endpoint path, payload shape, response shape —
 * live only in `DeepSeekProvider` below, so another provider is a new class
 * implementing the same interface, not a rewrite.
 *
 * CONFIGURATION (server-only, never NEXT_PUBLIC_):
 *   ASK_PHOENIX_API_KEY   — the credential. Read here and nowhere else.
 *   ASK_PHOENIX_MODEL     — the model id, sent verbatim. Never defaulted:
 *                           silently substituting a model changes cost and
 *                           behaviour without anyone deciding to.
 *   ASK_PHOENIX_BASE_URL  — API root. Defaults to DeepSeek's documented
 *                           endpoint, which is public information rather
 *                           than a decision with consequences.
 *
 * Missing key or missing model means NO PROVIDER: `resolveProvider()` returns
 * null, the endpoint answers 503 `not-configured`, and the UI says so.
 * ======================================================================== */

export type ProviderMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export type ProviderRequest = {
  messages: ProviderMessage[]
  /** Hard ceiling on output size, for cost and latency. */
  maxOutputTokens: number
  /** Abort signal carrying the server-side timeout. */
  signal: AbortSignal
}

export type ProviderResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'timeout' | 'upstream'; detail: string }

export interface ModelProvider {
  readonly name: string
  complete(request: ProviderRequest): Promise<ProviderResult>
}

/** Server-only configuration names. Discoverable from the code, not memory. */
export const ENV = {
  key: 'ASK_PHOENIX_API_KEY',
  model: 'ASK_PHOENIX_MODEL',
  baseUrl: 'ASK_PHOENIX_BASE_URL',
} as const

/** DeepSeek's documented endpoint. Public, not a secret or a cost decision. */
const DEFAULT_BASE_URL = 'https://api.deepseek.com'

/**
 * DeepSeek over its OpenAI-compatible chat-completions API.
 *
 * `temperature` is low and `response_format` is JSON mode because this is not
 * a creative writing task: the handler parses the reply against a schema, and
 * a model being inventive with the envelope just produces a 502. JSON mode
 * requires the word "json" in the prompt, which the response contract in
 * `instructions.ts` provides.
 *
 * No reasoning mode. The configured model is sent verbatim; nothing here
 * enables extended thinking, which would add latency and cost to what should
 * feel like an interactive panel.
 */
class DeepSeekProvider implements ModelProvider {
  readonly name = 'deepseek'

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string,
  ) {}

  async complete({ messages, maxOutputTokens, signal }: ProviderRequest): Promise<ProviderResult> {
    let response: Response
    try {
      response = await fetch(`${this.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxOutputTokens,
          temperature: 0.2,
          stream: false,
          response_format: { type: 'json_object' },
        }),
        signal,
      })
    } catch (error) {
      /* An aborted request is our own timeout firing, not the provider's
         fault — the handler maps the two to different statuses. */
      const aborted = error instanceof Error && error.name === 'AbortError'
      return {
        ok: false,
        reason: aborted ? 'timeout' : 'upstream',
        detail: aborted ? 'aborted by server timeout' : 'network error reaching provider',
      }
    }

    if (!response.ok) {
      /* The status is useful for our own logs. The body is not repeated
         anywhere a visitor can see, and the handler discards `detail`. */
      let body = ''
      try {
        body = (await response.text()).slice(0, 500)
      } catch {
        /* Nothing to add. */
      }
      return {
        ok: false,
        reason: response.status === 408 || response.status === 504 ? 'timeout' : 'upstream',
        detail: `provider responded ${response.status}: ${body}`,
      }
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      return { ok: false, reason: 'upstream', detail: 'provider returned non-JSON envelope' }
    }

    const text = extractText(payload)
    if (text === null) {
      return { ok: false, reason: 'upstream', detail: 'provider envelope had no message content' }
    }
    return { ok: true, text }
  }
}

/** Pulls the assistant message out of an OpenAI-shaped envelope. */
function extractText(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) return null
  const content = (choices[0] as { message?: { content?: unknown } })?.message?.content
  return typeof content === 'string' && content.trim().length > 0 ? content : null
}

/**
 * Returns the configured provider, or null when configuration is incomplete.
 *
 * Fails closed on a missing MODEL as well as a missing key. A deployment with
 * a credential but no model would otherwise have to guess one, and guessing a
 * model is a cost and behaviour decision nobody made.
 */
export function resolveProvider(): ModelProvider | null {
  const apiKey = process.env[ENV.key]
  const model = process.env[ENV.model]

  if (!apiKey || !model) {
    if (apiKey && !model && process.env.NODE_ENV !== 'production') {
       
      console.warn(`[ask-phoenix] ${ENV.key} is set but ${ENV.model} is not. Refusing to guess a model.`)
    }
    return null
  }

  return new DeepSeekProvider(apiKey, model, process.env[ENV.baseUrl] || DEFAULT_BASE_URL)
}

/** Whether the feature can serve real answers. Read by the route and the UI. */
export const isProviderConfigured = (): boolean => resolveProvider() !== null

/** The model in use, for operational reporting. Never sent to the browser. */
export const configuredModel = (): string | null => process.env[ENV.model] ?? null
