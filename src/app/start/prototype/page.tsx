import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { StageIntakeForm } from '@/components/sections/intake/StageIntakeForm'
import { prototypeIntake } from '@/data/intake'

export const metadata: Metadata = {
  title: 'Design or prototype',
  description: prototypeIntake.body,
}

export default function PrototypeIntakePage() {
  return (
    <>
      <PageHero
        eyebrow={prototypeIntake.eyebrow}
        lines={prototypeIntake.lines}
        body={prototypeIntake.body}
        plate="caliper"
        seed={71}
      />
      <div data-tone="light" className="bg-paper">
        <StageIntakeForm definition={prototypeIntake} />
      </div>
    </>
  )
}
