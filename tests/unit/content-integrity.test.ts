import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { capabilityFamilies, claimDispositions, quarantinedClaims } from '@/data/capabilities'
import { processStages } from '@/data/process'
import { whyPhoenix } from '@/data/site'

/**
 * Guards the Phase 0 content rules.
 *
 * These assert business-integrity properties rather than implementation
 * detail: the site must not present unverified capabilities as approved ones,
 * must not display fabricated statistics, and must not claim a submission was
 * delivered while no delivery is configured.
 */

describe('the Round 1 capability claims are all accounted for', () => {
  /* Phase 0 quarantined nine claims behind a visible "Unverified" marker.
     Phase 1 and Phase 4 removed four as their sections were retired. Phase 6
     dispositioned the remaining six individually — every one is REMOVED,
     REFRAMED or still QUARANTINED, and not one was verified, because
     verification needs client evidence and cannot be inferred. */
  it('dispositions all six remaining claims, and verifies none', () => {
    expect(claimDispositions.map((c) => c.id).sort()).toEqual([
      'certification-support',
      'manufacturing-feasibility',
      'mechanical-engineering',
      'production-tooling',
      'supplier-audit',
      'tolerance-analysis',
    ])
    for (const c of claimDispositions) {
      expect(['removed', 'reframed', 'quarantined']).toContain(c.disposition)
      expect(c.rationale.length, `${c.id} has no rationale`).toBeGreaterThan(40)
    }
  })

  it('cannot express a verified disposition at all', () => {
    /* Guards the rule rather than trusting it: if `verified` ever becomes a
       value this data can hold, a future edit could promote a claim without
       any evidence entering the repository. */
    const source = readFileSync('src/data/capabilities.ts', 'utf8')
    expect(source).not.toMatch(/disposition:\s*'verified'/)
    expect(source).toMatch(/ClaimDisposition\s*=\s*'removed'\s*\|\s*'reframed'\s*\|\s*'quarantined'/)
  })

  it('renders no quarantined claim anywhere on the site', () => {
    /* Phases 0-5 published quarantined claims behind a marker. Under "claim
       less, show more" they are simply not published — a marker still puts
       the words in front of a reader. */
    const rendered = JSON.stringify(capabilityFamilies).toLowerCase()
    for (const forbidden of [
      'certification support',
      'certification',
      'tolerance analysis',
      'stack-up',
      'mould-flow',
      'mold flow',
      'supplier audit',
      'audited in person',
    ]) {
      expect(rendered, `capability copy asserts "${forbidden}"`).not.toContain(forbidden)
    }
    expect(quarantinedClaims.length).toBeGreaterThan(0)
  })

  /* Phase 1 protection, preserved through the Phase 6 restructure. The
     manufacturing-oversight pillar asserted physical presence during
     production; it was deleted, not verified, when the why-us section was
     recast from five pillars into three principles. */
  it('does not reassert the removed manufacturing-presence claim', () => {
    const prose = whyPhoenix.pillars.map((p) => `${p.title} ${p.body}`).join(' ')
    expect(prose).not.toMatch(/we are present|process audits|in-line checks/i)
    const ids: readonly string[] = whyPhoenix.pillars.map((p) => p.id)
    expect(ids).not.toContain('manufacturing-oversight')
  })

  it('no longer ships the Round 1 capability taxonomy', () => {
    const ids = capabilityFamilies.map((f) => f.id)
    expect(ids).toEqual(['develop', 'prototype', 'produce', 'deliver'])
    expect(existsSync('src/components/sections/CapabilityStory.tsx')).toBe(false)
    expect(existsSync('src/app/capabilities/[slug]/page.tsx')).toBe(false)
  })
})

describe('fabricated statistics are gone', () => {
  it('has no stats data module', () => {
    expect(existsSync('src/data/stats.ts')).toBe(false)
  })

  it('has no stats components', () => {
    expect(existsSync('src/components/sections/Stats.tsx')).toBe(false)
    expect(existsSync('src/components/motion/StatCounter.tsx')).toBe(false)
  })

  it('does not render placeholder XX figures anywhere', () => {
    const home = readFileSync('src/app/page.tsx', 'utf8')
    const about = readFileSync('src/app/about/page.tsx', 'utf8')
    expect(home).not.toMatch(/Stats/)
    expect(about).not.toMatch(/Stats/)
  })
})

