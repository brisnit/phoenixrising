'use client'

import { useCallback, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { MediaFrame } from '@/components/media/MediaFrame'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { testimonials, testimonialsIntro } from '@/data/testimonials'
import { cn } from '@/lib/utils'

/**
 * Editorial testimonial carousel.
 *
 * One quote at a time at display scale, with the speaker set small beneath it
 * and a composition alongside. Transitions cross the quote out upward and the
 * next one in from below rather than sliding a track, which keeps the type
 * feeling set rather than scrolled.
 *
 * It does not auto-advance. Moving content under a reader is hostile to anyone
 * reading slowly, and an auto-rotating quote is one of the few carousel
 * patterns with no upside — so advancing is always a deliberate act, by
 * button or arrow key.
 *
 * NOTE: every quote is a placeholder. See `src/data/testimonials.ts`.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0)
  const quoteRef = useRef<HTMLDivElement>(null)
  const animating = useRef(false)

  const go = useCallback(
    (dir: 1 | -1) => {
      if (animating.current) return
      const next = (index + dir + testimonials.length) % testimonials.length
      const el = quoteRef.current

      if (!el || prefersReducedMotion()) {
        setIndex(next)
        return
      }

      animating.current = true
      gsap
        .timeline({
          onComplete: () => {
            animating.current = false
          },
        })
        .to(el, { opacity: 0, y: -22 * dir, duration: 0.35, ease: 'power2.in' })
        .add(() => setIndex(next))
        .fromTo(
          el,
          { opacity: 0, y: 22 * dir },
          { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out' },
        )
    },
    [index],
  )

  const current = testimonials[index]
  const allPlaceholder = testimonials.every((t) => t.placeholder)

  return (
    <section
      data-tone="light"
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      className="bg-paper py-(--spacing-section)"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
      }}
    >
      <div className="container-rule">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-6">{testimonialsIntro.eyebrow}</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="testimonials-heading"
              lines={[testimonialsIntro.headline]}
              className="text-h2 font-semibold uppercase"
            />
          </div>
          {allPlaceholder && <PlaceholderNote>{testimonialsIntro.note}</PlaceholderNote>}
        </div>

        <div className="mt-14 grid gap-10 border-t rule-light pt-12 lg:grid-cols-12 lg:gap-8">
          {/* Quote */}
          <div
            className="lg:col-span-7"
            aria-live="polite"
            aria-atomic="true"
          >
            <div ref={quoteRef}>
              <blockquote>
                <p className="font-display text-[clamp(1.5rem,3.4vw,3rem)] font-medium leading-[1.08] tracking-[-0.03em] text-ink">
                  <span aria-hidden="true" className="text-cyan">
                    “
                  </span>
                  {current.quote}
                  <span aria-hidden="true" className="text-cyan">
                    ”
                  </span>
                </p>
                <footer className="mt-10 flex items-center gap-4 border-t rule-light pt-6">
                  <span aria-hidden="true" className="block size-2 bg-cyan" />
                  <div>
                    <p className="label-mono text-ink">{current.name}</p>
                    <p className="mt-1.5 text-sm text-slate">
                      {current.role} — {current.company}
                    </p>
                  </div>
                </footer>
              </blockquote>
            </div>

            {/* Controls */}
            <div className="mt-10 flex items-center gap-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="label-mono flex size-12 items-center justify-center border rule-light transition-colors hover:bg-ink hover:text-paper"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="label-mono flex size-12 items-center justify-center border rule-light transition-colors hover:bg-ink hover:text-paper"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <ol className="flex flex-1 gap-2" aria-label="Testimonials">
                {testimonials.map((t, i) => (
                  <li key={t.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show testimonial ${i + 1} of ${testimonials.length}`}
                      aria-current={i === index ? 'true' : undefined}
                      className="block w-full py-3"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'block h-px transition-colors duration-500',
                          i === index ? 'bg-ink' : 'bg-ink/18',
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ol>

              <p className="label-mono shrink-0 text-slate">
                {String(index + 1).padStart(2, '0')} /{' '}
                {String(testimonials.length).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Media */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-[4/5]">
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-[600ms]',
                    i === index ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <MediaFrame
                    plate={t.plate}
                    tone="dark"
                    seed={i * 37 + 19}
                    reveal={false}
                    className="h-full w-full"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
