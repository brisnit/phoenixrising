/* ===========================================================================
 * STAGE INTAKE
 * ---------------------------------------------------------------------------
 * Field definitions for the two intake journeys, as data.
 *
 * Nothing about the questions lives in the components — adding a field, a step
 * or a whole new stage is an edit here. `StageIntakeForm` renders whatever
 * this describes.
 *
 * CLAIM INTEGRITY: option labels describe what the VISITOR needs or has, never
 * what Phoenix Rising performs. "Tooling decisions" is a question the visitor
 * has; "we do tooling" would be a capability claim, and several capabilities
 * remain unverified (see claim.ts and the `verification: 'pending'` entries in
 * capabilities.ts / process.ts). Each needs question also carries a note
 * saying scope is confirmed after review, so selecting an option cannot read
 * as us agreeing to it.
 * ======================================================================== */

import type { ProjectStage } from './projectContext'

export type FieldType =
  | 'text'
  | 'email'
  | 'url'
  | 'textarea'
  | 'radio'
  | 'multi'

export type IntakeField = {
  id: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  autoComplete?: string
  help?: string
  options?: string[]
  /** Grid span at >=768px within its step. */
  span?: 1 | 2
}

export type IntakeStep = {
  id: string
  title: string
  /** Shown under the step heading. */
  lead?: string
  fields: IntakeField[]
}

export type IntakeDefinition = {
  stage: Exclude<ProjectStage, 'idea'>
  eyebrow: string
  lines: readonly string[]
  body: string
  steps: IntakeStep[]
}

