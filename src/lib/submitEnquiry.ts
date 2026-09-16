/**
 * INTEGRATION POINT
 * -----------------------------------------------------------------------
 * The project intake form is deliberately front-end only. This function is
 * the single place to wire in a real destination — a Next route handler, a
 * transactional email service, or a CRM.
 *
 * To connect a backend, replace the body below with a `fetch` to your API
 * route and keep the return shape. Nothing in the UI needs to change.
 *
 *   const res = await fetch('/api/enquiry', { method: 'POST', body: formData })
 *   if (!res.ok) throw new Error('Request failed')
 *   return { ok: true }
 */

export type EnquiryResult = { ok: true } | { ok: false; error: string }

export async function submitEnquiry(data: FormData): Promise<EnquiryResult> {
  if (process.env.NODE_ENV === 'development') {
     
    console.info('[enquiry] captured (no backend configured):', Object.fromEntries(data.entries()))
  }

  /* Simulated round-trip so the UI's pending state is exercised honestly. */
  await new Promise((resolve) => setTimeout(resolve, 900))

  return { ok: true }
}
