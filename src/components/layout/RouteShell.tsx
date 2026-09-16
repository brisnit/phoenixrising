import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { CTASection } from '@/components/sections/CTASection'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import type { PlateVariant } from '@/components/media/plates'
import type { Shell } from '@/data/shells'

/**
 * Shared shell for routes whose full experience arrives in a later phase.
 *
 * Built from the existing design system so the site stays coherent for
 * anyone who reaches one of these routes — but it states plainly what is not
 * built yet and routes the visitor to something that does work, rather than
 * presenting a dead end or, worse, a convincing imitation of the missing
 * feature.
 */
export function RouteShell({
  shell,
  plate = 'grid',
  seed = 5,
}: {
  shell: Shell
  plate?: PlateVariant
  seed?: number
}) {
  return (
    <>
      <PageHero
        eyebrow={shell.eyebrow}
        lines={shell.lines}
        body={shell.lead}
        plate={plate}
        seed={seed}
      />

      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal stagger={0.1} className="grid gap-6">
              {shell.body.map((paragraph, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'text-lead text-ink' : 'text-lead text-steel/85'}
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <PlaceholderNote className="mt-10">{shell.notice}</PlaceholderNote>
          </div>

          {/* What a visitor can actually do from here today. */}
          <div className="lg:col-span-4 lg:col-start-9">
            <Eyebrow className="mb-7">In the meantime</Eyebrow>
            <ul className="border-t rule-light">
              {shell.available.map((item) => (
                <li key={item.href} className="border-b rule-light">
                  <Link
                    href={item.href}
                    className="group/act block py-6 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-3"
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="font-display text-h3 font-medium tracking-[-0.02em] transition-colors duration-500 group-hover/act:text-blue">
                        {item.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/act:translate-x-1 group-hover/act:-translate-y-1"
                      >
                        ↗
                      </span>
                    </span>
                    <span className="mt-2 block max-w-[38ch] text-[0.95rem] leading-relaxed text-steel/80">
                      {item.note}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
