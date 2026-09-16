'use client'

import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { PIN_PRIORITY, ScrollTrigger } from '@/lib/gsap'
import { useCanPin } from '@/lib/hooks/useMediaQuery'
import { MediaFrame } from '@/components/media/MediaFrame'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { Reveal } from '@/components/motion/Reveal'
import Link from 'next/link'
import {
  processStages,
  processIntro,
  outputNote,
  shortRunCaveat,
} from '@/data/process'
import { cn } from '@/lib/utils'

const N = processStages.length

/**
 * Scroll-driven manufacturing timeline.
 *
 * DESKTOP — the section pins and the stage index becomes the graphic: a column
 * of numerals rolls behind a clip as each stage is reached, while the copy
 * crossfades and the media beneath it cuts. The numeral roll is stepped rather
 * than continuous, so the number is always a readable stage and never a blur
 * of half-digits mid-scroll.
 *
 * MOBILE — the pin is dropped entirely. The same five stages become a
 * vertical sequence with their own reveals, which keeps the timeline reading
 * as one journey without the cost of pinned scroll on a small device.
 *
 * The motion architecture here is regression-protected and was changed only
 * where the content model required it: linear crossfade easing, the pinnable
 * eligibility rule and the progress-derived active index are all unchanged.
 * See tests/e2e/process-timeline.spec.ts before touching any of it.
 */
