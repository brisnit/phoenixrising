import type { Metadata } from 'next'
import { LegalPage } from '@/components/layout/LegalPage'

export const metadata: Metadata = { title: 'Terms', robots: { index: false } }

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of use"
      sections={[
        'Use of this site',
        'Intellectual property',
        'Enquiries and submitted material',
        'Limitation of liability',
        'Governing law',
        'Contact',
      ]}
    />
  )
}
