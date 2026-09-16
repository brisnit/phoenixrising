import { test, expect } from '@playwright/test'
import { MOTION_ROUTES } from '../support/routes'
import { scrollThroughPage } from '../support/page-audit'

/**
 * Guards the two GSAP traps documented in the README, plus the no-JavaScript
 * failsafe. Each of these was a live defect during Round 1.
 */

test.describe('masked line reveals', () => {
  for (const route of MOTION_ROUTES) {
    test(`${route} — every masked line resolves to its resting position`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      await scrollThroughPage(page)

      /* The Round 1 bug left lines displaced by exactly one line-height
         because GSAP adopted the CSS fallback transform as its baseline and
         then animated only `yPercent` on top of it. Asserting on the resolved
         pixel offset catches that regardless of which property is at fault. */
      const displaced = await page.evaluate(() =>
        [...document.querySelectorAll('[data-reveal-line]')]
          .filter((el) => !el.closest('[data-hero-line]'))
          .map((el) => {
            const style = getComputedStyle(el)
            const y = style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42
            return { text: (el.textContent ?? '').trim().slice(0, 40), y: Math.round(y) }
          })
          .filter((entry) => Math.abs(entry.y) > 2),
      )

      expect(displaced, 'masked lines left displaced after their reveal').toEqual([])
    })
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('no content is hidden when motion is reduced', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1800)

    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('[data-reveal-line], [data-reveal], [data-word]')]
        .filter((el) => {
          const style = getComputedStyle(el)
          const y = style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42
          return Number(style.opacity) < 0.9 || Math.abs(y) > 2
        })
        .map((el) => (el.textContent ?? '').trim().slice(0, 40)),
    )

    expect(hidden, 'content hidden under prefers-reduced-motion').toEqual([])
  })
})

test.describe('motion failsafe', () => {
  test('content stays readable when the JS bundle never loads', async ({ page }) => {
    /* Simulates a chunk 404 against a stale cache after a deploy: JavaScript
       runs, so the inline script applies `.motion-ready` and the
       pre-animation CSS takes effect, but the bundle never arrives. Without
       the failsafe every headline on the site renders permanently invisible. */
    await page.route('**/_next/static/chunks/**', (r) => r.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000)

    const state = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[data-reveal-line], [data-hero-line]')]
      const hidden = els.filter((el) => {
        const style = getComputedStyle(el)
        const y = style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42
        return Number(style.opacity) < 0.5 || Math.abs(y) > 4
      })
      return {
        motionReady: document.documentElement.classList.contains('motion-ready'),
        total: els.length,
        hidden: hidden.length,
      }
    })

    expect(state.total, 'expected reveal elements in the server-rendered markup').toBeGreaterThan(0)
    expect(state.motionReady, 'failsafe should have removed .motion-ready').toBe(false)
    expect(state.hidden, 'content left hidden after the bundle failed to load').toBe(0)
  })
})

test.describe('pinned sections', () => {
  test('pinned content fits within the viewport', async ({ page }) => {
    await page.goto('/process', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    /* Anything taller than the viewport while pinned is unreachable for the
       entire duration of the pin — the Round 1 Reality-section defect.
       Only sections ScrollTrigger actually pinned are relevant: below the
       desktop breakpoint these same elements scroll normally, where being
       taller than the viewport is ordinary and harmless. A pinned element is
       identifiable by the `.pin-spacer` ScrollTrigger wraps it in. */
    const overflowing = await page.evaluate(() => {
      const viewport = window.innerHeight
      return [...document.querySelectorAll('[data-pin]')]
        .filter((el) => el.closest('.pin-spacer') !== null)
        .map((el) => ({
          label: el.className.slice(0, 40),
          height: Math.round(el.getBoundingClientRect().height),
          viewport,
        }))
        .filter((entry) => entry.height > entry.viewport + 2)
    })

    expect(overflowing, 'pinned section taller than the viewport').toEqual([])
  })
})

test.describe('ScrollTrigger lifecycle', () => {
  /* Drives the desktop navigation, which is not rendered below 1024px. The
     mobile equivalent is covered by the mobile-menu test in a11y.spec.ts. */
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, 'desktop navigation only')

  test('triggers do not accumulate across client-side navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1800)

    const countTriggers = () =>
      page.evaluate(() => document.querySelectorAll('.pin-spacer').length)

    const before = await countTriggers()

    for (const name of ['Capabilities', 'Process', 'Work']) {
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name, exact: true })
        .first()
        .click()
      await page.waitForTimeout(1400)
    }

    await page.getByRole('link', { name: 'Phoenix Rising' }).first().click()
    await page.waitForTimeout(2000)

    expect(await countTriggers(), 'pin spacers accumulated after navigation').toBe(before)
    expect(await page.evaluate(() => window.scrollY), 'scroll should reset on navigation').toBe(0)
  })
})
