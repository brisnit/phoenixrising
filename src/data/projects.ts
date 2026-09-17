/* ===========================================================================
 * PROJECTS — EVIDENCE LIBRARY
 * ---------------------------------------------------------------------------
 * Phase 6 replaced the Round 1 portfolio with an evidence model.
 *
 * WHY THERE ARE NO PROJECTS IN THIS FILE
 * Round 1 shipped four "case studies". Every one was a structural placeholder:
 * `[Project One]`, `[20XX]`, `[PLACEHOLDER]` narratives, coded SVG plates
 * standing in for photography, and `result` fields left deliberately unfilled.
 * They named no client and invented no metric — that part was handled
 * honestly — but they were still four pieces of furniture arranged to look
 * like a body of work.
 *
 * None of them contains a single item of real evidence, so none of them is
 * published. `projects` is empty and `/projects` renders an honest empty state
 * that explains what evidence a project can carry. The detail template is
 * built, tested against a fixture, and ready for the first real project.
 *
 * The bar for publishing: a project needs at least one evidence item whose
 * provenance is NOT `illustrative` or `pending`. `isPublishable` enforces it.
 * ======================================================================== */

import type { PlateVariant } from '@/components/media/plates'

/**
 * Where an evidence item came from.
 *
 * The three that count as real evidence are `verified`, `client-provided` and
 * `phoenix-provided`. `illustrative` marks generated or generic material that
 * demonstrates a concept and proves nothing about a project; `pending` marks
 * a slot awaiting the real thing. The distinction is the point of the model:
 * a coded technical plate must never be able to sit in a gallery looking like
 * a photograph of work that happened.
 */
export type EvidenceProvenance =
  | 'verified'
  | 'client-provided'
  | 'phoenix-provided'
  | 'illustrative'
  | 'pending'

/** Provenances that constitute real evidence of work done. */
export const REAL_PROVENANCE: readonly EvidenceProvenance[] = [
  'verified',
  'client-provided',
  'phoenix-provided',
]

export const isRealEvidence = (item: EvidenceItem) => REAL_PROVENANCE.includes(item.provenance)

/** Human-readable label. Rendered as text — never as colour alone. */
export const PROVENANCE_LABEL: Record<EvidenceProvenance, string> = {
  verified: 'Verified',
  'client-provided': 'Client provided',
  'phoenix-provided': 'Phoenix Rising provided',
  illustrative: 'Illustrative',
  pending: 'Awaiting evidence',
}

export type EvidenceStage = 'development' | 'prototype' | 'manufacturing' | 'product' | 'outcome'

export type EvidenceItem = {
  id: string
  stage: EvidenceStage
  title: string
  description?: string
  /** `image` is real media; `plate` is a coded composition and never proof. */
  media?: { image?: string; alt?: string; plate?: PlateVariant }
  caption?: string
  provenance: EvidenceProvenance
  /** Only when actually known. Never approximated to look complete. */
  date?: string
}

export type Project = {
  slug: string
  name: string
  summary: string
  /** Named only with permission; omitted entirely otherwise. */
  client?: string
  year?: string
  /** Narrative sections. Each is optional — a missing one renders nothing. */
  challenge?: string
  startingPoint?: string
  questions?: readonly string[]
  whatChanged?: string
  currentState?: string
  evidence: readonly EvidenceItem[]
  /** Chosen per project, not stamped on every one. */
  journeyCta?: { prompt: string; label: string; href: string }
}

/**
 * A project may be published only when it can show something real.
 *
 * Without this, the model would happily render a page of "Awaiting evidence"
 * slots and illustrative plates under a project name — which is precisely the
 * fictional credibility the phase exists to avoid.
 */
export const isPublishable = (project: Project) => project.evidence.some(isRealEvidence)

/** Published projects. Empty until real evidence exists — see the file note. */
export const projects: readonly Project[] = []

export const publishedProjects = projects.filter(isPublishable)

export const projectBySlug = (slug: string) =>
  publishedProjects.find((p) => p.slug === slug)

/* ---------------------------------------------------------------------------
 * PAGE CONTENT
 * ------------------------------------------------------------------------ */

export const projectsIntro = {
  eyebrow: 'Evidence',
  lines: ['The work', 'leaves evidence.'],
  body: 'Products become real through decisions, prototypes, specifications, production information and finished objects. This is where that work can be shown — as the things themselves, not as claims about them.',
} as const

