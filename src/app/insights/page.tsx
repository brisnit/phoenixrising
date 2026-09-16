import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { Reveal } from '@/components/motion/Reveal'
import { insights, insightsIntro } from '@/data/insights'

export const metadata: Metadata = {
  title: 'Insights',
  description: insightsIntro.body,
}

/**
 * Insights index — a typographic list rather than a card grid. Each row gives
 * the title the weight of a headline and keeps the metadata quiet beside it.
 */
export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow={insightsIntro.eyebrow}
        lines={insightsIntro.lines}
        body={insightsIntro.body}
        plate="grid"
        seed={9}
      />

      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <ul className="container-rule border-t rule-light">
          {insights.map((insight, i) => (
            <li key={insight.slug} className="border-b rule-light">
              <Reveal>
                <Link
                  href={`/insights/${insight.slug}`}
                  className="group/post grid gap-4 py-9 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-4 lg:grid-cols-12 lg:gap-8"
                >
                  <span className="label-mono text-slate lg:col-span-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="lg:col-span-6">
                    <h2 className="numeral text-[clamp(1.5rem,3.2vw,2.75rem)] font-semibold uppercase transition-colors duration-500 group-hover/post:text-blue">
                      {insight.title}
                    </h2>
                    <span className="mt-3 block max-w-[52ch] text-[0.98rem] leading-relaxed text-steel/75">
                      {insight.excerpt}
                    </span>
                  </span>
                  <span className="label-mono flex items-start gap-6 text-slate lg:col-span-4 lg:col-start-9 lg:justify-end">
                    <span>{insight.category}</span>
                    <span>{insight.readingTime}</span>
                    <span
                      aria-hidden="true"
                      className="text-base transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/post:translate-x-1.5 group-hover/post:-translate-y-1.5"
                    >
                      ↗
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <CTASection />
    </>
  )
}
