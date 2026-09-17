import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import {
  allIdeationFields,
  briefCopy,
  briefSections,
  ideationSections,
  resetCopy,
  workspaceIntro,
} from '@/data/ideation'
import { buildBrief, briefToText, hasIdeationContent } from '@/data/ideationBrief'
import { deriveQuestions, questionRules, questionsCopy } from '@/data/ideationQuestions'
import {
  PRODUCIBLE_PROVENANCE,
  answerState,
  createProjectContext,
  deserialiseProjectContext,
  serialiseProjectContext,
  setAnswer,
  type ProjectContext,
} from '@/data/projectContext'
import {
  IDEATION_ASSISTANT_AVAILABLE,
  askIdeationAssistant,
} from '@/lib/ideationAssistant'

/**
 * Guards the ideation workspace.
 *
 * The workspace produces a document a visitor may forward to an investor, a
 * supplier or an engineer. That raises the stakes on two things: the brief
 * must contain only what they actually wrote, and nothing in it may read as a
 * Phoenix Rising assessment of their product.
 *
 * So these tests care most about what the workspace DOESN'T do — no scoring,
 * no synthesis, no conclusions, no AI, no submission.
 */

const ctxWith = (answers: Record<string, string | string[]>): ProjectContext =>
  Object.entries(answers).reduce(
    (ctx, [id, value]) => setAnswer(ctx, id, value),
    createProjectContext('idea'),
  )

describe('the workspace structure', () => {
  it('is the eight-part journey, in order', () => {
    expect(ideationSections.map((s) => s.id)).toEqual([
      'idea',
      'problem',
      'person',
      'product',
      'experience',
      'reality',
      'current-state',
    ])
    /* Seven sections of input; "questions" is derived rather than asked, which
       is why it is not a section the visitor fills in. */
    expect(questionsCopy.eyebrow).toMatch(/questions to resolve/i)
  })

  it('phrases every section prompt as a question to think about', () => {
    for (const section of ideationSections) {
      expect(
        section.prompt.join(' '),
        `${section.id} does not ask the visitor anything`,
      ).toMatch(/\?$/)
    }
  })

  it('gives every field a real label and a brief destination', () => {
    const briefIds = new Set(briefSections.map((b) => b.id))
    for (const field of allIdeationFields) {
      expect(field.label.length, `${field.id} has no label`).toBeGreaterThan(2)
      expect(briefIds, `${field.id} feeds an unknown brief section`).toContain(field.brief)
    }
  })

  it('has no required fields — nothing here can be wrong', () => {
    const source = readFileSync('src/data/ideation.ts', 'utf8')
    expect(source).not.toMatch(/required:\s*true/)
  })

  it('says plainly that the session is local', () => {
    expect(workspaceIntro.privacy.body).toMatch(/browser session/i)
    expect(workspaceIntro.privacy.body).toMatch(/cannot see/i)
  })
})

describe('known / assumed / unknown', () => {
  it('treats a plain answer as known', () => {
    const ctx = ctxWith({ 'idea.description': 'A thing' })
    expect(answerState(ctx.answers['idea.description'])).toBe('known')
  })

  it('records an assumption without demoting it to an absence', () => {
    const ctx = setAnswer(createProjectContext('idea'), 'reality.price', '£120', 'user', 'assumed')
    expect(answerState(ctx.answers['reality.price'])).toBe('assumed')
    const brief = buildBrief(ctx)
    expect(brief.counts.assumptions).toBe(1)
    const entry = brief.sections.find((s) => s.id === 'constraints')!.entries[0]
    expect(entry.value).toBe('£120')
    expect(entry.state).toBe('assumed')
  })

  it('records unknown as an open item rather than a silent gap', () => {
    const ctx = setAnswer(
      createProjectContext('idea'),
      'reality.quantity',
      'Not yet known',
      'user',
      'unknown',
    )
    const brief = buildBrief(ctx)
    expect(brief.counts.unknowns).toBe(1)
    expect(brief.unknowns[0].fieldId).toBe('reality.quantity')
    /* An unknown must not count as an explored area — otherwise saying "I
       don't know" would look like progress. */
    expect(brief.sections.find((s) => s.id === 'constraints')!.empty).toBe(true)
  })

  it('survives serialisation, so a reload does not lose the distinction', () => {
    const ctx = setAnswer(createProjectContext('idea'), 'reality.price', '£120', 'user', 'assumed')
    const round = deserialiseProjectContext(
      JSON.parse(JSON.stringify(serialiseProjectContext(ctx))),
    )
    expect(answerState(round.answers['reality.price'])).toBe('assumed')
  })
})

