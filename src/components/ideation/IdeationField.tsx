'use client'

import { useId } from 'react'
import type { IdeationField as FieldDef } from '@/data/ideation'
import type { Answer, InformationState } from '@/data/projectContext'
import { cn } from '@/lib/utils'

type Props = {
  field: FieldDef
  answer: Answer | undefined
  onChange: (value: string | string[]) => void
  onState: (state: InformationState | undefined) => void
}

/**
 * One thinking surface.
 *
 * Every field is optional and nothing here can be wrong, so there is no
 * validation and no error state — "I don't know yet" is a real answer that
 * gets recorded in the brief, not a failure to complete something.
 *
 * The label is a real `<label>` (or a `<legend>` for the grouped inputs), the
 * hint is wired through `aria-describedby`, and the state toggles are ordinary
 * buttons with `aria-pressed`. Nothing depends on colour: the pressed state
 * changes the border and the text, and the brief later prints the word.
 */
export function IdeationField({ field, answer, onChange, onState }: Props) {
  const id = useId()
  const hintId = field.hint ? `${id}-hint` : undefined
  const state: InformationState = answer?.state ?? 'known'
  const isUnknown = state === 'unknown'
  const value = answer?.value ?? (field.type === 'multi' ? [] : '')

  const toggleState = (next: InformationState) => onState(state === next ? undefined : next)

  const stateToggles = (
    <div className="mt-3 flex flex-wrap gap-2">
      {field.unknownable && (
        <button
          type="button"
          aria-pressed={isUnknown}
          onClick={() => toggleState('unknown')}
          className={cn(
            'label-mono border px-3 py-1.5 transition-colors',
            isUnknown
              ? 'border-blue bg-blue/10 text-blue'
              : 'border-ink/25 text-slate hover:border-cyan hover:text-blue',
          )}
        >
          I don’t know yet
        </button>
      )}
      {field.assumable && (
        <button
          type="button"
          aria-pressed={state === 'assumed'}
          onClick={() => toggleState('assumed')}
          className={cn(
            'label-mono border px-3 py-1.5 transition-colors',
            state === 'assumed'
              ? 'border-blue bg-blue/10 text-blue'
              : 'border-ink/25 text-slate hover:border-cyan hover:text-blue',
          )}
        >
          This is an assumption
        </button>
      )}
    </div>
  )

  if (field.type === 'multi' || field.type === 'choice') {
    const selected = Array.isArray(value) ? value : []
    return (
      <fieldset className="border-t rule-light pt-6" data-field={field.id}>
        <legend className="font-display text-[1.15rem] font-medium tracking-[-0.01em]">
          {field.label}
        </legend>
        {field.hint && (
          <p id={hintId} className="mt-2 max-w-[56ch] text-[0.95rem] leading-relaxed text-slate">
            {field.hint}
          </p>
        )}
        <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {field.options?.map((option) => {
            const checked = selected.includes(option)
            return (
              <label
                key={option}
                className={cn(
                  'flex cursor-pointer items-start gap-3 border px-4 py-3 text-[0.95rem] transition-colors',
                  checked ? 'border-blue bg-blue/5 text-ink' : 'border-ink/15 text-steel hover:border-cyan',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  aria-describedby={hintId}
                  onChange={() =>
                    onChange(
                      checked ? selected.filter((o) => o !== option) : [...selected, option],
                    )
                  }
                  className="mt-1 size-4 shrink-0 accent-[var(--color-blue)]"
                />
                {option}
              </label>
            )
          })}
        </div>
        {stateToggles}
      </fieldset>
    )
  }

  const isLong = field.type === 'longtext'
  return (
    <div className="border-t rule-light pt-6" data-field={field.id}>
      <label htmlFor={id} className="block font-display text-[1.15rem] font-medium tracking-[-0.01em]">
        {field.label}
      </label>
      {field.hint && (
        <p id={hintId} className="mt-2 max-w-[56ch] text-[0.95rem] leading-relaxed text-slate">
          {field.hint}
        </p>
      )}

      {isLong ? (
        <textarea
          id={id}
          rows={5}
          aria-describedby={hintId}
          disabled={isUnknown}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'mt-4 w-full resize-y border bg-transparent px-4 py-3 text-[1.02rem] leading-relaxed text-ink outline-none transition-colors placeholder:text-slate/70',
            isUnknown
              ? 'cursor-not-allowed border-ink/10 text-slate'
              : 'border-ink/20 focus-visible:border-blue',
          )}
        />
      ) : (
        <input
          id={id}
          type="text"
          aria-describedby={hintId}
          disabled={isUnknown}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'mt-4 w-full border bg-transparent px-4 py-3 text-[1.02rem] text-ink outline-none transition-colors placeholder:text-slate/70',
            isUnknown
              ? 'cursor-not-allowed border-ink/10 text-slate'
              : 'border-ink/20 focus-visible:border-blue',
          )}
        />
      )}

      {stateToggles}

      {isUnknown && (
        <p className="mt-3 text-sm text-slate">
          Recorded as not yet known. It will appear in the brief as an open item.
        </p>
      )}
    </div>
  )
}
