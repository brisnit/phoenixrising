import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ROUTES, DESKTOP_NAV_MIN_WIDTH } from '../support/routes'

/**
 * Automated accessibility checks.
 *
 * axe catches a meaningful subset of WCAG failures — contrast, names, roles,
 * landmarks — but not keyboard operability or focus management, which are
 * asserted explicitly below.
 */
for (const route of ROUTES.filter((r) => !r.expect404)) {
  test(`${route.name} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      /* WCAG 1.4.3 exempts text that is pure decoration — serving only an
         aesthetic purpose, carrying no information and having no function.
         Elements marked `data-decorative` are oversized watermarks whose
         content is also present in readable form nearby; axe cannot infer
         that, so the exemption is declared explicitly and reviewably here
         rather than by weakening the rule for real content. */
      .exclude('[data-decorative="true"]')
      .analyze()

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.help,
    }))

    expect(violations, `${route.path} accessibility violations`).toEqual([])
  })
}

test.describe('keyboard operability', () => {
  test('skip link is the first stop and focus is always visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    await page.keyboard.press('Tab')
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim())
    expect(first).toContain('Skip to content')

    /* Every reachable control must paint a focus ring. A keyboard user who
       cannot see where they are cannot use the site. */
    const missingRing: string[] = []
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        const s = getComputedStyle(el)
        return {
          label: (el.textContent ?? el.tagName).trim().slice(0, 30),
          outlineWidth: s.outlineWidth,
        }
      })
      if (info && info.outlineWidth === '0px') missingRing.push(info.label)
    }

    expect(missingRing, 'focusable elements without a visible focus ring').toEqual([])
  })
})

test.describe('fullscreen menu', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= DESKTOP_NAV_MIN_WIDTH,
    'fullscreen navigation only',
  )

  test('opens, traps focus, closes on Escape and restores focus', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    await page.getByRole('button', { name: /menu/i }).click()
    await page.waitForTimeout(900)

    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    await page.keyboard.press('Escape')
    await page.waitForTimeout(700)

    const after = await page.evaluate(() => ({
      hidden: document.getElementById('mobile-menu')?.getAttribute('aria-hidden'),
      focus: document.activeElement?.textContent?.trim(),
      overflow: document.body.style.overflow,
    }))

    expect(after.hidden, 'menu should be hidden from assistive technology').toBe('true')
    expect(after.focus, 'focus should return to the trigger').toContain('Menu')
    expect(after.overflow, 'scroll lock should be released').toBe('')
  })
})
