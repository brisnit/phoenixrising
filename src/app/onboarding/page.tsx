import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { EngagementPath } from '@/components/sections/EngagementPath'
import { CTASection } from '@/components/sections/CTASection'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { entryPoints, fitReview, onboardingIntro, onboardingNotice } from '@/data/onboarding'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: onboardingIntro.lead,
}

/**
 * Onboarding — how a conversation becomes an engagement.
 *
 * Replaces the Phase 2 route shell. This is educational content about a human
 * business process, and the page is built so it cannot be mistaken for
 * software: it states what does not exist near the top, defines "fit review"
 * by saying what it is NOT as well as what it is, and acknowledges commercial
 * terms without naming a single figure.
 *
 * The anchors `#fit-review` and `#onboard` are linked from /start, so the
 * compact journey there can explain its own vocabulary.
 */
export default function OnboardingPage() {
  return (
    <>
      <PageHero
        eyebrow={onboardingIntro.eyebrow}
        lines={onboardingIntro.lines}
        body={onboardingIntro.lead}
        plate="route"
        seed={97}
        meta={[
          { label: 'Principle', value: onboardingIntro.principle },
          { label: 'Stages', value: 'Start · Fit review · Define · Onboard · Begin' },
          { label: 'Commercial terms', value: 'Agreed per project, not published' },
        ]}
      />

      {/* What this page is — and what it is not. Stated early, on purpose. */}
      <section data-tone="light" className="bg-paper pt-(--spacing-section)">
        <div className="container-rule">
          <div className="grid gap-6 border-l-2 border-blue/40 pl-6 lg:grid-cols-12 lg:gap-8">
            <p className="label-mono text-slate lg:col-span-3">{onboardingNotice.label}</p>
            <div className="lg:col-span-8 lg:col-start-5">
              <p className="text-lead max-w-[62ch] text-ink">{onboardingNotice.body}</p>
              <Link
                href={onboardingNotice.cta.href}
                className="group/c label-mono mt-6 inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
              >
                {onboardingNotice.cta.label}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/c:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fit review, defined carefully — the phrase does real work. */}
      <section
        data-tone="light"
        aria-labelledby="fit-review-heading"
        id="fit-review-explained"
        className="scroll-mt-28 bg-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">{fitReview.eyebrow}</Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="fit-review-heading"
                lines={fitReview.lines}
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-slate']}
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
              <SplitTextReveal
                text={fitReview.definition}
                className="text-lead max-w-[46ch] text-steel/85"
              />
            </div>
          </div>

          <div className="mt-16 grid gap-10 border-t rule-light pt-10 sm:mt-24 lg:grid-cols-12 lg:gap-8">
            <Reveal stagger={0.12} className="grid gap-6 lg:col-span-6">
              {fitReview.body.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === 0 ? 'text-lead max-w-[54ch] text-ink' : 'text-lead max-w-[54ch] text-steel/80'
                  }
                >
                  {para}
                </p>
              ))}
              <p className="max-w-[54ch] border-l-2 border-blue/40 pl-5 text-[0.95rem] leading-relaxed text-slate">
                {fitReview.caveat}
              </p>
            </Reveal>

            {/* The five things "review" invites people to assume. */}
            <div className="lg:col-span-5 lg:col-start-8">
              <h3 className="label-mono text-slate">What it is not</h3>
              <ul className="mt-6 grid gap-3">
                {fitReview.isNot.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-t rule-light pt-3 text-[0.95rem] leading-relaxed text-steel/85"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.55em] block h-px w-3 shrink-0 bg-slate"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <EngagementPath />

      {/* Where a project joins the development path. */}
      <section
        data-tone="light"
        aria-labelledby="entry-points-heading"
        className="bg-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">{entryPoints.eyebrow}</Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="entry-points-heading"
                lines={entryPoints.lines}
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-slate']}
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
              <SplitTextReveal
                text={entryPoints.body}
                className="text-lead max-w-[46ch] text-steel/85"
              />
            </div>
          </div>

          <Reveal as="ol" stagger={0.09} className="mt-16 border-t rule-light sm:mt-20">
            {entryPoints.points.map((point) => (
              <li key={point.stage} className="border-b rule-light py-8">
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                  <p className="font-display text-h3 font-medium uppercase tracking-[-0.02em] lg:col-span-4">
                    {point.stage}
                  </p>
                  <p className="label-mono self-center text-blue lg:col-span-2">
                    <span aria-hidden="true" className="mr-2">
                      →
                    </span>
                    {point.enters}
                  </p>
                  <p className="max-w-[52ch] text-[0.98rem] leading-relaxed text-steel/85 lg:col-span-6 lg:col-start-7">
                    {point.note}
                  </p>
                </div>
              </li>
            ))}
          </Reveal>

          <p className="mt-10 max-w-[60ch] text-[0.95rem] leading-relaxed text-slate">
            {entryPoints.note}
          </p>
        </div>
      </section>

      <CTASection />
    </>
  )
}
