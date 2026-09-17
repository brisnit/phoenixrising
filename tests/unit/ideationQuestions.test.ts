import { describe, it, expect } from 'vitest'
import { deriveQuestions, questionRules } from '@/data/ideationQuestions'
import { createProjectContext, setAnswer, type ProjectContext } from '@/data/projectContext'

/**
 * Guards the deterministic question rules.
 *
 * The danger these tests exist for is subtle. A rules file that looks at a
 * product and emits text is one careless edit away from emitting a
 * CONCLUSION — "this will be expensive to tool", "this needs certification" —
 * and a conclusion from a rules file is a professional opinion nobody
 * qualified has given. It would also be Phoenix Rising appearing to assess a
 * product it has never seen.
 *
 * The structural defence is that every rule must be a question. It is very
 * hard to smuggle an assertion into something ending in a question mark.
 */

const ctx = (answers: Record<string, string | string[]>): ProjectContext =>
  Object.entries(answers).reduce(
    (c, [id, value]) => setAnswer(c, id, value),
    createProjectContext('idea'),
  )

describe('every rule asks rather than concludes', () => {
  it('phrases all of them as questions', () => {
    for (const rule of questionRules) {
      expect(rule.question, `"${rule.id}" is not a question`).toMatch(/\?$/)
    }
  })

  it('never asserts a fact about the product', () => {
    const all = questionRules.map((r) => `${r.question} ${r.because}`).join(' ').toLowerCase()
    for (const assertion of [
      'we recommend',
      'you should',
      'you must',
      'this will cost',
      'this requires',
      'is not feasible',
      'will not work',
      'we have identified',
      'our analysis',
      'risk:',
      'finding:',
      'issue:',
    ]) {
      expect(all, `a rule asserts rather than asks: "${assertion}"`).not.toContain(assertion)
    }
  })

  it('explains itself without claiming authority', () => {
    for (const rule of questionRules) {
      expect(rule.because.length, `${rule.id} has no rationale`).toBeGreaterThan(20)
    }
  })

  it('stays small enough to read', () => {
    /* A rules file that grows past this has stopped being transparent and
       started being a pseudo-expert system. */
    expect(questionRules.length).toBeLessThanOrEqual(20)
  })

  it('points every question at a real workspace section', () => {
    const sections = new Set([
      'idea',
      'problem',
      'person',
      'product',
      'experience',
      'reality',
      'current-state',
    ])
    for (const rule of questionRules) {
      expect(sections, `${rule.id} points at unknown section "${rule.section}"`).toContain(
        rule.section,
      )
    }
  })
})

describe('what triggers a question', () => {
  it('asks about power when electronics are mentioned and power is not', () => {
    const ids = deriveQuestions(ctx({ 'product.elements': ['Electronics'] })).map((q) => q.id)
    expect(ids).toContain('electronics-power')
  })

  it('stops asking about power once the visitor covers it', () => {
    const ids = deriveQuestions(
      ctx({ 'product.elements': ['Electronics', 'A battery or power source'] }),
    ).map((q) => q.id)
    expect(ids).not.toContain('electronics-power')
  })

  it('reads the visitor’s own words, not just the checkboxes', () => {
    /* Someone describing a coffee product without ticking "food contact"
       should still be asked the materials question. */
    const ids = deriveQuestions(
      ctx({ 'idea.description': 'A portable espresso maker for campers' }),
    ).map((q) => q.id)
    expect(ids).toContain('food-contact-materials')
    expect(ids).toContain('outdoor-conditions')
  })

  it('asks what a prototype proved, once one exists', () => {
    const ids = deriveQuestions(ctx({ 'state.artifacts': ['A functional prototype'] })).map(
      (q) => q.id,
    )
    expect(ids).toContain('prototype-learning')
  })

  it('stops asking once the visitor records what it proved', () => {
    const ids = deriveQuestions(
      ctx({
        'state.artifacts': ['A functional prototype'],
        'state.notes': 'It leaked at the seal under pressure.',
      }),
    ).map((q) => q.id)
    expect(ids).not.toContain('prototype-learning')
  })

  it('asks which assumptions to confirm, once any exist', () => {
    const base = deriveQuestions(ctx({ 'idea.description': 'A thing' })).map((q) => q.id)
    expect(base).not.toContain('assumptions-to-confirm')

    const assumed = setAnswer(
      createProjectContext('idea'),
      'reality.price',
      '£120',
      'user',
      'assumed',
    )
    expect(deriveQuestions(assumed).map((q) => q.id)).toContain('assumptions-to-confirm')
  })

  it('treats an explicit unknown as unanswered, not as an answer', () => {
    const unknown = setAnswer(
      createProjectContext('idea'),
      'person.user',
      'Not yet known',
      'user',
      'unknown',
    )
    /* Saying "I don't know" must keep the question alive — that is the entire
       point of recording it. */
    expect(deriveQuestions(unknown).map((q) => q.id)).toContain('no-user')
  })
})

describe('the output is stable and deduplicated', () => {
  it('returns each question at most once', () => {
    const ids = deriveQuestions(
      ctx({
        'idea.description': 'A wearable espresso machine with electronics and liquids',
        'product.elements': ['Electronics', 'Liquids', 'Contact with skin or body'],
      }),
    ).map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not reshuffle between identical runs', () => {
    const context = ctx({ 'idea.description': 'A thing', 'product.elements': ['Electronics'] })
    expect(deriveQuestions(context).map((q) => q.id)).toEqual(
      deriveQuestions(context).map((q) => q.id),
    )
  })

  it('surfaces more questions as more is said, not fewer', () => {
    const sparse = deriveQuestions(ctx({ 'idea.description': 'A thing' }))
    const rich = deriveQuestions(
      ctx({
        'idea.description': 'A thing',
        'product.elements': ['Electronics', 'Liquids'],
        'state.artifacts': ['A prototype'],
      }),
    )
    expect(rich.length).toBeGreaterThan(sparse.length)
  })
})
