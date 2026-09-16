import { SectionIntro } from '@/components/ui/SectionIntro'
import { CapabilityStory } from './CapabilityStory'
import { capabilities, capabilitiesIntro } from '@/data/capabilities'

export function Capabilities() {
  return (
    <div data-tone="light" className="bg-paper">
      <div className="container-rule pb-16 pt-(--spacing-section) sm:pb-24">
        <SectionIntro
          eyebrow={capabilitiesIntro.eyebrow}
          lines={capabilitiesIntro.lines}
          body={capabilitiesIntro.body}
        />
      </div>

      {capabilities.map((capability, i) => (
        <CapabilityStory key={capability.slug} capability={capability} index={i} />
      ))}
    </div>
  )
}
