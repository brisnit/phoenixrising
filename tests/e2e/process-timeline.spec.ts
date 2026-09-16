import { test, expect } from '@playwright/test'

/**
 * Regression guard for the pinned development timeline.
 *
 * THE FAILURE THIS PREVENTS
 * While the section is pinned, the seven stages crossfade. The outgoing
 * stage's opacity tween had no explicit ease, so it inherited the project's
 * global `expo.out` default — which applies 82% of its change in the first
 * 25% of the tween. The outgoing stage therefore collapsed to ~18% opacity
 * almost immediately, while the incoming stage had not begun. For a stretch
 * of scroll the pinned band rendered as an empty light-grey panel with the
 * header still floating over it.
 *
 * Nothing in the existing suite caught it: the section was pinned (so no
 * overflow), the reveals had all fired (so nothing was "stuck"), no console
 * errors, and the audit only samples one position per viewport height. The
 * dead zone is a few hundred pixels wide inside a ~5,700px pinned scroll.
 *
 * These tests therefore sweep the pin *finely* and assert the invariant
 * directly: at no scroll position may the pinned timeline be without a
 * legible stage on screen.
 */

/** Below this, at least one stage must be readable at all times. */
const MIN_SETTLED_OPACITY = 0.45
/** Scrub intentionally lags the scroll, so mid-motion is allowed to dip further. */
const MIN_IN_MOTION_OPACITY = 0.25

type Sample = { max: number; active: number; visibleText: number } | null

async function sampleTimeline(page: import('@playwright/test').Page): Promise<Sample> {
  return page.evaluate(() => {
    const pin = document.querySelector<HTMLElement>('[data-pin][data-active]')
    if (!pin) return null

    /* Only meaningful while the pinned band actually fills the viewport. */
    const box = pin.getBoundingClientRect()
    if (!(box.top <= 2 && box.bottom >= window.innerHeight - 2)) return null

    const panels = [...pin.querySelectorAll<HTMLElement>('[data-step-panel]')]
    if (!panels.length) return null

    const opacities = panels.map((el) => Number(getComputedStyle(el).opacity))
    const max = Math.max(...opacities)

    /* Guards against the opacity being fine while the copy is empty or the
       panel has been translated out of the viewport. */
    const visibleText = panels.reduce((count, el) => {
      const r = el.getBoundingClientRect()
      const onScreen = r.top < window.innerHeight && r.bottom > 0 && r.height > 0
      const readable = Number(getComputedStyle(el).opacity) >= 0.45
      const hasCopy = (el.textContent ?? '').trim().length > 40
      return count + (onScreen && readable && hasCopy ? 1 : 0)
    }, 0)

    return { max, active: Number(pin.dataset.active), visibleText }
  })
}

