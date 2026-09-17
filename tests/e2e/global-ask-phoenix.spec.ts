import { test, expect, type Page } from '@playwright/test'

/**
 * The global Ask Phoenix surface.
 *
 * Phase 9 built the intelligence and surfaced it only inside /ideate. Phase 9.1
 * gave it a public entry point. The risks that creates are specific, and each
 * has a test here:
 *
 *   · Two panels. Phase 9 shipped exactly that bug at 768px, so instance
 *     COUNT is asserted — not "one visible instance".
 *   · Project data leaking out of the workspace. The global panel is
 *     understand-mode only, and a visitor who has used /ideate or /start in
 *     the same tab has project text sitting in session storage.
 *   · Focus going nowhere on open or close.
 */

const PUBLIC_ROUTES = ['/', '/capabilities', '/how-we-develop', '/about', '/onboarding', '/projects']

const openPanel = async (page: Page) => {
  await page.getByRole('button', { name: 'Ask Phoenix' }).first().click()
  await page.waitForTimeout(500)
}

test.describe('the global trigger', () => {
  test('is present on every public route, and the panel is mounted once', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)

      const counts = await page.evaluate(() => ({
        triggers: document.querySelectorAll('[data-ask-phoenix-trigger]').length,
        panels: document.querySelectorAll('[data-ask-phoenix]').length,
      }))
      expect(counts.triggers, `${route} has no Ask Phoenix trigger`).toBe(1)
      /* Instance count, not visible count — a hidden second panel is still a
         second conversation and a second opened event. */
      expect(counts.panels, `${route} mounted ${counts.panels} panels`).toBe(1)
    }
  })

  test('is absent on /ideate, which provides its own surface', async ({ page }) => {
    await page.goto('/ideate', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    expect(await page.locator('[data-ask-phoenix-trigger]').count()).toBe(0)
    expect(await page.locator('[data-global-ask-phoenix]').count()).toBe(0)
  })

  test('is a text action, not an icon', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const trigger = page.locator('[data-ask-phoenix-trigger]')
    await expect(trigger).toHaveAccessibleName('Ask Phoenix')
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    /* No floating bubble pinned over the page. */
    const fixedPosition = await trigger.evaluate((el) => getComputedStyle(el).position)
    expect(fixedPosition).not.toBe('fixed')
  })
})

test.describe('opening and closing', () => {
  test('opens, traps focus, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    const trigger = page.getByRole('button', { name: 'Ask Phoenix' }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(600)

    const dialog = page.locator('[data-global-ask-phoenix]')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    /* Focus moved into the panel, not left on the page behind it. */
    const focusInside = await page.evaluate(
      () => !!document.querySelector('[data-global-ask-phoenix]')?.contains(document.activeElement),
    )
    expect(focusInside, 'focus stayed outside the panel on open').toBe(true)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(600)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    /* Focus returns to whatever opened it. */
    const backOnTrigger = await page.evaluate(
      () => document.activeElement?.getAttribute('data-ask-phoenix-trigger') !== null,
    )
    expect(backOnTrigger, 'focus did not return to the trigger').toBe(true)
  })

  test('is removed from the tab order while closed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    /* The panel stays mounted so the conversation survives — it must not be
       reachable by keyboard while it is shut. */
    await expect(page.locator('[data-global-ask-phoenix]')).toHaveAttribute('inert', '')
  })

  test('closes from the panel close button', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await openPanel(page)
    await page.getByRole('button', { name: /^close$/i }).click()
    await page.waitForTimeout(500)
    await expect(page.locator('[data-global-ask-phoenix]')).toHaveAttribute('inert', '')
  })
})

test.describe('page-aware starters', () => {
  const expected: [string, RegExp][] = [
    ['/', /what does phoenix rising do\?/i],
    ['/capabilities', /what can phoenix rising help move forward\?/i],
    ['/how-we-develop', /what is production readiness\?/i],
    ['/about', /why california and guangzhou\?/i],
    ['/onboarding', /what is a fit review\?/i],
    ['/projects', /why are there no case studies\?/i],
  ]

  for (const [route, starter] of expected) {
    test(`${route} offers its own starters`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      await openPanel(page)
      await expect(page.locator('[data-ask-phoenix]').getByRole('button', { name: starter })).toBeVisible()
    })
  }

  test('starters follow the route for a fresh conversation', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await openPanel(page)
    await expect(page.getByRole('button', { name: /why california and guangzhou\?/i })).toBeVisible()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    await page.getByRole('link', { name: /how we develop products/i }).first().click()
    await page.waitForURL('**/how-we-develop')
    await page.waitForTimeout(800)
    await openPanel(page)
    /* Same untouched conversation, but starters reflect where the visitor is. */
    await expect(page.getByRole('button', { name: /what is production readiness\?/i })).toBeVisible()
  })
})