describe('submission copy does not claim delivery', () => {
  const form = readFileSync('src/components/sections/ProjectIntakeForm.tsx', 'utf8')

  it('never states the enquiry was received by Phoenix Rising', () => {
    expect(form).not.toMatch(/we have it/i)
    expect(form).not.toMatch(/submitted to phoenix/i)
    expect(form).not.toMatch(/we'?ll be in touch/i)
    expect(form).not.toMatch(/expect a reply/i)
  })

  it('states plainly that delivery is not connected', () => {
    expect(form).toMatch(/not connected|has not reached/i)
  })
})

describe('five-stage development model', () => {
  it('is exactly the approved five stages, in order', () => {
    expect(processStages.map((s) => s.id)).toEqual([
      'ideation-definition',
      'engineering-rd',
      'prototype-readiness',
      'short-run',
      'long-run',
    ])
    expect(processStages.map((s) => s.index)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('does not ship the Round 1 seven-stage model', () => {
    const titles = processStages.map((s) => s.title.toLowerCase())
    /* Round 1 stages that no longer exist as standalone steps. */
    for (const retired of ['discovery', 'tooling', 'quality control', 'delivery']) {
      expect(titles, `retired stage "${retired}" still present`).not.toContain(retired)
    }
  })

  it('names a conceptual output per stage and says it is not a deliverable', async () => {
    const { outputNote } = await import('@/data/process')
    for (const stage of processStages) {
      expect(stage.output.length, `${stage.id} has no output`).toBeGreaterThan(4)
    }
    expect(outputNote).toMatch(/not a fixed list|agreed per project/i)
  })

  it('routes stage CTAs into the matching Phase 3 journeys', () => {
    const ctas = Object.fromEntries(
      processStages.filter((s) => s.cta).map((s) => [s.id, s.cta!.href]),
    )
    expect(ctas['ideation-definition']).toBe('/ideate')
    expect(ctas['prototype-readiness']).toBe('/start/prototype')
    expect(ctas['long-run']).toBe('/start/production')
    /* Used sparingly — not every stage gets one. */
    expect(Object.keys(ctas).length).toBeLessThan(processStages.length)
  })

  it('presents the sequence as typical rather than mandatory', async () => {
    const { processIntro } = await import('@/data/process')
    expect(processIntro.note).toMatch(/rarely run it identically|not a fixed/i)
  })

  it('states that short-run specifics are product-dependent', async () => {
    const { shortRunCaveat } = await import('@/data/process')
    expect(shortRunCaveat).toMatch(/depend on the specific product/i)
    expect(shortRunCaveat.toLowerCase()).not.toMatch(/minimum|moq|\d+\s*units/)
  })

  it('introduces no quantity, capacity, certification or timing claims', () => {
    const text = JSON.stringify(processStages).toLowerCase()
    for (const forbidden of [
      'we guarantee',
      'minimum order',
      'moq',
      'certified',
      'iso ',
      'lead time of',
      'our factories',
      'unlimited',
      'always includes',
    ]) {
      expect(text, `process copy contains "${forbidden}"`).not.toContain(forbidden)
    }
  })
})

describe('the space between design and delivery', () => {
  it('frames every layer as a question, not a service performed', async () => {
    const { spaceBetween } = await import('@/data/spaceBetween')
    for (const layer of spaceBetween.layers) {
      expect(layer.question, `${layer.id} is not phrased as a question`).toMatch(/\?$/)
    }
  })

  it('does not claim tolerance analysis or tooling manufacture', async () => {
    const { spaceBetween } = await import('@/data/spaceBetween')
    const text = JSON.stringify(spaceBetween).toLowerCase()
    for (const forbidden of [
      'we perform',
      'stack-up analysis',
      'we manufacture the tool',
      'our tooling',
      'we audit',
      'we inspect',
    ]) {
      expect(text, `space-between copy contains "${forbidden}"`).not.toContain(forbidden)
    }
  })

  it('avoids an unsupported quantitative claim about the decisions', async () => {
    const { spaceBetween } = await import('@/data/spaceBetween')
    const text = spaceBetween.body.join(' ').toLowerCase()
    expect(text).toMatch(/chain of decisions/)
    expect(text).not.toMatch(/hundreds|thousands/)
  })
})
