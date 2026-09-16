import Link from 'next/link'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { twoWorldsTeaser } from '@/data/company'

/**
 * Homepage door into the company story.
 *
 * The homepage has already made the argument — the statement section sets out
 * the two worlds and the why-us principles work through them. This adds the
 * one thing that argument was missing, which is that the two worlds are real
 * places, and then gets out of the way. Anything more would be the About page
 * played twice.
 *
 * Continues the cream band above it with a rule rather than opening a new
 * full-bleed section, so it reads as the closing line of that argument
 * instead of another destination.
 */
export function TwoWorldsTeaser() {
  return (
    <section
      data-tone="light"
      aria-labelledby="two-worlds-teaser-heading"
      className="bg-paper pb-(--spacing-section)"
    >
      <div className="container-rule border-t rule-light pt-(--spacing-section)">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Eyebrow className="mb-8">{twoWorldsTeaser.eyebrow}</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="two-worlds-teaser-heading"
              lines={twoWorldsTeaser.lines}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-slate']}
            />
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            <SplitTextReveal
              text={twoWorldsTeaser.body}
              className="text-lead max-w-[46ch] text-steel/85"
            />

            <Reveal className="mt-10">
              {/* The axis as a plain, readable line. The relationship is the
                  content, so it is text — not an arrow drawn between two
                  boxes that a screen reader would skip. */}
              <p className="numeral text-[clamp(1.25rem,2.4vw,2rem)] font-semibold uppercase">
                {twoWorldsTeaser.axis[0]}
                <span className="px-3 text-blue" aria-hidden="true">
                  ↔
                </span>
                <span className="sr-only"> and </span>
                {twoWorldsTeaser.axis[1]}
              </p>

              <Link
                href={twoWorldsTeaser.cta.href}
                className="group/more label-mono mt-8 inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
              >
                {twoWorldsTeaser.cta.label}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
