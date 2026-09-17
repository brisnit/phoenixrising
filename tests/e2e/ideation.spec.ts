import { test, expect, type Page } from '@playwright/test'

/**
 * A real ideation journey, start to brief.
 *
 * Not an element-existence sweep. This enters a plausible product idea, works
 * through every section, leaves things unknown, goes backward, edits, comes
 * forward, and checks the brief actually changed — because the workspace's
 * whole value is that moving around does not cost you your work, and that is
 * only provable by moving around.
 *
 * Reaching the brief is asserted, never skipped. A journey that quietly fails
 * to arrive would make every assertion after it vacuous.
 */

const IDEA = 'A portable espresso maker for people who camp. Hand-pumped, no electricity.'
const IDEA_EDITED = 'A hand-pumped espresso maker that packs inside a camping mug.'

async function enterWorkspace(page: Page) {
  await page.goto('/ideate', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const start = page.getByRole('button', { name: /start with the idea|continue where you left off/i })
  await expect(start, 'the workspace never offered a way in').toBeVisible()
  await start.click()
  await page.waitForTimeout(400)
}

const goToSection = async (page: Page, name: RegExp) => {
  await page.getByRole('button', { name }).first().click()
  await page.waitForTimeout(300)
}

test.describe('the ideation journey', () => {
  test('carries an idea all the way to a project brief', async ({ page }) => {
    await enterWorkspace(page)

    /* 01 — the idea */
    await page.getByLabel('The idea').fill(IDEA)

    /* 02 — the problem, with one thing left unknown on purpose */
    await goToSection(page, /02.*problem/i)
    await page.getByLabel('The problem it solves').fill('Camping coffee is either bad or heavy.')
    await page.getByRole('button', { name: /i don’t know yet/i }).first().click()

    /* 03 — the person */
    await goToSection(page, /03.*person/i)
    await page.getByLabel('Intended user').fill('People who hike and camp for several days.')

    /* 04 — the product */
    await goToSection(page, /04.*product/i)
    await page.getByLabel('Essential function').fill('Make one good espresso without power.')
    await page.getByRole('checkbox', { name: /contact with food or drink/i }).check()

    /* 05 — experience */
    await goToSection(page, /05.*experience/i)
    await page.getByLabel('What it should feel like').fill('Rugged, obvious, nothing to learn.')

    /* 06 — reality, marking a guess as a guess */
    await goToSection(page, /06.*reality/i)
    await page.getByLabel(/target price/i).fill('Around £120')
    await page
      .locator('[data-field="reality.price"]')
      .getByRole('button', { name: /this is an assumption/i })
      .click()

    /* 07 — current state */
    await goToSection(page, /07.*current state/i)
    await page.getByRole('checkbox', { name: /^sketches$/i }).check()

    /* --- The brief ------------------------------------------------------ */
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(600)

    const brief = page.locator('[data-brief-view]')
    await expect(brief, 'the journey never reached the project brief').toBeVisible()

    /* Everything written is present, as written. */
    await expect(brief.getByText(IDEA)).toBeVisible()
    await expect(brief.getByText('Camping coffee is either bad or heavy.')).toBeVisible()
    await expect(brief.getByText('Make one good espresso without power.')).toBeVisible()

    /* Uncertainty is visible rather than flattened. */
    await expect(brief.getByText(/— assumed/i).first()).toBeVisible()
    await expect(brief.getByText(/not yet known/i).first()).toBeVisible()

    /* Questions reflect what is missing and what was said. */
    const questions = page.locator('[data-brief-questions]')
    await expect(questions.getByText(/what production volume/i)).toBeVisible()
    await expect(
      questions.getByText(/materials are acceptable for the parts that touch food/i),
    ).toBeVisible()
    /* And not the ones that were answered. */
    await expect(questions.getByText(/who is the primary user\?/i)).toHaveCount(0)

    /* Counts describe information, never quality. The label is uppercased by
       CSS, so compare case-insensitively rather than against the styling. */
    const summary = await page.locator('[data-brief-summary]').innerText()
    expect(summary).toMatch(/\d+ of \d+ areas explored/i)
    expect(summary).toMatch(/marked as an assumption\b/i)
    expect(summary).not.toMatch(/%|score|ready|good|viable/i)
  })

  test('editing from the brief changes the brief', async ({ page }) => {
    await enterWorkspace(page)
    await page.getByLabel('The idea').fill(IDEA)
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(500)

    await expect(page.getByText(IDEA)).toBeVisible()

    /* Jump back into the section from the brief. */
    await page
      .locator('[data-brief-doc-section="idea"]')
      .getByRole('button', { name: /edit this/i })
      .click()
    await page.waitForTimeout(400)

    const field = page.getByLabel('The idea')
    await expect(field, 'the edit jump lost the existing answer').toHaveValue(IDEA)
    await field.fill(IDEA_EDITED)

    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(500)
    await expect(page.getByText(IDEA_EDITED)).toBeVisible()
    await expect(page.getByText(IDEA, { exact: true })).toHaveCount(0)
  })

  test('work survives leaving the route and coming back', async ({ page }) => {
    await enterWorkspace(page)
    await page.getByLabel('The idea').fill(IDEA)
    await page.waitForTimeout(400)

    /* Navigate away through the real site, then return. */
    await page.getByRole('link', { name: /^about$/i }).first().click()
    await page.waitForURL('**/about')
    await page.waitForTimeout(600)
    await page.goBack()
    await page.waitForTimeout(900)

    /* The workspace offers to continue rather than starting blank. */
    const resume = page.getByRole('button', { name: /continue where you left off/i })
    await expect(resume, 'the session draft was lost').toBeVisible()
    await resume.click()
    await page.waitForTimeout(400)
    await expect(page.getByLabel('The idea')).toHaveValue(IDEA)
  })

  test('reset clears the workspace and nothing else', async ({ page }) => {
    await page.goto('/ideate', { waitUntil: 'networkidle' })
    /* Plant Phase 3 intake state, which reset must not touch. */
    await page.evaluate(() =>
      sessionStorage.setItem('phoenix-intake:prototype', '{"sentinel":"keep"}'),
    )

    await enterWorkspace(page)
    await page.getByLabel('The idea').fill(IDEA)
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: /reset workspace/i }).click()
    await expect(page.locator('[data-reset-confirm]')).toBeVisible()
    await page.getByRole('button', { name: /clear the workspace/i }).click()
    await page.waitForTimeout(500)

    const state = await page.evaluate(() => ({
      ideation: sessionStorage.getItem('phoenix-ideation'),
      intake: sessionStorage.getItem('phoenix-intake:prototype'),
    }))
    expect(state.ideation, 'the ideation draft survived a reset').toBeNull()
    expect(state.intake, 'reset destroyed unrelated Phase 3 state').toBe('{"sentinel":"keep"}')

    await expect(page.getByRole('button', { name: /start with the idea/i })).toBeVisible()
  })

  test('copies the brief as plain text', async ({ page, context, browserName }, testInfo) => {
    testInfo.skip(browserName !== 'chromium', 'clipboard permissions are chromium-specific')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await enterWorkspace(page)
    await page.getByLabel('The idea').fill(IDEA)
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: /copy brief/i }).click()
    await expect(page.getByText(/brief copied to clipboard/i).first()).toBeVisible()

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain('PROJECT BRIEF')
    expect(clipboard).toContain(IDEA)
    /* The pasted document carries the same truth the page does. */
    expect(clipboard).toContain('Phoenix Rising has not received this brief.')
  })

  test('never claims a submission, a review or an assessment', async ({ page }) => {
    await enterWorkspace(page)
    await page.getByLabel('The idea').fill(IDEA)
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(500)

    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase()
    for (const claim of [
      'we have received',
      'your submission',
      'submitted',
      'under review',
      'has been reviewed',
      'ai has',
      'is thinking',
      'fit score',
      'idea score',
      'readiness',
      'we recommend',
      'feasible',
    ]) {
      expect(text, `the brief claims "${claim}"`).not.toContain(claim)
    }
    await expect(page.getByText(/has not received this brief/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /how fit review works/i })).toHaveAttribute(
      'href',
      '/onboarding#fit-review',
    )
  })
})

