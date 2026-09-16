import { describe, it, expect } from 'vitest'
import {
  verified,
  unverified,
  isVerified,
  renderClaim,
  verifiedValues,
  pendingClaims,
  type Claim,
} from '@/data/claim'

describe('Claim guard', () => {
  it('renders a verified value', () => {
    const c = verified('Guangzhou, China', 'client, 2026-09-15')
    expect(isVerified(c)).toBe(true)
    expect(renderClaim(c)).toBe('Guangzhou, China')
  })

  it('never renders an unverified value, even when draft wording exists', () => {
    const c = unverified<string>('awaiting confirmation', 'We operate 40 factories')
    expect(isVerified(c)).toBe(false)
    expect(renderClaim(c)).toBeNull()
  })

  it('filters a mixed list down to confirmed values only', () => {
    const claims: Claim<string>[] = [
      verified('Prototyping', 'client'),
      unverified('mould-flow simulation not confirmed', 'Mould-flow simulation'),
      verified('Factory coordination', 'client'),
    ]
    expect(verifiedValues(claims)).toEqual(['Prototyping', 'Factory coordination'])
    expect(pendingClaims(claims)).toEqual(['mould-flow simulation not confirmed'])
  })
})
