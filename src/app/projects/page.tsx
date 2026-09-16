import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { MediaFrame } from '@/components/media/MediaFrame'
import { Reveal } from '@/components/motion/Reveal'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { projects, workIntro } from '@/data/projects'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Work',
  description: workIntro.body,
}

/**
 * Work index.
 *
 * An editorial grid rather than a card wall: projects alternate between a wide
 * and a narrow column so the page has a rhythm, and each entry leads with its
 * composition at a generous size.
 */
export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow={workIntro.eyebrow}
        lines={workIntro.lines}
        body={workIntro.body}
        plate="wave"
        seed={15}
      />

      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule">
          <PlaceholderNote className="mb-14">
            Placeholder projects — replace in src/data/projects.ts
          </PlaceholderNote>

          <ul className="grid gap-x-8 gap-y-16 lg:grid-cols-12">
            {projects.map((project, i) => {
              /* Alternating measure: wide, narrow, narrow, wide. */
              const wide = i % 4 === 0 || i % 4 === 3
              return (
                <li
                  key={project.slug}
                  className={cn(wide ? 'lg:col-span-7' : 'lg:col-span-5', i % 4 === 3 && 'lg:col-start-6')}
                >
                  <Reveal>
                    <Link href={`/projects/${project.slug}`} data-cursor="View" className="group/proj block">
                      <MediaFrame
                        plate={project.plate}
                        tone="dark"
                        seed={i * 41 + 3}
                        ratio={wide ? 'aspect-[4/3]' : 'aspect-[4/5]'}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                      <div className="mt-6 flex items-baseline justify-between gap-5 border-t rule-light pt-5">
                        <div>
                          <h2 className="numeral text-[clamp(1.5rem,3vw,2.5rem)] font-semibold uppercase transition-colors duration-500 group-hover/proj:text-blue">
                            {project.name}
                          </h2>
                          <p className="mt-2 label-mono text-slate">
                            {project.category} — {project.year}
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="text-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/proj:translate-x-1.5 group-hover/proj:-translate-y-1.5"
                        >
                          ↗
                        </span>
                      </div>
                      <p className="mt-4 max-w-[48ch] text-[0.98rem] leading-relaxed text-steel/75">
                        {project.excerpt}
                      </p>
                    </Link>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <CTASection />
    </>
  )
}
