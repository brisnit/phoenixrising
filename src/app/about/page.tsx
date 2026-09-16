import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { Reveal } from '@/components/motion/Reveal'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { MediaFrame } from '@/components/media/MediaFrame'
import { about } from '@/data/about'

export const metadata: Metadata = {
  title: 'About',
  description: about.lead,
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={about.eyebrow}
        lines={about.lines}
        body={about.lead}
        plate="burst"
        seed={12}
      />

      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule grid gap-10 lg:grid-cols-12 lg:gap-8">
          <p className="label-mono text-slate lg:col-span-3">Position</p>
          <Reveal stagger={0.12} className="grid gap-6 lg:col-span-7 lg:col-start-5">
            {about.body.map((para, i) => (
              <p
                key={i}
                className={i === 0 ? 'text-lead text-ink' : 'text-lead text-steel/80'}
              >
                {para}
              </p>
            ))}
          </Reveal>
        </div>

        <div className="container-rule mt-16 sm:mt-24">
          <MediaFrame
            plate="lattice"
            tone="dark"
            seed={44}
            ratio="aspect-[16/10] sm:aspect-[21/9]"
            parallax={7}
            sizes="100vw"
          />
        </div>
      </section>

      {/* Operating principles */}
      <section
        data-tone="dark"
        aria-labelledby="principles-heading"
        className="is-dark bg-ink text-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <Eyebrow tone="dark" className="mb-8">
            How we operate
          </Eyebrow>
          <AnimatedHeadline
            as="h2"
            id="principles-heading"
            lines={['Five principles', 'we do not trade away.']}
            className="text-h1 font-semibold uppercase"
          />

          <ol className="mt-16 border-t rule-dark sm:mt-24">
            {about.principles.map((p) => (
              <li key={p.index} className="border-b rule-dark py-8">
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                  <p className="label-mono text-cyan lg:col-span-1">{p.index}</p>
                  <h3 className="numeral text-[clamp(1.5rem,3.4vw,2.75rem)] font-semibold uppercase lg:col-span-5">
                    {p.title}
                  </h3>
                  <p className="max-w-[48ch] text-[0.98rem] leading-relaxed text-slate-2 lg:col-span-5 lg:col-start-8">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team and presence — awaiting real information */}
      <section data-tone="light" className="bg-paper pb-(--spacing-section)">
        <div className="container-rule grid gap-12 border-t rule-light pt-14 lg:grid-cols-2 lg:gap-8">
          {[about.team, about.presence].map((block) => (
            <div key={block.headline}>
              <h2 className="text-h3 font-semibold uppercase">{block.headline}</h2>
              <p className="mt-5 max-w-[48ch] text-lead text-steel/75">{block.body}</p>
              {block.placeholder && (
                <PlaceholderNote className="mt-6">Awaiting content</PlaceholderNote>
              )}
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  )
}
