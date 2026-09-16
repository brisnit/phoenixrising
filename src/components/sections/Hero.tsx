'use client'

import { useGsap } from '@/lib/hooks/useGsap'
import { LINE_HIDDEN, LINE_SHOWN } from '@/lib/gsap'
import { MediaFrame } from '@/components/media/MediaFrame'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { hero, primaryCta, secondaryCta } from '@/data/site'

/**
 * Full-viewport opening.
 *
 * ENTRANCE — the company name arrives first at display scale, the headline
 * rises out of its clip line by line, then the supporting interface settles in
 * underneath. The background plate is already painted and simply relaxes from
 * an oversized crop, so nothing is held back waiting for an animation.
 *
 * EXIT — as the page is scrolled the two headline lines separate laterally and
 * drift at different rates while the whole composition sinks and dims. The
 * section below then arrives over a hero that has already left, rather than
 * cutting against one still sitting at full contrast.
 */
export function Hero() {
  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    const q = gsap.utils.selector(self)

    if (reduced) {
      /* The CSS fallback is neutralised by the reduced-motion media query,
         but the hero still needs its resting state written explicitly. */
      gsap.set(q('[data-hero-line], [data-hero-mark]'), LINE_SHOWN)
      gsap.set(q('[data-hero-fade]'), { opacity: 1, y: 0 })
    }

    if (!reduced) {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.fromTo(
        q('[data-hero-bg]'),
        { scale: 1.16 },
        { scale: 1, duration: 2.2, ease: 'power2.out' },
        0,
      )
        .fromTo(
          q('[data-hero-mark]'),
          LINE_HIDDEN,
          { ...LINE_SHOWN, duration: 1.3 },
          0.1,
        )
        .fromTo(
          q('[data-hero-line]'),
          LINE_HIDDEN,
          { ...LINE_SHOWN, duration: 1.25, stagger: 0.1 },
          0.45,
        )
        .fromTo(
          q('[data-hero-fade]'),
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.09 },
          0.95,
        )
        .fromTo(
          q('[data-hero-rule]'),
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: 'power3.inOut' },
          0.6,
        )
    }

    /* Scroll-out. Skipped under reduced motion so the hero simply scrolls. */
    if (reduced) return

    gsap
      .timeline({
        scrollTrigger: {
          trigger: self,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
      .to(q('[data-hero-line="0"]'), { xPercent: -7, yPercent: -32 }, 0)
      .to(q('[data-hero-line="1"]'), { xPercent: 9, yPercent: -12 }, 0)
      .to(q('[data-hero-fade]'), { opacity: 0, y: -30 }, 0)
      .to(q('[data-hero-bg]'), { scale: 1.12, yPercent: 8 }, 0)
      .to(q('[data-hero-veil]'), { opacity: 1 }, 0)
  }, [])

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="hero-heading"
      className="is-dark relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-deep text-paper"
    >
      {/* Background composition */}
      <div data-hero-bg className="absolute inset-0">
        <MediaFrame
          plate="burst"
          tone="dark"
          seed={31}
          reveal={false}
          className="h-full w-full"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/70"
      />
      <div data-hero-veil aria-hidden="true" className="absolute inset-0 bg-ink-deep opacity-0" />

      {/* Content */}
      <div className="container-rule relative flex min-h-[100svh] flex-col pb-10 pt-[88px] sm:pb-12 sm:pt-[104px]">
        <div className="flex flex-1 flex-col justify-center py-10">
          {/* Company name at display scale — the first thing to arrive. */}
          <div className="line-clip mb-8 sm:mb-12">
            <p
              data-hero-mark
              className="label-mono flex flex-wrap items-center gap-x-4 gap-y-2 text-cyan"
            >
              Phoenix Rizing
              <span aria-hidden="true" className="h-px w-10 bg-cyan/50" />
              <span className="text-slate-2">{hero.index}</span>
            </p>
          </div>

          <h1 id="hero-heading" className="text-display font-semibold uppercase">
            {hero.headline.map((line, i) => (
              <span key={line} className="line-clip">
                <span data-hero-line={i} className="block will-change-transform">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div
            data-hero-rule
            aria-hidden="true"
            className="mt-10 h-px w-full origin-left bg-paper/18 sm:mt-14"
          />
        </div>

        {/* Base row */}
        <div className="grid gap-9 lg:grid-cols-12 lg:items-end lg:gap-8">
          <p
            data-hero-fade
            className="text-lead max-w-[46ch] text-slate-2 lg:col-span-5"
          >
            {hero.body}
          </p>

          <div
            data-hero-fade
            className="flex flex-wrap items-center gap-3 sm:gap-4 lg:col-span-5 lg:col-start-7"
          >
            <MagneticButton href={primaryCta.href} variant="invert">
              {primaryCta.label}
            </MagneticButton>
            <MagneticButton href={secondaryCta.href} variant="ghost" arrow={false}>
              {secondaryCta.label}
            </MagneticButton>
          </div>

          <div
            data-hero-fade
            className="flex items-center gap-3 lg:col-span-1 lg:col-start-12 lg:justify-end"
          >
            <span className="label-mono text-slate">{hero.scrollHint}</span>
            <span aria-hidden="true" className="relative block h-9 w-px overflow-hidden bg-paper/20">
              <span className="absolute inset-x-0 top-0 block h-3 animate-[scrollhint_2.2s_ease-in-out_infinite] bg-cyan" />
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollhint {
          0% { transform: translateY(-100%); }
          55%, 100% { transform: translateY(300%); }
        }
      `}</style>
    </section>
  )
}
