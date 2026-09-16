import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  aboutCta,
  aboutHero,
  approvedCompanyFacts,
  companyThesis,
  distanceStatement,
  founders,
  howThisChangesTheWork,
  informationFlow,
  locations,
  origin,
  pendingCompanyInformation,
  processBridge,
  twoWorlds,
  twoWorldsTeaser,
} from '@/data/company'
import { company } from '@/data/site'

/**
 * Guards the Phase 5 company story.
 *
 * Phoenix Rising has supplied four facts about itself. A page about a company
 * is the single easiest place on a marketing site to drift from "what we were
 * told" into "what a company like this probably has" — a founding year, a
 * headcount, a square footage, two plausible founder names. None of that was
 * supplied, so none of it may appear, and these tests make the boundary
 * mechanical rather than a matter of care.
 *
 * `PUBLISHED` is every string this page can render. The two ledger exports are
 * excluded from it deliberately: they describe what is missing, so they are
 * allowed to use the vocabulary the published copy is forbidden.
 *
 * That exclusion is only sound while the page does not RENDER the ledger.
 * It did, briefly, and production verification caught it: the gap list was
 * on the live About page, putting the unconfirmed "Stockton" and a note
 * about which brief said what onto a public marketing page. The exclusion is
 * therefore paired with an assertion below that the About page imports
 * neither ledger export — otherwise this file would be modelling a page that
 * does not exist.
 */
const PUBLISHED = JSON.stringify([
  aboutHero,
  companyThesis,
  twoWorlds,
  informationFlow,
  distanceStatement,
  origin,
  founders,
  locations,
  howThisChangesTheWork,
  aboutCta,
  twoWorldsTeaser,
  processBridge,
]).toLowerCase()

const ABOUT_PAGE = readFileSync('src/app/about/page.tsx', 'utf8')

/** The page with comments stripped — so a rule can be *discussed* in a doc
    comment without the discussion itself tripping the rule. */
const ABOUT_CODE = ABOUT_PAGE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

describe('the approved fact ledger', () => {
  it('is exactly the four facts Phoenix Rising supplied', () => {
    expect(approvedCompanyFacts.map((f) => f.id)).toEqual([
      'legal-entity',
      'guangzhou',
      'california',
      'dual-perspective',
    ])
  })

  it('sources every fact — a fact with no source is an invented one', () => {
    for (const fact of approvedCompanyFacts) {
      expect(fact.source.length, `${fact.id} has no source`).toBeGreaterThan(8)
      expect(fact.statement.length).toBeGreaterThan(8)
    }
  })

  it('records the legal entity exactly as confirmed', () => {
    expect(company.legalName).toBe('Phoenix Rising Trading Company, LTD.')
    expect(approvedCompanyFacts[0].statement).toContain(company.legalName)
  })

  it('keeps the ledger internal — it is a note to the client, not page copy', () => {
    /* Nothing unconfirmed is published on About, so there is no placeholder
       for a visitor to mistake for real content and nothing to mark. The
       gap list would only leak unconfirmed detail and internal brief
       history onto a public page. */
    expect(ABOUT_CODE).not.toMatch(/pendingCompanyInformation/)
    expect(ABOUT_CODE).not.toMatch(/approvedCompanyFacts/)
    expect(ABOUT_CODE).not.toMatch(/Still to be supplied/i)
  })

  it('still lists what is missing, so the gaps cannot go quiet', () => {
    const pending = pendingCompanyInformation.join(' ').toLowerCase()
    expect(pending).toMatch(/founder names/)
    expect(pending).toMatch(/portrait/)
    expect(pending).toMatch(/founding date/)
    expect(pending).toMatch(/address/)
    expect(pending).toMatch(/photograph/)
    /* The Round 1 brief said "office in Stockton"; the Phase 5 brief restated
       it as "a California/Stockton connection or office". That is an open
       question about the nature of the presence, not a confirmed address, so
       it belongs here and not on the page. */
    expect(pending).toMatch(/stockton/)
  })
})

