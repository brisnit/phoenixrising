import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import {
  engagementPath,
  entryPoints,
  fitReview,
  fitReviewHandoff,
  onboardingIntro,
  onboardingNotice,
} from '@/data/onboarding'
import {
  CURRENT_RUNTIME_STATE,
  ENGAGEMENT_LIFECYCLE,
  PRODUCIBLE_PROVENANCE,
  requiresBackend,
} from '@/data/engagementLifecycle'
import { FIT_REVIEW_AVAILABLE, requestFitReview } from '@/lib/requestFitReview'
import { createProjectContext } from '@/data/projectContext'
import { publishedTestimonials, testimonials } from '@/data/testimonials'

/**
 * Guards Phase 7.
 *
 * An onboarding page is the single most dangerous page on a site like this to
 * write loosely. It sits exactly where a visitor is deciding whether to
 * commit, so every vague sentence gets read as a promise: a fee they will be
 * charged, a reply they will receive, an account they have created, a
 * decision that has been made about them.
 *
 * So the rules are enforced as vocabulary bans rather than trusted to care.
 */

/** Every .ts/.tsx file under a directory. */
function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

const PUBLISHED = JSON.stringify([
  onboardingIntro,
  fitReview,
  engagementPath,
  entryPoints,
  onboardingNotice,
  fitReviewHandoff,
]).toLowerCase()

/**
 * The same copy minus `fitReview.isNot`.
 *
 * That list exists to enumerate what a fit review is NOT — "a guaranteed
 * feasibility study", "a score, a rating, or an automated decision". Scanning
 * it for banned words flags the denials as if they were claims, which is
 * backwards. The promise checks run against this corpus; everything else
 * still runs against the full one.
 */
const AFFIRMATIVE = JSON.stringify([
  onboardingIntro,
  { ...fitReview, isNot: [] },
  engagementPath,
  entryPoints,
  onboardingNotice,
  fitReviewHandoff,
]).toLowerCase()

