import { Hero } from '@/components/sections/Hero'
import { Statement } from '@/components/sections/Statement'
import { Capabilities } from '@/components/sections/Capabilities'
import { IPSystem } from '@/components/sections/IPSystem'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { ProjectShowcase } from '@/components/sections/ProjectShowcase'
import { WhyPhoenix } from '@/components/sections/WhyPhoenix'
import { Reality } from '@/components/sections/Reality'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTASection } from '@/components/sections/CTASection'

/**
 * Homepage.
 *
 * The section order is a tonal sequence as much as an argument: dark hero →
 * cream thesis and proof → cream capabilities → dark supply chain → cream
 * process → dark work → cream rationale → dark reality → cream testimony →
 * dark close. Each band declares its tone so the fixed header can stay legible
 * across all of them.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Capabilities />
      <IPSystem />
      <ProcessTimeline />
      <ProjectShowcase />
      <Testimonials />
      <Reality />
      <WhyPhoenix />
      <CTASection />
    </>
  )
}
