import type { Metadata } from 'next'
import { RouteShell } from '@/components/layout/RouteShell'
import { startShell } from '@/data/shells'

export const metadata: Metadata = {
  title: 'Start a project',
  description: startShell.lead,
}

export default function StartPage() {
  return <RouteShell shell={startShell} plate="route" seed={64} />
}
