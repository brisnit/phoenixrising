import { test, expect, type Page } from '@playwright/test'

/**
 * Browser coverage for Phase 7 — onboarding and the engagement path.
 *
 * The risk this page carries is not a broken layout. It is a visitor leaving
 * with a belief the site never meant to create: that they have applied, been
 * accepted, created an account, paid something, or had their browser-local
 * intake read by a person. Most of these tests are therefore assertions about
 * what the RENDERED page does not say.
 *
 * The intake tests matter most. A completion screen that mentions a fit
 * review is one careless sentence away from implying one has started.
 */

const canHold = (page: Page) => {
  const v = page.viewportSize()
  return (v?.width ?? 0) >= 1024 && (v?.height ?? 0) >= 780
}

test.describe('the onboarding page', () => {
  for (const entry of ['direct', 'navigated'] as const) {
    test(`presents the five stages in order (${entry})`, async ({ page }) => {
      if (entry === 'direct') {
        await page.goto('/onboarding', { waitUntil: 'networkidle' })
      } else {
        await page.goto('/start', { waitUntil: 'networkidle' })
        await page.waitForTimeout(800)
        await page.getByRole('link', { name: /^fit review$/i }).first().click()
        await page.waitForURL('**/onboarding**')
      }
      await page.waitForTimeout(1200)

      const stages = await page.evaluate(() =>
        [...document.querySelectorAll('[data-stage]')].map((el) => el.getAttribute('data-stage')),
      )
      expect(stages).toEqual(['start', 'fit-review', 'define-engagement', 'onboard', 'begin'])
    })
  }

  test('states what the page is not, before describing the process', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)

    expect(text).toMatch(/no account to create/i)
    expect(text).toMatch(/nothing to upload/i)
    expect(text).toMatch(/nothing to pay for/i)

    const noticeIsAbove = await page.evaluate(() => {
      const notice = [...document.querySelectorAll('p')].find((p) =>
        /no account to create/i.test(p.textContent ?? ''),
      )
      const path = document.querySelector('[data-stage]')
      if (!notice || !path) return null
      return (
        notice.getBoundingClientRect().top + window.scrollY <
        path.getBoundingClientRect().top + window.scrollY
      )
    })
    expect(noticeIsAbove, 'the "what this is not" notice sits below the process').toBe(true)
  })

  test('defines fit review by what it is and what it is not', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    expect(text).toMatch(/a structured review of what is known/i)
    expect(text).toMatch(/what it is not/i)
    expect(text).toMatch(/score, a rating, or an automated decision/i)
  })

  test('publishes no commercial figure of any kind', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()

    for (const term of [
      'onboarding fee',
      'hourly rate',
      'retainer',
      'deposit',
      'payment schedule',
      'refund',
      'cancellation policy',
      'minimum order',
    ]) {
      expect(text, `onboarding publishes "${term}"`).not.toContain(term)
    }
    expect(text).not.toMatch(/[$£€]\s?\d/)
    /* It does still acknowledge that commercial terms exist. */
    expect(text).toMatch(/commercial terms/i)
  })

  test('promises no acceptance, response time or automated decision', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()
    for (const promise of [
      'we will respond within',
      'guaranteed response',
      'fit score',
      'you have been accepted',
      'apply now',
    ]) {
      expect(text, `onboarding promises "${promise}"`).not.toContain(promise)
    }
  })

  test('the dossier assembles through every state', async ({ page }, testInfo) => {
    if (!canHold(page)) {
      testInfo.skip(true, 'the dossier is a wide-viewport device')
      return
    }
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)

    const tops = await page.evaluate(() =>
      [...document.querySelectorAll('[data-stage]')].map((el) =>
        Math.round(el.getBoundingClientRect().top + window.scrollY),
      ),
    )
    expect(tops.length).toBe(5)

    const labels = new Set<string>()
    for (const top of tops) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }),
        top - 220,
      )
      await page.waitForTimeout(650)
      const label = await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>('.lg\\:sticky p')
        return el?.textContent?.split('—').pop()?.trim() ?? null
      })
      if (label) labels.add(label)
    }
    expect(labels.size, `only reached ${[...labels].join(', ')}`).toBeGreaterThan(3)
  })

  test('reads top to bottom on a narrow viewport', async ({ page }, testInfo) => {
    if (canHold(page)) {
      testInfo.skip(true, 'this viewport uses the wide layout')
      return
    }
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)

    const order = await page.evaluate(() =>
      [...document.querySelectorAll('[data-stage] h3')].map((el) => el.textContent?.trim()),
    )
    expect(order).toEqual([
      'Start',
      'Fit review',
      'Define the engagement',
      'Onboard',
      'Begin the work',
    ])

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('the anchors linked from /start actually resolve', async ({ page }) => {
    for (const anchor of ['fit-review', 'onboard']) {
      await page.goto(`/onboarding#${anchor}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(700)
      const found = await page.evaluate((id) => !!document.getElementById(id), anchor)
      expect(found, `#${anchor} does not exist on /onboarding`).toBe(true)
    }
  })

  test('survives reduced motion with the whole narrative intact', async ({ browser }, testInfo) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.setViewportSize(testInfo.project.use.viewport ?? { width: 1440, height: 900 })
    await page.goto('/onboarding', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1100)

    for (const name of [
      'Start',
      'Fit review',
      'Define the engagement',
      'Onboard',
      'Begin the work',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    }

    const stuck = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>('[data-reveal-line], [data-word]')].filter(
          (el) => {
            const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
            return Math.abs(m.m42) > 4 || Number(getComputedStyle(el).opacity) < 0.9
          },
        ).length,
    )
    expect(stuck, 'reveals never rested under reduced motion').toBe(0)
    await context.close()
  })
})

