'use client'

import { useRef, useState } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { formFields, formCta, formConfidence, type Field } from '@/data/contactForm'
import { submitEnquiry } from '@/lib/submitEnquiry'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'pending' | 'sent' | 'error'

/* Inputs are underlined rather than boxed — closer to a form on a drawing
   sheet than a web control, and it keeps the page free of rounded rectangles. */
const CONTROL =
  'w-full border-0 border-b rule-light bg-transparent py-3.5 text-[1.05rem] text-ink outline-none transition-colors placeholder:text-slate/60 focus:border-cyan'

function Control({ field }: { field: Field }) {
  const id = `field-${field.name}`
  const describedBy = field.help ? `${id}-help` : undefined

  return (
    <div className={cn(field.span === 2 && 'md:col-span-2')}>
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
          name={field.name}
          rows={5}
          required={field.required}
          placeholder={field.placeholder}
          aria-describedby={describedBy}
          className={cn(CONTROL, 'resize-y')}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          name={field.name}
          required={field.required}
          defaultValue=""
          aria-describedby={describedBy}
          className={cn(CONTROL, 'appearance-none')}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'file' ? (
        <input
          id={id}
          name={field.name}
          type="file"
          multiple
          accept=".pdf,.step,.stp,.stl,.iges,.igs,.zip,.png,.jpg,.jpeg"
          aria-describedby={describedBy}
          className={cn(
            CONTROL,
            'cursor-pointer text-slate file:mr-4 file:cursor-pointer file:border file:border-solid file:border-ink/20 file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-[0.6875rem] file:uppercase file:tracking-[0.22em] file:text-ink hover:file:bg-ink hover:file:text-paper',
          )}
        />
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type}
          required={field.required}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          aria-describedby={describedBy}
          className={CONTROL}
        />
      )}

      {field.help && (
        <p id={`${id}-help`} className="mt-2 text-sm text-slate">
          {field.help}
        </p>
      )}
    </div>
  )
}

/**
 * Project qualification form.
 *
 * Front-end only by design — `submitEnquiry` is the single seam where an API
 * route, transactional email or CRM gets wired in without touching this
 * component. Validation is left to the browser's constraint API rather than
 * reimplemented, so required-field and email messages arrive in the user's own
 * language and their own assistive technology announces them.
 *
 * The result is announced through a live region and focus moves to it on
 * success, so a keyboard or screen-reader user is told the form was sent
 * rather than left wondering.
 */
export function ProjectIntakeForm() {
  const [status, setStatus] = useState<Status>('idle')
  const resultRef = useRef<HTMLDivElement>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus('pending')

    const result = await submitEnquiry(new FormData(form))

    if (result.ok) {
      setStatus('sent')
      form.reset()
      requestAnimationFrame(() => resultRef.current?.focus())
    } else {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="border-t rule-light py-16 outline-none"
      >
        <Eyebrow className="mb-8">Received</Eyebrow>
        <p className="text-h2 font-semibold uppercase">Thank you — we have it.</p>
        <p className="text-lead mt-6 max-w-[48ch] text-steel/80">
          We read every enquiry ourselves. Expect a reply from a person who has looked at what
          you sent, not an autoresponder.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="label-mono mt-10 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
        >
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="border-t rule-light pt-12">
      <div className="grid gap-x-8 gap-y-9 md:grid-cols-2">
        {formFields.map((field) => (
          <Control key={field.name} field={field} />
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-8 border-t rule-light pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[46ch] text-sm text-slate">{formConfidence}</p>
        <MagneticButton type="submit" variant="solid" disabled={status === 'pending'}>
          {status === 'pending' ? 'Sending…' : formCta}
        </MagneticButton>
      </div>

      <div aria-live="polite" className="mt-6">
        {status === 'error' && (
          <p className="label-mono text-blue">
            Something went wrong. Please try again, or email us directly.
          </p>
        )}
      </div>
    </form>
  )
}
