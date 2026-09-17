import Link from 'next/link'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { compactJourney } from '@/data/stages'

/**
 * The wider relationship, shown once and briefly.
 *
 * Educational, not a promise: the note says explicitly that it is a typical
 * shape rather than a fixed sequence, because where a project joins depends
 * on what already exists — which is the whole premise of the stage selector
 * above it.
 */
export function CompactJourney() {
  return (
    <section data-tone="light" aria-labelledby="journey-heading" className="bg-paper pb-(--spacing-section)">
      <div className="container-rule border-t rule-light pt-12">
        <Eyebrow className="mb-6">{compactJourney.eyebrow}</Eyebrow>
        <h2 id="journey-heading" className="sr-only">
          How a project usually runs
        </h2>

        <ol className="grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-7 lg:gap-x-4">
          {compactJourney.steps.map((item, index) => (
            <li key={item.label} className="relative">
              <span
                aria-hidden="true"
                className="block h-px w-full bg-ink/18"
              />
              <p className="label-mono mt-4 text-blue">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-2 font-display text-[1.05rem] font-medium uppercase tracking-[-0.01em]">
                {item.href ? (
                  /* Underlined, so the affordance is visible rather than
                     discovered by hovering. Only two steps carry one. */
                  <Link
                    href={item.href}
                    className="border-b border-ink/30 pb-0.5 transition-colors hover:border-cyan hover:text-blue"
                  >
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </p>
              <p className="mt-1.5 max-w-[24ch] text-sm leading-relaxed text-steel/75">
                {item.note}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-[64ch] text-sm text-slate">{compactJourney.note}</p>
      </div>
    </section>
  )
}
