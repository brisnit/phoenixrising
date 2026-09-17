/* ===========================================================================
 * PHOENIX KNOWLEDGE CORPUS
 * ---------------------------------------------------------------------------
 * What Ask Phoenix is allowed to state as fact about Phoenix Rising.
 *
 * DERIVED, NOT COPIED. Every entry is built from the same data structures the
 * site renders. That is the whole design: a hand-written corpus would drift
 * from the site the first time copy changed, and the drift would be invisible
 * — the model would keep confidently stating something the site no longer
 * says. Deriving it means the corpus cannot describe a Phoenix Rising that
 * does not exist on the page.
 *
 * WHAT IS STRUCTURALLY EXCLUDED
 * The repository contains several bodies of text that must never reach a
 * model as authoritative Phoenix fact:
 *
 *   · `pendingCompanyInformation`  — what we do NOT know (founders, addresses)
 *   · `quarantinedClaims`          — unverified capability claims
 *   · `claimDispositions`          — the removed Round 1 claims, verbatim
 *   · `projectContentRequest`      — an internal asset checklist
 *   · placeholder contact details  — `contact.placeholder === true`
 *   · `ENGAGEMENT_LIFECYCLE`       — future states that do not exist yet
 *   · test fixtures, projects (empty), testimonials (empty)
 *
 * These are excluded by construction — this file imports none of them — and
 * `tests/unit/knowledge.test.ts` asserts their vocabulary never appears in a
 * built entry. Exclusion by import boundary rather than by filtering matters:
 * you cannot forget to filter something you never had.
 * ======================================================================== */

import { capabilityFamilies, capabilitiesIntro } from './capabilities'
import {
  approvedCompanyFacts,
  companyThesis,
  distanceStatement,
  howThisChangesTheWork,
  informationFlow,
  locations,
  origin,
  twoWorlds,
} from './company'
import { workspaceIntro } from './ideation'
import {
  engagementPath,
  entryPoints,
  fitReview,
  onboardingNotice,
} from './onboarding'
import { processIntro, processStages, qualityPrinciple, shortRunCaveat } from './process'
import { evidenceEmptyState, evidenceTaxonomy, projectsIntro } from './projects'
import { company, directContact, primaryCta, statement, whyPhoenix } from './site'
import { spaceBetween } from './spaceBetween'
import { stages } from './stages'

export type KnowledgeTopic =
  | 'company'
  | 'positioning'
  | 'geography'
  | 'process'
  | 'capabilities'
  | 'engagement'
  | 'evidence'
  | 'ideation'
  | 'contact'

/**
 * `verification` records what kind of statement an entry is.
 *
 * `approved`  — a fact Phoenix Rising confirmed (the four company facts).
 * `published` — something the site states publicly about how it works. True
 *               as a description of the site's own position, and the model
 *               may state it, but it is not a client-confirmed fact.
 *
 * There is deliberately no third value. Anything that would need one does not
 * belong in the corpus.
 */
export type KnowledgeVerification = 'approved' | 'published'

export type KnowledgeEntry = {
  id: string
  topic: KnowledgeTopic
  title: string
  content: string
  /** Where a visitor can read this on the site. */
  source: { label: string; route: string }
  verification: KnowledgeVerification
  /** Routes this entry is especially relevant to, for retrieval weighting. */
  routes: readonly string[]
  /** Extra retrieval terms that do not appear in the content verbatim. */
  keywords: readonly string[]
}

const join = (...parts: (string | readonly string[] | undefined)[]): string =>
  parts
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .join(' ')

/* ---------------------------------------------------------------------------
 * THE CORPUS
 * ------------------------------------------------------------------------ */