describe('geography is confined to the two approved anchors', () => {
  it('uses California and Guangzhou as the anchors', () => {
    expect(twoWorlds.worlds.map((w) => w.id)).toEqual([
      'california',
      'phoenix-rising',
      'guangzhou',
    ])
    expect(locations.places.map((p) => p.name)).toEqual(['California', 'Guangzhou'])
    expect(twoWorldsTeaser.axis).toEqual(['California', 'Guangzhou'])
  })

  it('publishes no city, district or region that was never supplied', () => {
    /* Stockton included: it is not confirmed, so it may not be published even
       though it appeared in an early brief. */
    for (const place of [
      'stockton',
      'shenzhen',
      'shanghai',
      'beijing',
      'dongguan',
      'hong kong',
      'san francisco',
      'los angeles',
      'sacramento',
      'panyu',
      'baiyun',
    ]) {
      expect(PUBLISHED, `publishes unsupported place "${place}"`).not.toContain(place)
    }
  })

  it('publishes no street address, unit or postcode', () => {
    for (const pattern of [
      /\d+\s+[a-z]+\s+(street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd|lane|drive)/i,
      /suite\s+\d/i,
      /\bunit\s+\d/i,
      /floor\s+\d/i,
      /\b\d{5}(-\d{4})?\b/,
      /\bCA\s+\d{5}\b/,
    ]) {
      expect(PUBLISHED, `publishes something address-shaped: ${pattern}`).not.toMatch(pattern)
    }
  })

  it('is confident about Guangzhou without reducing the company to China', () => {
    /* §12: do not hide it, do not let it become the whole proposition. */
    expect(PUBLISHED).toContain('guangzhou')
    const chinaMentions = (PUBLISHED.match(/china/g) ?? []).length
    expect(chinaMentions, 'the word "China" is carrying too much of the story').toBeLessThanOrEqual(2)

    for (const reduction of [
      'china sourcing',
      'sourced in china',
      'made in china',
      'low-cost manufacturing',
      'cheap manufacturing',
      'offshore',
    ]) {
      expect(PUBLISHED, `reduces the position to "${reduction}"`).not.toContain(reduction)
    }
  })
})

describe('no facility or ownership claims', () => {
  const OWNERSHIP =
    /\bour (factor|production line|manufacturing line|engineer|inspector|facilit|plant|warehouse|workshop|staff|employees)/i

  it('claims no factory, line, facility or personnel as its own', () => {
    expect(PUBLISHED).not.toMatch(OWNERSHIP)
    expect(ABOUT_PAGE).not.toMatch(OWNERSHIP)
  })

  it('describes no premises it has not been given', () => {
    for (const claim of [
      'square feet',
      'square metres',
      'sq ft',
      'headquarters',
      'our office',
      'our studio',
      'production centre',
      'production center',
      'owned facility',
      'in-house factory',
      'state-of-the-art',
    ]) {
      expect(PUBLISHED, `describes premises: "${claim}"`).not.toContain(claim)
    }
  })

  it('says plainly that it does not own the manufacturing', () => {
    const disclaimer = `${locations.note} ${twoWorlds.clarifications.map((c) => c.text).join(' ')}`
    expect(disclaimer).toMatch(/does not own|nothing here describes|coordinates with manufacturing/i)
  })

  it('counts nothing it was not given a count for', () => {
    /* No headcount, factory count, partner count, client count or years in
       business. Ordinal indices ("01") and the seven exchange beats are the
       page's own structure, not claims about the business, so the check runs
       against prose only. */
    const prose = [
      ...aboutHero.lines,
      aboutHero.lead,
      ...companyThesis.body,
      twoWorlds.lead,
      ...twoWorlds.worlds.map((w) => w.summary),
      informationFlow.lead,
      informationFlow.closing,
      ...distanceStatement.body,
      ...origin.body,
      origin.answer,
      locations.note,
      ...howThisChangesTheWork.items.map((i) => i.body),
      twoWorldsTeaser.body,
    ].join(' ')

    for (const pattern of [
      /\b\d+\+?\s*(years|clients|customers|factories|partners|projects|products|people|engineers|staff)/i,
      /\bfounded in\b/i,
      /\bsince (19|20)\d{2}\b/i,
      /\bover \d/i,
      /\bmore than \d/i,
    ]) {
      expect(prose, `contains an unsupported count: ${pattern}`).not.toMatch(pattern)
    }
  })
})

describe('founders', () => {
  it('publishes no people, because none have been supplied', () => {
    expect(founders.published).toBe(false)
    expect(founders.people).toHaveLength(0)
  })

  it('renders the people section only when real people exist', () => {
    /* The page must branch on the data rather than on a hard-coded false, so
       that supplying real founders is a data edit and not a component edit. */
    expect(ABOUT_PAGE).toMatch(/founders\.published && founders\.people\.length/)
  })

  it('invents no placeholder names, titles or portraits', () => {
    /* Word-bounded: a substring check fails here for a silly reason — "cto"
       is inside "factory", and "ceo" would be inside any word containing it.
       Short titles have to be matched as words. */
    for (const fake of [
      /\bjohn doe\b/,
      /\bjane (doe|smith)\b/,
      /\bco-?founders?\b/,
      /\bchief (executive|technology|operating) officer\b/,
      /\bmanaging director\b/,
      /\b(ceo|cto|coo|cfo)\b/,
      /\bour founder\b/,
      /\bportrait of\b/,
      /\b(founder|director|president)\s*[,—-]/,
    ]) {
      expect(PUBLISHED, `invents founder detail: ${fake}`).not.toMatch(fake)
    }
  })

  it('keeps the seam ready for real entries', () => {
    /* Shape assertion only: supplying a founder must not require a component
       change. If this drifts, `published: true` would render a broken card. */
    expect(Object.keys(founders)).toEqual(
      expect.arrayContaining(['published', 'people', 'headline', 'lead', 'eyebrow']),
    )
  })

  it('tells the origin story without counting or naming anyone', () => {
    const text = origin.body.join(' ')
    expect(text).toMatch(/american/i)
    expect(text).toMatch(/guangzhou/i)
    expect(text).not.toMatch(/\b(two|three|our|a pair of) founders?\b/i)
    expect(text).not.toMatch(/\bfounded (in|on)\b/i)
  })
})

