/* ===========================================================================
 * MODEL PROVIDER BOUNDARY
 * ---------------------------------------------------------------------------
 * ⚠️  NO PROVIDER IS CONFIGURED, AND NONE HAS BEEN CHOSEN.
 *
 * The Phase 9 audit found: no AI SDK dependency, no API route or server
 * action anywhere in the repo before this phase, no `.env` or `.env.example`,
 * no provider credential in the environment, and no provider named in any
 * brief or in eight phases of git history.
 *
 * So this file defines the SHAPE of a model call and deliberately does not
 * make one. `resolveProvider()` returns null, the endpoint answers 503, and
 * Ask Phoenix stays behind its feature flag. Picking a vendor is a decision
 * with cost, data-handling and contractual consequences — it is not a
 * default to be quietly assumed by whoever writes the fetch call.
 *
 * TO CONNECT ONE
 *   1. Choose a provider and model, and say so.
 *   2. Add the SDK (or use fetch) and set the credential as a SERVER-ONLY
 *      environment variable — never one prefixed `NEXT_PUBLIC_`.
 *   3. Implement `complete()` below and return it from `resolveProvider()`.
 *   4. Flip `askPhoenix.enabled` in data/site.ts.
 *   5. Run the evaluation set in `tests/eval/ask-phoenix-eval.md` against the
 *      real model and read the answers. HTTP 200 is not quality.
 *
 * The rest of the system — retrieval, instructions, schema validation,
 * limits, the UI — is complete and tested against a mock provider, so step 3
 * is the only code that should need writing.
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

/**
 * The server-only credential name this build expects.
 *
 * Named here so the deployment requirement is discoverable from the code
 * rather than from memory. Nothing reads it yet.
 */
export const EXPECTED_CREDENTIAL_ENV = 'ASK_PHOENIX_API_KEY'

/**
 * Returns the configured provider, or null when there is none.
 *
 * Currently always null. It checks the environment anyway so that the day a
 * credential is added, the failure is "provider not implemented" rather than
 * silence — a configured key with no implementation is a misconfiguration
 * worth surfacing loudly.
 */
export function resolveProvider(): ModelProvider | null {
  const credential = process.env[EXPECTED_CREDENTIAL_ENV]
  if (!credential) return null

  /* A credential exists but no provider has been implemented. Returning null
     keeps the endpoint honest; the log line is for whoever set the key. */
  if (process.env.NODE_ENV !== 'production') {

    console.warn(
      `[ask-phoenix] ${EXPECTED_CREDENTIAL_ENV} is set but no provider is implemented. ` +
        'See src/lib/askPhoenix/provider.ts.',
    )
  }
  return null
}

/** Whether the feature can serve real answers. Read by the route and the UI. */
export const isProviderConfigured = (): boolean => resolveProvider() !== null
