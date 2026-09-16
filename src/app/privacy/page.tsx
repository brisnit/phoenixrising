import type { Metadata } from 'next'
import { LegalPage } from '@/components/layout/LegalPage'

export const metadata: Metadata = { title: 'Privacy', robots: { index: false } }

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      sections={[
        'Information we collect',
        'How enquiry and file submissions are handled',
        'Confidentiality of product information',
        'Cookies and analytics',
        'Data retention',
        'Your rights',
        'Contact',
      ]}
    />
  )
}
