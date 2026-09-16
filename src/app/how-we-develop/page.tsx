import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { SpaceBetween } from '@/components/sections/SpaceBetween'
import { QualityPrinciple } from '@/components/sections/QualityPrinciple'
import { CTASection } from '@/components/sections/CTASection'
import { processIntro, processStages } from '@/data/process'

export const metadata: Metadata = {
  title: 'How we develop products',
  description: processIntro.body,
}

/**
 * The development story.
 *
 * Sequence: the five stages, then the decisions that sit between a design and
 * a finished product, then quality as a thread through all of it rather than
 * a final inspection. Tonally cream → dark → cream → dark so no two full-bleed
 * bands of the same tone sit adjacent.
 */
export default function HowWeDevelopPage() {
  return (
    <>
      <PageHero
        eyebrow={processIntro.eyebrow}
        lines={processIntro.lines}
        body={processIntro.body}
        plate="route"
        seed={21}
        meta={[
          { label: 'Stages', value: `${processStages.length} — idea through repeatable manufacturing` },
          { label: 'Accountability', value: 'One team across the whole distance' },
          { label: 'Sequence', value: 'A typical shape, not a fixed pipeline' },
        ]}
      />
      <ProcessTimeline />
      <SpaceBetween />
      <QualityPrinciple />
      <CTASection />
    </>
  )
}