test.describe('pinned development timeline', () => {
  test('never goes blank at any settled scroll position', async ({ page }, testInfo) => {
    await page.goto('/how-we-develop', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1800)

    const height = page.viewportSize()?.height ?? 900
    const total = await page.evaluate(() => document.body.scrollHeight)

    /* Step is a fraction of the viewport so the sweep stays fine enough to
       land inside a handoff — the original defect was only a few hundred
       pixels wide. */
    const step = Math.max(60, Math.round(height / 8))
    const failures: string[] = []
    let pinnedSamples = 0

    for (let y = 0; y <= total - height; y += step) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y)
      await page.waitForTimeout(650)

      const sample = await sampleTimeline(page)
      if (!sample) continue
      pinnedSamples++

      if (sample.max < MIN_SETTLED_OPACITY || sample.visibleText === 0) {
        failures.push(
          `y=${y} max-opacity=${sample.max.toFixed(3)} readable-stages=${sample.visibleText} active=${sample.active}`,
        )
      }
    }

    /* Below the desktop breakpoint the timeline is a plain vertical list and
       is never pinned — nothing to assert, but say so rather than pass silently. */
    if (pinnedSamples === 0) {
      testInfo.skip(true, 'timeline is not pinned at this viewport')
      return
    }

    expect(failures, 'scroll positions where the pinned timeline had no legible stage').toEqual([])
  })

  test('stays legible through continuous scrolling', async ({ page }, testInfo) => {
    await page.goto('/how-we-develop', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1800)

    const start = await page.evaluate(() => {
      const pin = document.querySelector('[data-pin][data-active]')?.closest('.pin-spacer')
      return pin ? Math.round(pin.getBoundingClientRect().top + window.scrollY) : null
    })
    if (start === null) {
      testInfo.skip(true, 'timeline is not pinned at this viewport')
      return
    }

    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), start)
    await page.waitForTimeout(1200)

    /* Two passes: an unhurried read, then aggressive flicking. */
    for (const [label, delta, ticks] of [
      ['slow', 120, 80],
      ['fast', 600, 40],
    ] as const) {
      let worst = 1
      for (let i = 0; i < ticks; i++) {
        await page.mouse.wheel(0, delta)
        await page.waitForTimeout(20)
        const sample = await sampleTimeline(page)
        if (sample) worst = Math.min(worst, sample.max)
      }
      expect(worst, `${label} scrolling left the timeline below the legibility floor`).toBeGreaterThanOrEqual(
        MIN_IN_MOTION_OPACITY,
      )
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), start)
      await page.waitForTimeout(1200)
    }
  })

  test('behaves the same whether loaded directly or navigated into', async ({ page }, testInfo) => {
    /* Client-side navigation re-runs ScrollTrigger.refresh against a document
       whose height has just changed, which is where pin measurements are most
       likely to go stale. */
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    const nav = page.getByRole('navigation', { name: 'Main' })
    if (await nav.isHidden().catch(() => true)) {
      testInfo.skip(true, 'horizontal navigation not present at this viewport')
      return
    }

    await nav.getByRole('link', { name: 'How we develop products', exact: true }).first().click()
    await page.waitForURL('**/how-we-develop')
    await page.waitForTimeout(2000)

    const height = page.viewportSize()?.height ?? 900
    const total = await page.evaluate(() => document.body.scrollHeight)
    const failures: string[] = []
    let pinnedSamples = 0

    for (let y = 0; y <= total - height; y += Math.round(height / 6)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y)
      await page.waitForTimeout(650)
      const sample = await sampleTimeline(page)
      if (!sample) continue
      pinnedSamples++
      if (sample.max < MIN_SETTLED_OPACITY || sample.visibleText === 0) {
        failures.push(`y=${y} max-opacity=${sample.max.toFixed(3)}`)
      }
    }

    /* This must not skip on zero samples. A navigated-to route that never
       pins is precisely the defect this test exists to catch — an earlier
       version skipped here and let a blank Process page ship. Whether pinning
       is expected is decided by the viewport, not by whether it happened. */
    const shouldPin = (page.viewportSize()?.width ?? 0) >= 1024 && (page.viewportSize()?.height ?? 0) >= 780
    if (!shouldPin) {
      testInfo.skip(true, 'viewport is not pinnable')
      return
    }

    expect(
      pinnedSamples,
      'no pinned samples after client-side navigation — the timeline never pinned',
    ).toBeGreaterThan(0)
    expect(failures, 'blank positions after client-side navigation').toEqual([])
  })

  test('survives a resize mid-sequence', async ({ page }, testInfo) => {
    await page.goto('/how-we-develop', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1800)

    const start = await page.evaluate(() => {
      const pin = document.querySelector('[data-pin][data-active]')?.closest('.pin-spacer')
      return pin ? Math.round(pin.getBoundingClientRect().top + window.scrollY) : null
    })
    if (start === null) {
      testInfo.skip(true, 'timeline is not pinned at this viewport')
      return
    }

    const size = page.viewportSize()!
    await page.evaluate((top) => window.scrollTo({ top: top + 1500, behavior: 'instant' as ScrollBehavior }), start)
    await page.waitForTimeout(1200)

    await page.setViewportSize({ width: size.width, height: size.height - 140 })
    await page.waitForTimeout(1800)

    const sample = await sampleTimeline(page)
    if (sample) {
      expect(sample.max, 'timeline went blank after a resize').toBeGreaterThanOrEqual(
        MIN_SETTLED_OPACITY,
      )
    }

    await page.setViewportSize(size)
    await page.waitForTimeout(1500)
    const restored = await sampleTimeline(page)
    if (restored) {
      expect(restored.max, 'timeline went blank after restoring the viewport').toBeGreaterThanOrEqual(
        MIN_SETTLED_OPACITY,
      )
    }
  })
})

/**
 * A pinned band holds its content still for the duration of the pin, so
 * anything taller than the viewport is unreachable for that whole stretch —
 * the same category of defect as the blank timeline, arrived at from the
 * other direction.
 *
 * Height is a real axis of failure here and width alone does not capture it:
 * display type sets against viewport WIDTH while the pin's budget is viewport
 * HEIGHT, so the worst cases are wide, short windows. This sweeps a grid
 * rather than trusting the project's single viewport.
 */
