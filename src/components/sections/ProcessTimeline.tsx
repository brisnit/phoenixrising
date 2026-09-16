'use client'

import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { PIN_PRIORITY, ScrollTrigger } from '@/lib/gsap'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'
import { MediaFrame } from '@/components/media/MediaFrame'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { Reveal } from '@/components/motion/Reveal'
import { processSteps, processIntro } from '@/data/process'
import { cn } from '@/lib/utils'

const N = processSteps.length

/**
 * Scroll-driven manufacturing timeline.
 *
 * DESKTOP — the section pins and the stage index becomes the graphic: a column
 * of numerals rolls behind a clip as each stage is reached, while the copy
 * crossfades and the media beneath it cuts. The numeral roll is stepped rather
 * than continuous, so the number is always a readable stage and never a blur
 * of half-digits mid-scroll.
 *
 * MOBILE — the pin is dropped entirely. The same seven stages become a
 * vertical sequence with their own reveals and a continuous rule running down
 * the index column, which keeps the timeline reading as one journey without
 * the cost of pinned scroll on a small device.
 */
export function ProcessTimeline() {
  const [active, setActive] = useState(0)
  const isDesktop = useIsDesktop()

  const ref = useGsap<HTMLDivElement>(
    ({ self, gsap, reduced }) => {
      if (!isDesktop || reduced) return

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
         The outgoing stage clears before the incoming one is fully up, but
         the two windows overlap enough that there is never a stretch of
         scroll with no copy on screen — which is what a symmetrical
         crossfade produced. Roughly two thirds of every segment is a settled,
         readable stage; the handoff occupies the rest. */
      const OUT_AT = 0.38
      const OUT_DUR = 0.2
      const IN_AT = 0.44
      const IN_DUR = 0.26
      /* Midpoint of the handoff — where the rail label should change over. */
      const FLIP = 0.54

      /* The timeline is built first and handed to ScrollTrigger, rather than
         declared inline, so `onUpdate` can read the playhead it is driving. */
      const tl = gsap.timeline()

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
          .to(media[i - 1], { opacity: 0, duration: OUT_DUR + 0.06 }, at + OUT_AT)
          .to(
            media[i],
            { opacity: 1, scale: 1, duration: IN_DUR + 0.2, ease: 'power2.out' },
            at + IN_AT,
          )
      }

      /* Tail hold so the final stage is readable before the pin releases. */
      tl.to({}, { duration: 0.6 })
    },
    [isDesktop],
  )

  return (
    <section
      data-tone="light"
      aria-labelledby="process-heading"
      className="bg-paper"
    >
      <div className="container-rule py-(--spacing-section)">
        <SectionIntro
          id="process-heading"
          eyebrow={processIntro.eyebrow}
          lines={processIntro.lines}
          body={processIntro.body}
        />
      </div>

      <div ref={ref}>
        {/* ---------------------------------------------------- DESKTOP */}
        <div data-pin data-active={active} className="hidden lg:block">
          <div className="relative flex min-h-screen items-center border-y rule-light bg-paper-2/40">
            <div className="container-rule grid w-full grid-cols-12 items-center gap-8 py-20">
              {/* Rolling stage index */}
              <div className="col-span-3">
                <p className="label-mono mb-6 text-slate">Stage</p>
                <div className="h-[1em] overflow-hidden text-[12.5vw]">
                  <div data-numerals>
                    {processSteps.map((step) => (
                      <div
                        key={step.index}
                        className="numeral flex h-[1em] items-center font-semibold leading-none text-ink"
                      >
                        {step.index}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress rail */}
                <ol className="mt-10 space-y-2.5">
                  {processSteps.map((step, i) => (
                    <li key={step.id} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'block h-px transition-all duration-500',
                          i === active ? 'w-9 bg-cyan' : 'w-4 bg-ink/20',
                        )}
                      />
                      <span
                        className={cn(
                          'label-mono transition-colors duration-500',
                          i === active ? 'text-ink' : 'text-slate/60',
                        )}
                      >
                        {step.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Stage copy — stacked and crossfaded */}
              <div className="relative col-span-4 col-start-5 min-h-[400px]">
                {processSteps.map((step) => (
                  <div
                    key={step.id}
                    data-step-panel
                    aria-hidden={step.index !== processSteps[active].index}
                    className="absolute inset-x-0 top-0"
                  >
                    <h3 className="text-h2 font-semibold uppercase">{step.title}</h3>
                    <p className="text-lead mt-5 max-w-[42ch] text-steel/85">{step.summary}</p>
                    <p className="mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed text-steel/70">
                      {step.body}
                    </p>
                    <ul className="mt-8 border-t rule-light">
                      {step.activities.map((a) => (
                        <li
                          key={a}
                          className="flex gap-3 border-b rule-light py-2.5 text-sm text-steel/80"
                        >
                          <span aria-hidden="true" className="mt-2 block size-1 shrink-0 bg-cyan" />
                          {a}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 label-mono text-blue">
                      Deliverable
                      <span className="ml-2 font-sans text-[0.9rem] normal-case tracking-normal text-steel">
                        {step.deliverable}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Stage media */}
              <div className="relative col-span-3 col-start-10 aspect-[3/4] overflow-hidden bg-ink-deep">
                {processSteps.map((step, i) => (
                  <div
                    key={step.id}
                    data-step-media
                    className="absolute inset-0 overflow-hidden"
                  >
                    <MediaFrame
                      plate={step.plate}
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

        {/* ----------------------------------------------------- MOBILE */}
        <div className="lg:hidden">
          {processSteps.map((step, i) => (
            <article
              key={step.id}
              className="border-t rule-light bg-paper px-(--spacing-gutter) py-12"
            >
              <div className="flex items-start gap-5">
                <span
                  aria-hidden="true"
                  className="numeral shrink-0 text-[3.5rem] font-semibold text-ink/18"
                >
                  {step.index}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-h3 font-semibold uppercase">{step.title}</h3>
                  <p className="mt-3 text-[1.02rem] leading-relaxed text-steel/85">
                    {step.summary}
                  </p>
                </div>
              </div>

              <Reveal className="mt-7">
                <MediaFrame
                  plate={step.plate}
                  tone="dark"
                  seed={i * 23 + 11}
                  ratio="aspect-[16/10]"
                  sizes="100vw"
                />
              </Reveal>

              <p className="mt-6 text-[0.95rem] leading-relaxed text-steel/75">{step.body}</p>

              <ul className="mt-6 border-t rule-light">
                {step.activities.map((a) => (
                  <li
                    key={a}
                    className="flex gap-3 border-b rule-light py-2.5 text-sm text-steel/80"
                  >
                    <span aria-hidden="true" className="mt-2 block size-1 shrink-0 bg-cyan" />
                    {a}
                  </li>
                ))}
              </ul>

              <p className="mt-5 label-mono text-blue">
                Deliverable
                <span className="mt-1.5 block font-sans text-[0.95rem] normal-case tracking-normal text-steel">
                  {step.deliverable}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