/**
 * What a project can carry.
 *
 * This is content about the system rather than about any project, which is
 * what makes the page useful while it is empty: a visitor learns what
 * Phoenix Rising considers evidence, and a prospective client learns exactly
 * what would be needed to publish their project.
 */
export const evidenceTaxonomy: readonly {
  stage: EvidenceStage
  title: string
  note: string
  items: readonly string[]
}[] = [
  {
    stage: 'development',
    title: 'Development',
    note: 'How the product was decided — the part that is usually invisible afterwards.',
    items: [
      'The problem or brief',
      'Requirements',
      'Design iterations',
      'Decisions made',
      'Questions answered',
      'Changes between versions',
    ],
  },
  {
    stage: 'prototype',
    title: 'Prototype',
    note: 'What was built to answer a question, and what the answer turned out to be.',
    items: [
      'Prototype photography',
      'Prototype progression',
      'What each one was built to test',
      'Material studies',
      'Test results against stated criteria',
    ],
  },
  {
    stage: 'manufacturing',
    title: 'Manufacturing',
    note: 'What it took to make the same thing again, to the same standard.',
    items: [
      'Manufacturing considerations',
      'Production information',
      'Tooling evidence',
      'Production samples',
      'Assembly information',
      'Quality criteria',
      'Packaging requirements',
    ],
  },
  {
    stage: 'product',
    title: 'Product',
    note: 'The object itself, at whatever stage of reality it reached.',
    items: [
      'Final product photography',
      'CAD and technical drawings',
      'Exploded views',
      'Components',
      'Packaging',
    ],
  },
  {
    stage: 'outcome',
    title: 'Outcome',
    note: 'What changed, what was learned, and what actually reached production.',
    items: [
      'What changed',
      'What was learned',
      'What was delivered',
      'What reached production',
    ],
  },
] as const

export const evidenceEmptyState = {
  eyebrow: 'Current state',
  lines: ['Nothing here yet.'],
  body: [
    'Phoenix Rising has not published a project on this site. That is a statement about what has been cleared for publication, not about what has been built — client work carries confidentiality, and photography, drawings and outcomes need permission before they can be shown.',
    'The alternative was four placeholder case studies with invented narratives and generated imagery standing in for photographs. Those were here until this phase and have been removed. A portfolio that cannot be checked is worth less than an empty one that can.',
  ],
  /* Stated plainly so the emptiness reads as a standard rather than a gap. */
  standard:
    'A project appears here when it can show at least one real thing — a photograph, a drawing, a sample, a documented decision — with a named source. Illustrative material is labelled as such and never counted as evidence.',
} as const

/* ---------------------------------------------------------------------------
 * CONTENT REQUEST — internal
 * ---------------------------------------------------------------------------
 * Not rendered. This is the list to work through with a client for each
 * project that might be published.
 * ------------------------------------------------------------------------ */

export const projectContentRequest: readonly {
  group: string
  items: readonly string[]
  blocking: boolean
}[] = [
  {
    group: 'Permissions — nothing can be published without these',
    blocking: true,
    items: [
      'Customer permission to reference the project at all',
      'Whether the client may be named, or whether it must stay anonymous',
      'Whether the product may be named and shown',
      'Attribution permissions for any photography',
      'What manufacturing detail may be publicly disclosed',
      'Confidentiality constraints and any embargo date',
    ],
  },
  {
    group: 'The project',
    blocking: false,
    items: [
      'Project name, or an acceptable anonymised description',
      'Product description and what it is for',
      'Sector and intended customer',
      'Starting state — what existed when Phoenix Rising became involved',
      'Final state — what it became',
      'Dates, or at least the year',
    ],
  },
  {
    group: 'Evidence — images and documents',
    blocking: false,
    items: [
      'Prototype photography, ideally showing progression between versions',
      'Final product photography',
      'Production photography, where disclosable',
      'CAD screenshots, technical drawings or exploded views',
      'Packaging photography',
      'Component or material studies',
    ],
  },
  {
    group: 'The story',
    blocking: false,
    items: [
      'The problem or brief as originally stated',
      'Key decisions made, and what they were between',
      'Questions the prototypes were built to answer',
      'What changed between versions, and why',
      'Manufacturing details that can be publicly disclosed',
    ],
  },
  {
    group: 'Outcome — only with substantiation',
    blocking: false,
    items: [
      'What was delivered and what reached production',
      'Measurable results, WITH the source of each figure',
      'A testimonial, with the named person’s approval to publish it',
    ],
  },
] as const