test.describe('pinned sections fit their viewport', () => {
  /* One project runs the grid; the others would repeat identical work. */
  test.skip(({ viewport }) => viewport?.width !== 1440, 'grid runs once')

  const WIDTHS = [1024, 1280, 1440, 1600, 1920, 2560]
  const HEIGHTS = [780, 800, 900, 1080]

  for (const route of ['/', '/how-we-develop']) {
    test(`${route} keeps every pinned band within the viewport`, async ({ page }) => {
      const failures: string[] = []

      for (const width of WIDTHS) {
        for (const height of HEIGHTS) {
          await page.setViewportSize({ width, height })
          await page.goto(route, { waitUntil: 'networkidle' })
          await page.waitForTimeout(1100)

          const overflow = await page.evaluate(() =>
            [...document.querySelectorAll('[data-pin]')]
              .filter((el) => el.closest('.pin-spacer'))
              .map((el) => ({
                label: el.hasAttribute('data-active')
                  ? 'ProcessTimeline'
                  : el.closest('section')?.getAttribute('aria-labelledby') ?? 'unknown',
                over: Math.round(el.getBoundingClientRect().height - window.innerHeight),
              }))
              .filter((entry) => entry.over > 2),
          )

          for (const entry of overflow) {
            failures.push(`${width}x${height} ${entry.label} +${entry.over}px`)
          }
        }
      }

      expect(failures, 'pinned content taller than the viewport').toEqual([])
    })
  }
})

/**
 * `position: fixed` resolves against the nearest ancestor with a transform,
 * filter or perspective — not the viewport. ScrollTrigger pins with
 * `position: fixed`, so a single transformed ancestor silently converts every
 * pin on the page into an element that scrolls away, leaving the section
 * blank.
 *
 * This shipped: the page transition animated its content wrapper with `y`, and
 * GSAP leaves `transform: matrix(1,0,0,1,0,0)` behind when such a tween ends.
 * An identity transform still creates the containing block. Direct loads were
 * unaffected because the first-load transition only animates opacity, so the
 * defect appeared solely when navigating in from another route.
 */
test.describe('pinned sections resolve against the viewport', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1024 || (viewport?.height ?? 0) < 780,
    'viewport is not pinnable',
  )

  for (const entry of ['direct', 'navigated'] as const) {
    test(`no transformed ancestor above a pinned section (${entry})`, async ({ page }) => {
      if (entry === 'direct') {
        await page.goto('/how-we-develop', { waitUntil: 'networkidle' })
      } else {
        await page.goto('/', { waitUntil: 'networkidle' })
        await page.waitForTimeout(1500)
        await page
          .getByRole('navigation', { name: 'Main' })
          .getByRole('link', { name: 'How we develop products', exact: true })
          .first()
          .click()
        await page.waitForURL('**/how-we-develop')
      }
      await page.waitForTimeout(2600)

      const offenders = await page.evaluate(() => {
        const found: { ancestor: string; property: string; value: string }[] = []
        for (const pin of document.querySelectorAll('[data-pin]')) {
          if (!pin.closest('.pin-spacer')) continue
          let node = pin.parentElement
          while (node && node !== document.documentElement) {
            const style = getComputedStyle(node)
            for (const property of ['transform', 'filter', 'perspective'] as const) {
              const value = style[property]
              /* `none` is the only safe value — an identity matrix still
                 establishes a containing block. */
              if (value && value !== 'none') {
                found.push({
                  ancestor: `${node.tagName}.${String(node.className).slice(0, 24)}`,
                  property,
                  value: String(value).slice(0, 40),
                })
              }
            }
            node = node.parentElement
          }
        }
        return found
      })

      expect(offenders, 'ancestors that break position: fixed for pinned sections').toEqual([])

      /* And the behavioural consequence, asserted directly. */
      await page.evaluate(() => window.scrollTo({ top: 2486, behavior: 'instant' as ScrollBehavior }))
      await page.waitForTimeout(1300)
      const top = await page.evaluate(() => {
        const pin = document.querySelector('[data-pin][data-active]')
        return pin ? pin.getBoundingClientRect().top : null
      })
      expect(top, 'no pinned timeline found').not.toBeNull()
      /* Sub-pixel tolerance: a correctly pinned section sits at 0, but layout
         rounding can land on a fractional value (and Math.round can produce
         -0, which is not Object.is-equal to 0). */
      expect(
        Math.abs(top!),
        `pinned section is not held at the top of the viewport (top=${top})`,
      ).toBeLessThanOrEqual(1)
    })
  }
})
