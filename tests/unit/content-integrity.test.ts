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

    expect(pending).toHaveLength(2)
    expect(pending.join(' ')).toMatch(/PCB layout and firmware/)
    expect(pending.join(' ')).toMatch(/mould-flow analysis/)
  })

  it('flags the manufacturing-oversight pillar and the IP approach', () => {
    const oversight = whyPhoenix.pillars.find((p) => p.id === 'manufacturing-oversight')
    expect(oversight && 'verification' in oversight && oversight.verification).toBe('pending')
    expect(ipSystem.verification).toBe('pending')
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