/**
 * Reaching the completion screen for real.
 *
 * An earlier version of this walked the intake blind, guessed the button
 * names, never arrived, and SKIPPED — which is the vacuous-pass pattern this
 * project has been bitten by before. Completion is now driven properly and a
 * failure to arrive is a failure, not a skip: these two tests are the whole
 * reason the spec exists.
 */
async function completeIntake(page: Page, stage: 'prototype' | 'production') {
  await page.goto('/start', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.locator(`a[data-stage="${stage}"]`).click()
  await page.waitForURL(`**/start/${stage}`)
  await page.waitForTimeout(600)

  /* Fill whatever the current step requires, then advance. Generic rather
     than hard-coded per stage, so adding a field does not silently turn this
     into a skip again. */
  for (let step = 0; step < 10; step++) {
    const review = page.getByRole('heading', { name: /does this look right/i })
    if (await review.isVisible().catch(() => false)) break

    const boxes = page.getByRole('textbox')
    const count = await boxes.count()
    for (let i = 0; i < count; i++) {
      const box = boxes.nth(i)
      if (!(await box.isVisible().catch(() => false))) continue
      if ((await box.inputValue().catch(() => 'x')) !== '') continue
      const name = ((await box.getAttribute('name')) ?? '') + ((await box.getAttribute('id')) ?? '')
      await box.fill(/email/i.test(name) ? 'test@example.com' : 'Test value for the intake')
    }

    /* Satisfy any radio group on the step. */
    const radios = page.getByRole('radio')
    const radioCount = await radios.count()
    if (radioCount > 0) {
      const first = radios.first()
      if (await first.isVisible().catch(() => false)) await first.check().catch(() => {})
    }

    const next = page.getByRole('button', { name: /^(continue|review)$/i }).first()
    if (!(await next.isVisible().catch(() => false))) break
    await next.click()
    await page.waitForTimeout(450)
  }

  await expect(
    page.getByRole('heading', { name: /does this look right/i }),
    `${stage}: never reached the review step`,
  ).toBeVisible()

  await page.getByRole('button', { name: /that looks right/i }).click()
  await page.waitForTimeout(700)
}

test.describe('intake completion explains the fit review without claiming one', () => {
  for (const stage of ['prototype', 'production'] as const) {
    test(`${stage}: completion offers onboarding education, not a submission`, async ({ page }) => {
      await completeIntake(page, stage)

      await expect(page.getByText(/summary is ready/i)).toBeVisible()

      /* The handoff must exist — not reaching it is a failure. */
      const handoff = page.locator('[data-fit-review-handoff]')
      await expect(handoff, `${stage}: no fit-review handoff on the completion screen`).toBeVisible()

      const text = await handoff.innerText()
      /* Future-state framing, explicitly conditional... */
      expect(text).toMatch(/when project delivery is connected/i)
      /* ...and the present-tense correction, which must also be there. */
      expect(text).toMatch(/not connected yet/i)
      expect(text).toMatch(/no review has started/i)

      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase()
      for (const claim of [
        'we have received',
        'your submission',
        'under review',
        'in review',
        "we'll be in touch",
        'fit review has begun',
      ]) {
        expect(body, `${stage}: completion claims "${claim}"`).not.toContain(claim)
      }

      /* The real action stays manual; onboarding is the educational path. */
      await expect(
        page.getByRole('link', { name: /contact phoenix rising/i }).first(),
      ).toHaveAttribute('href', '/contact')
      await expect(page.getByRole('link', { name: /how onboarding works/i })).toHaveAttribute(
        'href',
        '/onboarding',
      )
    })
  }
})

test.describe('standing protections', () => {
  test('no testimonials render anywhere', async ({ page }) => {
    for (const route of ['/', '/about', '/capabilities', '/projects', '/onboarding']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()
      for (const ghost of ['[placeholder quote', '[client name]', 'in their words']) {
        expect(text, `${route} still renders testimonial content: "${ghost}"`).not.toContain(ghost)
      }
      const quotes = await page.evaluate(() => document.querySelectorAll('blockquote').length)
      expect(quotes, `${route} renders a blockquote`).toBe(0)
    }
  })

  test('manual contact remains reachable and unredirected', async ({ page }) => {
    const response = await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    expect(new URL(page.url()).pathname).toBe('/contact')
  })

  test('no pending company facts and no placeholder projects', async ({ page }) => {
    for (const route of ['/', '/about', '/projects', '/onboarding']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()
      expect(text, `${route} names an unconfirmed location`).not.toContain('stockton')
      expect(text, `${route} leaks the gap list`).not.toContain('still to be supplied')
      expect(text, `${route} shows a placeholder project`).not.toContain('[project one]')
    }
  })
})
