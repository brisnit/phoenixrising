import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { IPSystem } from '@/components/sections/IPSystem'
import { CTASection } from '@/components/sections/CTASection'
import { processIntro, processSteps } from '@/data/process'

export const metadata: Metadata = {
  title: 'Process',
  description: processIntro.body,
}

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow={processIntro.eyebrow}
        lines={processIntro.lines}
        body={processIntro.body}
        plate="route"
        seed={21}
        meta={[
          { label: 'Stages', value: `${processSteps.length} — discovery through delivery` },
          { label: 'Accountability', value: 'One team across the full programme' },
          { label: 'Output', value: 'Every stage ends in an approvable deliverable' },
        ]}
      />
      <ProcessTimeline />
      <IPSystem />
      <CTASection />
    </>
  )
}
