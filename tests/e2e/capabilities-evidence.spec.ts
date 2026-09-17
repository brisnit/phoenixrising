import { test, expect, type Page } from '@playwright/test'

/**
 * Browser coverage for Phase 6 — capabilities and the evidence library.
 *
 * The unit tests hold the data layer honest. These hold the RENDERED PAGE
 * honest, which is a different question: a claim can be absent from
 * `capabilityFamilies` and still reach a visitor through a component's own
 * hard-coded copy, and the evidence rules only matter as far as they survive
 * into the DOM.
 *
 * The global block exists because Phase 6 corrected a CTA that had been wrong
 * on roughly twenty routes. Checking the data is not enough there — the whole
 * point is what every page actually links to.
 */

const canHold = (page: Page) => {
  const v = page.viewportSize()
  return (v?.width ?? 0) >= 1024 && (v?.height ?? 0) >= 780
}

/* Every route a visitor can reach, used by the global sweeps. */
const VISITOR_ROUTES = [
  '/',
  '/capabilities',
  '/projects',
  '/about',
  '/how-we-develop',
  '/start',
  '/start/prototype',
  '/start/production',
  '/ideate',
  '/onboarding',
  '/insights',
  '/contact',
]

test.describe('capabilities', () => {
  test('presents the four families in journey order', async ({ page }) => {
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    const families = await page.evaluate(() =>
      [...document.querySelectorAll('[data-family]')].map((el) => el.getAttribute('data-family')),
    )
    expect(families).toEqual(['develop', 'prototype', 'produce', 'deliver'])

    for (const name of ['Develop', 'Prototype', 'Produce', 'Deliver']) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    }
  })

  test('routes each family CTA into its journey', async ({ page }) => {
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    for (const [name, href] of [
      [/explore your idea/i, '/ideate'],
      [/continue development/i, '/start/prototype'],
      [/discuss production/i, '/start/production'],
    ] as const) {
      await expect(page.getByRole('link', { name }).first()).toHaveAttribute('href', href)
    }
  })

  test('the technical object advances through every state', async ({ page }, testInfo) => {
    if (!canHold(page)) {
      testInfo.skip(true, 'the progression object is a wide-viewport device')
      return
    }
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)

    const tops = await page.evaluate(() =>
      [...document.querySelectorAll('[data-family]')].map((el) =>
        Math.round(el.getBoundingClientRect().top + window.scrollY),
      ),
    )
    expect(tops.length).toBe(4)

    const seen = new Set<string>()
    for (const top of tops) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }),
        top - 220,
      )
      await page.waitForTimeout(700)
      const live = await page.evaluate(
        () => document.querySelector('[data-family]')?.parentElement?.parentElement
          ? document.querySelector('[data-family][class*="rule-dark"]')?.getAttribute('data-family') ?? null
          : null,
      )
      if (live) seen.add(live)
    }
    /* Non-vacuous: the object must actually change state, not sit on one. */
    expect(seen.size, `only reached ${[...seen].join(',')}`).toBeGreaterThan(2)
  })

  test('renders no unverified marker and no quarantined claim', async ({ page }) => {
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()

    expect(text, 'a quarantined claim is on the page').not.toContain('unverified')
    for (const claim of [
      'certification',
      'tolerance analysis',
      'stack-up',
      'mould-flow',
      'supplier audit',
      'incoterms',
      'golden sample',
      'finished-goods inspection',
    ]) {
      expect(text, `capabilities page asserts "${claim}"`).not.toContain(claim)
    }
  })

  test('says what it is not, where that is the likely misreading', async ({ page }) => {
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    expect(text).toMatch(/not a freight forwarder/i)
    expect(text).toMatch(/no single prototype/i)
  })

  test('retired capability URLs resolve to the page that replaced them', async ({ page }) => {
    for (const old of [
      '/capabilities/design-for-manufacturability',
      '/capabilities/prototyping-tooling',
      '/capabilities/production',
      '/capabilities/quality-logistics',
    ]) {
      const response = await page.goto(old, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${old} did not resolve`).toBe(200)
      expect(new URL(page.url()).pathname, `${old} did not land on /capabilities`).toBe(
        '/capabilities',
      )
    }
  })

  test('reads top to bottom on a narrow viewport', async ({ page }, testInfo) => {
    if (canHold(page)) {
      testInfo.skip(true, 'this viewport uses the wide layout')
      return
    }
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)

    const order = await page.evaluate(() =>
      [...document.querySelectorAll('[data-family] h3')].map((el) => el.textContent?.trim()),
    )
    expect(order).toEqual(['Develop', 'Prototype', 'Produce', 'Deliver'])

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
})

test.describe('projects — evidence library', () => {
  test('shows an honest empty state rather than a portfolio', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)

    await expect(page.locator('[data-evidence-empty="true"]')).toBeVisible()
    const text = await page.evaluate(() => document.body.innerText)
    expect(text).toMatch(/nothing here yet/i)
    /* The standard has to be stated, or the emptiness reads as an oversight. */
    expect(text).toMatch(/at least one real thing|named source/i)
  })

  test('carries none of the retired placeholder case studies', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' })
    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()
    for (const ghost of ['project one', 'project two', '[placeholder]', '20xx']) {
      expect(text, `retired placeholder content is still rendered: "${ghost}"`).not.toContain(ghost)
    }
  })

  test('renders no empty evidence section', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' })
    const empties = await page.evaluate(() =>
      [...document.querySelectorAll('[data-evidence-stage]')].filter(
        (el) => el.querySelectorAll('[data-evidence-item]').length === 0,
      ).length,
    )
    expect(empties, 'an evidence section rendered with no items').toBe(0)
  })

  test('explains what a project can show', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' })
    for (const stage of ['Development', 'Prototype', 'Manufacturing', 'Product', 'Outcome']) {
      await expect(page.getByRole('heading', { name: stage, exact: true })).toBeVisible()
    }
  })

  test('offers the journeys instead of borrowed credibility', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'networkidle' })
    for (const href of ['/ideate', '/start/prototype', '/start/production']) {
      await expect(page.locator(`a[href="${href}"]`).first()).toHaveCount(1)
    }
  })

  test('retired case-study URLs resolve to the library', async ({ page }) => {
    for (const old of [
      '/projects/consumer-enclosure-programme',
      '/projects/outdoor-equipment-programme',
      '/work/precision-hardware-programme',
    ]) {
      const response = await page.goto(old, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${old} did not resolve`).toBe(200)
      expect(new URL(page.url()).pathname).toBe('/projects')
    }
  })

  test('an unknown project slug is a 404, not an empty page', async ({ page }) => {
    const response = await page.goto('/projects/not-a-real-project', {
      waitUntil: 'domcontentloaded',
    })
    expect(response?.status()).toBe(404)
  })
})

