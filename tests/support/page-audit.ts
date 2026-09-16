import type { Page } from '@playwright/test'

/**
 * The Round 1 audit, ported into the repository.
 *
 * Each check corresponds to a class of defect that survived a green build
 * during Round 1 and had to be found by hand in a browser. They are collected
 * into one in-page evaluation so a full sweep costs a single round trip.
 */
export type AuditReport = {
  horizontalOverflow: { scrollWidth: number; innerWidth: number } | null
  danglingAria: string[]
  duplicateIds: string[]
  h1Count: number
  stuckElements: { text: string; opacity: string; y: number }[]
  imagesWithoutAlt: number
  brokenSvgRefs: string[]
}

/**
 * Scrolls the full length of the page in viewport-sized steps so every
 * ScrollTrigger has a chance to fire, then returns to rest.
 *
 * Reveals are `once: true`, so a test that never scrolls past an element
 * cannot distinguish "not yet revealed" from "never reveals" — which is
 * exactly the bug this suite exists to catch.
 */
export async function scrollThroughPage(page: Page): Promise<void> {
  const viewportHeight = page.viewportSize()?.height ?? 900
  const total = await page.evaluate(() => document.body.scrollHeight)

  for (let y = 0; y < total; y += viewportHeight * 0.7) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y)
    await page.waitForTimeout(90)
  }
  await page.waitForTimeout(700)
}

export async function auditPage(page: Page): Promise<AuditReport> {
  return page.evaluate(() => {
    /* --- horizontal overflow ------------------------------------------- */
    const scrollWidth = document.documentElement.scrollWidth
    const innerWidth = window.innerWidth
    const horizontalOverflow =
      scrollWidth > innerWidth + 1 ? { scrollWidth, innerWidth } : null

    /* --- ARIA references that point at nothing -------------------------- */
    const danglingAria: string[] = []
    for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        const raw = el.getAttribute(attr)
        if (!raw) return
        for (const id of raw.split(/\s+/).filter(Boolean)) {
          if (!document.getElementById(id)) danglingAria.push(`${attr}="${id}"`)
        }
      })
    }

    /* --- duplicate ids --------------------------------------------------
       SVG gradients reference their defs by id, and `url(#id)` resolves to
       the first match in the document — so a collision silently cross-wires
       one graphic's paint to another's. */
    const seen = new Set<string>()
    const duplicateIds = new Set<string>()
    document.querySelectorAll('[id]').forEach((el) => {
      if (seen.has(el.id)) duplicateIds.add(el.id)
      seen.add(el.id)
    })

    /* --- SVG paint references that do not resolve ------------------------ */
    const brokenSvgRefs = new Set<string>()
    document.querySelectorAll('[fill^="url("], [stroke^="url("]').forEach((el) => {
      for (const attr of ['fill', 'stroke']) {
        const value = el.getAttribute(attr)
        if (!value?.startsWith('url(#')) continue
        const id = value.slice(5, -1)
        if (!document.getElementById(id)) brokenSvgRefs.add(id)
      }
    })

    /* --- content still hidden after a full scroll ------------------------
       The Round 1 failure: a CSS pre-animation transform became GSAP's parsed
       baseline, so animating `yPercent` to zero left every line displaced by
       one line-height and nine sections rendered with invisible headings.

       Hero lines are excluded: they are deliberately translated off-axis by
       the hero's scroll-out animation and are not stuck. */
    const stuckElements: { text: string; opacity: string; y: number }[] = []
    const revealSelector = [
      '[data-reveal-line]',
      '[data-reveal]',
      '[data-word]',
      '[data-statement-line]',
      /* Staggered reveals animate their children, not the container. */
      '[data-reveal-group] > *',
    ].join(', ')

    document.querySelectorAll(revealSelector).forEach((el) => {
      if (el.closest('[data-hero-line], [data-cta-question]')) return
      const style = getComputedStyle(el)
      const y =
        style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42
      if (Number(style.opacity) < 0.5 || Math.abs(y) > 4) {
        stuckElements.push({
          text: (el.textContent ?? '').trim().slice(0, 48),
          opacity: style.opacity,
          y: Math.round(y),
        })
      }
    })

    return {
      horizontalOverflow,
      danglingAria: [...new Set(danglingAria)],
      duplicateIds: [...duplicateIds],
      h1Count: document.querySelectorAll('h1').length,
      stuckElements,
      imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
      brokenSvgRefs: [...brokenSvgRefs],
    }
  })
}

/**
 * Collects console errors, uncaught page errors and failed responses.
 *
 * `expect404` suppresses the noise a deliberately-missing route produces: the
 * browser logs a console error for the 404 document itself, which is correct
 * behaviour and not a defect in the page being tested.
 */
export function collectPageProblems(
  page: Page,
  options: { expect404?: boolean } = {},
): string[] {
  const problems: string[] = []

  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))

  page.on('console', (message) => {
    if (message.type() !== 'error') return
    if (options.expect404 && /Failed to load resource/i.test(message.text())) return
    problems.push(`console: ${message.text()}`)
  })

  page.on('response', (response) => {
    if (response.status() < 400) return
    /* `page.url()` is still about:blank while the first navigation is in
       flight, so the document response cannot be identified by comparing
       URLs. Its navigation flag is reliable. */
    if (options.expect404 && response.request().isNavigationRequest()) return
    problems.push(`${response.status()} ${response.url()}`)
  })

  return problems
}
