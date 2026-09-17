/* ===========================================================================
 * PROJECT BRIEF
 * ---------------------------------------------------------------------------
 * Assembles the visitor's own answers into a readable document.
 *
 * It synthesises NOTHING. Every line is something the visitor typed or chose,
 * reproduced as written. The brief adds structure, the visible distinction
 * between known / assumed / unknown, and the derived questions — and nothing
 * else. There is no summarisation, no rewording and no interpretation,
 * because all three would put words the visitor did not write into a document
 * they are about to send to someone.
 * ======================================================================== */

import {
  allIdeationFields,
  briefSections,
  fieldById,
  ideationSections,
  type BriefSectionId,
} from './ideation'
import { deriveQuestions, type IdeationQuestion } from './ideationQuestions'
import { answerState, type InformationState, type ProjectContext } from './projectContext'

export type BriefEntry = {
  fieldId: string
  label: string
  /** As written. Arrays are joined for display only. */
  value: string
  state: InformationState
  /** Which workspace section to jump back to. */
  section: string
}

export type BriefSection = {
  id: BriefSectionId
  title: string
  note: string
  entries: BriefEntry[]
  /** True when the visitor has recorded nothing here yet. */
  empty: boolean
}

export type ProjectBrief = {
  sections: BriefSection[]
  questions: IdeationQuestion[]
  /** Fields explicitly marked as not yet known. */
  unknowns: BriefEntry[]
  counts: BriefCounts
}

/**
 * Factual counts only.
 *
 * These describe how much information exists. They must never be turned into
 * a percentage, a score, a readiness rating or a judgement — an "idea score"
 * would be a claim about quality that nothing here can support. Guarded by
 * test.
 */
export type BriefCounts = {
  sectionsExplored: number
  sectionsTotal: number
  answered: number
  fieldsTotal: number
  assumptions: number
  unknowns: number
  questions: number
}

const sectionOfField = (fieldId: string) =>
  ideationSections.find((s) => s.fields.some((f) => f.id === fieldId))?.id ?? 'idea'

export function buildBrief(context: ProjectContext): ProjectBrief {
  const entriesFor = (briefId: BriefSectionId): BriefEntry[] =>
    allIdeationFields
      .filter((field) => field.brief === briefId)
      .flatMap((field) => {
        const answer = context.answers[field.id]
        if (!answer) return []
        const state = answerState(answer)
        const value = Array.isArray(answer.value) ? answer.value.join(', ') : answer.value
        /* An unknown answer has no text of its own — it is recorded as the
           absence of one, and the brief shows it as such. */
        if (state !== 'unknown' && value.trim() === '') return []
        return [
          {
            fieldId: field.id,
            label: field.label,
            value,
            state,
            section: sectionOfField(field.id),
          },
        ]
      })

  const sections: BriefSection[] = briefSections.map((meta) => {
    const entries = entriesFor(meta.id)
    return {
      ...meta,
      entries,
      empty: entries.filter((e) => e.state !== 'unknown').length === 0,
    }
  })

  const all = sections.flatMap((s) => s.entries)
  const unknowns = all.filter((e) => e.state === 'unknown')
  const questions = deriveQuestions(context)

  return {
    sections,
    questions,
    unknowns,
    counts: {
      sectionsExplored: sections.filter((s) => !s.empty).length,
      sectionsTotal: sections.length,
      answered: all.filter((e) => e.state !== 'unknown').length,
      fieldsTotal: allIdeationFields.length,
      assumptions: all.filter((e) => e.state === 'assumed').length,
      unknowns: unknowns.length,
      questions: questions.length,
    },
  }
}

/** True once there is anything worth showing — used to offer "continue". */
export const hasIdeationContent = (context: ProjectContext) =>
  Object.keys(context.answers).length > 0

/**
 * Plain-text rendering, for the clipboard.
 *
 * Deliberately plain text rather than Markdown or HTML: it has to paste
 * legibly into an email, a document and a chat window without carrying
 * formatting that one of them will mangle.
 */
export function briefToText(context: ProjectContext): string {
  const brief = buildBrief(context)
  const lines: string[] = ['PROJECT BRIEF', '']

  lines.push(
    'Prepared in the Phoenix Rising ideation workspace. This organises what the',
    'author knows today and the questions still to resolve. It is a starting',
    'point for a product-development conversation — not a technical',
    'specification, and not an assessment of whether the product can be made.',
    '',
  )

  for (const section of brief.sections) {
    const shown = section.entries
    if (shown.length === 0) continue
    lines.push(section.title.toUpperCase(), '')
    for (const entry of shown) {
      const suffix =
        entry.state === 'unknown' ? ' — not yet known' : entry.state === 'assumed' ? ' — assumed' : ''
      lines.push(`${entry.label}${suffix}`)
      if (entry.state !== 'unknown') lines.push(entry.value)
      lines.push('')
    }
  }

  if (brief.questions.length > 0) {
    lines.push('QUESTIONS TO RESOLVE', '')
    lines.push('Derived from the information above. These are questions to think', 'about, not conclusions about the product.', '')
    brief.questions.forEach((q, i) => {
      lines.push(`${String(i + 1).padStart(2, '0')}. ${q.question}`)
      lines.push(`    ${q.because}`)
      lines.push('')
    })
  }

  lines.push(
    '—',
    `${brief.counts.sectionsExplored} of ${brief.counts.sectionsTotal} areas explored · ` +
      `${brief.counts.questions} question${brief.counts.questions === 1 ? '' : 's'} to resolve`,
    'Phoenix Rising has not received this brief.',
  )

  return lines.join('\n')
}

/** Label for a field id, used by the live rail. */
export const labelFor = (fieldId: string) => fieldById(fieldId)?.label ?? fieldId