export function ProcessTimeline() {
  const [active, setActive] = useState(0)
  const canPin = useCanPin()

  const ref = useGsap<HTMLDivElement>(
    ({ self, gsap, reduced }) => {
      if (!canPin || reduced) return

      const numerals = self.querySelector('[data-numerals]')
      const panels = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-step-panel]'))
      const media = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-step-media]'))
      if (!numerals || panels.length !== N) return

      /* Resting state: first stage present, the rest stood down. */
      gsap.set(panels.slice(1), { opacity: 0, yPercent: 8 })
      gsap.set(media.slice(1), { opacity: 0, scale: 1.06 })

      /* The numerals are one tall column inside a single-digit-high clip, so a
         step is one item's share of the column — not 100% of the column. */
      const STEP = 100 / N

      /* Handoff timing, in fractions of each unit-long segment.
         These windows only behave as written because the crossfade is LINEAR
         (see the timeline defaults below). The outgoing stage fades over a
         long window while the incoming arrives over a short one, so the
         weaker of the two is never far below 60% opacity — there is no point
         in the scroll where the stage copy is effectively gone. */
      const OUT_AT = 0.4
      const OUT_DUR = 0.3
      const IN_AT = 0.44
      const IN_DUR = 0.16
      /* Midpoint of the handoff — where the rail label should change over. */
      const FLIP = 0.54

      /* The timeline is built first and handed to ScrollTrigger, rather than
         declared inline, so `onUpdate` can read the playhead it is driving.

         `ease: 'none'` is not a style choice — it is required. The global
         default is `expo.out`, which applies 82% of its change in the first
         25% of a tween. On a scrubbed crossfade that meant the outgoing stage
         collapsed to 18% opacity almost immediately while the incoming one
         had not started, leaving the pinned section visually blank for a
         stretch of scroll. In a scrubbed timeline the playhead position IS
         the progress; any additional easing decouples what is on screen from
         where the reader has scrolled. Eases below are per-tween and
         deliberate. */
      const tl = gsap.timeline({ defaults: { ease: 'none' } })

      ScrollTrigger.create({
        animation: tl,
        trigger: self,
        start: 'top top',
        end: `+=${N * 90}%`,
        pin: '[data-pin]',
        refreshPriority: PIN_PRIORITY,
        scrub: 0.7,
        /* `progress` is derived from the live scroll position, whereas
           `tl.time()` is still being eased toward it by the scrub — reading
           the playhead here reports a stale time and leaves the rail label a
           full stage behind the copy on screen. */
        onUpdate: ({ progress }) => {
          const step = Math.floor(progress * tl.duration() - FLIP + 1)
          setActive(Math.min(N - 1, Math.max(0, step)))
        },
      })

      for (let i = 1; i < N; i++) {
        const at = i - 1
        tl.to(numerals, { yPercent: -STEP * i, duration: 0.34, ease: 'power3.inOut' }, at + OUT_AT)
          .to(panels[i - 1], { opacity: 0, yPercent: -6, duration: OUT_DUR }, at + OUT_AT)
          .to(panels[i], { opacity: 1, yPercent: 0, duration: IN_DUR }, at + IN_AT)
          .to(media[i - 1], { opacity: 0, duration: OUT_DUR }, at + OUT_AT)
          .to(media[i], { opacity: 1, duration: IN_DUR }, at + IN_AT)
          .to(media[i], { scale: 1, duration: IN_DUR + 0.2, ease: 'power2.out' }, at + IN_AT)
      }

      /* Tail hold so the final stage is readable before the pin releases. */
      tl.to({}, { duration: 0.6 })
    },
    [canPin],
  )

  return (
    <section data-tone="light" aria-labelledby="process-heading" className="bg-paper">
      <div className="container-rule py-(--spacing-section)">
        <SectionIntro
          id="process-heading"
          eyebrow={processIntro.eyebrow}
          lines={processIntro.lines}
          body={processIntro.body}
        />
        {/* Said once, before the sequence, so five numbered stages cannot read
            as a fixed pipeline every project must run. */}
        <p className="mt-10 max-w-[70ch] text-sm text-slate">{processIntro.note}</p>
      </div>

      <div ref={ref}>
        {/* ---------------------------------------------------------- DESKTOP */}
        <div data-pin data-active={active} className="hidden pinnable:block">
          <div className="relative flex min-h-screen items-center border-y rule-light bg-paper-2/40">
            <div className="container-rule grid w-full grid-cols-12 items-center gap-8 py-10">
              {/* Rolling stage index */}
              <div className="col-span-3">
                <p className="label-mono mb-5 text-slate">Stage</p>
                <div className="h-[1em] overflow-hidden text-[12vw]">
                  <div data-numerals>
                    {processStages.map((stage) => (
                      <div
                        key={stage.index}
                        className="numeral flex h-[1em] items-center font-semibold leading-none text-ink"
                      >
                        {stage.index}
                      </div>
                    ))}
                  </div>
                </div>

                <ol className="mt-9 space-y-2.5">
                  {processStages.map((stage, i) => (
                    <li key={stage.id} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-2 block h-px shrink-0 transition-all duration-500',
                          i === active ? 'w-9 bg-blue' : 'w-4 bg-ink/25',
                        )}
                      />
                      <span
                        className={cn(
                          'label-mono transition-colors duration-500',
                          i === active ? 'text-ink' : 'text-slate',
                        )}
                      >
                        {stage.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Stage copy — stacked and crossfaded */}
              <div className="relative col-span-5 col-start-5 min-h-[420px]">
                {processStages.map((stage) => (
                  <div
                    key={stage.id}
                    data-step-panel
                    /* `inert`, not `aria-hidden`. The stage CTA inside these
                       panels is focusable, and an aria-hidden element
                       containing focusable content lets a keyboard user tab
                       into something screen readers have been told is not
                       there. `inert` removes it from both the tab order and
                       the accessibility tree. */
                    inert={stage.index !== processStages[active].index}
                    className="absolute inset-x-0 top-0"
                  >
                    <h3 className="numeral text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold uppercase leading-[0.95]">
                      {stage.headline.map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))}
                    </h3>
                    <p className="text-lead mt-4 max-w-[44ch] text-steel">{stage.summary}</p>
                    <p className="mt-3.5 max-w-[48ch] text-[0.95rem] leading-relaxed text-steel/85">
                      {stage.body}
                    </p>

                    <ul className="mt-6 border-t rule-light">
                      {/* The pinned frame is exactly one viewport tall and the
                          panels are absolutely positioned inside it, so anything
                          past the fold is unreachable for the whole pin. The
                          list is capped to what fits at the shortest pinnable
                          viewport with margin; the vertical layout below carries
                          every item. */}
                      {stage.covers.slice(0, 4).map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 border-b rule-light py-2 text-sm text-steel/85"
                        >
                          <span aria-hidden="true" className="mt-2 block size-1 shrink-0 bg-blue" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {stage.id === 'short-run' && (
                      <p className="mt-4 max-w-[54ch] text-sm text-slate">{shortRunCaveat}</p>
                    )}

                    <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                      <p className="label-mono text-blue">
                        Output
                        <span className="ml-2 font-sans text-[0.95rem] normal-case tracking-normal text-steel">
                          {stage.output}
                        </span>
                      </p>
                      {stage.cta && (
                        <Link
                          href={stage.cta.href}
                          className="group/cta label-mono inline-flex items-center gap-2 border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
                        >
                          {stage.cta.label}
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-500 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1"
                          >
                            ↗
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stage media */}
              <div className="relative col-span-3 col-start-10 aspect-[3/4] max-h-[58vh] overflow-hidden bg-ink-deep">
                {processStages.map((stage, i) => (
                  <div key={stage.id} data-step-media className="absolute inset-0 overflow-hidden">
                    <MediaFrame
                      plate={stage.plate}
                      tone="dark"
                      seed={i * 23 + 11}
                      reveal={false}
                      className="h-full w-full"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- MOBILE */}
        <div className="pinnable:hidden">
          {processStages.map((stage, i) => (
            <article
              key={stage.id}
              className="border-t rule-light bg-paper px-(--spacing-gutter) py-12"
            >
              <div className="flex items-start gap-5">
                {/* Decorative watermark — the stage index is stated in readable
                    form beside it. */}
                <span
                  aria-hidden="true"
                  data-decorative="true"
                  className="numeral shrink-0 select-none text-[3.5rem] font-semibold text-ink/18"
                >
                  {stage.index}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="label-mono mb-2 text-slate">Stage {stage.index}</p>
                  <h3 className="numeral text-[clamp(1.5rem,7vw,2.25rem)] font-semibold uppercase leading-[0.98]">
                    {stage.headline.map((line, k) => (
                      <span key={k} className="block">
                        {line}
                      </span>
                    ))}
                  </h3>
                  <p className="mt-3 text-[1.02rem] leading-relaxed text-steel">{stage.summary}</p>
                </div>
              </div>

              <Reveal className="mt-7">
                <MediaFrame
                  plate={stage.plate}
                  tone="dark"
                  seed={i * 23 + 11}
                  ratio="aspect-[16/10]"
                  sizes="100vw"
                />
              </Reveal>

              <p className="mt-6 text-[0.95rem] leading-relaxed text-steel/85">{stage.body}</p>

              <ul className="mt-6 border-t rule-light">
                {stage.covers.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-b rule-light py-2.5 text-sm text-steel/85"
                  >
                    <span aria-hidden="true" className="mt-2 block size-1 shrink-0 bg-blue" />
                    {item}
                  </li>
                ))}
              </ul>

              {stage.id === 'short-run' && (
                <p className="mt-5 text-sm text-slate">{shortRunCaveat}</p>
              )}

              <p className="mt-5 label-mono text-blue">
                Output
                <span className="mt-1.5 block font-sans text-[0.95rem] normal-case tracking-normal text-steel">
                  {stage.output}
                </span>
              </p>

              {stage.cta && (
                <Link
                  href={stage.cta.href}
                  className="label-mono mt-6 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-ink"
                >
                  {stage.cta.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="container-rule border-t rule-light py-10">
        <p className="max-w-[70ch] text-sm text-slate">{outputNote}</p>
      </div>
    </section>
  )
}
