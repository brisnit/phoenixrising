'use client'

import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { PIN_PRIORITY, ScrollTrigger } from '@/lib/gsap'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'
import { MediaFrame } from '@/components/media/MediaFrame'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { reality } from '@/data/site'
import { cn } from '@/lib/utils'

const STAGES = reality.stages
const PLATES = ['caliper', 'lattice', 'mold', 'route'] as const

/**
 * The manufacturing-reality argument, staged as a transformation.
 *
 * A single macro visual steps through prototype → component → assembly →
 * packaged product as the section is pinned, which is the site's one literal
 * expression of the brand idea: the same object, reaching a different state.
 *
 * On narrow viewports the pin is replaced by a horizontally scrollable rail of
 * the same four stages — touch-appropriate, and it keeps the sense of sequence
 * that a vertical stack would lose.
 */
export function Reality() {
  const [active, setActive] = useState(0)
  const isDesktop = useIsDesktop()

  const ref = useGsap<HTMLElement>(
    ({ self, gsap, reduced }) => {
      if (!isDesktop || reduced) return
      const media = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-stage-media]'))
      if (media.length !== STAGES.length) return

      gsap.set(media.slice(1), { opacity: 0, scale: 1.08 })

      const tl = gsap.timeline()

      ScrollTrigger.create({
        animation: tl,
        trigger: self,
        start: 'top top',
        end: `+=${STAGES.length * 80}%`,
        pin: '[data-pin]',
        refreshPriority: PIN_PRIORITY,
        scrub: 0.7,
        /* Matches the media crossfade positions below, so the caption can
           never name a stage other than the one being shown. */
        onUpdate: ({ progress }) => {
          const step = Math.floor(progress * tl.duration() - 0.3 + 1)
          setActive(Math.min(STAGES.length - 1, Math.max(0, step)))
        },
      })

      for (let i = 1; i < STAGES.length; i++) {
        tl.to(media[i - 1], { opacity: 0, duration: 0.4 }, i - 1 + 0.3)
          .to(media[i], { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, i - 1 + 0.3)
      }
      tl.to({}, { duration: 0.5 })
    },
    [isDesktop],
  )

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="reality-heading"
      className="is-dark bg-ink text-paper"
    >
      {/* The pinned composition has to fit a single viewport, or the bottom of
          it is simply unreachable for the whole duration of the pin. On
          desktop the headline and media therefore sit side by side rather than
          stacked, and the vertical rhythm is set from viewport height. */}
      <div data-pin className="lg:flex lg:min-h-screen lg:items-center lg:overflow-hidden">
        <div className="container-rule w-full py-(--spacing-section) lg:py-[clamp(4rem,9vh,7rem)]">
          <Eyebrow tone="dark" className="mb-8 lg:mb-6">
            {reality.eyebrow}
          </Eyebrow>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="lg:col-span-6">
              <AnimatedHeadline
                as="h2"
                id="reality-heading"
                lines={reality.lines}
                className="text-h2 font-semibold uppercase"
                lineClassName={(i) => (i === 1 ? 'text-slate' : undefined)}
              />

              <p className="text-lead mt-8 max-w-[46ch] text-slate-2">{reality.body}</p>
            </div>

            {/* Stage visual — desktop */}
            <div className="relative hidden aspect-[4/3] overflow-hidden bg-ink-deep lg:col-span-6 lg:block">
              {STAGES.map((stage, i) => (
                <div key={stage.id} data-stage-media className="absolute inset-0 overflow-hidden">
                  <MediaFrame
                    plate={PLATES[i]}
                    tone="dark"
                    seed={i * 29 + 13}
                    reveal={false}
                    className="h-full w-full"
                    sizes="58vw"
                  />
                </div>
              ))}
              {/* Stage caption over the visual */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-ink-deep to-transparent p-7">
                <div>
                  <p className="numeral text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold uppercase">
                    {STAGES[active].label}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-2">{STAGES[active].note}</p>
                </div>
                <p className="label-mono text-cyan">
                  {String(active + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>

          {/* Stage rail — desktop indicator */}
          <ol className="mt-8 hidden grid-cols-4 gap-4 border-t rule-dark pt-5 lg:grid">
            {STAGES.map((stage, i) => (
              <li key={stage.id} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -top-5 left-0 block h-px transition-all duration-700',
                    i <= active ? 'w-full bg-cyan' : 'w-0 bg-cyan',
                  )}
                />
                <p
                  className={cn(
                    'label-mono transition-colors duration-500',
                    i === active ? 'text-paper' : 'text-slate/70',
                  )}
                >
                  {stage.label}
                </p>
              </li>
            ))}
          </ol>

          {/* Stage rail — mobile horizontal scroll */}
          <ul className="no-scrollbar -mx-(--spacing-gutter) mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--spacing-gutter) pb-2 lg:hidden">
            {STAGES.map((stage, i) => (
              <li key={stage.id} className="w-[78vw] shrink-0 snap-start sm:w-[54vw]">
                <MediaFrame
                  plate={PLATES[i]}
                  tone="dark"
                  seed={i * 29 + 13}
                  ratio="aspect-[4/3]"
                  sizes="78vw"
                />
                <p className="mt-4 label-mono text-cyan">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 font-display text-h3 font-medium uppercase">{stage.label}</p>
                <p className="mt-1.5 text-sm text-slate-2">{stage.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
