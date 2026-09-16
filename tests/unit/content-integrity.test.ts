import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { capabilities } from '@/data/capabilities'
import { processSteps } from '@/data/process'
import { ipSystem } from '@/data/ipSystem'
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

  it('flags the inferred process activities', () => {
    const pending = processSteps
      .flatMap((s) => s.activities)
      .filter((a) => a.verification === 'pending')
      .map((a) => a.text)

    expect(pending).toHaveLength(3)
    expect(pending.join(' ')).toMatch(/PCB layout and firmware/)
    expect(pending.join(' ')).toMatch(/mould-flow analysis/)
    /* Found during Phase 1: the same in-person production claim that was
       removed from the why-us pillars also sat in the quality-control stage.
       Quarantined rather than left inconsistent. */
    expect(pending.join(' ')).toMatch(/In-line process audits/)
  })

  it('flags the IP approach', () => {
    expect(ipSystem.verification).toBe('pending')
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
