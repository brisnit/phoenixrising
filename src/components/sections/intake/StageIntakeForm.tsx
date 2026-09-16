'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { IntakeField } from './IntakeField'
import { IntakeProgress } from './IntakeProgress'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { validateStep, hasErrors, type Errors } from '@/lib/intakeValidation'
import { submitProjectIntake } from '@/lib/submitProjectIntake'
import { track } from '@/lib/analytics'
import {
  completionCopy,
  reviewCopy,
  fieldIds,
  type IntakeDefinition,
} from '@/data/intake'
import {
  createProjectContext,
  setAnswer,
  describeAnswer,
  deserialiseProjectContext,
  serialiseProjectContext,
  type ProjectContext,
} from '@/data/projectContext'

const storageKey = (stage: string) => `phoenix-intake:${stage}`

type Phase = 'steps' | 'review' | 'done'

/**
 * The intake, driven entirely by an IntakeDefinition.
 *
 * Answers live in a ProjectContext rather than in per-field state, so the
 * review screen, the submission seam and — later — Phoenix Intelligence all
 * read the same structure. Nothing here knows which stage it is rendering.
 *
 * Session storage keeps answers across a reload while the visitor is still in
 * the flow. It is per-tab and never leaves the browser; the completion copy
 * says exactly that rather than implying we hold anything.
 */
