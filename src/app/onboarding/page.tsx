import type { Metadata } from 'next'
import { RouteShell } from '@/components/layout/RouteShell'
import { onboardingShell } from '@/data/shells'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: onboardingShell.lead,
}

export default function OnboardingPage() {
  return <RouteShell shell={onboardingShell} plate="caliper" seed={97} />
}
