import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { EvidenceSection } from '@/components/sections/EvidenceGallery'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { evidenceTaxonomy, type Project } from '@/data/projects'

/**
 * Project detail, rendered from whatever evidence exists.
 *
 * Every section is conditional. A project with prototype photography and
 * nothing else renders one evidence section and no empty headings — which is
 * the whole point of the model: the page reports what there is rather than
 * implying a complete story with blanks in it.
 *
 * Lives here rather than in the route file so it can be rendered directly by
 * `tests/component/ProjectEvidence.test.tsx` against a fixture. There are no
 * published projects yet, so its conditional behaviour is verified without
 * shipping a fictional project to prove it works.
 */
export function ProjectDetail({ project }: { project: Project }) {
  const narrative = [
    { label: 'The challenge', body: project.challenge },
    { label: 'Where it started', body: project.startingPoint },
    { label: 'What changed', body: project.whatChanged },
    { label: 'Where it is now', body: project.currentState },
  ].filter((section): section is { label: string; body: string } => Boolean(section.body))

  const meta = [
    project.client ? { label: 'Client', value: project.client } : null,
    project.year ? { label: 'Year', value: project.year } : null,
  ].filter((m): m is { label: string; value: string } => m !== null)

  return (
    <>
      <PageHero
        eyebrow="Project"
        lines={[project.name]}
        body={project.summary}
        plate="grid"
        seed={19}
        meta={meta.length > 0 ? meta : undefined}
      />

      {narrative.length > 0 && (
        <section
          data-tone="light"
          aria-labelledby="narrative-heading"
          className="bg-paper py-(--spacing-section)"
        >
          <div className="container-rule">
            <h2 id="narrative-heading" className="sr-only">
              Project background
            </h2>
            <dl className="grid gap-12">
              {narrative.map((section) => (
                <div key={section.label} className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                  <dt className="label-mono text-slate lg:col-span-3">{section.label}</dt>
                  <dd className="text-lead max-w-[58ch] text-ink lg:col-span-7 lg:col-start-5">
                    {section.body}
                  </dd>
                </div>
              ))}
            </dl>

            {project.questions && project.questions.length > 0 && (
              <div className="mt-16 border-t rule-light pt-10">
                <Eyebrow className="mb-8">What had to be learned</Eyebrow>
                <Reveal as="ol" stagger={0.08} className="grid gap-5">
                  {project.questions.map((question, i) => (
                    <li key={question} className="flex items-baseline gap-5">
                      <span className="label-mono shrink-0 text-blue">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="max-w-[54ch] font-display text-h3 font-medium tracking-[-0.02em]">
                        {question}
                      </span>
                    </li>
                  ))}
                </Reveal>
              </div>
            )}
          </div>
        </section>
      )}

      {/* One section per evidence stage that actually has items. */}
      {evidenceTaxonomy.map((group) => (
        <EvidenceSection
          key={group.stage}
          headingId={`evidence-${group.stage}`}
          title={group.title}
          note={group.note}
          items={project.evidence.filter((item) => item.stage === group.stage)}
        />
      ))}

      {/* Chosen per project — not the same prompt stamped on every one. */}
      {project.journeyCta && (
        <section data-tone="light" className="bg-paper pb-(--spacing-section)">
          <div className="container-rule border-t rule-light pt-12">
            <p className="numeral max-w-[20ch] text-[clamp(1.75rem,4vw,3rem)] font-semibold uppercase">
              {project.journeyCta.prompt}
            </p>
            <Link
              href={project.journeyCta.href}
              className="group/cta label-mono mt-8 inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
            >
              {project.journeyCta.label}
              <span
                aria-hidden="true"
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </section>
      )}

      <CTASection />
    </>
  )
}
