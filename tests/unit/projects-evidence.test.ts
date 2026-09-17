import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import {
  REAL_PROVENANCE,
  evidenceEmptyState,
  evidenceTaxonomy,
  isPublishable,
  isRealEvidence,
  projectContentRequest,
  projects,
  publishedProjects,
  type EvidenceItem,
  type Project,
} from '@/data/projects'

/**
 * Guards the Phase 6 evidence model.
 *
 * The thing being prevented is specific: a page that looks like a case study
 * but is assembled from generated imagery and invented narrative. Round 1 had
 * four of those. They were honestly labelled — `[Project One]`, `[PLACEHOLDER]`
 * — and they still functioned as a portfolio at a glance, which is what a
 * visitor takes away.
 *
 * So publishing is derived from evidence rather than declared by a flag, and
 * these tests hold that line.
 */

const item = (over: Partial<EvidenceItem> = {}): EvidenceItem => ({
  id: 'e1',
  stage: 'prototype',
  title: 'A prototype',
  provenance: 'illustrative',
  ...over,
})

const project = (over: Partial<Project> = {}): Project => ({
  slug: 'p',
  name: 'A project',
  summary: 'A summary',
  evidence: [],
  ...over,
})

describe('publishing is earned, not declared', () => {
  it('treats only real provenance as evidence', () => {
    expect([...REAL_PROVENANCE].sort()).toEqual([
      'client-provided',
      'phoenix-provided',
      'verified',
    ])
    expect(isRealEvidence(item({ provenance: 'verified' }))).toBe(true)
    expect(isRealEvidence(item({ provenance: 'client-provided' }))).toBe(true)
    expect(isRealEvidence(item({ provenance: 'illustrative' }))).toBe(false)
    expect(isRealEvidence(item({ provenance: 'pending' }))).toBe(false)
  })

  it('will not publish a project with no evidence at all', () => {
    expect(isPublishable(project())).toBe(false)
  })

  it('will not publish a project built only from illustrative material', () => {
    /* This is the Round 1 failure exactly: plates and placeholders arranged
       into something that reads as work. */
    const dressed = project({
      evidence: [
        item({ id: 'a', provenance: 'illustrative' }),
        item({ id: 'b', provenance: 'illustrative' }),
        item({ id: 'c', provenance: 'pending' }),
      ],
    })
    expect(isPublishable(dressed)).toBe(false)
  })

  it('publishes as soon as one real item exists', () => {
    const real = project({
      evidence: [item({ id: 'a', provenance: 'illustrative' }), item({ id: 'b', provenance: 'client-provided' })],
    })
    expect(isPublishable(real)).toBe(true)
  })

  it('derives the published list rather than trusting a flag', () => {
    const source = readFileSync('src/data/projects.ts', 'utf8')
    expect(source).toMatch(/publishedProjects\s*=\s*projects\.filter\(isPublishable\)/)
    /* No `published: boolean` escape hatch on the project type. */
    expect(source).not.toMatch(/^\s*published:\s*boolean/m)
  })
})

describe('the Round 1 portfolio is gone', () => {
  it('publishes no projects, because none has real evidence', () => {
    expect(projects).toHaveLength(0)
    expect(publishedProjects).toHaveLength(0)
  })

  it('carries no placeholder case-study content', () => {
    /* Comments stripped: the file's own header explains what was removed and
       names the placeholders to do so. Discussing the rule must not trip it. */
    const source = readFileSync('src/data/projects.ts', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const ghost of [
      '[Project One]',
      '[Project Two]',
      '[20XX]',
      '[PLACEHOLDER]',
      'consumer-enclosure-programme',
      'precision-hardware-programme',
      'housewares-programme',
      'outdoor-equipment-programme',
    ]) {
      expect(source, `placeholder project content survives: "${ghost}"`).not.toContain(ghost)
    }
  })

  it('retired the showcase that presented them as a body of work', () => {
    expect(existsSync('src/components/sections/ProjectShowcase.tsx')).toBe(false)
  })

  it('invents no metric anywhere in the projects data', () => {
    const source = JSON.stringify([evidenceTaxonomy, evidenceEmptyState]).toLowerCase()
    for (const pattern of [
      /reduced (cost|lead time) by \d/,
      /\b\d+%\b/,
      /\b\d{3,}\s*(units|pieces)/,
      /cut .* in half/,
    ]) {
      expect(source, `projects copy invents a metric: ${pattern}`).not.toMatch(pattern)
    }
  })
})

describe('the empty state is a standard, not an apology', () => {
  it('says what would have to be true to publish', () => {
    expect(evidenceEmptyState.standard).toMatch(/at least one real thing|named source/i)
    expect(evidenceEmptyState.standard).toMatch(/illustrative/i)
  })

  it('explains the absence without claiming unpublished work exists', () => {
    const text = evidenceEmptyState.body.join(' ')
    expect(text).toMatch(/permission|confidential/i)
    /* Must not imply a specific volume of unpublished work — that would be a
       client-count claim wearing a modest hat. */
    expect(text).not.toMatch(/\b(dozens|many|numerous|hundreds)\b/i)
    expect(text).not.toMatch(/\b\d+\s*(projects|clients|programmes)\b/i)
  })
})

describe('the evidence taxonomy', () => {
  it('covers the five stages a project can show', () => {
    expect(evidenceTaxonomy.map((g) => g.stage)).toEqual([
      'development',
      'prototype',
      'manufacturing',
      'product',
      'outcome',
    ])
  })

  it('asks for outcomes without supplying any', () => {
    const outcome = evidenceTaxonomy.find((g) => g.stage === 'outcome')!
    expect(outcome.items.join(' ')).toMatch(/what changed|what was learned/i)
  })
})

describe('the content request is internal and actionable', () => {
  it('leads with permissions, and marks them blocking', () => {
    expect(projectContentRequest[0].group).toMatch(/permission/i)
    expect(projectContentRequest[0].blocking).toBe(true)
  })

  it('requires a source for any figure', () => {
    const outcome = projectContentRequest.find((g) => /outcome/i.test(g.group))!
    expect(outcome.items.join(' ')).toMatch(/with the source of each figure/i)
  })

  it('is not rendered on any page', () => {
    /* Same rule Phase 5 established for the company-fact ledger: a request
       list is a note to the client, not marketing copy. */
    for (const file of ['src/app/projects/page.tsx', 'src/components/sections/EvidencePreview.tsx']) {
      const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      expect(source, `${file} renders the internal content request`).not.toMatch(
        /projectContentRequest/,
      )
    }
  })
})
