import { test, expect } from '@playwright/test'
import { ROUTES } from '../support/routes'
import { auditPage, collectPageProblems, scrollThroughPage } from '../support/page-audit'

/**
 * Full-site regression sweep.
 *
 * Runs against every route at every breakpoint defined in playwright.config.
 * This is the suite that would have caught Round 1's defects.
 */
for (const route of ROUTES) {
  test(`${route.name} (${route.path}) renders without regressions`, async ({ page }) => {
    const problems = collectPageProblems(page, { expect404: route.expect404 })

    const response = await page.goto(route.path, { waitUntil: 'networkidle' })

    if (route.expect404) {
      expect(response?.status(), 'unknown route should return 404').toBe(404)
    } else {
      expect(response?.status(), `${route.path} should return 200`).toBe(200)
    }

    await page.waitForTimeout(1200)
    await scrollThroughPage(page)

    const report = await auditPage(page)

    expect(report.horizontalOverflow, `${route.path} has horizontal overflow`).toBeNull()
    expect(report.danglingAria, `${route.path} has ARIA references pointing at missing ids`).toEqual([])
    expect(report.duplicateIds, `${route.path} has duplicate element ids`).toEqual([])
    expect(report.brokenSvgRefs, `${route.path} has SVG paint references that do not resolve`).toEqual([])
    expect(report.imagesWithoutAlt, `${route.path} has images without alt attributes`).toBe(0)

    if (route.hasH1 !== false) {
      expect(report.h1Count, `${route.path} should have exactly one <h1>`).toBe(1)
    }

    expect(
      report.stuckElements,
      `${route.path} has content still hidden after a full scroll`,
    ).toEqual([])

    expect(problems, `${route.path} produced console or page errors`).toEqual([])
  })
}
