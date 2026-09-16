import type { Metadata } from 'next'
import { RouteShell } from '@/components/layout/RouteShell'
import { ideateShell } from '@/data/shells'

export const metadata: Metadata = {
  title: 'Ideation workspace',
  description: ideateShell.lead,
}

export default function IdeatePage() {
  return <RouteShell shell={ideateShell} plate="burst" seed={82} />
}
