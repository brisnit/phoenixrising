import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MediaFrame } from '@/components/media/MediaFrame'
import {
  evidenceEmptyState,
  evidenceTaxonomy,
  projectsIntro,
  publishedProjects,
} from '@/data/projects'
import { stages } from '@/data/stages'

export const metadata: Metadata = {
  title: 'Projects',
  description: projectsIntro.body,
}

/**
 * Projects — an evidence library rather than a portfolio.
 *
 * Round 1's four placeholder case studies are gone. `publishedProjects` is
 * derived: a project appears only when it carries at least one evidence item
 * with a real provenance, so an unsupported project cannot be published by
 * editing a boolean.
 *
 * While the library is empty the page is not: it explains what counts as
 * evidence and what the standard for publishing is. That is genuinely useful
 * to a prospective client — it is the same list Phoenix Rising would ask them
 * for — and it makes the absence read as a standard rather than an oversight.
 */
export default function ProjectsPage() {
  const hasProjects = publishedProjects.length > 0

  return (
    <>
      <PageHero
        eyebrow={projectsIntro.eyebrow}
        lines={projectsIntro.lines}
        body={projectsIntro.body}
        plate="lattice"
        seed={26}
      />

      {hasProjects ? (
        <section
          data-tone="light"
          aria-labelledby="project-index-heading"
          className="bg-paper py-(--spacing-section)"
        >
          <div className="container-rule">
            <h2 id="project-index-heading" className="text-h2 font-semibold uppercase">
              Published projects
            </h2>
            <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {publishedProjects.map((project) => (
                <li key={project.slug}>
                  <Link href={`/projects/${project.slug}`} className="group/p block">
                    <MediaFrame
                      plate="grid"
                      image={project.evidence.find((e) => e.media?.image)?.media?.image}
                      alt={project.evidence.find((e) => e.media?.image)?.media?.alt}
                      ratio="aspect-[4/3]"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                    <h3 className="mt-5 font-display text-h3 font-medium uppercase tracking-[-0.02em] transition-colors group-hover/p:text-blue">
                      {project.name}
                    </h3>
                    <p className="mt-2 max-w-[34ch] text-[0.95rem] leading-relaxed text-steel/85">
                      {project.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        /* --- Empty state ------------------------------------------------ */
        <section
          data-tone="light"
          aria-labelledby="empty-heading"
          data-evidence-empty="true"
          className="bg-paper py-(--spacing-section)"
        >
          <div className="container-rule">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <Eyebrow className="mb-8">{evidenceEmptyState.eyebrow}</Eyebrow>
                <AnimatedHeadline
                  as="h2"
                  id="empty-heading"
                  lines={evidenceEmptyState.lines}
                  className="text-h1 font-semibold uppercase"
                />
              </div>
              <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
                <SplitTextReveal
                  text={evidenceEmptyState.body[0]}
                  className="text-lead max-w-[46ch] text-steel/85"
                />
              </div>
            </div>

            <div className="mt-14 grid gap-8 border-t rule-light pt-10 lg:grid-cols-12 lg:gap-8">
              <p className="label-mono text-slate lg:col-span-3">The standard</p>
              <div className="grid gap-6 lg:col-span-7 lg:col-start-5">
                <p className="text-lead max-w-[58ch] text-ink">{evidenceEmptyState.standard}</p>
                <p className="text-lead max-w-[58ch] text-steel/80">
                  {evidenceEmptyState.body[1]}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What a project can carry. Content about the system, not about work. */}
      <section
        data-tone="dark"
        aria-labelledby="taxonomy-heading"
        className="is-dark bg-ink py-(--spacing-section) text-paper"
      >
        <div className="container-rule">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow tone="dark" className="mb-8">
                What a project can show
              </Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="taxonomy-heading"
                lines={['Five kinds', 'of evidence.']}
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-cyan']}
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
              <p className="text-lead max-w-[46ch] text-slate-2">
                A project is published against these, not against a narrative. Every item names
                where it came from, and anything illustrative says so on its face.
              </p>
            </div>
          </div>

          <Reveal as="ol" stagger={0.07} className="mt-16 border-t rule-dark lg:mt-24">
            {evidenceTaxonomy.map((group, index) => (
              <li key={group.stage} className="border-b rule-dark py-8">
                <div className="grid gap-5 lg:grid-cols-12 lg:gap-8">
                  <p className="label-mono text-cyan lg:col-span-1">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <div className="lg:col-span-4">
                    <h3 className="numeral text-[clamp(1.5rem,3vw,2.5rem)] font-semibold uppercase">
                      {group.title}
                    </h3>
                    <p className="mt-2 max-w-[32ch] text-[0.95rem] leading-relaxed text-slate">
                      {group.note}
                    </p>
                  </div>
                  <ul className="grid gap-2 lg:col-span-6 lg:col-start-7">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 font-mono text-[0.78rem] leading-[1.5] tracking-[0.04em] text-paper"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.5em] block size-1 shrink-0 bg-slate-brand"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Where you are matters more than what we can show. */}
      <section
        data-tone="light"
        aria-labelledby="journey-from-projects"
        className="bg-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <Eyebrow className="mb-8">Meanwhile</Eyebrow>
          <h2 id="journey-from-projects" className="text-h2 font-semibold uppercase">
            Your project is the one that matters
          </h2>
          <p className="text-lead mt-5 max-w-[56ch] text-steel/85">
            Evidence of someone else’s product tells you what a company has done, not what it would
            do with yours. The more useful question is where yours has reached.
          </p>
          <Reveal as="ul" stagger={0.09} className="mt-12 grid gap-8 sm:grid-cols-3">
            {stages.map((stage) => (
              <li key={stage.id}>
                <Link href={stage.href} className="group/j block border-t rule-light pt-5">
                  <p className="label-mono text-blue">{stage.index}</p>
                  <p className="mt-3 font-display text-h3 font-medium uppercase tracking-[-0.02em] transition-colors group-hover/j:text-blue">
                    {stage.title}
                  </p>
                  <p className="mt-2 max-w-[30ch] text-[0.95rem] leading-relaxed text-steel/80">
                    {stage.outcome}
                  </p>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  )
}