describe('the California ↔ Guangzhou story', () => {
  it('places the product between the two worlds, in that order', () => {
    expect(twoWorlds.worlds[1].place).toBe('Phoenix Rising')
    expect(twoWorlds.worlds[1].role).toBe('The product')
  })

  it('sets the arrow as the centre of the headline', () => {
    expect(twoWorlds.lines).toEqual(['California', '↔', 'Guangzhou'])
  })

  it('moves information in both directions', () => {
    const directions = informationFlow.exchanges.map((e) => e.direction)
    expect(directions).toContain('outbound')
    expect(directions).toContain('return')
    /* Outbound must come first and return must follow — a story that ends
       pointing at the factory is the one-way version this page rejects. */
    expect(directions.indexOf('return')).toBeGreaterThan(directions.lastIndexOf('outbound') - 1)
    expect(directions[directions.length - 1]).toBe('return')
  })

  it('routes every beat through a real world, and both legs through the middle', () => {
    const ids = new Set(twoWorlds.worlds.map((w) => w.id))
    for (const e of informationFlow.exchanges) {
      expect(ids, `beat ${e.index} sits in unknown world "${e.at}"`).toContain(e.at)
    }
    /* The exchange has to pass THROUGH Phoenix Rising in both directions.
       A story where information goes California → Guangzhou → California
       without stopping in the middle describes a courier, not this company. */
    for (const direction of ['outbound', 'return'] as const) {
      const leg = informationFlow.exchanges.filter((e) => e.direction === direction)
      expect(
        leg.map((e) => e.at),
        `the ${direction} leg never passes through Phoenix Rising`,
      ).toContain('phoenix-rising')
    }
    /* And it starts and ends on the market side. */
    expect(informationFlow.exchanges[0].at).toBe('california')
    expect(informationFlow.exchanges[informationFlow.exchanges.length - 1].at).toBe('california')
  })

  it('ends the exchange back with the people who own the product', () => {
    const last = informationFlow.exchanges[informationFlow.exchanges.length - 1]
    expect(last.label).toMatch(/approval/i)
  })

  it('states that the point is continuity, not logistics', () => {
    const text = `${distanceStatement.lines.join(' ')} ${distanceStatement.pullQuote} ${distanceStatement.body.join(' ')} ${distanceStatement.closing}`
    expect(text).toMatch(/intent/i)
    expect(text).toMatch(/continuity/i)
    expect(text).not.toMatch(/freight|shipping rates|customs|tariff|door-to-door/i)
  })

  it('does not present the market side as marketing services', () => {
    const clarification = twoWorlds.clarifications.map((c) => c.text).join(' ')
    expect(clarification).toMatch(/not marketing work/i)
    for (const agency of [
      'brand strategy',
      'campaign',
      'go-to-market services',
      'advertising',
      'creative agency',
    ]) {
      expect(PUBLISHED, `reads as agency work: "${agency}"`).not.toContain(agency)
    }
  })
})

describe('the story connects to the rest of the site', () => {
  it('sends the homepage teaser to About', () => {
    expect(twoWorldsTeaser.cta.href).toBe('/about')
    expect(twoWorldsTeaser.cta.label).toMatch(/why phoenix rising/i)
  })

  it('renders the teaser on the homepage', () => {
    const home = readFileSync('src/app/page.tsx', 'utf8')
    expect(home).toMatch(/<TwoWorldsTeaser \/>/)
  })

  it('closes About by asking where the project already is', () => {
    expect(aboutCta.lines.join(' ')).toMatch(/where is your project/i)
    expect(aboutCta.primary.href).toBe('/start')
  })

  it('bridges the development story to the company story without retelling it', () => {
    expect(processBridge.cta.href).toBe('/about')
    /* One sentence. A process page that starts carrying company history has
       stopped being a process page. */
    expect(processBridge.text.split('.').filter(Boolean)).toHaveLength(1)
    expect(processBridge.text).not.toMatch(/founded|founder|origin|history|our story/i)
  })

  it('keeps the homepage axis and the About axis the same idea', () => {
    expect(companyThesis.axisLabel).toBe('Customer ↔ Product ↔ Factory')
  })
})