describe('the brief reproduces, it does not synthesise', () => {
  it('prints the visitor’s words unchanged', () => {
    const words = 'A portable espresso maker for people who camp'
    const brief = buildBrief(ctxWith({ 'idea.description': words }))
    expect(brief.sections.find((s) => s.id === 'idea')!.entries[0].value).toBe(words)
  })

  it('starts completely empty', () => {
    const brief = buildBrief(createProjectContext('idea'))
    expect(brief.sections.every((s) => s.empty)).toBe(true)
    expect(brief.counts.answered).toBe(0)
    expect(brief.counts.sectionsExplored).toBe(0)
  })

  it('counts information, never quality', () => {
    const brief = buildBrief(ctxWith({ 'idea.description': 'A thing', 'problem.statement': 'A problem' }))
    expect(brief.counts.sectionsExplored).toBe(2)
    expect(brief.counts.answered).toBe(2)
    /* No score, rating, percentage or readiness anywhere in the model. */
    const keys = Object.keys(brief.counts)
    for (const forbidden of ['score', 'rating', 'readiness', 'percent', 'grade', 'viability']) {
      expect(keys.join(' ').toLowerCase()).not.toContain(forbidden)
    }
  })

  it('never renders a score or a judgement in any ideation copy', () => {
    const published = JSON.stringify([
      workspaceIntro,
      ideationSections,
      briefCopy,
      briefSections,
      questionsCopy,
      questionRules,
      resetCopy,
    ]).toLowerCase()

    for (const forbidden of [
      'idea score',
      'readiness score',
      'good idea',
      'bad idea',
      'manufacturing ready',
      'production ready',
      'feasible',
      'feasibility',
      'we recommend',
      'our assessment',
      'viable',
      '% complete',
    ]) {
      expect(published, `ideation copy judges the idea: "${forbidden}"`).not.toContain(forbidden)
    }
  })

  it('calls the artifact a starting point, not a specification', () => {
    expect(briefCopy.lead).toMatch(/starting point/i)
    expect(briefCopy.lead).toMatch(/not a technical specification/i)
    for (const wrong of [
      'engineering brief',
      'manufacturing specification',
      'feasibility report',
      'production-ready document',
    ]) {
      expect(briefCopy.lead.toLowerCase()).not.toContain(wrong)
    }
  })
})

describe('the clipboard rendering', () => {
  it('includes the answers, the questions and the disclaimer', () => {
    const ctx = ctxWith({
      'idea.description': 'A portable espresso maker',
      'product.elements': ['Electronics'],
    })
    const text = briefToText(ctx)
    expect(text).toContain('PROJECT BRIEF')
    expect(text).toContain('A portable espresso maker')
    expect(text).toContain('QUESTIONS TO RESOLVE')
    /* The pasted document has to carry the same truth the page does. */
    expect(text).toContain('Phoenix Rising has not received this brief.')
    expect(text).toMatch(/not a technical/i)
  })

  it('marks assumptions and unknowns in the text, not just on screen', () => {
    let ctx = setAnswer(createProjectContext('idea'), 'reality.price', '£120', 'user', 'assumed')
    ctx = setAnswer(ctx, 'reality.timing', 'Not yet known', 'user', 'unknown')
    const text = briefToText(ctx)
    expect(text).toMatch(/— assumed/)
    expect(text).toMatch(/— not yet known/)
  })

  it('omits sections the visitor never touched', () => {
    const text = briefToText(ctxWith({ 'idea.description': 'A thing' }))
    expect(text).toContain('THE IDEA')
    expect(text).not.toContain('EXPERIENCE INTENT')
  })
})

describe('project context integration', () => {
  it('uses the existing ProjectContext rather than a second model', () => {
    const ctx = ctxWith({ 'idea.description': 'A thing' })
    expect(ctx.stage).toBe('idea')
    expect(serialiseProjectContext(ctx).answers[0].id).toBe('idea.description')
  })

  it('knows when there is something worth resuming', () => {
    expect(hasIdeationContent(createProjectContext('idea'))).toBe(false)
    expect(hasIdeationContent(ctxWith({ 'idea.description': 'A thing' }))).toBe(true)
  })

  it('scopes its session key away from the Phase 3 intake', () => {
    const source = readFileSync('src/components/ideation/IdeationWorkspace.tsx', 'utf8')
    expect(source).toMatch(/STORAGE_KEY = 'phoenix-ideation'/)
    /* Reset must remove only its own key. Wiping the visitor's /start answers
       because they cleared a different tool would be real data loss. */
    expect(source).toMatch(/sessionStorage\.removeItem\(STORAGE_KEY\)/)
    expect(source).not.toMatch(/sessionStorage\.clear\(\)/)
    expect(source).not.toMatch(/localStorage/)
  })

  it('explains in the reset copy that /start information is untouched', () => {
    expect(resetCopy.body).toMatch(/\/start/)
    expect(resetCopy.body).toMatch(/not affected/i)
  })
})