export const knowledgeCorpus: readonly KnowledgeEntry[] = [
  /* --- Company and positioning ------------------------------------- */
  {
    id: 'what-phoenix-does',
    topic: 'company',
    title: 'What Phoenix Rising does',
    content: join(
      company.description,
      statement.body,
      `The axis the company organises around is ${statement.axisLabel}.`,
    ),
    source: { label: 'Home', route: '/' },
    verification: 'published',
    routes: ['/', '/about'],
    keywords: ['what do you do', 'who are you', 'services', 'company', 'overview'],
  },
  {
    id: 'approved-company-facts',
    topic: 'company',
    title: 'Confirmed facts about Phoenix Rising',
    content: join(
      approvedCompanyFacts.map((f) => f.statement),
      'Phoenix Rising has confirmed these four facts about itself and no others. Anything beyond them — founder names, founding date, team size, addresses — has not been published.',
    ),
    source: { label: 'About', route: '/about' },
    verification: 'approved',
    routes: ['/about'],
    keywords: ['facts', 'legal name', 'entity', 'where based', 'company details'],
  },
  {
    id: 'why-phoenix',
    topic: 'positioning',
    title: 'Why Phoenix Rising works the way it does',
    content: join(
      whyPhoenix.body,
      whyPhoenix.pillars.map((p) => `${p.title}: ${p.body}`),
    ),
    source: { label: 'Home', route: '/' },
    verification: 'published',
    routes: ['/', '/about'],
    keywords: ['why', 'different', 'approach', 'philosophy'],
  },
  {
    id: 'company-thesis',
    topic: 'positioning',
    title: 'Market reality and manufacturing reality',
    content: join(companyThesis.body),
    source: { label: 'About', route: '/about' },
    verification: 'published',
    routes: ['/about'],
    keywords: ['thesis', 'position', 'market', 'manufacturing', 'two realities'],
  },

  /* --- Geography ----------------------------------------------------- */
  {
    id: 'california-guangzhou',
    topic: 'geography',
    title: 'California ↔ Guangzhou',
    content: join(
      twoWorlds.lead,
      twoWorlds.worlds.map((w) => `${w.place} — ${w.role}. ${w.summary}`),
      twoWorlds.clarifications.map((c) => c.text),
      locations.note,
    ),
    source: { label: 'About', route: '/about' },
    verification: 'published',
    routes: ['/about'],
    keywords: ['where', 'based', 'located', 'offices', 'california', 'guangzhou', 'china', 'geography'],
  },
  {
    id: 'information-both-ways',
    topic: 'geography',
    title: 'Information moves both ways',
    content: join(
      informationFlow.lead,
      informationFlow.exchanges.map((e) => `${e.label}: ${e.note}`),
      informationFlow.closing,
      distanceStatement.pullQuote,
      distanceStatement.body,
    ),
    source: { label: 'About', route: '/about' },
    verification: 'published',
    routes: ['/about'],
    keywords: ['communication', 'exchange', 'both ways', 'distance', 'intent'],
  },
  {
    id: 'origin',
    topic: 'company',
    title: 'Where Phoenix Rising came from',
    content: join(origin.body, origin.answer),
    source: { label: 'About', route: '/about' },
    verification: 'published',
    routes: ['/about'],
    keywords: ['origin', 'history', 'founded', 'started', 'story'],
  },

  /* --- Process -------------------------------------------------------- */
  {
    id: 'development-process',
    topic: 'process',
    title: 'How Phoenix Rising develops products',
    content: join(
      processIntro.body,
      processIntro.note,
      processStages.map((s) => `${s.index} ${s.title} — ${s.summary} Output: ${s.output}.`),
    ),
    source: { label: 'How we develop products', route: '/how-we-develop' },
    verification: 'published',
    routes: ['/how-we-develop', '/'],
    keywords: ['process', 'stages', 'development', 'how it works', 'steps'],
  },
  {
    id: 'short-run',
    topic: 'process',
    title: 'Short-run production',
    content: shortRunCaveat,
    source: { label: 'How we develop products', route: '/how-we-develop' },
    verification: 'published',
    routes: ['/how-we-develop'],
    keywords: ['short run', 'pilot', 'small batch', 'first production'],
  },
  {
    id: 'quality',
    topic: 'process',
    title: 'Quality starts before production',
    content: join(
      qualityPrinciple.body,
      qualityPrinciple.touchpoints.map((t) => `${t.label}: ${t.note}`),
    ),
    source: { label: 'How we develop products', route: '/how-we-develop' },
    verification: 'published',
    routes: ['/how-we-develop'],
    keywords: ['quality', 'acceptable', 'standard', 'defect'],
  },
  {
    id: 'space-between',
    topic: 'process',
    title: 'The decisions between a design and a finished product',
    content: join(
      spaceBetween.body,
      spaceBetween.layers.map((l) => `${l.label}: ${l.question} ${l.note}`),
    ),
    source: { label: 'How we develop products', route: '/how-we-develop' },
    verification: 'published',
    routes: ['/how-we-develop'],
    keywords: ['decisions', 'between', 'design to production', 'gap'],
  },

  /* --- Capabilities --------------------------------------------------- */
  {
    id: 'capability-families',
    topic: 'capabilities',
    title: 'What Phoenix Rising can help move forward',
    content: join(
      capabilitiesIntro.body,
      capabilitiesIntro.principle.body,
      capabilityFamilies.map((f) =>
        join(
          `${f.title} — ${f.headline.join(' ')}`,
          f.lead,
          `Covers: ${f.focus.map((i) => i.label).join(', ')}.`,
          f.caveat,
        ),
      ),
    ),
    source: { label: 'Capabilities', route: '/capabilities' },
    verification: 'published',
    routes: ['/capabilities', '/'],
    keywords: ['capabilities', 'develop', 'prototype', 'produce', 'deliver', 'can you'],
  },

  /* --- Engagement ----------------------------------------------------- */
  {
    id: 'fit-review',
    topic: 'engagement',
    title: 'What a fit review is',
    content: join(
      fitReview.definition,
      fitReview.body,
      `A fit review is not: ${fitReview.isNot.join('; ')}.`,
      fitReview.caveat,
    ),
    source: { label: 'Onboarding', route: '/onboarding#fit-review' },
    verification: 'published',
    routes: ['/onboarding', '/start'],
    keywords: ['fit review', 'review', 'accepted', 'qualify', 'next step'],
  },
  {
    id: 'engagement-path',
    topic: 'engagement',
    title: 'What happens between starting and the work beginning',
    content: join(
      engagementPath.map((s) =>
        join(`${s.index} ${s.title} — ${s.headline.join(' ')}`, s.lead, s.caveat),
      ),
      onboardingNotice.body,
    ),
    source: { label: 'Onboarding', route: '/onboarding' },
    verification: 'published',
    routes: ['/onboarding', '/start'],
    keywords: ['onboarding', 'engagement', 'what happens', 'after i start', 'scope', 'terms'],
  },
  {
    id: 'entry-points',
    topic: 'engagement',
    title: 'Where a project joins the development path',
    content: join(
      entryPoints.body,
      entryPoints.points.map((p) => `${p.stage} enters at ${p.enters}. ${p.note}`),
      entryPoints.note,
    ),
    source: { label: 'Onboarding', route: '/onboarding' },
    verification: 'published',
    routes: ['/onboarding', '/start'],
    keywords: ['where do i start', 'entry', 'join', 'idea only', 'already have'],
  },
  {
    id: 'start-stages',
    topic: 'engagement',
    title: 'The three places a project can start',
    content: join(
      stages.map((s) => `${s.title}: ${s.statement} ${s.detail} This leads to ${s.outcome}`),
    ),
    source: { label: 'Start a project', route: '/start' },
    verification: 'published',
    routes: ['/start', '/'],
    keywords: ['start', 'idea', 'prototype', 'production', 'begin'],
  },

  /* --- Evidence -------------------------------------------------------- */
  {
    id: 'evidence-philosophy',
    topic: 'evidence',
    title: 'Why no projects are published yet',
    content: join(
      projectsIntro.body,
      evidenceEmptyState.body,
      evidenceEmptyState.standard,
      `A project can show: ${evidenceTaxonomy.map((g) => g.title.toLowerCase()).join(', ')}.`,
    ),
    source: { label: 'Projects', route: '/projects' },
    verification: 'published',
    routes: ['/projects'],
    keywords: ['projects', 'case studies', 'portfolio', 'work', 'examples', 'evidence'],
  },

  /* --- Ideation -------------------------------------------------------- */
  {
    id: 'ideation-workspace',
    topic: 'ideation',
    title: 'The ideation workspace',
    content: join(
      workspaceIntro.lead,
      workspaceIntro.privacy.body,
      'The workspace organises what is known, what is assumed and what is still unknown into a project brief the visitor owns. It reproduces what they write without rewriting it, and it does not assess whether a product can be made.',
    ),
    source: { label: 'Ideation workspace', route: '/ideate' },
    verification: 'published',
    routes: ['/ideate'],
    keywords: ['workspace', 'ideate', 'brief', 'idea', 'organise my thinking'],
  },

  /* --- What the work changes ------------------------------------------ */
  {
    id: 'how-this-changes-the-work',
    topic: 'positioning',
    title: 'What the position changes about the work',
    content: join(howThisChangesTheWork.items.map((i) => `${i.title}: ${i.body}`)),
    source: { label: 'About', route: '/about' },
    verification: 'published',
    routes: ['/about'],
    keywords: ['difference', 'changes', 'practically', 'in practice'],
  },

  /* --- Contact --------------------------------------------------------- */
  {
    id: 'how-to-get-in-touch',
    topic: 'contact',
    title: 'How to get in touch',
    content: join(
      `There are two ways in. "${primaryCta.label}" (${primaryCta.href}) is the structured journey: it asks where the project has reached and prepares a summary in the visitor's browser.`,
      `"${directContact.label}" (${directContact.href}) is the direct path for anyone who would rather just write to a person.`,
      'Neither is currently connected to automatic delivery: a summary prepared in the browser has not been sent to Phoenix Rising, and the site says so.',
    ),
    source: { label: 'Contact', route: '/contact' },
    verification: 'published',
    routes: ['/contact', '/start'],
    keywords: ['contact', 'get in touch', 'email', 'reach', 'talk to'],
  },
]