test.describe('workspace accessibility', () => {
  test('is operable by keyboard alone', async ({ page }) => {
    await enterWorkspace(page)

    /* Tab into the first writing surface and type. */
    const idea = page.getByLabel('The idea')
    await idea.focus()
    await page.keyboard.type('A keyboard-only idea')
    await expect(idea).toHaveValue('A keyboard-only idea')

    /* Section navigation communicates where the visitor is. */
    await page.getByRole('button', { name: /03.*person/i }).first().focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await expect(page.getByRole('button', { name: /03.*person/i }).first()).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  test('the live brief is not an announcement firehose', async ({ page }) => {
    await enterWorkspace(page)
    /* The rail must not be a live region — it would be read back on every
       keystroke, which is unusable for a screen-reader user writing a
       paragraph. Discrete events use the single polite region instead. */
    const railIsLive = await page.evaluate(() => {
      const rail = document.querySelector('[data-brief-rail]')
      return rail?.getAttribute('aria-live') ?? rail?.closest('[aria-live]')?.getAttribute('aria-live') ?? null
    })
    expect(railIsLive).toBeNull()
  })

  test('survives reduced motion with the workspace usable', async ({ browser }, testInfo) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.setViewportSize(testInfo.project.use.viewport ?? { width: 1440, height: 900 })
    await enterWorkspace(page)

    await page.getByLabel('The idea').fill(IDEA)
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(400)
    await expect(page.locator('[data-brief-view]')).toBeVisible()
    await expect(page.getByText(IDEA)).toBeVisible()
    await ctx.close()
  })
})

/**
 * Verbatim fidelity.
 *
 * The brief's whole premise is that it reproduces what the visitor wrote. That
 * makes the round trip — input → session → live brief → edit → clipboard —
 * the single most important correctness property in the workspace, and the
 * one most likely to break quietly: an apostrophe that becomes `&#39;`, an
 * ampersand that becomes `&amp;`, a long paragraph silently truncated, or
 * text that renders as markup.
 *
 * The rail deliberately truncates for display; the BRIEF and the CLIPBOARD
 * must not.
 */
const AWKWARD = [
  `It's a "pocket-sized" press — 60mm × 90mm — for hikers & cyclists.`,
  `Cost target: <£120 (ex. VAT). Tolerance ±0.2mm; 50% lighter than a Moka pot.`,
  `Why now? Because "good enough" coffee isn't, and the alternatives — instant,`,
  `pods, or carrying a 400g steel pot — all fail on at least one of weight,`,
  `taste & cleanup. If it can't survive being dropped on granite, it's useless.`,
].join(' ')

const SCRIPTY = `<img src=x onerror="window.__pwned=1">  <script>window.__pwned=1</script> & <b>bold?</b>`

test.describe('the brief reproduces exactly what was written', () => {
  test('survives input, session, brief, edit and clipboard unchanged', async ({
    page,
    context,
    browserName,
  }, testInfo) => {
    testInfo.skip(browserName !== 'chromium', 'clipboard permissions are chromium-specific')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await enterWorkspace(page)
    const idea = page.getByLabel('The idea')
    await idea.fill(AWKWARD)
    await page.waitForTimeout(400)

    /* INPUT → the field itself holds it unchanged. */
    expect(await idea.inputValue(), 'the input mangled the text').toBe(AWKWARD)

    /* → SESSION STATE — stored as data, not as escaped markup. */
    const stored = await page.evaluate(() => {
      const raw = sessionStorage.getItem('phoenix-ideation')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed.answers.find((a: { id: string }) => a.id === 'idea.description')?.value ?? null
    })
    expect(stored, 'the session round trip changed the text').toBe(AWKWARD)

    /* → LIVE BRIEF — full value, no truncation, no escaping artifacts. */
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(600)

    const entry = page.locator('[data-brief-entry="idea.description"] dd')
    const rendered = await entry.innerText()
    expect(rendered, 'the brief did not reproduce the text verbatim').toBe(AWKWARD)
    for (const artifact of ['&amp;', '&#39;', '&quot;', '&lt;', '&gt;', '…']) {
      expect(rendered, `the brief introduced an escaping artifact: ${artifact}`).not.toContain(
        artifact,
      )
    }
    /* Appears once, not duplicated across rail and document. */
    expect(await page.getByText(AWKWARD, { exact: true }).count()).toBe(1)

    /* → EDIT — the value comes back into the field intact. */
    await page
      .locator('[data-brief-doc-section="idea"]')
      .getByRole('button', { name: /edit this/i })
      .click()
    await page.waitForTimeout(400)
    expect(
      await page.getByLabel('The idea').inputValue(),
      'editing lost or altered the text',
    ).toBe(AWKWARD)

    /* → COPY BRIEF — the clipboard carries the same characters. */
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /copy brief/i }).click()
    await expect(page.getByText(/brief copied to clipboard/i).first()).toBeVisible()

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard, 'the clipboard copy altered the text').toContain(AWKWARD)
    for (const artifact of ['&amp;', '&#39;', '&quot;']) {
      expect(clipboard, `the clipboard introduced ${artifact}`).not.toContain(artifact)
    }
  })

  test('renders user text as text, never as markup', async ({ page }) => {
    await enterWorkspace(page)
    await page.getByLabel('The idea').fill(SCRIPTY)
    await page.getByRole('button', { name: /view project brief/i }).click()
    await page.waitForTimeout(600)

    /* Nothing executed. */
    const pwned = await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)
    expect(pwned, 'user input executed as script').toBeUndefined()

    /* Nothing became a real element inside the brief. */
    const injected = await page.evaluate(() => {
      const view = document.querySelector('[data-brief-view]')
      return {
        scripts: view?.querySelectorAll('script').length ?? -1,
        images: view?.querySelectorAll('img').length ?? -1,
        bolds: view?.querySelectorAll('b').length ?? -1,
      }
    })
    expect(injected.scripts).toBe(0)
    expect(injected.images).toBe(0)
    expect(injected.bolds).toBe(0)

    /* And it is still shown to the visitor, as the characters they typed. */
    const entry = await page.locator('[data-brief-entry="idea.description"] dd').innerText()
    expect(entry).toContain('<script>')
    expect(entry).toContain('<b>bold?</b>')
  })
})
