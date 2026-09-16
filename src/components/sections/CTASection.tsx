'use client'

import { useGsap } from '@/lib/hooks/useGsap'
import { MediaFrame } from '@/components/media/MediaFrame'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { finalCta } from '@/data/site'

/**
 * Closing call to action.
 *
 * The two lines are a single sentence delivered in two beats: the question
 * holds alone, then trades places with the answer as the section is scrolled —
 * the first line clearing upward as the second arrives from below. It is the
 * hero's entrance run in reverse, which is what makes the page feel closed
 * rather than merely ended.
 */
export function CTASection() {
  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    const q = gsap.utils.selector(self)

    if (reduced) {
      gsap.set(q('[data-cta-answer] > *'), { yPercent: 0 })
      return
    }

    gsap.fromTo(
      q('[data-cta-bg]'),
      { scale: 1.2 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: self, start: 'top bottom', end: 'bottom bottom', scrub: 1 },
      },
    )

    gsap
      .timeline({
        scrollTrigger: { trigger: self, start: 'top 68%', end: 'top 18%', scrub: 0.8 },
      })
      .to(q('[data-cta-question] > *'), { yPercent: -108, ease: 'power2.inOut' }, 0)
      .fromTo(
        q('[data-cta-answer] > *'),
        { yPercent: 108 },
        { yPercent: 0, ease: 'power2.inOut' },
        0.15,
      )
  }, [])

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="cta-heading"
      className="is-dark relative overflow-hidden bg-ink-deep text-paper"
    >
      <div data-cta-bg className="absolute inset-0">
        <MediaFrame plate="burst" tone="dark" seed={57} reveal={false} className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink-deep/85 via-ink-deep/70 to-ink-deep"
      />

      <div className="container-rule relative py-(--spacing-section)">
        <h2 id="cta-heading" className="text-display font-semibold uppercase">
          <span className="line-clip">
            <span data-cta-question className="block">
              <span className="block">{finalCta.lines[0]}</span>
            </span>
          </span>
          <span className="line-clip">
            <span data-cta-answer className="block">
              <span className="block text-cyan">{finalCta.lines[1]}</span>
            </span>
          </span>
        </h2>

        <div className="mt-14 grid gap-10 border-t rule-dark pt-10 lg:grid-cols-12 lg:gap-8">
          <p className="text-lead max-w-[44ch] text-slate-2 lg:col-span-5">{finalCta.body}</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:col-span-6 lg:col-start-7 lg:justify-end">
            <MagneticButton href={finalCta.primary.href} variant="invert">
              {finalCta.primary.label}
            </MagneticButton>
            <MagneticButton href={finalCta.secondary.href} variant="ghost" arrow={false}>
              {finalCta.secondary.label}
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
