import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { CapabilityProgression } from '@/components/sections/CapabilityProgression'
import { CTASection } from '@/components/sections/CTASection'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { capabilitiesIntro, capabilityFamilies } from '@/data/capabilities'

export const metadata: Metadata = {
  title: 'Capabilities',
  description: capabilitiesIntro.body,
}

/**
 * Capabilities.
 *
 * One page, four families, no detail routes. Round 1 had four capability
 * pages listing ~26 named technical disciplines between them — a service menu
 * that claimed far more than had ever been confirmed, and carried six of the
 * seven quarantined markers. The old slugs now redirect here.
 *
 * The page states its own standard before making any claim, which is the only
 * honest order to do it in.
 */
export default function CapabilitiesPage() {
  return (
    <>
      <PageHero
        eyebrow={capabilitiesIntro.eyebrow}
        lines={capabilitiesIntro.lines}
        body={capabilitiesIntro.body}
        plate="caliper"
        seed={8}
        meta={capabilityFamilies.map((f) => ({
          label: f.index,
          value: `${f.title} — ${f.objectState.label}`,
        }))}
      />

      {/* The standard the rest of the page is written to. */}
      <section
        data-tone="light"
        aria-labelledby="principle-heading"
        className="bg-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">How to read this page</Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="principle-heading"
                lines={capabilitiesIntro.principle.lines}
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-slate']}
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
              <SplitTextReveal
                text={capabilitiesIntro.principle.body}
                className="text-lead max-w-[46ch] text-steel/85"
              />
            </div>
          </div>

          <Reveal
            as="ol"
            stagger={0.09}
            className="mt-14 grid gap-x-8 gap-y-8 border-t rule-light pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
          >
            {capabilityFamilies.map((family) => (
              <li key={family.id}>
                <p className="label-mono text-blue">{family.index}</p>
                <p className="numeral mt-3 text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold uppercase">
                  <a href={`#${family.id}`} className="transition-colors hover:text-blue">
                    {family.title}
                  </a>
                </p>
                <p className="mt-2 max-w-[28ch] text-[0.95rem] leading-relaxed text-steel/80">
                  {family.headline.join(' ')}
                </p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <CapabilityProgression />
      <CTASection />
    </>
  )
}
