import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { MediaFrame } from '@/components/media/MediaFrame'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { projects, projectBySlug } from '@/data/projects'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = projectBySlug(slug)
  if (!project) return {}
  return { title: project.name, description: project.excerpt }
}

/**
 * Case study.
 *
 * Structured as challenge → solution → result, which is the only narrative
 * shape that makes an engineering decision legible to a non-engineer. Every
 * project currently carries placeholder copy, and the result field is
 * deliberately left as an unfilled placeholder rather than populated with a
 * plausible-sounding outcome.
 */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = projectBySlug(slug)
  if (!project) notFound()

  const position = projects.findIndex((p) => p.slug === slug)
  const next = projects[(position + 1) % projects.length]

  const sections = [
    { label: 'Challenge', body: project.challenge },
    { label: 'Solution', body: project.solution },
    { label: 'Result', body: project.result },
  ]

  return (
    <>
      <PageHero
        eyebrow={project.category}
        lines={[project.name]}
        body={project.excerpt}
        plate={project.plate}
        seed={position * 41 + 3}
        meta={[
          { label: 'Category', value: project.category },
          { label: 'Year', value: project.year },
          { label: 'Services', value: project.services.join(', ') },
        ]}
      />

      <article data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule">
          {project.placeholder && (
            <PlaceholderNote className="mb-14">
              Placeholder case study — not a Phoenix Rising project
            </PlaceholderNote>
          )}

          <div className="border-t rule-light">
            {sections.map((section) => (
              <div
                key={section.label}
                className="grid gap-4 border-b rule-light py-10 lg:grid-cols-12 lg:gap-8"
              >
                <h2 className="label-mono text-slate lg:col-span-3">{section.label}</h2>
                <Reveal className="lg:col-span-8 lg:col-start-5">
                  <p className="text-lead max-w-[58ch] text-ink">{section.body}</p>
                </Reveal>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="mt-14">
            <Eyebrow className="mb-6">Services applied</Eyebrow>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {project.services.map((service) => (
                <li key={service} className="label-mono border-b rule-light pb-2 text-ink">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Gallery */}
          <div className="mt-20">
            <Eyebrow className="mb-8">Gallery</Eyebrow>
            <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
              {project.gallery.map((item, i) => (
                <figure key={i} className={i === 0 ? 'sm:col-span-2' : undefined}>
                  <MediaFrame
                    plate={item.plate}
                    image={item.image}
                    alt={item.image ? item.caption : undefined}
                    tone="dark"
                    seed={position * 13 + i * 7 + 2}
                    ratio={i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}
                    parallax={i === 0 ? 5 : 0}
                    sizes={i === 0 ? '100vw' : '(min-width: 640px) 50vw, 100vw'}
                  />
                  <figcaption className="mt-3 label-mono text-slate">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* Next project */}
          <div className="mt-20">
            <Link href={`/projects/${next.slug}`} className="group/next block border-t rule-light pt-8">
              <span className="label-mono text-slate">Next project</span>
              <span className="mt-3 flex items-baseline justify-between gap-6">
                <span className="numeral text-[clamp(1.75rem,5vw,4rem)] font-semibold uppercase transition-colors duration-500 group-hover/next:text-blue">
                  {next.name}
                </span>
                <span
                  aria-hidden="true"
                  className="text-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/next:translate-x-2 group-hover/next:-translate-y-2"
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