test.describe('the conversation follows the visitor', () => {
  test('survives navigation between public routes', async ({ page }) => {
    await page.goto('/capabilities', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await openPanel(page)

    await page.locator('[data-ask-phoenix] textarea').fill('A question asked on capabilities')
    await page.locator('[data-ask-phoenix] button').filter({ hasText: /^Send$/ }).click()
    await page.waitForTimeout(2500)
    await expect(page.getByText('A question asked on capabilities')).toBeVisible()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    await page.getByRole('link', { name: /^about$/i }).first().click()
    await page.waitForURL('**/about')
    await page.waitForTimeout(900)
    await openPanel(page)

    /* The panel is mounted at the root, so the exchange is still there. */
    await expect(
      page.getByText('A question asked on capabilities'),
      'the conversation was lost on navigation',
    ).toBeVisible()
  })
})

test.describe('understand mode cannot carry project data', () => {
  test('sends neither ideation nor intake session data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    /* Plant sentinels in BOTH browser-local project stores, exactly as a
       visitor who has used /ideate and /start in this tab would have. */
    await page.evaluate(() => {
      sessionStorage.setItem(
        'phoenix-ideation',
        JSON.stringify({
          stage: 'idea',
          answers: [
            { id: 'idea.description', value: 'SENTINEL-IDEATION-XYZ', provenance: 'user' },
          ],
          startedAt: null,
          updatedAt: null,
        }),
      )
      sessionStorage.setItem(
        'phoenix-intake:prototype',
        JSON.stringify({
          stage: 'prototype',
          answers: [{ id: 'product', value: 'SENTINEL-INTAKE-XYZ', provenance: 'user' }],
          startedAt: null,
          updatedAt: null,
        }),
      )
    })

    const bodies: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/api/ask-phoenix') && r.method() === 'POST') {
        bodies.push(r.postData() ?? '')
      }
    })

    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await openPanel(page)
    await page.locator('[data-ask-phoenix] textarea').fill('What does Phoenix Rising do?')
    await page.locator('[data-ask-phoenix] button').filter({ hasText: /^Send$/ }).click()
    await page.waitForTimeout(3000)

    expect(bodies.length, 'no request was captured — the test proves nothing').toBeGreaterThan(0)
    const sent = bodies.join('\n')
    expect(sent, 'ideation data reached the request').not.toContain('SENTINEL-IDEATION-XYZ')
    expect(sent, 'intake data reached the request').not.toContain('SENTINEL-INTAKE-XYZ')

    const parsed = JSON.parse(bodies[0])
    expect(parsed.mode, 'the global panel used develop mode').toBe('understand')
    expect(parsed.project, 'the global panel attached project context').toBeNull()
  })
})

test.describe('standing protections', () => {
  test('the primary conversion is untouched', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const cta = page.getByRole('link', { name: /start a project/i }).first()
    await expect(cta).toHaveAttribute('href', '/start')
  })

  test('the workspace still owns its own project-aware panel', async ({ page }) => {
    await page.goto('/ideate', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: /start with the idea/i }).click()
    await page.waitForTimeout(600)

    const wide = (page.viewportSize()?.width ?? 0) >= 1024
    if (wide) {
      await page.getByRole('tab', { name: /ask phoenix/i }).click()
    } else {
      await page.getByRole('button', { name: /^ask phoenix$/i }).click()
    }
    await page.waitForTimeout(600)

    /* Develop mode keeps its consent gate — the global surface must not have
       flattened it. */
    await expect(page.getByRole('button', { name: /use my project notes/i })).toBeVisible()
    expect(await page.locator('[data-ask-phoenix]').count()).toBe(1)
  })
})
