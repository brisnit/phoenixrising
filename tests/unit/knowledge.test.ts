import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  FORBIDDEN_IN_CORPUS,
  knowledgeCorpus,
  topics,
  type KnowledgeEntry,
} from '@/data/knowledge'
import { DeterministicRetriever, normalise } from '@/lib/knowledge/retriever'

/**
 * Guards the knowledge the model is allowed to speak from.
 *
 * This is the highest-leverage test file in the project. Eight phases went
 * into removing unverified claims, pending facts and placeholder content from
 * the site — and a single corpus entry carrying any of it back would let a
 * model restate all of it, fluently and with apparent authority, to every
 * visitor who asks.
 */

const corpusText = knowledgeCorpus
  .map((e) => `${e.title} ${e.content} ${e.keywords.join(' ')}`)
  .join(' ')
  .toLowerCase()

describe('the corpus contains only approved knowledge', () => {
  it('makes none of the claims eight phases removed', () => {
    for (const forbidden of FORBIDDEN_IN_CORPUS) {
      expect(corpusText, `the corpus reintroduces ${forbidden}`).not.toMatch(forbidden)
    }
  })

  it('still allows the site to DENY a removed claim', () => {
    /* The fit-review entry says a fit review is not "a formal manufacturing
       or supplier audit". Denials must survive the filter — banning the topic
       rather than the claim would delete the disclaimer. */
    const fitReview = knowledgeCorpus.find((e) => e.id === 'fit-review')!
    expect(fitReview.content.toLowerCase()).toContain('supplier audit')
    expect(fitReview.content.toLowerCase()).toMatch(/is not|not:/)
  })

  it('excludes the internal ledgers by import boundary, not by filtering', () => {
    /* You cannot forget to filter something you never imported. */
    const source = readFileSync('src/data/knowledge.ts', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    for (const banned of [
      'pendingCompanyInformation',
      'quarantinedClaims',
      'claimDispositions',
      'projectContentRequest',
      'testimonialRequirements',
      'ENGAGEMENT_LIFECYCLE',
      'CURRENT_RUNTIME_STATE',
    ]) {
      expect(source, `knowledge.ts imports the excluded source ${banned}`).not.toContain(banned)
    }
  })

  it('states no count of anything', () => {
    /* No factory, staff, client, project or year counts — Phoenix has
       published none, and a number is the easiest thing for a model to
       repeat confidently. */
    /* Scoped to counts OF PHOENIX. "thousands of times over" describes how
       often a product has to be built and is legitimate published copy. */
    for (const pattern of [
      /\b\d+\+?\s*(factories|clients|customers|engineers|staff|employees|partners)\b/i,
      /\b(dozens|hundreds|thousands) of (factories|clients|customers|projects|partners)\b/i,
      /\b(we|phoenix rising) (have|has|own|owns|operate|operates) \d/i,
    ]) {
      expect(corpusText, `the corpus states a count: ${pattern}`).not.toMatch(pattern)
    }
  })

  it('publishes no commercial figure', () => {
    expect(corpusText).not.toMatch(/[$£€]\s?\d/)
    for (const term of ['fee is', 'costs from', 'per hour', 'retainer', 'minimum order']) {
      expect(corpusText, `the corpus publishes "${term}"`).not.toContain(term)
    }
  })

  it('gives every entry a real source a visitor can read', () => {
    for (const entry of knowledgeCorpus) {
      expect(entry.source.route.startsWith('/'), `${entry.id} has no route`).toBe(true)
      expect(entry.source.label.length, `${entry.id} has no source label`).toBeGreaterThan(1)
      expect(entry.content.length, `${entry.id} is empty`).toBeGreaterThan(80)
      expect(['approved', 'published']).toContain(entry.verification)
    }
  })

  it('marks only client-confirmed facts as approved', () => {
    const approved = knowledgeCorpus.filter((e) => e.verification === 'approved')
    /* Exactly one entry carries the four confirmed facts. Everything else is
       the site describing its own position, which is a weaker claim. */
    expect(approved.map((e) => e.id)).toEqual(['approved-company-facts'])
  })

  it('has unique ids and covers the site', () => {
    const ids = knowledgeCorpus.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const topic of ['company', 'process', 'capabilities', 'engagement', 'evidence']) {
      expect(topics, `no knowledge about ${topic}`).toContain(topic)
    }
  })

  it('says openly that no projects are published', () => {
    const evidence = knowledgeCorpus.find((e) => e.id === 'evidence-philosophy')!
    expect(evidence.content.toLowerCase()).toMatch(/not published|nothing here yet/)
  })
})