test.describe('global — the corrected CTA and the standing protections', () => {
  /* The buttons render a trailing arrow glyph inside the anchor, so the
     accessible text is "Start a project\u2197" rather than the bare label.
     An exact match therefore finds nothing and every assertion built on it
     passes without testing anything — which is exactly what happened the
     first time this spec ran, and why the non-vacuity check below exists. */
  const MATCH = `(a) => /start a project/i.test((a.textContent ?? '').replace(/[^a-z ]/gi, ' ').trim())`

  test('every "Start a project" link goes to /start, on every route', async ({ page }) => {
    const offenders: string[] = []
    let found = 0

    for (const route of VISITOR_ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const links = await page.evaluate((matcher) => {
        const test = eval(matcher) as (a: Element) => boolean
        return [...document.querySelectorAll('a[href]')]
          .filter(test)
          .map((a) => a.getAttribute('href') ?? '')
      }, MATCH)

      found += links.length
      for (const href of links.filter((h) => h !== '/start')) {
        offenders.push(`${route}: Start a project -> ${href}`)
      }
    }

    /* Asserted inside this test, not beside it: a sweep that found nothing
       must fail here rather than report an empty offender list as success. */
    expect(found, 'found no Start-a-project links at all — the sweep is vacuous').toBeGreaterThan(
      VISITOR_ROUTES.length,
    )
    expect(offenders, 'a Start-a-project CTA does not reach /start').toEqual([])
  })

  test('the corrected CTA is the one in the shared closing section', async ({ page }) => {
    /* The specific regression: CTASection renders on ~20 routes, and its
       primary button was labelled "Start a project" and pointed at /contact. */
    await page.goto('/about', { waitUntil: 'networkidle' })
    const cta = page.locator('section[aria-labelledby="cta-heading"]')
    await expect(cta).toBeVisible()
    await expect(cta.getByRole('link', { name: /start a project/i })).toHaveAttribute(
      'href',
      '/start',
    )
  })

  test('the direct contact path is untouched', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/contact"]').first()).toHaveCount(1)
    const response = await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    expect(new URL(page.url()).pathname).toBe('/contact')
  })

  test('no pending company information is exposed anywhere', async ({ page }) => {
    /* Phase 5 protection. The gap ledger reached production once. */
    for (const route of ['/', '/about', '/capabilities', '/projects']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()
      expect(text, `${route} names an unconfirmed location`).not.toContain('stockton')
      expect(text, `${route} leaks the gap list`).not.toContain('still to be supplied')
    }
  })

  test('the About company story is intact', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    expect(text).toMatch(/one product/i)
    expect(text).toMatch(/two worlds/i)
    expect(text).toMatch(/california/i)
    expect(text).toMatch(/guangzhou/i)
  })
})
