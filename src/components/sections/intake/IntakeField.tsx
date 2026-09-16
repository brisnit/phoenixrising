'use client'

import { useId } from 'react'
import type { IntakeField as FieldDef } from '@/data/intake'
import { cn } from '@/lib/utils'

/* Underlined rather than boxed — consistent with the rest of the site, and it
   keeps the form free of rounded rectangles. */
const CONTROL =
  'w-full border-0 border-b rule-light bg-transparent py-3.5 text-[1.05rem] text-ink outline-none transition-colors placeholder:text-slate focus:border-cyan'

type Props = {
  field: FieldDef
  value: string | string[] | undefined
  error?: string
  onChange: (value: string | string[]) => void
}

/**
 * One question.
 *
 * Choice groups are real `fieldset`/`legend` with native inputs, not styled
 * divs with click handlers: that gives keyboard operation, grouping and error
 * association for free, and a screen reader announces position within the
 * group without any ARIA bookkeeping. Selection is signalled by a mark and a
 * border as well as colour, so it never depends on colour alone.
 */
export function IntakeField({ field, value, error, onChange }: Props) {
  const uid = useId()
  const id = `${uid}-${field.id}`
  const errorId = error ? `${id}-error` : undefined
  const helpId = field.help ? `${id}-help` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined

  const isChoice = field.type === 'radio' || field.type === 'multi'
  const selected = Array.isArray(value) ? value : value ? [value] : []

  const toggle = (option: string) => {
    if (field.type === 'radio') {
      onChange(option)
      return
    }
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option]
    onChange(next)
  }

  return (
    <div className={cn('min-w-0', field.span === 2 && 'md:col-span-2')}>
      {isChoice ? (
        <fieldset aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
          <legend className="label-mono flex flex-wrap items-center gap-2 text-slate">
            {field.label}
            {field.required && (
              <>
                <span aria-hidden="true" className="text-cyan">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </>
            )}
            {field.type === 'multi' && (
              <span className="normal-case tracking-normal text-slate">— select any</span>
            )}
          </legend>

          {field.help && (
            <p id={helpId} className="mt-2 max-w-[56ch] text-sm text-slate">
              {field.help}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2.5">
            {field.options?.map((option) => {
              const isSelected = selected.includes(option)
              return (
                <label
                  key={option}
                  className={cn(
                    'group/opt relative inline-flex cursor-pointer items-center gap-2.5 border px-4 py-3 text-[0.95rem] transition-colors duration-300',
                    'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan',
                    isSelected
                      ? 'border-blue bg-blue/8 text-ink'
                      : 'rule-light text-steel hover:border-ink/35',
                  )}
                >
                  {/* The native control fills the option rather than being
                      clipped to a screen-reader-only pixel: the whole chip is
                      the hit target, and the element stays genuinely
                      hit-testable for pointer, keyboard and automation alike. */}
                  <input
                    type={field.type === 'radio' ? 'radio' : 'checkbox'}
                    name={field.type === 'radio' ? id : `${id}-${option}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => toggle(option)}
                    className="absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none opacity-0"
                  />
                  {/* A mark, not only a colour. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block size-2 shrink-0 transition-colors duration-300',
                      isSelected ? 'bg-blue' : 'bg-transparent outline outline-1 outline-slate/50',
                    )}
                  />
                  {option}
                </label>
              )
            })}
          </div>

          {error && (
            <p id={errorId} role="alert" className="label-mono mt-3 text-blue">
              {error}
            </p>
          )}
        </fieldset>
      ) : (
        <>
          <label htmlFor={id} className="label-mono flex items-center gap-2 text-slate">
            {field.label}
            {field.required && (
              <>
                <span aria-hidden="true" className="text-cyan">
                  *
                </span>
                <span className="sr-only">(required)</span>
              </>
            )}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={id}
              rows={4}
              value={(value as string) ?? ''}
              placeholder={field.placeholder}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              onChange={(event) => onChange(event.target.value)}
              className={cn(CONTROL, 'resize-y', error && 'border-blue')}
            />
          ) : (
            <input
              id={id}
              type={field.type}
              value={(value as string) ?? ''}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              onChange={(event) => onChange(event.target.value)}
              className={cn(CONTROL, error && 'border-blue')}
            />
          )}

          {field.help && (
            <p id={helpId} className="mt-2 text-sm text-slate">
              {field.help}
            </p>
          )}
          {error && (
            <p id={errorId} role="alert" className="label-mono mt-2 text-blue">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}
