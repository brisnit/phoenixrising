import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { MediaFrame } from '@/components/media/MediaFrame'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PendingTag } from '@/components/ui/PendingTag'
import { capabilities, capabilityBySlug } from '@/data/capabilities'

type Params = { params: Promise<{ slug: string }> }

/* Pre-renders /capabilities/design-for-manufacturability, /prototyping-tooling,
   /production and /quality-logistics at build time. */
export function generateStaticParams() {
  return capabilities.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const capability = capabilityBySlug(slug)
  if (!capability) return {}
  return { title: capability.title, description: capability.summary }
}

export default async function CapabilityPage({ params }: Params) {
  const { slug } = await params
  const capability = capabilityBySlug(slug)
  if (!capability) notFound()

  const position = capabilities.findIndex((c) => c.slug === slug)
  const next = capabilities[(position + 1) % capabilities.length]

  return (
    <>
      <PageHero
        eyebrow={`Capability ${capability.index}`}
        lines={capability.titleLines}
        body={capability.lead}
        plate={capability.plate}
        seed={position * 17 + 5}
      />

      {/* The failure mode this capability prevents */}
      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-8">Why it matters</Eyebrow>
            <AnimatedHeadline
              as="h2"
              lines={[capability.risk.title]}
              className="text-h2 font-semibold uppercase"
            />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <p className="text-lead max-w-[46ch] text-steel/85">{capability.risk.body}</p>
          </Reveal>
        </div>

        <div className="container-rule mt-16 sm:mt-20">
          <MediaFrame
            plate={capability.plate}
            tone="dark"
            seed={position * 17 + 61}
            ratio="aspect-[16/10] sm:aspect-[21/9]"
            parallax={6}
            sizes="100vw"
          />
        </div>
      </section>

      {/* What the work consists of */}
      <section
        data-tone="dark"
        aria-labelledby="scope-heading"
        className="is-dark bg-ink py-(--spacing-section) text-paper"
      >
        <div className="container-rule">
          <Eyebrow tone="dark" className="mb-8">
            Scope of work
          </Eyebrow>
          <AnimatedHeadline
            as="h2"
            lines={['What this', 'actually involves.']}
            className="text-h1 font-semibold uppercase"
            id="scope-heading"
          />

          <dl className="mt-16 border-t rule-dark sm:mt-20">
            {capability.disciplines.map((d, i) => (
              <div key={d.title} className="grid gap-3 border-b rule-dark py-7 lg:grid-cols-12 lg:gap-8">
                <dt className="label-mono text-cyan lg:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </dt>
                <dd className="lg:col-span-4">
                  <p className="font-display text-h3 font-medium tracking-[-0.02em]">
                    {d.title}
                    {d.verification === 'pending' && <PendingTag />}
                  </p>
                </dd>
                <dd className="max-w-[56ch] text-[0.98rem] leading-relaxed text-slate-2 lg:col-span-6 lg:col-start-7">
                  {d.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Deliverables */}
      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow className="mb-8">Deliverables</Eyebrow>
            <h2 className="text-h2 font-semibold uppercase">What you receive</h2>
          </div>
          <Reveal stagger={0.07} as="ul" className="border-t rule-light lg:col-span-7 lg:col-start-6">
            {capability.deliverables.map((item) => (
              <li
                key={item.text}
                className="flex items-baseline gap-4 border-b rule-light py-5 text-lead text-ink"
              >
                <span aria-hidden="true" className="block size-1.5 shrink-0 bg-cyan" />
                <span>
                  {item.text}
                  {item.verification === 'pending' && <PendingTag />}
                </span>
              </li>
            ))}
          </Reveal>
        </div>

        {/* Next capability */}
        <div className="container-rule mt-20">
          <Link
            href={`/capabilities/${next.slug}`}
            className="group/next block border-t rule-light pt-8"
          >
            <span className="label-mono text-slate">Next — {next.index}</span>
            <span className="mt-3 flex items-baseline justify-between gap-6">
              <span className="numeral text-[clamp(1.75rem,5vw,4rem)] font-semibold uppercase transition-colors duration-500 group-hover/next:text-blue">
                {next.title}
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
      </section>

      <CTASection />
    </>
  )
}
