import { test, expect, type Page } from '@playwright/test'

/**
 * Browser coverage for the Phase 5 company story.
 *
 * The signature section holds its composition with `position: sticky` rather
 * than a ScrollTrigger pin. That choice removes two whole classes of defect
 * this project has already shipped once — a pin resolving against a
 * transformed ancestor, and a pinned band taller than the viewport — but it
 * introduces its own: a sticky element only sticks if nothing in its ancestor
 * chain has established a scroll container or a `contain` that breaks it, and
 * it fails silently by simply scrolling past.
 *
 * So the invariants here are the sticky equivalents of the pinning ones:
 *   · the held frame fits the viewport it is held in
 *   · it actually holds, on direct load AND after client-side navigation
 *   · the scrubbed timeline advances through every beat
 *   · zero samples where holding is expected is a FAILURE, never a skip
 *
 * Plus the part that matters more than any of it: with motion off, at any
 * width, the story is still completely readable.
 */

/** Matches `pinnable` in globals.css and `PINNABLE_QUERY` in useMediaQuery. */
const canHold = (page: Page) => {
  const v = page.viewportSize()
  return (v?.width ?? 0) >= 1024 && (v?.height ?? 0) >= 780
}

type Hold = {
  /** Offset of the held frame from the top of the viewport. */
  top: number
  /** Index of the exchange currently crossing, or -1 when unset. */
  active: number
  /** Horizontal translation of the outbound packet, in SVG user units. */
  packetX: number | null
  /** How much of the frame sits below the fold. */
  overflow: number
  /** Which world the exchange is currently passing through. */
  live: string | null
}

async function sampleHold(page: Page): Promise<Hold | null> {
  return page.evaluate(() => {
    const track = document.querySelector<HTMLElement>('[data-exchange-track]')
    const frame = document.querySelector<HTMLElement>('[data-exchange-frame]')
    if (!track || !frame) return null

    /* Only meaningful inside the range where the frame is supposed to be
       held: the track's top has passed the viewport top and its bottom has
       not yet arrived. */
    const t = track.getBoundingClientRect()
    if (!(t.top <= 0 && t.bottom >= window.innerHeight)) return null

    const f = frame.getBoundingClientRect()
    const packet = document.querySelector<SVGGElement>('[data-packet="outbound"]')
    const matrix = packet ? new DOMMatrixReadOnly(getComputedStyle(packet).transform) : null

    const raw = frame.dataset.activeExchange
    return {
      top: Math.round(f.top),
      active: raw === undefined || raw === '' ? -1 : Number(raw),
      packetX: matrix && matrix.m41 !== 0 ? matrix.m41 : matrix ? 0 : null,
      overflow: Math.round(f.bottom - window.innerHeight),
      live: document.querySelector<HTMLElement>('[data-world][data-live]')?.dataset.world ?? null,
    }
  })
}

test.describe('the California ↔ Guangzhou section holds its frame', () => {
  for (const entry of ['direct', 'navigated'] as const) {
    test(`holds, advances and fits the viewport (${entry})`, async ({ page }, testInfo) => {
      if (entry === 'direct') {
        await page.goto('/about', { waitUntil: 'networkidle' })
      } else {
        await page.goto('/', { waitUntil: 'networkidle' })
        await page.waitForTimeout(900)
        await page.getByRole('link', { name: /why phoenix rising/i }).first().click()
        await page.waitForURL('**/about')
      }
      await page.waitForTimeout(1600)

      const height = page.viewportSize()?.height ?? 900
      const total = await page.evaluate(() => document.body.scrollHeight)
      const step = Math.max(60, Math.round(height / 6))

      const slipped: string[] = []
      const clipped: string[] = []
      const seen = new Set<number>()
      const live = new Set<string>()
      const packetPositions: number[] = []
      let held = 0

      for (let y = 0; y <= total - height; y += step) {
        await page.evaluate(
          (top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }),
          y,
        )
        await page.waitForTimeout(520)

        const sample = await sampleHold(page)
        if (!sample) continue
        held++

        /* A sticky element that has come unstuck scrolls with the page, so
           this drifts far from zero rather than wobbling near it. */
        if (Math.abs(sample.top) > 2) slipped.push(`y=${y} top=${sample.top}`)
        if (sample.overflow > 2) clipped.push(`y=${y} +${sample.overflow}px below the fold`)
        if (sample.active >= 0) seen.add(sample.active)
      if (sample.live) live.add(sample.live)
        if (sample.packetX !== null) packetPositions.push(sample.packetX)
      }

      /* Below the pinnable threshold the section is a plain vertical stack
         and never holds — but whether holding is EXPECTED is decided by the
         viewport, not by whether it happened. A navigated-in route that
         silently stopped holding is exactly the defect this catches. */
      if (!canHold(page)) {
        testInfo.skip(true, 'viewport cannot hold the composition')
        return
      }

      expect(held, 'the frame never held — no samples inside its own range').toBeGreaterThan(3)
      expect(slipped, 'scroll positions where the held frame came unstuck').toEqual([])
      expect(clipped, 'held frame extends past the fold').toEqual([])

      /* The scrubbed timeline ran: the beat advanced, and the packet moved. */
      expect(seen.size, `only reached beats ${[...seen].join(',')}`).toBeGreaterThan(3)
      const travel = Math.max(...packetPositions) - Math.min(...packetPositions)
      expect(travel, 'the outbound packet never moved').toBeGreaterThan(50)

      /* The exchange must visibly pass through the middle, not just between
         the two ends — that is the whole claim the section is making. */
      expect([...live], `worlds lit during the hold: ${[...live].join(',')}`).toContain(
        'phoenix-rising',
      )
    })
  }

  test('reaches both directions of the exchange', async ({ page }, testInfo) => {
    if (!canHold(page)) {
      testInfo.skip(true, 'viewport cannot hold the composition')
      return
    }

    await page.goto('/about', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1600)

    const height = page.viewportSize()?.height ?? 900
    const total = await page.evaluate(() => document.body.scrollHeight)
    const axes = new Set<string>()

    for (let y = 0; y <= total - height; y += Math.round(height / 8)) {
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }),
        y,
      )
      await page.waitForTimeout(420)
      const sample = await sampleHold(page)
      if (!sample) continue
      const axis = await page.evaluate(() => {
        const frame = document.querySelector('[data-exchange-frame]')
        return frame?.textContent?.match(/California (⟶|⟵|↔) Guangzhou/)?.[0] ?? null
      })
      if (axis) axes.add(axis)
    }

    /* Information moving only one way would state the opposite of the
       company's position — the whole section exists for the return leg. */
    expect([...axes], 'the exchange never reversed direction').toEqual(
      expect.arrayContaining(['California ⟶ Guangzhou', 'California ⟵ Guangzhou']),
    )
  })
})