export function StageIntakeForm({ definition }: { definition: IntakeDefinition }) {
  const [context, setContext] = useState<ProjectContext>(() =>
    createProjectContext(definition.stage),
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('steps')
  const [errors, setErrors] = useState<Errors>({})
  const [delivered, setDelivered] = useState<boolean | null>(null)
  const [invalidToken, setInvalidToken] = useState(0)
  /* Set when a step is opened from the review screen: correcting one answer
     should return you to the summary, not walk you through every remaining
     step again. */
  const [returnToReview, setReturnToReview] = useState(false)

  const headingRef = useRef<HTMLDivElement>(null)
  const announceRef = useRef<HTMLParagraphElement>(null)
  const started = useRef(false)

  const steps = definition.steps
  const step = steps[stepIndex]

  /* Focus the first field that failed validation. */
  useEffect(() => {
    if (invalidToken === 0) return
    const target = document.querySelector<HTMLElement>(
      '[aria-invalid="true"]:is(input, textarea), fieldset[aria-invalid="true"] input',
    )
    target?.focus()
  }, [invalidToken])

  /* Restore anything from this tab, then announce the intake as started. */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(definition.stage))
      if (raw) setContext(deserialiseProjectContext(JSON.parse(raw)))
    } catch {
      /* Private mode, blocked storage — the form works without it. */
    }
    if (!started.current) {
      started.current = true
      track({
        name: definition.stage === 'prototype' ? 'PROTOTYPE_INTAKE_STARTED' : 'PRODUCTION_INTAKE_STARTED',
      })
    }
  }, [definition.stage])

  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey(definition.stage),
        JSON.stringify(serialiseProjectContext(context)),
      )
    } catch {
      /* Not being able to persist is not a reason to fail. */
    }
  }, [context, definition.stage])

  /* Move focus to the new step heading so keyboard and screen-reader users are
     taken to the content rather than left at the bottom of the previous step.
     
     Driven by an effect on the step/phase rather than deferred from the click
     handler: a rAF callback can land after the visitor has already started
     typing into the next step and pull focus out from under them. */
  const [focusToken, setFocusToken] = useState(0)
  const focusHeading = useCallback(() => setFocusToken((n) => n + 1), [])

  useEffect(() => {
    if (focusToken === 0) return
    headingRef.current?.focus()
  }, [focusToken])

  const update = (id: string, value: string | string[]) => {
    setContext((current) => setAnswer(current, id, value))
    setErrors((current) => {
      if (!(id in current)) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const goNext = () => {
    const found = validateStep(step, context)
    setErrors(found)
    if (hasErrors(found)) {
      /* Send focus to the first problem rather than leaving it to be hunted. */
      setInvalidToken((n) => n + 1)
      return
    }

    if (returnToReview) {
      setReturnToReview(false)
      setPhase('review')
    } else if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      setPhase('review')
    }
    focusHeading()
  }

  const goBack = () => {
    if (returnToReview) {
      setReturnToReview(false)
      setPhase('review')
    } else if (phase === 'review') {
      setPhase('steps')
      setStepIndex(steps.length - 1)
    } else if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
    focusHeading()
  }

  const editStep = (index: number) => {
    track({ name: 'INTAKE_REVIEW_EDITED', step: steps[index].id })
    setReturnToReview(true)
    setPhase('steps')
    setStepIndex(index)
    focusHeading()
  }

  const finish = async () => {
    const ids = fieldIds(definition)
    track({
      name:
        definition.stage === 'prototype'
          ? 'PROTOTYPE_INTAKE_COMPLETED'
          : 'PRODUCTION_INTAKE_COMPLETED',
      answered: Object.keys(context.answers).length,
      total: ids.length,
    })
    const result = await submitProjectIntake(context)
    setDelivered(result.ok ? result.delivered : false)
    setPhase('done')
    focusHeading()
  }

  /* ------------------------------------------------------------- COMPLETE */
  if (phase === 'done') {
    return (
      <div className="container-rule py-(--spacing-section)">
        <div
          ref={headingRef}
          tabIndex={-1}
          role="status"
          className="max-w-[60ch] outline-none"
        >
          <Eyebrow className="mb-8">{completionCopy.eyebrow}</Eyebrow>
          <AnimatedHeadline
            as="h2"
            lines={completionCopy.lines}
            immediate
            className="text-h1 font-semibold uppercase"
          />
          <p className="text-lead mt-8 text-steel/85">{completionCopy.body}</p>
          {delivered === false && (
            <PlaceholderNote className="mt-8">
              Awaiting email / CRM integration
            </PlaceholderNote>
          )}
          <p className="mt-5 text-sm text-slate">{completionCopy.note}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              href={completionCopy.primary.href}
              variant="solid"
              onClick={() => track({ name: 'MANUAL_CONTACT_SELECTED', from: definition.stage })}
            >
              {completionCopy.primary.label}
            </MagneticButton>
            <button
              type="button"
              onClick={() => {
                setPhase('review')
                focusHeading()
              }}
              className="label-mono border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
            >
              {completionCopy.secondary}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* --------------------------------------------------------------- REVIEW */
  if (phase === 'review') {
    return (
      <div className="container-rule py-(--spacing-section)">
        <div ref={headingRef} tabIndex={-1} className="outline-none">
          <Eyebrow className="mb-8">{reviewCopy.eyebrow}</Eyebrow>
          <AnimatedHeadline
            as="h2"
            lines={reviewCopy.lines}
            immediate
            className="text-h1 font-semibold uppercase"
          />
          <p className="text-lead mt-7 max-w-[48ch] text-steel/85">{reviewCopy.body}</p>
        </div>

        <div className="mt-14 border-t rule-light">
          {steps.map((reviewStep, index) => (
            <section key={reviewStep.id} className="border-b rule-light py-8">
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="font-display text-h3 font-medium uppercase tracking-[-0.02em]">
                  {reviewStep.title}
                </h3>
                <button
                  type="button"
                  onClick={() => editStep(index)}
                  className="label-mono shrink-0 border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
                >
                  Edit<span className="sr-only"> {reviewStep.title}</span>
                </button>
              </div>

              <dl className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
                {reviewStep.fields.map((field) => (
                  <div key={field.id} className={field.span === 2 ? 'md:col-span-2' : undefined}>
                    <dt className="label-mono text-slate">{field.label}</dt>
                    <dd
                      className={cnValue(context.answers[field.id] === undefined)}
                    >
                      {describeAnswer(context, field.id)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton type="button" variant="solid" onClick={finish}>
            That looks right
          </MagneticButton>
          <button
            type="button"
            onClick={goBack}
            className="label-mono border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- STEPS */
  return (
    <div className="container-rule py-(--spacing-section)">
      <IntakeProgress steps={steps} current={stepIndex} reviewLabel={reviewCopy.eyebrow} />

      <p ref={announceRef} aria-live="polite" className="sr-only">
        Step {stepIndex + 1} of {steps.length + 1}: {step.title}
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div ref={headingRef} tabIndex={-1} className="outline-none lg:sticky lg:top-32">
            <p className="label-mono text-blue">
              {String(stepIndex + 1).padStart(2, '0')} / {String(steps.length + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-4 numeral text-[clamp(1.75rem,4vw,3rem)] font-semibold uppercase">
              {step.title}
            </h2>
            {step.lead && (
              <p className="mt-4 max-w-[32ch] text-[1.02rem] leading-relaxed text-steel/80">
                {step.lead}
              </p>
            )}
          </div>
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            goNext()
          }}
          className="lg:col-span-7 lg:col-start-6"
        >
          <div className="grid gap-x-8 gap-y-9 md:grid-cols-2">
            {step.fields.map((field) => (
              <IntakeField
                key={field.id}
                field={field}
                value={context.answers[field.id]?.value}
                error={errors[field.id]}
                onChange={(value) => update(field.id, value)}
              />
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t rule-light pt-8">
            <MagneticButton type="submit" variant="solid">
              {returnToReview || stepIndex === steps.length - 1 ? 'Review' : 'Continue'}
            </MagneticButton>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="label-mono border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
              >
                Back
              </button>
            )}
            <Link
              href="/contact"
              onClick={() => track({ name: 'MANUAL_CONTACT_SELECTED', from: definition.stage })}
              className="label-mono ml-auto text-slate underline decoration-slate/40 underline-offset-4 transition-colors hover:text-blue"
            >
              Rather just email us?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

/* Unanswered questions read differently from answered ones — "Not provided"
   must not look like a value the visitor supplied. */
function cnValue(isEmpty: boolean) {
  return isEmpty
    ? 'mt-2 text-[1.02rem] text-slate italic'
    : 'mt-2 text-[1.02rem] text-ink'
}
