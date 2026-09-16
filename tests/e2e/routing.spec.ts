import { test, expect } from '@playwright/test'
import { REDIRECTS, ROUTES, DESKTOP_NAV_MIN_WIDTH } from '../support/routes'

/**
 * Route migration guards.
 *
 * Redirects exist for inbound links and bookmarks — not as the site's own
 * navigation. These tests assert both halves of that: the redirects work, and
 * nothing internal relies on them.
 */

test.describe('permanent redirects', () => {
  for (const { from, to } of REDIRECTS) {
    test(`${from} redirects permanently to ${to}`, async ({ page }) => {
      const response = await page.goto(from, { waitUntil: 'domcontentloaded' })

      expect(response?.status(), 'final response should be the destination').toBe(200)
      expect(new URL(page.url()).pathname, 'should land on the canonical route').toBe(to)

      /* 308 preserves the method and tells crawlers the move is permanent, so
         the old path does not linger as a competing indexable page. */
      const chain = response?.request().redirectedFrom()
      expect(chain, `${from} should have been redirected, not served directly`).toBeTruthy()
      const redirectStatus = (await chain?.response())?.status()
      expect([301, 308], `${from} returned ${redirectStatus}`).toContain(redirectStatus)
    })
  }
})

test.describe('canonical routes', () => {
  for (const route of ROUTES.filter((r) => !r.expect404)) {
    test(`${route.path} resolves directly`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBe(200)
      expect(
        response?.request().redirectedFrom(),
        `${route.path} should be canonical, not a redirect target`,
      ).toBeNull()
    })
  }
})

test.describe('internal links', () => {
  test('no page links to a retired route', async ({ page }) => {
    const offenders: string[] = []

    for (const route of ROUTES.filter((r) => !r.expect404)) {
      await page.goto(route.path, { waitUntil: 'networkidle' })
      const stale = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')]
          .map((a) => a.getAttribute('href') ?? '')
          .filter((href) => /^\/(process|work)(\/|$)/.test(href)),
      )
      for (const href of stale) offenders.push(`${route.path} → ${href}`)
    }

    expect(offenders, 'internal links pointing at redirected routes').toEqual([])
  })
})

test.describe('navigation architecture', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < DESKTOP_NAV_MIN_WIDTH,
    'horizontal navigation only',
  )

  test('primary navigation shows the approved hierarchy and omits Insights', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)

    const nav = page.getByRole('navigation', { name: 'Main' })
    const labels = await nav.locator('li a').evaluateAll((links) =>
      links.map((l) => (l.querySelector('span > span')?.textContent ?? '').trim()),
    )

    expect(labels).toEqual([
      'How we develop products',
      'Capabilities',
      'Ideation workspace',
      'Projects',
      'About',
    ])
    expect(labels).not.toContain('Insights')

    const cta = page.locator('header a[href="/start"]')
    await expect(cta).toBeVisible()
  })

  test('header has breathing room between the nav and the primary CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)

    /* Long Round 2 labels made this the tightest point in the layout. Below
       roughly 32px the bar reads as crowded rather than composed. */
    const gap = await page.evaluate(() => {
      const nav = document.querySelector('header nav[aria-label="Main"]')
      const cta = document.querySelector('header a[href="/start"]')
      if (!nav || !cta) return null
      return Math.round(cta.getBoundingClientRect().left - nav.getBoundingClientRect().right)
    })

    expect(gap).not.toBeNull()
    expect(gap!, 'gap between navigation and CTA').toBeGreaterThanOrEqual(32)
  })
})

test.describe('footer architecture', () => {
  test('exposes the routes the header omits', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    /* Testimonials use a <footer> inside a <blockquote> for attribution, which
       is valid and is NOT a contentinfo landmark. Target the landmark. */
    const footer = page.getByRole('contentinfo')
    for (const href of ['/insights', '/onboarding', '/contact', '/start', '/ideate', '/projects']) {
      await expect(
        footer.locator(`a[href="${href}"]`).first(),
        `footer should link to ${href}`,
      ).toBeAttached()
    }
  })

  test('names the legal entity', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('contentinfo')).toContainText(
      'Phoenix Rising Trading Company, LTD.',
    )
  })
})
