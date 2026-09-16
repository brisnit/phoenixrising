/* ===========================================================================
 * PROJECT INTAKE FORM
 * ---------------------------------------------------------------------------
 * Field definitions for the qualification form. The form is front-end only:
 * `src/lib/submitEnquiry.ts` is the single integration point where an API
 * route, email service or CRM can be wired in later.
 * ======================================================================== */

export type FieldType = 'text' | 'email' | 'url' | 'tel' | 'select' | 'textarea' | 'date' | 'file'

export type Field = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  autoComplete?: string
  options?: string[]
  help?: string
  /* Grid span at >=768px. */
  span?: 1 | 2
}

export const contactIntro = {
  eyebrow: 'Project intake',
  lines: ["Let's make", 'it real.'],
  body: 'Tell us where the product is today. The more specific you can be about stage, volume and timing, the more useful our first conversation will be.',
} as const

export const productStages = [
  'Idea',
  'Design',
  'Prototype',
  'Tooling',
  'Production',
  'Looking to switch manufacturers',
] as const

export const volumeRanges = [
  'Under 1,000 units',
  '1,000 – 5,000 units',
  '5,000 – 25,000 units',
  '25,000 – 100,000 units',
  'Over 100,000 units',
  'Not yet determined',
] as const

export const budgetRanges = [
  'Under $25,000',
  '$25,000 – $75,000',
  '$75,000 – $250,000',
  '$250,000 – $1M',
  'Over $1M',
  'Not yet determined',
] as const

export const formFields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name', span: 1 },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email', span: 1 },
  { name: 'company', label: 'Company', type: 'text', autoComplete: 'organization', span: 1 },
  {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://',
    autoComplete: 'url',
    span: 1,
  },
  {
    name: 'stage',
    label: 'Product stage',
    type: 'select',
    required: true,
    options: [...productStages],
    span: 1,
  },
  {
    name: 'volume',
    label: 'Estimated production volume',
    type: 'select',
    options: [...volumeRanges],
    span: 1,
  },
  {
    name: 'launchDate',
    label: 'Target launch date',
    type: 'date',
    help: 'Approximate is fine.',
    span: 1,
  },
  { name: 'budget', label: 'Budget range', type: 'select', options: [...budgetRanges], span: 1 },
  {
    name: 'brief',
    label: 'Tell us about the product',
    type: 'textarea',
    required: true,
    placeholder:
      'What is it, who is it for, and what is the hardest part — technically or commercially?',
    span: 2,
  },
  {
    name: 'files',
    label: 'Attachments',
    type: 'file',
    help: 'CAD / drawings / product brief — PDF, STEP, STL, ZIP. Max 25 MB.',
    span: 2,
  },
]

export const formCta = 'Start the conversation'

export const formConfidence =
  'Your files and product details are treated as confidential. We are happy to sign an NDA before you send anything.'
