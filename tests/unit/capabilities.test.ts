import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  capabilitiesIntro,
  capabilityFamilies,
  claimDispositions,
  quarantinedClaims,
} from '@/data/capabilities'

/**
 * Guards the Phase 6 capability architecture.
 *
 * Round 1 shipped four capability pages listing roughly twenty-six named
 * technical disciplines, six of which were quarantined and none of which had
 * been confirmed. The replacement is four families describing what has to
 * happen to a product — which only stays honest if the copy keeps describing
 * *work* rather than drifting back into *services rendered*.
 *
 * Most of what follows is therefore vocabulary enforcement. It is blunt, and
 * blunt is correct here: the failure mode is a plausible sentence, added in
 * good faith, that quietly asserts a capability nobody confirmed.
 */

const RENDERED = JSON.stringify([capabilitiesIntro, capabilityFamilies]).toLowerCase()

describe('the four families', () => {
  it('is exactly develop, prototype, produce, deliver — in journey order', () => {
    expect(capabilityFamilies.map((f) => f.id)).toEqual([
      'develop',
      'prototype',
      'produce',
      'deliver',
    ])
    expect(capabilityFamilies.map((f) => f.index)).toEqual(['01', '02', '03', '04'])
  })

  it('carries the Round 1 taxonomy nowhere', () => {
    for (const retired of [
      'design for manufacturability',
      'prototyping + tooling',
      'quality + delivery',
      'dfm report',
      'scope of work',
    ]) {
      expect(RENDERED, `retired capability language "${retired}" is back`).not.toContain(retired)
    }
  })

  it('routes each family CTA into the matching journey', () => {
    const ctas = Object.fromEntries(
      capabilityFamilies.filter((f) => f.cta).map((f) => [f.id, f.cta!.href]),
    )
    expect(ctas.develop).toBe('/ideate')
    expect(ctas.prototype).toBe('/start/prototype')
    expect(ctas.produce).toBe('/start/production')
    /* DELIVER deliberately has none — there is no delivery journey, and
       inventing one would imply a service that was never described. */
    expect(ctas.deliver).toBeUndefined()
  })

  it('gives every family a distinct object state for the progression', () => {
    const labels = capabilityFamilies.map((f) => f.objectState.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('states the claim-less principle on the page, not just in a commit', () => {
    expect(capabilitiesIntro.principle.lines.join(' ')).toMatch(/claim less/i)
    expect(capabilitiesIntro.principle.lines.join(' ')).toMatch(/show more/i)
  })
})

describe('the copy describes work, not services performed', () => {
  it('publishes no quantity, capacity, timing or certification claim', () => {
    for (const forbidden of [
      'moq',
      'minimum order',
      'lead time of',
      'within 30 days',
      'capacity of',
      'units per',
      'iso ',
      'certified',
      'certification',
      'we guarantee',
      'guaranteed',
    ]) {
      expect(RENDERED, `capability copy publishes "${forbidden}"`).not.toContain(forbidden)
    }
  })

  it('claims no factory, line, personnel or facility as its own', () => {
    expect(RENDERED).not.toMatch(
      /\bour (factor|production line|engineer|inspector|facilit|plant|warehouse|supplier|tooling)/i,
    )
    for (const forbidden of ['factory count', 'our factories', 'in-house factory', 'owned facility']) {
      expect(RENDERED, `capability copy claims "${forbidden}"`).not.toContain(forbidden)
    }
  })

  it('makes no inspection claim', () => {
    /* Round 1's quality capability asserted incoming inspection, in-line
       checks, finished-goods inspection and golden-sample sign-off. None was
       ever confirmed, and none of it survived the restructure. */
    for (const forbidden of [
      'we inspect',
      'inspection report',
      'incoming inspection',
      'in-line inspection',
      'finished-goods inspection',
      'golden sample',
      'sampling plan',
      'we audit',
    ]) {
      expect(RENDERED, `capability copy asserts inspection: "${forbidden}"`).not.toContain(forbidden)
    }
  })

  it('does not reposition the company as a freight or logistics provider', () => {
    /* DELIVER is the family most likely to be misread this way, so it must
       say what it is not. */
    const deliver = capabilityFamilies.find((f) => f.id === 'deliver')!
    expect(deliver.caveat).toMatch(/not a freight forwarder|not a logistics/i)
    for (const forbidden of ['incoterms', 'customs documentation', 'customs clearance', 'freight forwarding']) {
      expect(RENDERED, `delivery copy claims "${forbidden}"`).not.toContain(forbidden)
    }
  })

  it('says plainly where an answer depends on the product', () => {
    const produce = capabilityFamilies.find((f) => f.id === 'produce')!
    expect(produce.caveat).toMatch(/depend on the specific product|per project/i)
  })

  it('keeps a prototype framed as a question rather than a validation', () => {
    const prototype = capabilityFamilies.find((f) => f.id === 'prototype')!
    expect(prototype.lead).toMatch(/question/i)
    /* The caveat exists specifically to stop the section implying that one
       prototype proves everything. */
    expect(prototype.caveat).toMatch(/no single prototype/i)
  })
})

describe('claim dispositions', () => {
  it('reports one disposition per claim, with a reason', () => {
    expect(claimDispositions).toHaveLength(6)
    const byDisposition = claimDispositions.reduce<Record<string, number>>((acc, c) => {
      acc[c.disposition] = (acc[c.disposition] ?? 0) + 1
      return acc
    }, {})
    /* Not asserting exact counts per bucket — those are editorial calls that
       may change. Asserting that nothing is unaccounted for. */
    expect(Object.values(byDisposition).reduce((a, b) => a + b, 0)).toBe(6)
  })

  it('keeps exactly the still-unverified claims in quarantine', () => {
    const quarantined = claimDispositions
      .filter((c) => c.disposition === 'quarantined')
      .map((c) => c.id)
      .sort()
    expect(quarantinedClaims.map((q) => q.id).sort()).toEqual(quarantined)
  })

  it('records what each quarantined claim needs in order to be resolved', () => {
    for (const q of quarantinedClaims) {
      expect(q.needs.length, `${q.id} does not say what it needs`).toBeGreaterThan(30)
    }
  })

  it('no longer renders the PendingTag on any capability', () => {
    /* The marker component still exists for future use, but the capabilities
       page must not need it — nothing unverified is published there. */
    const page = readFileSync('src/app/capabilities/page.tsx', 'utf8')
    const progression = readFileSync('src/components/sections/CapabilityProgression.tsx', 'utf8')
    expect(page).not.toMatch(/PendingTag/)
    expect(progression).not.toMatch(/PendingTag/)
  })
})