export const entryById = (id: string) => knowledgeCorpus.find((e) => e.id === id)

export const topics = [...new Set(knowledgeCorpus.map((e) => e.topic))]

/**
 * Claims that must never appear in a corpus entry.
 *
 * ASSERTION-SHAPED, not keyword-shaped. An earlier version banned the bare
 * phrase "supplier audit" and flagged the fit-review entry — which contains
 * it only because the site says a fit review is NOT "a formal manufacturing
 * or supplier audit". Banning the words would have forced the removal of a
 * denial, which is the opposite of the intent.
 *
 * So these match the claim being made, not the topic being discussed.
 */
export const FORBIDDEN_IN_CORPUS: readonly RegExp[] = [
  /stockton/i,
  /\bwe (audit|inspect|certify)\b/i,
  /\baudited in person\b/i,
  /\bcertification support\b/i,
  /\btolerance (analysis|stack-up)\b/i,
  /\bmould-flow\b/i,
  /\bour (factor|production line|engineer|inspector|facilit|plant|supplier)/i,
  /\bonboarding fee\b/i,
  /\bhourly rate\b/i,
  /\bdeposit\b/i,
  /\[project (one|two|three|four)\]/i,
  /\[placeholder/i,
  /still to be supplied/i,
  /\bphoenix rising (owns|operates|has) \d/i,
]
