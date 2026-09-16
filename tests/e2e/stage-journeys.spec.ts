import { test, expect, type Page } from '@playwright/test'

/**
 * The three visitor journeys.
 *
 * The rule these exist to protect: where a visitor says they are determines
 * what they are asked. A production-ready visitor must never be routed
 * through ideation, and an idea-stage visitor must never be asked for
 * specifications they do not have.
 */

async function chooseStage(page: Page, stage: 'idea' | 'prototype' | 'production') {
  await page.goto('/start', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.locator(`a[data-stage="${stage}"]`).click()
}

/** Fills whatever is required on the current step, then advances. */
async function advance(page: Page, fill: () => Promise<void>) {
  await fill()
  await page.getByRole('button', { name: /^(continue|review)$/i }).click()
  await page.waitForTimeout(400)
}

test.describe('stage selector', () => {
  test('offers the three stages and states where each one leads', async ({ page }) => {
    await page.goto('/start', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    for (const [stage, href] of [
      ['idea', '/ideate'],
      ['prototype', '/start/prototype'],
      ['production', '/start/production'],
    ] as const) {
      const link = page.locator(`a[data-stage="${stage}"]`)
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', href)
    }
  })

  test('is fully operable by keyboard', async ({ page }) => {
    await page.goto('/start', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)

    /* Tab until the first stage has focus, then confirm each stage is
       reachable and that focus is visible at every one. */
    const reached: string[] = []
    for (let i = 0; i < 40 && reached.length < 3; i++) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        const stage = el?.getAttribute('data-stage')
        return stage ? { stage, outline: getComputedStyle(el!).outlineWidth } : null
      })
      if (info && !reached.includes(info.stage)) {
        reached.push(info.stage)
        expect(info.outline, `stage ${info.stage} has no visible focus ring`).not.toBe('0px')
      }
    }
    expect(reached).toEqual(['idea', 'prototype', 'production'])
  })
})

test.describe('IDEA journey', () => {
  test('routes to the ideation workspace and asks for no specifications', async ({ page }) => {
    await chooseStage(page, 'idea')
    await page.waitForURL('**/ideate')
    expect(new URL(page.url()).pathname).toBe('/ideate')

    /* An idea-stage visitor must not be met with an intake form. */
    await expect(page.locator('form')).toHaveCount(0)
    const body = ((await page.textContent('body')) ?? '').toLowerCase()
    expect(body).not.toContain('bill of materials')
    expect(body).not.toContain('production status')
  })
})

test.describe('PROTOTYPE journey', () => {
  test('completes intake, reviews, edits and reaches a truthful handoff', async ({ page }) => {
    await chooseStage(page, 'prototype')
    await page.waitForURL('**/start/prototype')

    await advance(page, async () => {
      await page.getByRole('textbox', { name: /^name/i }).fill('Test Person')
      await page.getByRole('textbox', { name: /^email/i }).fill('test@example.com')
    })
    await advance(page, async () => {
      await page.getByRole('textbox', { name: /what are you developing/i }).fill('A sealed handheld device')
    })
    await advance(page, async () => {
      await page.getByRole('radio', { name: /functional prototype/i }).check()
      await page.getByRole('checkbox', { name: /^cad files$/i }).check()
    })
    await advance(page, async () => {
      await page.getByRole('checkbox', { name: /engineering questions/i }).check()
    })

    /* Review */
    await expect(page.getByRole('heading', { name: /does this look right/i })).toBeVisible()
    await expect(page.getByText('A sealed handheld device')).toBeVisible()
    await expect(page.getByText('Functional prototype')).toBeVisible()

    /* Edit one section without restarting */
    await page.getByRole('button', { name: /edit the product/i }).click()
    await page.waitForTimeout(500)
    const product = page.getByRole('textbox', { name: /what are you developing/i })
    await expect(product).toHaveValue('A sealed handheld device')
    await product.fill('A sealed handheld device, IP67')
    /* Correcting one answer returns straight to the summary — the visitor is
       not walked through every remaining step again. */
    await page.getByRole('button', { name: /^review$/i }).click()
    await page.waitForTimeout(500)
    await expect(page.getByRole('heading', { name: /does this look right/i })).toBeVisible()
    await expect(page.getByText('A sealed handheld device, IP67')).toBeVisible()

    /* Truthful completion — no claim of delivery */
    await page.getByRole('button', { name: /that looks right/i }).click()
    await expect(page.getByText(/summary is ready/i)).toBeVisible()

    const body = ((await page.textContent('body')) ?? '').toLowerCase()
    for (const forbidden of ['we have it', 'we received', 'submitted to phoenix', 'has been delivered']) {
      expect(body, `completion claims "${forbidden}"`).not.toContain(forbidden)
    }
    await expect(page.getByRole('link', { name: /contact phoenix rising/i })).toBeVisible()
  })
})

test.describe('PRODUCTION journey', () => {
  test('never enters ideation and asks manufacturing questions only', async ({ page }) => {
    const visited: string[] = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) visited.push(new URL(frame.url()).pathname)
    })

    await chooseStage(page, 'production')
    await page.waitForURL('**/start/production')

    await advance(page, async () => {
      await page.getByRole('textbox', { name: /^name/i }).fill('Test Person')
      await page.getByRole('textbox', { name: /^email/i }).fill('test@example.com')
    })
    await advance(page, async () => {
      await page.getByRole('textbox', { name: /product/i }).first().fill('A moulded enclosure')
    })

    /* Manufacturing framing, not concept discovery. */
    await expect(page.getByRole('group', { name: /production status/i })).toBeVisible()
    const body = ((await page.textContent('body')) ?? '').toLowerCase()
    expect(body).not.toContain('who is it for')

    await advance(page, async () => {
      await page.getByRole('radio', { name: /currently in production/i }).check()
      await page.getByRole('checkbox', { name: /bill of materials/i }).check()
    })
    await advance(page, async () => {
      await page.getByRole('checkbox', { name: /manufacturing review/i }).check()
    })

    await expect(page.getByRole('heading', { name: /does this look right/i })).toBeVisible()
    await page.getByRole('button', { name: /that looks right/i }).click()
    await expect(page.getByText(/summary is ready/i)).toBeVisible()

    /* THE non-negotiable assertion. */
    expect(
      visited.filter((path) => path.includes('ideate')),
      'the production journey entered the ideation path',
    ).toEqual([])
  })
})

test.describe('intake accessibility', () => {
  test('reports validation errors and moves focus to the problem', async ({ page }) => {
    await page.goto('/start/prototype', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)

    await page.getByRole('button', { name: /continue/i }).click()
    await page.waitForTimeout(500)

    await expect(page.locator('[role="alert"]').first()).toBeVisible()
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid'))
    expect(focused, 'focus was not moved to the invalid field').toBe('true')
  })

  test('answers survive a reload while the visitor is still in the flow', async ({ page }) => {
    await page.goto('/start/prototype', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await page.getByRole('textbox', { name: /^name/i }).fill('Persisted Person')
    await page.waitForTimeout(600)

    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1400)
    await expect(page.getByRole('textbox', { name: /^name/i })).toHaveValue('Persisted Person')
  })
})
