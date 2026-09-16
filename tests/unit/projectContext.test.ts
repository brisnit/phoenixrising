import { describe, it, expect } from 'vitest'
import {
  createProjectContext,
  setAnswer,
  getAnswer,
  describeAnswer,
  unansweredFields,
  serialiseProjectContext,
  deserialiseProjectContext,
} from '@/data/projectContext'
import { validateStep, hasErrors } from '@/lib/intakeValidation'
import { prototypeIntake, productionIntake } from '@/data/intake'

describe('ProjectContext', () => {
  it('records provenance on every answer', () => {
    const ctx = setAnswer(createProjectContext('prototype'), 'name', 'Test Person')
    expect(ctx.answers.name).toEqual({ value: 'Test Person', provenance: 'user' })
  })

  it('never invents AI-sourced answers in this phase', () => {
    let ctx = createProjectContext('production')
    ctx = setAnswer(ctx, 'product', 'A sealed enclosure')
    ctx = setAnswer(ctx, 'needs', ['Manufacturing review'])
    const sources = Object.values(ctx.answers).map((a) => a.provenance)
    expect(new Set(sources)).toEqual(new Set(['user']))
  })

  it('treats clearing a field as unanswered rather than empty-answered', () => {
    let ctx = setAnswer(createProjectContext(), 'company', 'Acme')
    ctx = setAnswer(ctx, 'company', '')
    expect('company' in ctx.answers).toBe(false)
    expect(getAnswer(ctx, 'company')).toBeUndefined()
  })

  it('distinguishes unanswered from answered when describing', () => {
    const ctx = setAnswer(createProjectContext(), 'sector', 'Consumer electronics')
    expect(describeAnswer(ctx, 'sector')).toBe('Consumer electronics')
    expect(describeAnswer(ctx, 'market')).toBe('Not provided')
  })

  it('keeps multi-select answers as lists', () => {
    const ctx = setAnswer(createProjectContext(), 'available', ['CAD files', 'Prototype'])
    expect(describeAnswer(ctx, 'available')).toBe('CAD files, Prototype')
  })

  it('reports which fields were left open', () => {
    const ctx = setAnswer(createProjectContext(), 'name', 'A')
    expect(unansweredFields(ctx, ['name', 'email', 'company'])).toEqual(['email', 'company'])
  })

  it('round-trips through serialisation without losing provenance', () => {
    let ctx = createProjectContext('prototype')
    ctx = setAnswer(ctx, 'name', 'Test Person')
    ctx = setAnswer(ctx, 'available', ['CAD files'])
    const restored = deserialiseProjectContext(serialiseProjectContext(ctx))
    expect(restored).toEqual(ctx)
  })
})

describe('validation', () => {
  const aboutYou = prototypeIntake.steps[0]

  it('blocks only on genuinely required fields', () => {
    const errors = validateStep(aboutYou, createProjectContext('prototype'))
    expect(Object.keys(errors).sort()).toEqual(['email', 'name'])
  })

  it('rejects a malformed email', () => {
    let ctx = setAnswer(createProjectContext(), 'name', 'A')
    ctx = setAnswer(ctx, 'email', 'not-an-email')
    expect(validateStep(aboutYou, ctx).email).toBeTruthy()
  })

  it('accepts a valid email and clears', () => {
    let ctx = setAnswer(createProjectContext(), 'name', 'A')
    ctx = setAnswer(ctx, 'email', 'a@b.co')
    expect(hasErrors(validateStep(aboutYou, ctx))).toBe(false)
  })

  it('accepts "Not sure" as a real answer', () => {
    const step = productionIntake.steps[2]
    const ctx = setAnswer(createProjectContext('production'), 'productionStatus', 'Not sure')
    expect(hasErrors(validateStep(step, ctx))).toBe(false)
  })

  it('never demands precision on quantity, budget or timing', () => {
    for (const definition of [prototypeIntake, productionIntake]) {
      const optional = definition.steps
        .flatMap((s) => s.fields)
        .filter((f) => ['quantity', 'budget', 'timing'].includes(f.id))
      for (const field of optional) {
        expect(field.required, `${field.id} is required`).toBeFalsy()
      }
    }
  })
})
