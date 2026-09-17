'use client'

import Link from 'next/link'
import { useState } from 'react'
import { briefCopy } from '@/data/ideation'
import { questionsCopy } from '@/data/ideationQuestions'
import type { ProjectBrief } from '@/data/ideationBrief'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MagneticButton } from '@/components/ui/MagneticButton'

/**
 * The project brief — the artifact the whole workspace exists to produce.
 *
 * NOT A DEAD END. Every section links back to the part of the workspace that
 * produced it, and returning preserves everything: Phase 3 established that
 * expectation and breaking it here would be a regression in behaviour even
 * though it is a different feature.
 *
 * The handoff at the bottom states the future case and then immediately
 * corrects to the present, in that order, so the last thing read is what is
 * actually true today.
 */
export function ProjectBriefView({
  brief,
  onJump,
  onCopy,
}: {
  brief: ProjectBrief
  onJump: (section: string) => void
  onCopy: () => Promise<boolean>
}) {
  const [copied, setCopied] = useState(false)
  const { counts } = brief

  return (
    <div className="container-rule pb-(--spacing-section) pt-12" data-brief-view>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Eyebrow className="mb-8">{briefCopy.eyebrow}</Eyebrow>
          <h1 className="text-h1 font-semibold uppercase">
            {briefCopy.lines[0]} <span className="text-slate">{briefCopy.lines[1]}</span>
          </h1>
        </div>
        <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
          <p className="text-lead max-w-[46ch] text-steel/85">{briefCopy.lead}</p>
        </div>
      </div>

      {/* Factual counts. Never a score. */}
      <p className="label-mono mt-12 text-slate" data-brief-summary>
        {counts.sectionsExplored} of {counts.sectionsTotal} areas explored · {counts.answered}{' '}
        {counts.answered === 1 ? 'answer' : 'answers'} recorded
        {counts.assumptions > 0 &&
          ` · ${counts.assumptions} marked as ${counts.assumptions === 1 ? 'an assumption' : 'assumptions'}`}
        {counts.unknowns > 0 &&
          ` · ${counts.unknowns} ${counts.unknowns === 1 ? 'item' : 'items'} not yet known`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <MagneticButton
          type="button"
          variant="solid"
          onClick={async () => {
            const ok = await onCopy()
            setCopied(ok)
            if (ok) window.setTimeout(() => setCopied(false), 4000)
          }}
        >
          {briefCopy.copy}
        </MagneticButton>
        {/* Announced politely; also visible, so the feedback is not audio-only. */}
        <p role="status" aria-live="polite" className="label-mono text-blue">
          {copied ? briefCopy.copied : ''}
        </p>
      </div>

      {/* --- The document ------------------------------------------------ */}
      <div className="mt-16 grid gap-12 sm:mt-20">
        {brief.sections.map((section) => (
          <section key={section.id} data-brief-doc-section={section.id}>
            <div className="grid gap-4 border-t rule-light pt-8 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-3">
                <h2 className="font-display text-h3 font-medium uppercase tracking-[-0.02em]">
                  {section.title}
                </h2>
                <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-slate">
                  {section.note}
                </p>
                <button
                  type="button"
                  onClick={() => onJump(section.entries[0]?.section ?? section.id)}
                  className="label-mono mt-4 border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
                >
                  {section.empty ? 'Add this' : 'Edit this'}
                </button>
              </div>

              <div className="lg:col-span-8 lg:col-start-5">
                {section.entries.length === 0 ? (
                  <p className="text-[0.98rem] italic text-slate">{briefCopy.empty}</p>
                ) : (
                  <dl className="grid gap-6">
                    {section.entries.map((entry) => (
                      <div key={entry.fieldId} data-brief-entry={entry.fieldId}>
                        <dt className="label-mono text-slate">
                          {entry.label}
                          {entry.state === 'assumed' && (
                            <span className="ml-2 text-blue">— {briefCopy.assumedLabel}</span>
                          )}
                        </dt>
                        <dd
                          className={
                            entry.state === 'unknown'
                              ? 'mt-2 text-[1.02rem] italic text-slate'
                              : 'mt-2 whitespace-pre-line text-[1.02rem] leading-relaxed text-ink'
                          }
                        >
                          {entry.state === 'unknown' ? briefCopy.unknownLabel : entry.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* --- Questions --------------------------------------------------- */}
      <section className="mt-16 border-t rule-light pt-10 sm:mt-20" data-brief-questions>
        <Eyebrow className="mb-6">{questionsCopy.eyebrow}</Eyebrow>
        <h2 className="text-h2 font-semibold uppercase">
          {questionsCopy.lines[0]} <span className="text-slate">{questionsCopy.lines[1]}</span>
        </h2>
        <p className="text-lead mt-5 max-w-[60ch] text-steel/85">{questionsCopy.lead}</p>

        {brief.questions.length === 0 ? (
          <p className="mt-8 max-w-[60ch] text-[0.98rem] text-slate">{questionsCopy.empty}</p>
        ) : (
          <ol className="mt-10 border-t rule-light">
            {brief.questions.map((q, i) => (
              <li key={q.id} data-question={q.id} className="border-b rule-light py-6">
                <div className="grid gap-3 lg:grid-cols-12 lg:gap-8">
                  <p className="label-mono text-blue lg:col-span-1">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="font-display text-[1.15rem] font-medium tracking-[-0.01em] lg:col-span-6">
                    {q.question}
                  </p>
                  <div className="lg:col-span-4 lg:col-start-9">
                    <p className="max-w-[44ch] text-[0.92rem] leading-relaxed text-steel/80">
                      {q.because}
                    </p>
                    <button
                      type="button"
                      onClick={() => onJump(q.section)}
                      className="label-mono mt-3 border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
                    >
                      Go to this section
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* --- Handoff ----------------------------------------------------- */}
      <section className="mt-16 border-t rule-light pt-10 sm:mt-20" data-brief-handoff>
        <Eyebrow className="mb-5">Next</Eyebrow>
        <p className="text-lead max-w-[62ch] text-ink">{briefCopy.future}</p>
        <p className="text-lead mt-3 max-w-[62ch] text-slate">{briefCopy.present}</p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href={briefCopy.primary.href} variant="solid">
            {briefCopy.primary.label}
          </MagneticButton>
          <Link
            href={briefCopy.secondary.href}
            className="group/f label-mono inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
          >
            {briefCopy.secondary.label}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/f:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
