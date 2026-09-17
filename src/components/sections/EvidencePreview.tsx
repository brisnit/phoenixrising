import Link from 'next/link'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { evidenceTaxonomy, publishedProjects } from '@/data/projects'

/**
 * Homepage evidence band — replaces the Round 1 project showcase.
 *
 * That showcase was a display-scale list of four project names with a
 * pointer-following media panel. It was well built and it was furniture:
 * every project was `[Project One]` through `[Project Four]`, every narrative
 * was a `[PLACEHOLDER]`, and every image was a generated plate. On a homepage
 * that reads as a body of work.
 *
 * With nothing real to show, the honest move is to say what would be shown
 * and what the standard is. If projects are published later this section
 * names them instead, without a rewrite.
 */
export function EvidencePreview() {
  const hasProjects = publishedProjects.length > 0

  return (
    <section
      data-tone="dark"
      aria-labelledby="evidence-preview-heading"
      className="is-dark bg-ink py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark" className="mb-8">
              Evidence
            </Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="evidence-preview-heading"
              lines={['The work', 'leaves evidence.']}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-cyan']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text={
                hasProjects
                  ? 'Products become real through decisions, prototypes, specifications and finished objects. Those are the things worth showing.'
                  : 'Products become real through decisions, prototypes, specifications and finished objects. Phoenix Rising has not yet published a project here — client work needs permission before any of it can be shown.'
              }
              className="text-lead max-w-[46ch] text-slate-2"
            />
          </div>
        </div>

        {hasProjects ? (
          <Reveal as="ul" stagger={0.09} className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {publishedProjects.slice(0, 3).map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group/p block border-t rule-dark pt-5"
                >
                  <p className="font-display text-h3 font-medium uppercase tracking-[-0.02em] transition-colors group-hover/p:text-cyan">
                    {project.name}
                  </p>
                  <p className="mt-2 max-w-[30ch] text-[0.95rem] leading-relaxed text-slate">
                    {project.summary}
                  </p>
                </Link>
              </li>
            ))}
          </Reveal>
        ) : (
          <Reveal
            as="ul"
            stagger={0.07}
            className="mt-14 grid gap-x-8 gap-y-6 border-t rule-dark pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-5"
          >
            {evidenceTaxonomy.map((group) => (
              <li key={group.stage}>
                <p className="numeral text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold uppercase text-paper">
                  {group.title}
                </p>
                <p className="mt-2 max-w-[26ch] text-[0.9rem] leading-relaxed text-slate">
                  {group.note}
                </p>
              </li>
            ))}
          </Reveal>
        )}

        <div className="mt-12">
          <Link
            href="/projects"
            className="group/more label-mono inline-flex items-center gap-3 border-b border-white/25 pb-2 transition-colors hover:border-cyan hover:text-cyan"
          >
            {hasProjects ? 'All projects' : 'What a project can show'}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:translate-x-1 group-hover/more:-translate-y-1"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
