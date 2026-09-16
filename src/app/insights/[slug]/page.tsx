import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { Reveal } from '@/components/motion/Reveal'
import { insights, insightBySlug } from '@/data/insights'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const insight = insightBySlug(slug)
  if (!insight) return {}
  return { title: insight.title, description: insight.excerpt }
}

/**
 * Article.
 *
 * Body copy is rendered from structured blocks rather than raw HTML, so the
 * data layer stays portable to a CMS and the measure, rhythm and heading level
 * are controlled here rather than by whoever wrote the content.
 */
export default async function InsightPage({ params }: Params) {
  const { slug } = await params
  const insight = insightBySlug(slug)
  if (!insight) notFound()

  const position = insights.findIndex((i) => i.slug === slug)
  const next = insights[(position + 1) % insights.length]

  return (
    <>
      <PageHero
        eyebrow={insight.category}
        lines={[insight.title]}
        body={insight.excerpt}
        plate="grid"
        seed={position * 19 + 6}
        meta={[
          { label: 'Category', value: insight.category },
          { label: 'Published', value: insight.date },
          { label: 'Reading time', value: insight.readingTime },
        ]}
      />

      <article data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule">
          <div className="lg:mx-auto lg:max-w-[70ch]">
            {insight.body.map((block, i) => {
              if (block.type === 'h2') {
                return (
                  <Reveal key={i}>
                    <h2 className="mt-14 text-h3 font-semibold uppercase first:mt-0">
                      {block.text}
                    </h2>
                  </Reveal>
                )
              }
              if (block.type === 'list') {
                return (
                  <Reveal key={i} as="ul" className="mt-7 border-t rule-light">
                    {block.items?.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-4 border-b rule-light py-3.5 text-[1.05rem] text-ink"
                      >
                        <span aria-hidden="true" className="block size-1.5 shrink-0 bg-cyan" />
                        {item}
                      </li>
                    ))}
                  </Reveal>
                )
              }
              return (
                <Reveal key={i}>
                  <p className="mt-6 text-[1.1rem] leading-[1.7] text-steel/90 first:mt-0">
                    {block.text}
                  </p>
                </Reveal>
              )
            })}
          </div>

          <div className="mt-20 lg:mx-auto lg:max-w-[70ch]">
            <Link href={`/insights/${next.slug}`} className="group/next block border-t rule-light pt-8">
              <span className="label-mono text-slate">Next</span>
              <span className="mt-3 flex items-baseline justify-between gap-6">
                <span className="numeral text-[clamp(1.35rem,3.5vw,2.25rem)] font-semibold uppercase transition-colors duration-500 group-hover/next:text-blue">
                  {next.title}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/next:translate-x-2 group-hover/next:-translate-y-2"
                >
                  ↗
                </span>
              </span>
            </Link>
          </div>
        </div>
      </article>

      <CTASection />
    </>
  )
}