describe('retrieval', () => {
  const retriever = new DeterministicRetriever()

  it('normalises away punctuation and noise words', () => {
    /* The company name is dropped when other signal survives. */
    expect(normalise('What, exactly, does Phoenix Rising DO?')).toEqual(['exactly'])
    /* ...and kept when it is all there is. */
    expect(normalise('What does Phoenix Rising do?')).toEqual(['phoenix', 'rising'])
    expect(normalise('fit review & onboarding!')).toEqual(['fit', 'review', 'onboarding'])
  })

  it('answers the single most important question the site can be asked', () => {
    /* REGRESSION. Making the company name a stop word left "What does
       Phoenix Rising do?" with zero terms — every other word was already a
       stop word — so retrieval came back empty and production answered
       "That isn't something Phoenix Rising has published yet."
    
       The name is now dropped only when the question has other signal. */
    for (const question of [
      'What does Phoenix Rising do?',
      'What is Phoenix Rising?',
      'Who is Phoenix Rising?',
    ]) {
      const { hits, empty } = retriever.retrieve({ text: question })
      expect(empty, `"${question}" retrieved nothing`).toBe(false)
      expect(hits[0].entry.id, `"${question}" found the wrong entry`).toBe('what-phoenix-does')
    }
  })

  it('still drops the company name when the question has other signal', () => {
    /* The original ranking fix must survive the regression fix. */
    expect(normalise('Where is Phoenix Rising based?')).toEqual(['based'])
    const { hits } = retriever.retrieve({ text: 'Where is Phoenix Rising based?' })
    expect(hits.map((h) => h.entry.id)).toContain('california-guangzhou')
  })

  it('finds the fit review for a fit-review question', () => {
    const { hits, empty } = retriever.retrieve({ text: 'What is a fit review?' })
    expect(empty).toBe(false)
    expect(hits[0].entry.id).toBe('fit-review')
  })

  it('finds the process for a process question', () => {
    const { hits } = retriever.retrieve({ text: 'How do you develop products?' })
    expect(hits.map((h) => h.entry.id)).toContain('development-process')
  })

  it('finds the geography for a location question', () => {
    const { hits } = retriever.retrieve({ text: 'Where is Phoenix Rising based?' })
    expect(hits.map((h) => h.entry.id)).toContain('california-guangzhou')
  })

  it('explains sparse evidence when asked about projects', () => {
    const { hits } = retriever.retrieve({ text: 'Can I see some case studies?' })
    expect(hits.map((h) => h.entry.id)).toContain('evidence-philosophy')
  })

  it('never supplies an answer to something Phoenix has not published', () => {
    /* The most important retrieval behaviour, stated correctly.
    
       "Empty" is not the only acceptable outcome, and insisting on it was
       wrong: for "how much does onboarding cost?", retrieving the entry that
       says fees are agreed per project and are NOT published is strictly
       better than retrieving nothing — it gives the model grounded text for
       the refusal instead of leaving it to improvise one.
    
       What must never happen is retrieval handing back something that reads
       like an answer. So: either nothing, or something that disclaims. */
    const disclaims =
      /not published|has not published|agreed per project|does not publish|not yet known|has not received|nothing (here|on this page)|not a claim|as its own|does not own|no others/i

    for (const question of [
      'How much does onboarding cost?',
      'What is your hourly rate?',
      'How many factories do you own?',
      'Who founded the company?',
      'What is your street address?',
      'Are you ISO certified?',
    ]) {
      const { hits, empty } = retriever.retrieve({ text: question })
      if (empty) continue
      const text = hits.map((h) => h.entry.content).join(' ')
      expect(
        disclaims.test(text),
        `"${question}" retrieved ${hits.map((h) => h.entry.id).join(', ')} with no disclaimer`,
      ).toBe(true)
    }
  })

  it('returns nothing at all for the questions with no related content', () => {
    for (const question of ['What is your VAT number?', 'Do you sell shoes?']) {
      expect(retriever.retrieve({ text: question }).empty, question).toBe(true)
    }
  })

  it('weights by route without inventing relevance', () => {
    const neutral = retriever.retrieve({ text: 'What happens next?' })
    const onboarding = retriever.retrieve({ text: 'What happens next?', route: '/onboarding' })
    /* Route can reorder what already matched... */
    if (!neutral.empty && !onboarding.empty) {
      const boost = onboarding.hits.find((h) => h.entry.routes.includes('/onboarding'))
      expect(boost).toBeDefined()
    }
    /* ...but it can never make an unmatched question return something. */
    const unrelated = retriever.retrieve({ text: 'Do you sell shoes?', route: '/onboarding' })
    expect(unrelated.empty, 'route weighting created relevance from nothing').toBe(true)
  })

  it('returns nothing for an empty or noise-only question', () => {
    expect(retriever.retrieve({ text: '' }).empty).toBe(true)
    expect(retriever.retrieve({ text: 'the a of and' }).empty).toBe(true)
  })

  it('is deterministic and bounded', () => {
    const q = { text: 'How does Phoenix approach manufacturing and production?' }
    const a = retriever.retrieve(q).hits.map((h) => h.entry.id)
    const b = retriever.retrieve(q).hits.map((h) => h.entry.id)
    expect(a).toEqual(b)
    expect(a.length).toBeLessThanOrEqual(4)
  })

  it('can be swapped for a different implementation', () => {
    /* The interface is the point — vector retrieval must be able to replace
       this without Ask Phoenix changing. */
    const fake: KnowledgeEntry = {
      ...knowledgeCorpus[0],
      id: 'only-entry',
      title: 'Widgets',
      content: 'Everything about widgets and more widgets for widget people.',
      keywords: ['widget'],
    }
    const custom = new DeterministicRetriever([fake])
    expect(custom.retrieve({ text: 'widget' }).hits[0].entry.id).toBe('only-entry')
    expect(custom.retrieve({ text: 'fit review' }).empty).toBe(true)
  })
})
