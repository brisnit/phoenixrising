import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { capabilities } from '@/data/capabilities'
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

describe('unverified capability claims are quarantined', () => {
  /* The eight claims identified in the Round 2 audit. Each was inferred
     during the Round 1 build from the reference site, not supplied by
     Phoenix Rising. Verification is expected to arrive later; until then
     every one must carry `verification: 'pending'`. */
  const EXPECTED_PENDING_DISCIPLINES = [
    'Mechanical engineering',
    'Tolerance analysis',
    'Manufacturing feasibility',
    'Production tooling',
    'Supplier identification and audit',
    'Certification support',
  ]

  it('flags every inferred capability discipline', () => {
    const pending = capabilities
      .flatMap((c) => c.disciplines)
      .filter((d) => d.verification === 'pending')
      .map((d) => d.title)

    expect(pending.sort()).toEqual([...EXPECTED_PENDING_DISCIPLINES].sort())
  })

  it('flags the inferred tolerance deliverable', () => {
    const pending = capabilities
      .flatMap((c) => c.deliverables)
      .filter((d) => d.verification === 'pending')
      .map((d) => d.text)

    expect(pending).toEqual(['Tolerance stack-up analysis'])
  })

  /* Phase 4 replaced the seven-stage Round 1 process with the approved
     five-stage development model. The three quarantined activities it carried
     — electronics/PCB/firmware, mould-flow analysis and in-line process
     audits — went with it. They were REMOVED BY A STRATEGY CHANGE, not
     verified, and must not reappear. */
  it('carries no quarantined capability in the process model', () => {
    const text = JSON.stringify(processStages).toLowerCase()
    for (const removed of [
      'pcb layout',
      'firmware',
      'mould-flow',
      'mold flow',
      'in-line process audit',
      'tolerance stack-up',
    ]) {
      expect(text, `process model reasserts "${removed}"`).not.toContain(removed)
    }
  })

  /* The IP / supply-chain section described a methodology Phoenix Rising never
     confirmed. Phase 4 deleted the section and its data outright because the
     Round 2 strategy does not position around it — again, removed rather than
     verified. */
  it('no longer ships the unverified IP methodology', async () => {
    const { existsSync } = await import('node:fs')
    expect(existsSync('src/data/ipSystem.ts')).toBe(false)
    expect(existsSync('src/components/sections/IPSystem.tsx')).toBe(false)
  })

  /* Phase 0 quarantined nine claims. Phase 1 recast the "why" section from
     five pillars into three principles, which removed the ninth — the
     manufacturing-oversight pillar asserting physical presence during
     production. It was deleted, not verified: no pillar may reassert it, and
     the principles that replaced it describe how the work is approached
     rather than what Phoenix Rising is physically doing. */
  it('does not reassert the removed manufacturing-presence claim', () => {
    const prose = whyPhoenix.pillars.map((p) => `${p.title} ${p.body}`).join(' ')
    expect(prose).not.toMatch(/we are present|process audits|in-line checks/i)
    const ids: readonly string[] = whyPhoenix.pillars.map((p) => p.id)
    expect(ids).not.toContain('manufacturing-oversight')
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
