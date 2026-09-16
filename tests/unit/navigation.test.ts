import { describe, it, expect } from 'vitest'
import {
  navigation,
  footerGroups,
  primaryCta,
  secondaryCta,
  directContact,
  askPhoenix,
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
