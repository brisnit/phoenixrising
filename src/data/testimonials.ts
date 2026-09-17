/* ===========================================================================
 * TESTIMONIALS — SEAM ONLY
 * ---------------------------------------------------------------------------
 * Round 1 shipped a homepage carousel of four placeholder quotes:
 * `[Placeholder quote — a client describing...]` attributed to `[Client name]`,
 * `[Role]`, `[Company]`, behind a visible "Awaiting approved client quotes"
 * marker. It was honestly labelled and it was still quote-shaped furniture on
 * the most-visited page of the site. Phase 7 removed it.
 *
 * The same rule Phase 6 applied to projects applies here: publishing is
 * DERIVED, not declared. A testimonial appears only when it names a real
 * person and carries explicit approval to publish — there is no boolean to
 * flip and no placeholder to forget to replace.
 *
 * `publishedTestimonials` is empty, and no component renders testimonials at
 * all. When a real quote arrives, add it here and build the section then; an
 * empty carousel is not a seam worth maintaining.
 * ======================================================================== */

export type Testimonial = {
  id: string
  quote: string
  /** Real, named person. Anonymous praise is not evidence. */
  name: string
  role: string
  company: string
  /** Where the quote came from, and when it was given. */
  source: string
  /** Explicit permission from the named person to publish the quote. */
  approvedForPublication: boolean
}

/** A quote is publishable only with a named source and explicit approval. */
export const isPublishableTestimonial = (t: Testimonial) =>
  t.approvedForPublication && t.source.trim().length > 0 && !/^\[.*\]$/.test(t.name)

export const testimonials: readonly Testimonial[] = []

export const publishedTestimonials = testimonials.filter(isPublishableTestimonial)

/** What a real testimonial needs before it can go on the site. */
export const testimonialRequirements: readonly string[] = [
  'The quote itself, in the client’s own words',
  'The name and role of the person giving it',
  'The company, and permission to name it',
  'Explicit written approval to publish the quote and the attribution',
  'Where and when it was given, so it can be traced later',
] as const
