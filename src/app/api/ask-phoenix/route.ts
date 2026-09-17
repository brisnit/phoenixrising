import { handleAsk } from '@/lib/askPhoenix/handler'

/**
 * POST /api/ask-phoenix
 *
 * The first server endpoint in this project. Everything before Phase 9 was
 * static, which is why the boundary is worth stating explicitly:
 *
 *   · Runs on the server only. A provider credential must never be read in a
 *     client component or prefixed NEXT_PUBLIC_.
 *   · Accepts POST only, with a bounded body.
 *   · Returns typed errors. No stack traces, no provider detail, no echo of
 *     internal configuration.
 *   · Is not cached — an answer depends on the question.
 *
 * No provider is configured, so this currently answers 503 `not-configured`
 * for every well-formed request. That is the truthful state of the system,
 * not a bug, and the UI reads it rather than pretending otherwise.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Refuse oversized bodies before reading them into memory. */
const MAX_BYTES = 32_000

export async function POST(request: Request): Promise<Response> {
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return json(413, { error: 'too-large', message: 'That request is too large.' })
  }

  let body: string
  try {
    body = await request.text()
  } catch {
    return json(400, { error: 'invalid-request', message: 'Malformed request.' })
  }

  const outcome = await handleAsk(body)
  return json(outcome.status, outcome.body)
}

/* Any other method is a mistake, and saying so is cheaper than a 500. */
export async function GET(): Promise<Response> {
  return json(405, { error: 'invalid-request', message: 'Use POST.' })
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  })
}