/* Shared opening step — identical questions, asked once, either journey. */
const aboutYou: IntakeStep = {
  id: 'about-you',
  title: 'About you',
  lead: 'So we know who we are talking to.',
  fields: [
    { id: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name', span: 1 },
    { id: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email', span: 1 },
    { id: 'company', label: 'Company', type: 'text', autoComplete: 'organization', span: 1 },
    {
      id: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'https://',
      autoComplete: 'url',
      help: 'Optional.',
      span: 1,
    },
  ],
}

const NOT_SURE = 'Not sure'

export const prototypeIntake: IntakeDefinition = {
  stage: 'prototype',
  eyebrow: 'Design or prototype',
  lines: ["You've already", 'started building.'],
  body: 'Help us understand what exists today and what you need to solve next.',
  steps: [
    aboutYou,
    {
      id: 'product',
      title: 'The product',
      lead: 'What it is and who it is for.',
      fields: [
        {
          id: 'product',
          label: 'What are you developing?',
          type: 'textarea',
          required: true,
          placeholder: 'A sentence or two is plenty.',
          span: 2,
        },
        { id: 'sector', label: 'Sector or industry', type: 'text', span: 1 },
        { id: 'customer', label: 'Who is it for?', type: 'text', span: 1 },
        {
          id: 'market',
          label: 'Target market',
          type: 'text',
          help: 'Where it will be sold, if you know.',
          span: 2,
        },
      ],
    },
    {
      id: 'current-state',
      title: 'Where it is today',
      lead: 'An honest picture helps more than an optimistic one.',
      fields: [
        {
          id: 'currentState',
          label: 'Current state',
          type: 'radio',
          required: true,
          options: [
            'Design / CAD',
            'Concept prototype',
            'Functional prototype',
            'Production-ready prototype',
            'Existing product',
            NOT_SURE,
          ],
          span: 2,
        },
        {
          id: 'available',
          label: 'What do you have available?',
          type: 'multi',
          help: 'Select anything that exists. Nothing needs to be sent yet.',
          options: [
            'Sketches',
            'CAD files',
            'Drawings',
            'Bill of materials',
            'Prototype',
            'Product samples',
            'Specifications',
            'Test results',
            'None / not sure',
          ],
          span: 2,
        },
      ],
    },
    {
      id: 'needs',
      title: 'What you need',
      lead: 'Where you want help, and the shape of the project.',
      fields: [
        {
          id: 'needs',
          label: 'What do you need help with?',
          type: 'multi',
          help: 'Tell us where the open questions are. What we can take on is confirmed after we have reviewed the project.',
          options: [
            'Engineering questions',
            'Design refinement',
            'Prototyping',
            'Getting production-ready',
            'Tooling decisions',
            'Finding a manufacturing path',
            'Quality planning',
            'Cost and production planning',
            NOT_SURE,
          ],
          span: 2,
        },
        {
          id: 'quantity',
          label: 'Expected quantity',
          type: 'text',
          placeholder: 'A number, a range, or "not sure"',
          span: 1,
        },
        {
          id: 'budget',
          label: 'Budget range',
          type: 'text',
          placeholder: 'A range, or "not sure"',
          span: 1,
        },
        {
          id: 'timing',
          label: 'Target timing',
          type: 'text',
          placeholder: 'A date, a quarter, or "not sure"',
          span: 2,
        },
        {
          id: 'notes',
          label: 'Anything else we should know?',
          type: 'textarea',
          placeholder: 'Constraints, deadlines, what has already been tried.',
          span: 2,
        },
      ],
    },
  ],
}

export const productionIntake: IntakeDefinition = {
  stage: 'production',
  eyebrow: 'Ready for production',
  lines: ['Ready to', 'make it real?'],
  body: 'Tell us what has already been defined so Phoenix Rising can understand the manufacturing conversation you need to have.',
  steps: [
    aboutYou,
    {
      id: 'product',
      title: 'The product',
      lead: 'What is being made, and for which market.',
      fields: [
        {
          id: 'product',
          label: 'Product',
          type: 'textarea',
          required: true,
          placeholder: 'What it is, and anything that makes it unusual to build.',
          span: 2,
        },
        { id: 'sector', label: 'Sector', type: 'text', span: 1 },
        { id: 'market', label: 'Target market', type: 'text', span: 1 },
      ],
    },
    {
      id: 'current-state',
      title: 'Where it is today',
      lead: 'What already exists on the manufacturing side.',
      fields: [
        {
          id: 'productionStatus',
          label: 'Production status',
          type: 'radio',
          required: true,
          options: [
            'Not yet in production',
            'Pilot / short run',
            'Currently in production',
            'Looking for a new manufacturing path',
            NOT_SURE,
          ],
          span: 2,
        },
        {
          id: 'productionInfo',
          label: 'What production information do you have?',
          type: 'multi',
          help: 'Select anything that exists. Nothing needs to be sent yet.',
          options: [
            'CAD / engineering drawings',
            'Bill of materials',
            'Material specifications',
            'Quality requirements',
            'Packaging requirements',
            'Existing samples',
            'Tooling',
            'Current supplier information',
            'None / not sure',
          ],
          span: 2,
        },
      ],
    },
    {
      id: 'needs',
      title: 'What you need',
      lead: 'The conversation you are trying to have.',
      fields: [
        {
          id: 'needs',
          label: 'What do you need from Phoenix Rising?',
          type: 'multi',
          help: 'Tell us what you are looking for. What we can take on is confirmed after we have reviewed the project.',
          options: [
            'Manufacturing review',
            'Production planning',
            'Development-to-production guidance',
            'Quality planning',
            'Packaging and delivery planning',
            'Support for existing production',
            NOT_SURE,
          ],
          span: 2,
        },
        {
          id: 'quantity',
          label: 'Expected quantity',
          type: 'text',
          /* Deliberately free text. A range list would imply a minimum order
             quantity, and no Phoenix Rising MOQ has been supplied. */
          placeholder: 'Per order or per year — a number, a range, or "not sure"',
          span: 1,
        },
        {
          id: 'timing',
          label: 'Target timing',
          type: 'text',
          placeholder: 'A date, a quarter, or "not sure"',
          span: 1,
        },
        {
          id: 'notes',
          label: 'Anything else we should know?',
          type: 'textarea',
          placeholder: 'Current challenges, why you are looking, what has to stay the same.',
          span: 2,
        },
      ],
    },
  ],
}

export const intakeByStage: Record<Exclude<ProjectStage, 'idea'>, IntakeDefinition> = {
  prototype: prototypeIntake,
  production: productionIntake,
}

/** Every field id in a definition, in order — used by review and tests. */
export const fieldIds = (definition: IntakeDefinition): string[] =>
  definition.steps.flatMap((step) => step.fields.map((field) => field.id))

export const reviewCopy = {
  eyebrow: 'Review',
  lines: ['Does this', 'look right?'],
  body: 'Change anything that is not quite right before you continue.',
} as const

/**
 * Completion copy. Nothing is delivered anywhere — see submitProjectIntake —
 * so this must never suggest Phoenix Rising has received the project.
 */
export const completionCopy = {
  eyebrow: 'Not yet sent',
  lines: ['Your project', 'summary is ready.'],
  body: "Direct project delivery isn't connected yet, so nothing here has reached Phoenix Rising. You can review your information or continue through the current contact path.",
  primary: { label: 'Contact Phoenix Rising', href: '/contact' },
  secondary: 'Edit my information',
  note: 'Your answers stay in this browser tab only.',
} as const
