'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { ENTER } from '@/lib/gsap'
import { MediaFrame } from '@/components/media/MediaFrame'
import { track } from '@/lib/analytics'
import { stages } from '@/data/stages'
import { cn } from '@/lib/utils'

/**
 * The three ways into a project.
 *
 * Built as full-measure horizontal bands rather than three cards: the index
 * numerals carry the composition, the focused band expands to reveal what
 * that stage actually involves, and the technical plate changes with it. It
 * reads as one decision with three answers, not a pricing table.
 *
 * Each band is a real link, so the whole thing is keyboard-operable without
 * any roving-tabindex machinery: Tab moves between stages, Enter follows one.
 * Focus and hover drive the same expansion, so a keyboard user sees exactly
 * what a pointer user sees rather than a reduced version of it.
 */
export function StageSelector() {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)

  const ref = useGsap<HTMLDivElement>(({ self, gsap, reduced }) => {
    if (reduced) return
    const rows = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-stage-row]'))
    gsap.fromTo(
      rows,
      { yPercent: 40, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: self, start: ENTER, once: true },
      },
    )
  }, [])

  return (
    <section
      ref={ref}
      data-tone="light"
      aria-labelledby="stages-heading"
      className="bg-paper pb-(--spacing-section)"
    >
      <div className="container-rule">
        <h2 id="stages-heading" className="sr-only">
          Choose the stage your project is at
        </h2>

        <ol ref={listRef} className="border-t rule-light">
          {stages.map((stage, index) => {
            const isActive = active === index
            return (
              <li key={stage.id} data-stage-row className="border-b rule-light">
                <Link
                  href={stage.href}
                  data-stage={stage.id}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => track({ name: 'PROJECT_STAGE_SELECTED', stage: stage.id })}
                  className="group/stage block py-8 transition-[padding] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-4 focus-visible:pl-4 sm:py-10"
                >
                  <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                    {/* Index + title */}
                    <div className="flex items-start gap-5 lg:col-span-5 sm:gap-7">
                      {/* Decorative. The stages are an ordered list, so
                          position is already conveyed; this numeral repeats it
                          as a graphic element and carries nothing of its own. */}
                      <span
                        aria-hidden="true"
                        data-decorative="true"
                        className={cn(
                          'numeral shrink-0 select-none text-[clamp(2.75rem,7vw,5.5rem)] font-semibold transition-colors duration-500',
                          isActive ? 'text-blue' : 'text-ink/30',
                        )}
                      >
                        {stage.index}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="numeral text-[clamp(1.5rem,3.6vw,3rem)] font-semibold uppercase leading-[0.95]">
                          {stage.title}
                        </h3>
                        <p className="mt-3 max-w-[44ch] text-[1.02rem] leading-relaxed text-steel/85">
                          {stage.statement}
                        </p>
                      </div>
                    </div>

                    {/* Detail — expands for the focused stage */}
                    <div
                      /* Expanded by default below lg: there is no hover on
                         touch, so a collapsed stage would simply hide its
                         detail from every mobile visitor. The collapse is a
                         pointer affordance and applies only where a pointer
                         exists. */
                      className={cn(
                        'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:col-span-4',
                        isActive
                          ? 'lg:grid-rows-[1fr] lg:opacity-100'
                          : 'lg:grid-rows-[0fr] lg:opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[46ch] text-[0.95rem] leading-relaxed text-steel/80">
                          {stage.detail}
                        </p>
                        <ul className="mt-5 space-y-1.5">
                          {stage.signals.map((signal) => (
                            <li
                              key={signal}
                              className="flex gap-3 text-[0.9rem] leading-relaxed text-slate"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-2 block size-1 shrink-0 bg-blue"
                              />
                              {signal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-start lg:col-span-3 lg:justify-end">
                      <span className="label-mono inline-flex items-center gap-3 whitespace-nowrap border-b border-ink/25 pb-2 transition-colors duration-500 group-hover/stage:border-cyan group-hover/stage:text-blue group-focus-visible/stage:border-cyan group-focus-visible/stage:text-blue">
                        {stage.action}
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stage:translate-x-1 group-hover/stage:-translate-y-1 group-focus-visible/stage:translate-x-1 group-focus-visible/stage:-translate-y-1"
                        >
                          ↗
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* What happens if you pick this — stated before the click. */}
                  <p
                    className={cn(
                      'label-mono mt-6 max-w-[52ch] leading-[1.7] transition-colors duration-500',
                      isActive ? 'text-slate' : 'text-slate lg:text-transparent',
                    )}
                  >
                    <span className={cn(!isActive && 'lg:invisible')}>{stage.outcome}</span>
                  </p>
                </Link>
              </li>
            )
          })}
        </ol>

        {/* The focused stage's plate — desktop only; it is decoration, and on
            mobile the vertical space is better spent on the stages. */}
        <div className="mt-12 hidden lg:block">
          <div className="relative aspect-[21/6] overflow-hidden bg-ink-deep">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 transition-opacity duration-[700ms]',
                  active === index ? 'opacity-100' : 'opacity-0',
                )}
              >
                <MediaFrame
                  plate={stage.plate}
                  tone="dark"
                  seed={index * 53 + 9}
                  reveal={false}
                  className="h-full w-full"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
