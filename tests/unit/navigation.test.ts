import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import {
  navigation,
  footerGroups,
  primaryCta,
  secondaryCta,
  directContact,
  askPhoenix,
  finalCta,
} from '@/data/site'

describe('primary navigation', () => {
  it('matches the approved Round 2 hierarchy', () => {
    expect(navigation.map((item) => item.label)).toEqual([
      'How we develop products',
      'Capabilities',
      'Ideation workspace',
      'Projects',
      'About',
    ])
  })

  it('omits Insights, Contact and Onboarding', () => {
    const hrefs = navigation.map((item) => item.href)
    expect(hrefs).not.toContain('/insights')
    expect(hrefs).not.toContain('/contact')
    expect(hrefs).not.toContain('/onboarding')
  })

  it('points at canonical routes, never at redirected ones', () => {
    for (const item of navigation) {
      expect(item.href, `${item.label} uses a retired route`).not.toMatch(/^\/(process|work)(\/|$)/)
    }
  })
})

describe('entry points', () => {
  it('separates the structured journey from direct contact', () => {
    expect(primaryCta.href).toBe('/start')
    expect(directContact.href).toBe('/contact')
    expect(primaryCta.href).not.toBe(directContact.href)
  })

  it('sends "How we build" straight to the canonical development route', () => {
    expect(secondaryCta.label).toBe('How we build')
    expect(secondaryCta.href).toBe('/how-we-develop')
  })
})

describe('Ask Phoenix', () => {
  /* Phase 8. The shape exists so the header can adopt it without rework, but
     it must not be exposed until the experience answers. */
  it('stays disabled until the experience exists', () => {
    expect(askPhoenix.enabled).toBe(false)
  })
})

describe('footer', () => {
  it('keeps Insights reachable', () => {
    const hrefs = footerGroups.flatMap((g) => g.links.map((l) => l.href))
    expect(hrefs).toContain('/insights')
  })

  it('exposes every route the header omits', () => {
    const hrefs = new Set(footerGroups.flatMap((g) => g.links.map((l) => l.href)))
    for (const href of ['/insights', '/onboarding', '/contact', '/start', '/ideate']) {
      expect(hrefs, `footer should link to ${href}`).toContain(href)
    }
  })

  it('points at canonical routes only', () => {
    for (const group of footerGroups) {
      for (const link of group.links) {
        expect(link.href, `${link.label} uses a retired route`).not.toMatch(
          /^\/(process|work)(\/|$)/,
        )
      }
    }
  })
})

/**
 * "Start a project" is the structured journey. It must reach /start.
 *
 * This shipped wrong for five phases: `finalCta.primary` carried the label
 * "Start a project" and the href "/contact", and CTASection renders on ~20
 * routes — so the site's most repeated call to action contradicted the
 * navigation architecture Phase 2 established, on almost every page.
 *
 * Scanning the whole data layer rather than the one known offender is the
 * point: the defect was a single pair that nobody was comparing, and any
 * future data module can reintroduce it just as quietly.
 */
describe('the Start a project CTA can never route to contact', () => {
  /* Every {label, href} pair declared anywhere in src/data. */
  const pairs: { file: string; label: string; href: string }[] = []
  for (const file of readdirSync('src/data').filter((f) => f.endsWith('.ts'))) {
    const source = readFileSync(`src/data/${file}`, 'utf8')
    /* Matches both orders, since neither is enforced. */
    const forward = /label:\s*'([^']+)'\s*,\s*href:\s*'([^']+)'/g
    const reverse = /href:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'/g
    for (const m of source.matchAll(forward)) pairs.push({ file, label: m[1], href: m[2] })
    for (const m of source.matchAll(reverse)) pairs.push({ file, label: m[2], href: m[1] })
  }

  it('finds CTA pairs to check — otherwise this test proves nothing', () => {
    expect(pairs.length).toBeGreaterThan(8)
  })

  it('never pairs a "Start a project" label with /contact', () => {
    const offenders = pairs
      .filter((p) => /^start a project$/i.test(p.label.trim()))
      .filter((p) => p.href.startsWith('/contact'))
      .map((p) => `${p.file}: "${p.label}" -> ${p.href}`)

    expect(offenders, 'a Start-a-project CTA routes to /contact').toEqual([])
  })

  it('routes every "Start a project" label at /start', () => {
    const starts = pairs.filter((p) => /^start a project$/i.test(p.label.trim()))
    expect(starts.length, 'no Start a project CTA found at all').toBeGreaterThan(0)
    for (const p of starts) {
      expect(p.href, `${p.file}: "${p.label}" points at ${p.href}`).toBe('/start')
    }
  })

  it('fixes the shared closing CTA specifically', () => {
    expect(finalCta.primary.label).toBe('Start a project')
    expect(finalCta.primary.href).toBe('/start')
  })

  it('leaves genuine contact actions alone', () => {
    /* The correction must not sweep up real contact routes — the direct path
       is a deliberate, separate entry point. */
    expect(finalCta.secondary.href).toBe('/contact#team')
    expect(directContact.href).toBe('/contact')
  })
})
