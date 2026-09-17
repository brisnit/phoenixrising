'use client'

import { briefCopy } from '@/data/ideation'
import type { ProjectBrief } from '@/data/ideationBrief'
import { cn } from '@/lib/utils'

/**
 * The live brief.
 *
 * Populates as the visitor works, which is the point: the feeling should be
 * that thinking is becoming organised, not that a form is being completed.
 *
 * DELIBERATELY NOT A LIVE REGION. An `aria-live` rail would announce on every
 * keystroke, which is unusable — a screen-reader user typing a paragraph
 * would hear it read back continuously. Discrete events (section changes,
 * clipboard success) are announced instead, from a single polite region in
 * the workspace. The rail is reachable at any time as an ordinary landmark.
 */
export function BriefRail({
  brief,
  onJump,
  className,
}: {
  brief: ProjectBrief
  onJump?: (section: string) => void
  className?: string
}) {
  const { counts } = brief

  return (
    <aside
      aria-labelledby="brief-rail-heading"
      data-brief-rail
      className={cn('border-l rule-light pl-6', className)}
    >
      <h2 id="brief-rail-heading" className="label-mono text-slate">
        Project brief — so far
      </h2>

      {/* Factual counts only. Never a score, a percentage or a judgement. */}
      <p className="mt-3 text-[0.95rem] leading-relaxed text-steel/85" data-brief-counts>
        <span className="text-ink">
          {counts.sectionsExplored} of {counts.sectionsTotal}
        </span>{' '}
        areas explored ·{' '}
        <span className="text-ink">{counts.questions}</span>{' '}
        {counts.questions === 1 ? 'question' : 'questions'} to resolve
      </p>

      <div className="mt-8 grid gap-7">
        {brief.sections.map((section) => (
          <div key={section.id} data-brief-section={section.id}>
            <p className="label-mono text-blue">{section.title}</p>
            {section.entries.length === 0 ? (
              <p className="mt-2 text-sm text-slate">{briefCopy.empty}</p>
            ) : (
              <ul className="mt-2 grid gap-2">
                {section.entries.map((entry) => (
                  <li key={entry.fieldId} className="text-[0.92rem] leading-relaxed">
                    {entry.state === 'unknown' ? (
                      <span className="text-slate">
                        {entry.label} — {briefCopy.unknownLabel}
                      </span>
                    ) : (
                      <span className="text-steel">
                        {onJump ? (
                          <button
                            type="button"
                            onClick={() => onJump(entry.section)}
                            className="text-left underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-cyan hover:text-blue"
                          >
                            {truncate(entry.value)}
                          </button>
                        ) : (
                          truncate(entry.value)
                        )}
                        {entry.state === 'assumed' && (
                          <span className="label-mono ml-2 text-slate">
                            ({briefCopy.assumedLabel})
                          </span>
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

/* The rail is a glance, not the document — the full value is on the brief. */
function truncate(value: string, max = 90) {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean
}