describe('the engagement path', () => {
  it('is exactly the five approved stages, in order', () => {
    expect(engagementPath.map((s) => s.id)).toEqual([
      'start',
      'fit-review',
      'define-engagement',
      'onboard',
      'begin',
    ])
    expect(engagementPath.map((s) => s.index)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('opens at /start and closes into the development path', () => {
    expect(engagementPath[0].cta?.href).toBe('/start')
    expect(engagementPath[4].cta?.href).toBe('/how-we-develop')
  })

  it('does not stamp a CTA on every stage', () => {
    const withCta = engagementPath.filter((s) => s.cta)
    expect(withCta.length).toBeLessThan(engagementPath.length)
  })

  it('gives each stage a distinct object state for the dossier', () => {
    const labels = engagementPath.map((s) => s.objectState.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('explains where a project joins rather than implying a queue', () => {
    expect(entryPoints.points.map((p) => p.enters)).toEqual(['Define', 'Develop', 'Produce'])
    expect(entryPoints.note).toMatch(/not rules|depends on what it already has/i)
  })
})

describe('fit review is defined, not just named', () => {
  it('says what it is in one sentence', () => {
    expect(fitReview.definition).toMatch(/structured review/i)
    expect(fitReview.definition).toMatch(/next conversation/i)
  })

  it('says what it is not, including the machine reading', () => {
    const isNot = fitReview.isNot.join(' ').toLowerCase()
    expect(isNot).toMatch(/certification|approval/)
    expect(isNot).toMatch(/audit/)
    expect(isNot).toMatch(/feasibility/)
    expect(isNot).toMatch(/score|rating|automated/)
  })

  it('promises no acceptance, no response time and no criteria', () => {
    expect(fitReview.caveat).toMatch(/does not publish/i)
    for (const promise of [
      'within 48 hours',
      'within 24 hours',
      'we will respond',
      'guaranteed',
      'we accept',
      'qualify',
      'approved',
      'rejected',
      'eligible',
    ]) {
      expect(AFFIRMATIVE, `onboarding promises "${promise}"`).not.toContain(promise)
    }
  })
})

describe('no commercial terms are invented', () => {
  it('acknowledges commercial terms without specifying any', () => {
    const define = engagementPath.find((s) => s.id === 'define-engagement')!
    expect(define.covers).toContain('Commercial terms')
    expect(define.caveat).toMatch(/agreed per project|not published/i)
  })

  it('publishes no figure, rate, fee or policy', () => {
    for (const term of [
      'onboarding fee',
      'project minimum',
      'minimum project',
      'hourly rate',
      'per hour',
      'retainer',
      'deposit',
      'payment schedule',
      'cancellation',
      'refund',
      'margin',
      'consulting fee',
      'subscription',
      'contract length',
      'upfront',
      '50%',
    ]) {
      expect(PUBLISHED, `onboarding publishes a commercial term: "${term}"`).not.toContain(term)
    }
    /* No currency amounts at all. */
    expect(PUBLISHED).not.toMatch(/[$£€]\s?\d/)
    expect(PUBLISHED).not.toMatch(/\b\d+\s?(usd|rmb|gbp|eur)\b/)
  })
})

describe('no software is simulated', () => {
  it('states plainly what the page is not', () => {
    expect(onboardingNotice.body).toMatch(/no account/i)
    expect(onboardingNotice.body).toMatch(/nothing to upload/i)
    expect(onboardingNotice.body).toMatch(/nothing to pay/i)
  })

  it('claims no portal, login, dashboard or upload', () => {
    /* Word-bounded. "not a system you sign into" must not trip a ban on
       "sign in" — the denial is the point of the sentence. */
    for (const fake of [
      /\blog in\b/,
      /\blogin\b/,
      /\bsign in\b/,
      /\bsign up\b/,
      /\bcreate an account\b/,
      /\bdashboard\b/,
      /\bclient portal\b(?!\son\sthis\ssite)/,
      /\bdocument cent(re|er)\b/,
      /\bupload your\b/,
      /\bdrag and drop\b/,
      /\bproject status\b/,
    ]) {
      expect(AFFIRMATIVE, `onboarding implies software: ${fake}`).not.toMatch(fake)
    }
    /* The onboard stage is the one that lists drawings, CAD and samples, so
       it is the one most likely to imply an upload box. */
    const onboard = engagementPath.find((s) => s.id === 'onboard')!
    expect(onboard.caveat).toMatch(/no client portal|nothing can be uploaded/i)
  })

  it('offers no automated fit score', () => {
    for (const score of ['fit score', 'good fit', 'poor fit', 'recommended', '%']) {
      expect(PUBLISHED, `onboarding scores the project: "${score}"`).not.toContain(score)
    }
    /* And the page says outright that no software decides this. */
    expect(PUBLISHED).toMatch(/not decided by software|automated/)
  })
})

describe('the future handoff seam is typed and unavailable', () => {
  it('reports that nothing can be sent', async () => {
    const result = await requestFitReview(createProjectContext('prototype'))
    expect(result.available).toBe(false)
    expect(result.received).toBe(false)
    expect(FIT_REVIEW_AVAILABLE).toBe(false)
  })

  it('returns the payload it would have sent, rather than a fake success', async () => {
    const result = await requestFitReview(createProjectContext('production'))
    expect(result.available).toBe(false)
    if (result.available === false) {
      expect(result.payload.context.stage).toBe('production')
      expect(result.payload.requestedAt).toBeNull()
      expect(result.reason).toMatch(/nothing has been sent/i)
    }
  })

  it('makes no network call, opens no endpoint and writes nothing', () => {
    const source = readFileSync('src/lib/requestFitReview.ts', 'utf8')
    /* The connection recipe lives in a comment; strip comments before
       asserting, or the documentation trips the rule it documents. */
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    for (const call of ['fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'localStorage', 'axios']) {
      expect(code, `the fit-review seam actually calls ${call}`).not.toContain(call)
    }
    /* And no API route was quietly added to receive it. */
    expect(existsSync('src/app/api')).toBe(false)
  })
})

describe('the lifecycle model does not describe the current system', () => {
  it('declares the full future lifecycle', () => {
    expect([...ENGAGEMENT_LIFECYCLE]).toEqual([
      'draft',
      'ready-for-review',
      'fit-review',
      'engagement-definition',
      'onboarding',
      'active',
    ])
  })

  it('marks everything past ready-for-review as needing a backend', () => {
    expect([...CURRENT_RUNTIME_STATE.reachable]).toEqual(['draft', 'ready-for-review'])
    for (const state of ['fit-review', 'engagement-definition', 'onboarding', 'active'] as const) {
      expect(requiresBackend(state), `${state} is claimed as reachable today`).toBe(true)
    }
    expect(requiresBackend('draft')).toBe(false)
  })

  it('describes the runtime truthfully', () => {
    expect(CURRENT_RUNTIME_STATE.description).toMatch(/one browser tab/i)
    expect(CURRENT_RUNTIME_STATE.description).toMatch(/not a project record/i)
  })

  it('never assigns a lifecycle state to anything a visitor sees', () => {
    /* The model may be referenced by docs and tests. It may not label UI:
       every value past the first would assert a process that has not run. */
    const files: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${entry.name}`
        if (entry.isDirectory()) walk(full)
        else if (/\.tsx?$/.test(entry.name)) files.push(full)
      }
    }
    walk('src/app')
    walk('src/components')
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      expect(source, `${file} imports the future lifecycle model`).not.toMatch(
        /from '@\/data\/engagementLifecycle'/,
      )
    }
  })

  it('produces only the two provenances it can honestly produce', () => {
    expect([...PRODUCIBLE_PROVENANCE]).toEqual(['user-provided', 'unknown'])

    /* `phoenix-reviewed` is DECLARED for later — Phase 8 added it to the
       shared `Provenance` union so there is somewhere truthful to put such a
       value when a person actually reviews something. Declaring it is the
       point; ASSIGNING it is what must never happen. The check is therefore
       on assignment, not on the string appearing at all, which is what an
       earlier version got wrong the moment the type was extended. */
    const assigns = /(provenance\s*:\s*|setAnswer\([^)]*,\s*)'phoenix-reviewed'/
    for (const dir of ['src/data', 'src/components', 'src/lib', 'src/app']) {
      for (const file of walk(dir)) {
        const code = readFileSync(file, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '')
        expect(code, `${file} assigns phoenix-reviewed provenance`).not.toMatch(assigns)
      }
    }
  })
})

describe('the intake still tells the truth', () => {
  it('states the fit-review handoff as future, then corrects to the present', () => {
    expect(fitReviewHandoff.body).toMatch(/when project delivery is connected/i)
    expect(fitReviewHandoff.present).toMatch(/not connected yet/i)
    expect(fitReviewHandoff.present).toMatch(/nothing here has reached phoenix rising/i)
    expect(fitReviewHandoff.present).toMatch(/no review has started/i)
  })

  it('never claims a review is under way', () => {
    for (const claim of [
      'your fit review has begun',
      'we have received',
      'we received',
      'in review',
      'under review',
      'your submission',
      'submitted',
    ]) {
      expect(PUBLISHED, `the handoff claims "${claim}"`).not.toContain(claim)
    }
  })

  it('keeps the manual contact path as the real action', () => {
    expect(fitReviewHandoff.primary.href).toBe('/contact')
    expect(fitReviewHandoff.secondary.href).toBe('/onboarding')
  })

  it('no longer points at capability markers that were retired in Phase 6', () => {
    const source = readFileSync('src/data/intake.ts', 'utf8')
    /* The stale assertion was that unverified entries still EXIST in
       capabilities.ts. The corrected comment may still mention the old marker
       name while explaining that it is gone, so the test targets the claim
       rather than the words. */
    expect(source).not.toMatch(/several capabilities\s*\n?\s*\*?\s*remain unverified/)
    expect(source).toMatch(/no longer `verification: 'pending'` entries/)
    expect(source).toMatch(/claimDispositions/)
  })
})

describe('placeholder testimonials are gone', () => {
  it('publishes no testimonials, and has none to publish', () => {
    expect(testimonials).toHaveLength(0)
    expect(publishedTestimonials).toHaveLength(0)
  })

  it('removed the carousel that displayed them', () => {
    expect(existsSync('src/components/sections/Testimonials.tsx')).toBe(false)
    const home = readFileSync('src/app/page.tsx', 'utf8')
    expect(home).not.toMatch(/Testimonials/)
  })

  it('carries no placeholder quote or attribution', () => {
    const source = readFileSync('src/data/testimonials.ts', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const ghost of ['[Placeholder quote', '[Client name]', '[Role]', '[Company]']) {
      expect(source, `placeholder testimonial content survives: "${ghost}"`).not.toContain(ghost)
    }
  })

  it('requires a named source and explicit approval before publishing', () => {
    const source = readFileSync('src/data/testimonials.ts', 'utf8')
    expect(source).toMatch(/publishedTestimonials\s*=\s*testimonials\.filter\(isPublishableTestimonial\)/)
    expect(source).toMatch(/approvedForPublication/)
  })
})
