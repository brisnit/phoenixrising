'use client'

import Link from 'next/link'
import { useGsap } from '@/lib/hooks/useGsap'
import { MediaFrame } from '@/components/media/MediaFrame'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { Reveal } from '@/components/motion/Reveal'
import type { Capability } from '@/data/capabilities'
import { cn } from '@/lib/utils'

/**
 * One capability, given a full screen of its own.
 *
 * The media column is pinned with CSS `position: sticky` rather than a
 * ScrollTrigger pin. Sticky costs nothing per frame, cannot desynchronise from
 * the scroll position, and needs no document-height compensation — so pinned
 * sections stay correct when a route changes or a font swaps and reflows the
 * page. GSAP is reserved for the reveals and the drifting index numeral.
 *
 * Below the desktop breakpoint the columns stack and the pin is dropped, but
 * the index numeral, the reveals and the media crop all remain.
 */
export function CapabilityStory({
  capability,
  index,
}: {
  capability: Capability
  index: number
}) {
  const flipped = index % 2 === 1

  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    if (reduced) return
    const numeral = self.querySelector('[data-capability-index]')
    if (!numeral) return

    gsap.fromTo(
      numeral,
      { yPercent: 18 },
      {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: self, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    )
  }, [])

  return (
    <section
      ref={ref}
      aria-labelledby={`capability-${capability.slug}`}
      className="relative border-t rule-light py-16 sm:py-24 lg:py-28"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Media — sticky on desktop */}
          <div
            className={cn(
              'lg:col-span-6',
              flipped ? 'lg:col-start-7' : 'lg:col-start-1 lg:row-start-1',
            )}
          >
            <div className="lg:sticky lg:top-[14vh]">
              <MediaFrame
                plate={capability.plate}
                tone="dark"
                seed={index * 17 + 5}
                ratio="aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5]"
                parallax={6}
                sizes="(min-width: 1024px) 50vw, 100vw"
              >
                {/* Index numeral sits over the media, cropped by its edge. */}
                <span
                  data-capability-index
                  aria-hidden="true"
                  className="numeral pointer-events-none absolute -bottom-[0.14em] left-[0.06em] select-none text-[24vw] font-semibold text-paper/12 lg:text-[13vw]"
                >
                  {capability.index}
                </span>
              </MediaFrame>

              <p className="mt-4 label-mono text-slate">
                {capability.index} / {capability.summary}
              </p>
            </div>
          </div>

          {/* Content */}
          <div
            className={cn(
              'lg:col-span-5',
              flipped ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-8',
            )}
          >
            <AnimatedHeadline
              as="h3"
              lines={capability.titleLines}
              className="text-h2 font-semibold uppercase"
            />
            <Reveal className="mt-7" y={20}>
              <p className="text-lead max-w-[48ch] text-steel/85">{capability.lead}</p>
            </Reveal>

            <Reveal as="dl" stagger={0.06} className="mt-12 border-t rule-light">
              {capability.disciplines.map((d, i) => (
                <div
                  key={d.title}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b rule-light py-5 sm:grid-cols-[3.5rem_1fr]"
                >
                  <dt className="label-mono pt-[0.3rem] text-slate">
                    {String(i + 1).padStart(2, '0')}
                  </dt>
                  <dd>
                    <p className="font-display text-h3 font-medium tracking-[-0.02em]">
                      {d.title}
                    </p>
                    <p className="mt-2 max-w-[52ch] text-[0.95rem] leading-relaxed text-steel/75">
                      {d.body}
                    </p>
                  </dd>
                </div>
              ))}
            </Reveal>

            <Reveal className="mt-10">
              <Link
                href={`/capabilities/${capability.slug}`}
                className="group/more label-mono inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
              >
                <span id={`capability-${capability.slug}`} className="sr-only">
                  {capability.title}
                </span>
                Explore {capability.title}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:translate-x-[4px] group-hover/more:-translate-y-[4px]"
                >
                  ↗
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