describe('provenance: AI can suggest, the user decides', () => {
  it('produces only user-supplied provenance at runtime', () => {
    expect([...PRODUCIBLE_PROVENANCE].sort()).toEqual(['unknown', 'user', 'user-confirmed'])
  })

  it('creates no AI or Phoenix-reviewed information anywhere', () => {
    const files = readdirSync('src/components/ideation').map(
      (f) => `src/components/ideation/${f}`,
    )
    for (const file of [...files, 'src/data/ideation.ts', 'src/data/ideationBrief.ts']) {
      const code = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      expect(code, `${file} writes AI provenance`).not.toMatch(/'ai'/)
      expect(code, `${file} writes Phoenix-reviewed provenance`).not.toMatch(/'phoenix-reviewed'/)
    }
  })

  it('makes an assistant suggestion structurally incapable of self-approval', () => {
    const source = readFileSync('src/lib/ideationAssistant.ts', 'utf8')
    /* `requiresApproval: true` is a literal type, not a boolean — an
       assistant cannot emit a suggestion that skips the visitor. */
    expect(source).toMatch(/requiresApproval:\s*true\b/)
    expect(source).not.toMatch(/requiresApproval\??:\s*boolean/)
  })
})

describe('no AI, no backend, no theater', () => {
  it('reports the assistant as unavailable', async () => {
    const result = await askIdeationAssistant({
      context: createProjectContext('idea'),
      section: 'idea',
      known: [],
      unknown: [],
      history: [],
    })
    expect(result.available).toBe(false)
    expect(IDEATION_ASSISTANT_AVAILABLE).toBe(false)
  })

  it('opens no endpoint and makes no call', () => {
    const code = readFileSync('src/lib/ideationAssistant.ts', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    for (const call of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'openai', 'anthropic']) {
      expect(code, `the assistant seam calls ${call}`).not.toContain(call)
    }
    expect(existsSync('src/app/api')).toBe(false)
  })

  it('renders no AI theater in the workspace', () => {
    /* Comments stripped: the ban is on what the UI says, not on explaining
       the rule. BriefRail's docblock discusses a screen-reader user "typing",
       which is exactly the kind of sentence this check must not punish. */
    const files = readdirSync('src/components/ideation').map((f) =>
      readFileSync(`src/components/ideation/${f}`, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, ''),
    )
    const all = files.join('\n').toLowerCase()
    for (const theater of [
      'thinking…',
      'is thinking',
      'generating',
      'ai is',
      'phoenix ai',
      'typing',
      'assistant says',
      'confidence',
    ]) {
      expect(all, `the workspace performs AI: "${theater}"`).not.toContain(theater)
    }
  })

  it('claims no submission on the brief', () => {
    expect(briefCopy.future).toMatch(/when project delivery is connected/i)
    expect(briefCopy.present).toMatch(/not active yet/i)
    expect(briefCopy.present).toMatch(/has not received this brief/i)
    expect(briefCopy.present).toMatch(/no review has started/i)
    expect(briefCopy.primary.href).toBe('/contact')
    expect(briefCopy.secondary.href).toBe('/onboarding#fit-review')
  })
})

describe('the last route shell is gone', () => {
  it('no longer ships shells at all', () => {
    expect(existsSync('src/data/shells.ts')).toBe(false)
    expect(existsSync('src/components/layout/RouteShell.tsx')).toBe(false)
  })

  it('renders the real workspace at /ideate', () => {
    const page = readFileSync('src/app/ideate/page.tsx', 'utf8')
    expect(page).toMatch(/IdeationWorkspace/)
    expect(page).not.toMatch(/RouteShell|ideateShell/)
  })
})

describe('derived questions stay questions', () => {
  it('surfaces the missing basics on an empty workspace', () => {
    const ids = deriveQuestions(createProjectContext('idea')).map((q) => q.id)
    expect(ids).toContain('no-user')
    expect(ids).toContain('no-problem')
    expect(ids).toContain('no-quantity')
  })

  it('stops asking once the visitor answers', () => {
    const before = deriveQuestions(createProjectContext('idea')).map((q) => q.id)
    const after = deriveQuestions(ctxWith({ 'person.user': 'People who camp' })).map((q) => q.id)
    expect(before).toContain('no-user')
    expect(after).not.toContain('no-user')
  })
})
