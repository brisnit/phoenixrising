import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { StageSelector } from '@/components/sections/StageSelector'
import { CompactJourney } from '@/components/sections/CompactJourney'
import { StartTracker } from '@/components/sections/StartTracker'
import { startIntro } from '@/data/stages'

export const metadata: Metadata = {
  title: 'Start a project',
  description: startIntro.body,
}

export default function StartPage() {
  return (
    <>
      <StartTracker />
      <PageHero
        eyebrow={startIntro.eyebrow}
        lines={startIntro.lines}
        body={startIntro.body}
        plate="route"
        seed={64}
      />
      <StageSelector />
      <CompactJourney />
    </>
  )
}
