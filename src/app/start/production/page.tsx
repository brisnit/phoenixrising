import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { StageIntakeForm } from '@/components/sections/intake/StageIntakeForm'
import { productionIntake } from '@/data/intake'

export const metadata: Metadata = {
  title: 'Ready for production',
  description: productionIntake.body,
}

export default function ProductionIntakePage() {
  return (
    <>
      <PageHero
        eyebrow={productionIntake.eyebrow}
        lines={productionIntake.lines}
        body={productionIntake.body}
        plate="lattice"
        seed={88}
      />
      <div data-tone="light" className="bg-paper">
        <StageIntakeForm definition={productionIntake} />
      </div>
    </>
  )
}
