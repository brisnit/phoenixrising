import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { CapabilityStory } from '@/components/sections/CapabilityStory'
import { capabilities, capabilitiesIntro } from '@/data/capabilities'

export const metadata: Metadata = {
  title: 'Capabilities',
  description: capabilitiesIntro.body,
}

export default function CapabilitiesPage() {
  return (
    <>
      <PageHero
        eyebrow={capabilitiesIntro.eyebrow}
        lines={capabilitiesIntro.lines}
        body={capabilitiesIntro.body}
        plate="caliper"
        seed={8}
      />

      {/* Index of the four disciplines */}
      <section data-tone="light" aria-label="Capability index" className="bg-paper">
        <div className="container-rule py-16 sm:py-20">
          <ol className="grid gap-px border-t rule-light sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c) => (
              <li key={c.slug} className="border-b rule-light sm:border-b-0">
                <Link
                  href={`/capabilities/${c.slug}`}
                  className="group/idx flex h-full flex-col justify-between gap-8 py-7 pr-6 transition-colors hover:text-blue"
                >
                  <span className="numeral text-[3.5rem] font-semibold text-ink/15 transition-colors duration-500 group-hover/idx:text-cyan">
                    {c.index}
                  </span>
                  <span>
                    <span className="block font-display text-h3 font-medium uppercase tracking-[-0.02em]">
                      {c.title}
                    </span>
                    <span className="mt-2 block max-w-[30ch] text-sm text-slate">{c.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div data-tone="light" className="bg-paper">
        {capabilities.map((capability, i) => (
          <CapabilityStory key={capability.slug} capability={capability} index={i} />
        ))}
      </div>

      <CTASection />
    </>
  )
}
