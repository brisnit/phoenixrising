import { Hero } from '@/components/sections/Hero'
import { Statement } from '@/components/sections/Statement'
import { Capabilities } from '@/components/sections/Capabilities'
import { ProcessPreview } from '@/components/sections/ProcessPreview'
import { ProjectShowcase } from '@/components/sections/ProjectShowcase'
import { WhyPhoenix } from '@/components/sections/WhyPhoenix'
import { TwoWorldsTeaser } from '@/components/sections/TwoWorldsTeaser'
import { Reality } from '@/components/sections/Reality'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTASection } from '@/components/sections/CTASection'

/**
 * Homepage.
 *
 * The section order is a tonal sequence as much as an argument: dark hero →
 * cream thesis and proof → cream capabilities → dark supply chain → cream
 * process → dark work → cream rationale → dark reality → cream testimony →
 * dark close. The why-us argument and the California ↔ Guangzhou teaser share
 * one cream band, separated by a rule: the teaser is that argument's closing
 * line, not a second destination. Each band declares its tone so the fixed header can stay legible
 * across all of them.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Capabilities />
      <ProcessPreview />
      <ProjectShowcase />
      <Testimonials />
      <Reality />
      <WhyPhoenix />
      <TwoWorldsTeaser />
      <CTASection />
    </>
  )
}
