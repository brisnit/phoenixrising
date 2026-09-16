/* ===========================================================================
 * CLAIM GUARD
 * ---------------------------------------------------------------------------
 * A small type for factual assertions about the business — the kind of
 * statement that would be wrong to publish before someone has confirmed it.
 *
 * SCOPE, deliberately narrow. This is NOT for ordinary marketing copy. Wrap
 * only things that would be a misrepresentation if untrue:
 *
 *   capabilities we claim to perform   locations and presence
 *   statistics and counts              certifications
 *   client and project outcomes        manufacturing capacity
 *   pricing and commercial terms       operational claims
 *
 * Everything else — positioning, section headings, explanatory prose — stays
 * as plain strings so the content layer remains pleasant to edit by hand.
 *
 * The point is that an unverified claim cannot be rendered by accident: the
 * union forces a caller either to handle the unverified branch or to route
 * the value through `renderClaim`, which substitutes a visible placeholder.
 * ======================================================================== */

export type Claim<T> =
  | { verified: true; value: T; source: string }
  | { verified: false; value?: T; awaiting: string }

/** A confirmed fact. `source` records who confirmed it, so it can be re-checked. */
export function verified<T>(value: T, source: string): Claim<T> {
  return { verified: true, value, source }
}

/**
 * An assertion awaiting confirmation.
 *
 * `value` may hold draft wording so nothing is lost, but it is never rendered
 * through the normal path — `renderClaim` returns null for it.
 */
export function unverified<T>(awaiting: string, value?: T): Claim<T> {
  return { verified: false, value, awaiting }
}

export function isVerified<T>(claim: Claim<T>): claim is { verified: true; value: T; source: string } {
  return claim.verified
}

/** The value if confirmed, otherwise null. Use this at every render site. */
export function renderClaim<T>(claim: Claim<T>): T | null {
  return claim.verified ? claim.value : null
}

/** Confirmed values only — for filtering lists of claims down to the publishable ones. */
export function verifiedValues<T>(claims: Claim<T>[]): T[] {
  return claims.filter(isVerified).map((c) => c.value)
}

/** Everything still awaiting confirmation, for the audit surface and tests. */
export function pendingClaims<T>(claims: Claim<T>[]): string[] {
  return claims.filter((c) => !c.verified).map((c) => (c as { awaiting: string }).awaiting)
}
