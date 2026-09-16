import { describe, it, expect } from 'vitest'
import { stages, stageById, compactJourney } from '@/data/stages'
import { intakeByStage, prototypeIntake, productionIntake, fieldIds } from '@/data/intake'

describe('stage routing', () => {
  it('offers exactly the three approved stages in order', () => {
    expect(stages.map((s) => s.id)).toEqual(['idea', 'prototype', 'production'])
  })

  it('routes the idea stage to the ideation workspace, not an intake form', () => {
    expect(stageById('idea')!.href).toBe('/ideate')
  })

  it('gives prototype and production their own separate intakes', () => {
    expect(stageById('prototype')!.href).toBe('/start/prototype')
    expect(stageById('production')!.href).toBe('/start/production')
  })

  /* The non-negotiable rule: a production-ready visitor must never be routed
     through ideation, directly or by any intermediate hop. */
  it('never sends the production journey through /ideate', () => {
    const production = stageById('production')!
    expect(production.href).not.toContain('ideate')
    expect(JSON.stringify(productionIntake)).not.toContain('/ideate')
  })

  it('states the outcome of each choice before it is made', () => {
    for (const stage of stages) {
      expect(stage.outcome.length, `${stage.id} has no stated outcome`).toBeGreaterThan(10)
    }
  })

  it('presents the journey as typical rather than mandatory', () => {
    expect(compactJourney.note).toMatch(/not a fixed sequence/i)
  })
})

describe('intake definitions by stage', () => {
  it('exposes one definition per non-idea stage', () => {
    expect(Object.keys(intakeByStage).sort()).toEqual(['production', 'prototype'])
  })

  it('does not ask prototype visitors idea-definition questions', () => {
    const labels = prototypeIntake.steps
      .flatMap((s) => s.fields.map((f) => f.label.toLowerCase()))
      .join(' | ')
    /* Idea-stage framing: asking someone with CAD to describe "the problem you
       want to solve" treats them as earlier-stage than they are. */
    expect(labels).not.toMatch(/what problem.*solve/)
    expect(labels).not.toMatch(/rough idea/)
  })

  it('asks production visitors about manufacturing, not about defining a concept', () => {
    const ids = fieldIds(productionIntake)
    expect(ids).toContain('productionStatus')
    expect(ids).toContain('productionInfo')
    /* No "who is it for" discovery question — that is prototype-stage framing. */
    expect(ids).not.toContain('customer')
  })

  it('shares the About You step between both journeys', () => {
    const a = prototypeIntake.steps[0]
    const b = productionIntake.steps[0]
    expect(a.id).toBe('about-you')
    expect(b.id).toBe('about-you')
    expect(a.fields.map((f) => f.id)).toEqual(b.fields.map((f) => f.id))
  })

  it('groups each journey into four steps before review', () => {
    expect(prototypeIntake.steps).toHaveLength(4)
    expect(productionIntake.steps).toHaveLength(4)
  })

  it('offers "Not sure" wherever a choice is demanded', () => {
    for (const definition of [prototypeIntake, productionIntake]) {
      const choiceFields = definition.steps
        .flatMap((s) => s.fields)
        .filter((f) => f.type === 'radio' || f.type === 'multi')
      for (const field of choiceFields) {
        const joined = (field.options ?? []).join(' | ').toLowerCase()
        expect(joined, `${field.id} forces a definite answer`).toMatch(/not sure/)
      }
    }
  })

  it('keeps required fields to the minimum a conversation needs', () => {
    for (const definition of [prototypeIntake, productionIntake]) {
      const required = definition.steps.flatMap((s) => s.fields.filter((f) => f.required))
      expect(required.length).toBeLessThanOrEqual(4)
    }
  })
})

describe('claim integrity in intake wording', () => {
  it('does not present quantity as a Phoenix Rising minimum', () => {
    for (const definition of [prototypeIntake, productionIntake]) {
      const quantity = definition.steps.flatMap((s) => s.fields).find((f) => f.id === 'quantity')!
      /* Free text, not a range list — a list of ranges would imply an MOQ, and
         no Phoenix Rising minimum has been supplied. */
      expect(quantity.type).toBe('text')
      expect(quantity.options).toBeUndefined()
    }
  })

  it('frames needs as the visitor\'s questions, not as agreed services', () => {
    for (const definition of [prototypeIntake, productionIntake]) {
      const needs = definition.steps.flatMap((s) => s.fields).find((f) => f.id === 'needs')!
      expect(needs.help, `${definition.stage} needs field promises scope`).toMatch(
        /confirmed after|after we have reviewed/i,
      )
    }
  })

  it('introduces no capability, capacity, certification or lead-time claims', () => {
    const text = JSON.stringify([prototypeIntake, productionIntake]).toLowerCase()
    for (const forbidden of [
      'we can manufacture',
      'we guarantee',
      'iso ',
      'certified',
      'minimum order',
      'moq',
      'lead time of',
      'our factories',
      'our capacity',
    ]) {
      expect(text, `intake copy contains "${forbidden}"`).not.toContain(forbidden)
    }
  })
})