test.describe('the story survives without motion', () => {
  test('reduced motion keeps the whole narrative on the page', async ({ browser }, testInfo) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.setViewportSize(
      testInfo.project.use.viewport ?? { width: 1440, height: 900 },
    )
    await page.goto('/about', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    /* Both places, the product between them, and every beat of the exchange
       in both directions — all present with no animation having run. */
    for (const text of ['California', 'Guangzhou', 'Phoenix Rising']) {
      await expect(page.getByRole('heading', { name: text, exact: true }).first()).toBeVisible()
    }

    const beats = [
      'Customer need',
      'Product requirement',
      'Technical decision',
      'Manufacturing information',
      'Factory question',
      'Product decision',
      'Client approval',
    ]
    for (const beat of beats) {
      await expect(
        page.getByRole('heading', { name: beat, exact: true }),
        `"${beat}" is missing under reduced motion`,
      ).toBeVisible()
    }

    await expect(page.getByText('Toward manufacturing')).toBeVisible()
    await expect(page.getByText('Back toward the market')).toBeVisible()

    /* No reveal left mid-flight. */
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-reveal-line], [data-word]')].filter(
        (el) => {
          const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
          return Math.abs(m.m42) > 4 || Number(getComputedStyle(el).opacity) < 0.9
        },
      ).length,
    )
    expect(stuck, 'reveals never reached their resting state under reduced motion').toBe(0)

    await context.close()
  })

  test('the exchange reads top-to-bottom where it cannot read across', async ({
    page,
  }, testInfo) => {
    if (canHold(page)) {
      testInfo.skip(true, 'this viewport uses the held composition')
      return
    }

    await page.goto('/about', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    /* Market → product → manufacturing, in document order, so the story is
       the same one the wide layout tells left to right. */
    const order = await page.evaluate(() =>
      [...document.querySelectorAll('[data-exchange-frame] h3')].map(
        (el) => el.textContent?.trim() ?? '',
      ),
    )
    expect(order).toEqual(['California', 'Phoenix Rising', 'Guangzhou'])

    /* The horizontal channel is a wide-screen device only — §16. */
    const channelVisible = await page.evaluate(() => {
      const svg = document.querySelector('[data-exchange-frame] svg')
      return svg ? svg.getBoundingClientRect().width > 0 : false
    })
    expect(channelVisible, 'the horizontal channel is showing on a narrow viewport').toBe(false)

    await expect(page.getByRole('heading', { name: 'Client approval' })).toBeVisible()
  })
})

test.describe('About connects to the rest of the site', () => {
  test('publishes no unconfirmed location or internal gap list', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' })
    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()

    /* Stockton is not confirmed — the Phase 5 brief restated it as "a
       California/Stockton connection or office". It may live in the data
       layer's pending list; it may not reach a visitor. */
    expect(text, 'the live page names an unconfirmed location').not.toContain('stockton')
    expect(text).not.toContain('still to be supplied')
    expect(text).not.toContain('the round 1 brief said')

    /* The anchors that ARE approved must still be there. */
    expect(text).toContain('california')
    expect(text).toContain('guangzhou')
  })

  test('the homepage teaser leads to About', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const link = page.getByRole('link', { name: /why phoenix rising/i }).first()
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/about')
  })

  test('About closes into the stage selector, not a contact form', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: /where is your project right now/i })).toBeVisible()
    const cta = page.getByRole('link', { name: /start a project/i }).last()
    await expect(cta).toHaveAttribute('href', '/start')
  })

  test('the development story links to the company story', async ({ page }) => {
    await page.goto('/how-we-develop', { waitUntil: 'networkidle' })
    const link = page.getByRole('link', { name: /about phoenix rising/i }).first()
    await expect(link).toHaveAttribute('href', '/about')
  })

  test('the signature section is reachable and operable by keyboard', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    /* Every link on the page must have an accessible name — a bare arrow
       glyph in a link is a real failure mode in this codebase's CTAs. */
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].filter(
        (a) =>
          !(a.getAttribute('aria-label') ?? '').trim() &&
          !(a.textContent ?? '').trim() &&
          !a.querySelector('img[alt]:not([alt=""])'),
      ).length,
    )
    expect(unnamed, 'links with no accessible name').toBe(0)

    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? null)
    expect(focused).not.toBe('BODY')
  })
})
