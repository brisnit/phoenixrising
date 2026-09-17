import type { Metadata } from 'next'
import { IdeationWorkspace } from '@/components/ideation/IdeationWorkspace'
import { workspaceIntro } from '@/data/ideation'

export const metadata: Metadata = {
  title: 'Ideation workspace',
  description: workspaceIntro.lead,
}

/**
 * The ideation workspace — the last route that was a shell.
 *
 * Deliberately not wrapped in a PageHero: this is a workspace, not a
 * marketing page, and the switch in register is the point. The header and
 * footer stay so a visitor can leave, but everything between them belongs to
 * the person thinking.
 */
export default function IdeatePage() {
  return <IdeationWorkspace />
}
