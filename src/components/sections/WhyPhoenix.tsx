'use client'

import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { whyPhoenix } from '@/data/site'
import { cn } from '@/lib/utils'

/**
 * Value proposition as horizontal typography.
 *
 * Instead of five cards, five full-measure rows of display type. The row
 * currently crossing the middle of the viewport fills in solid and brings its
 * supporting copy with it; the others sit as outlined type. Scrolling the
 * section therefore reads as one continuous statement resolving itself, and
 * the supporting detail is only ever present for the pillar being read.
 *
 * Outlined type is a fill treatment, not a contrast reduction — the text is
 * always present, and each pillar's body copy is in the document whether or
 * not its row is the active one.
 */
export function WhyPhoenix() {
  const [active, setActive] = useState(0)

  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    const rows = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-pillar]'))
    if (reduced) {
      setActive(0)
      return
    }
    rows.forEach((row, i) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 62%',
          end: 'bottom 42%',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        },
      })
    })
  }, [])

  return (
    <section
      ref={ref}
      data-tone="light"
      aria-labelledby="why-heading"
      className="bg-paper py-(--spacing-section)"
    >
      <div className="container-rule">
        <SectionIntro
          id="why-heading"
          eyebrow={whyPhoenix.eyebrow}
          lines={whyPhoenix.headline}
          body={whyPhoenix.body}
        />

        <ul className="mt-16 border-t rule-light sm:mt-24">
          {whyPhoenix.pillars.map((pillar, i) => {
            const isActive = active === i
            return (
              <li
                key={pillar.id}
                data-pillar
                onMouseEnter={() => setActive(i)}
                className="border-b rule-light py-7 sm:py-9"
              >
                <div className="grid gap-4 lg:grid-cols-12 lg:items-center lg:gap-8">
                  <div className="flex items-baseline gap-5 lg:col-span-7">
                    <span
                      className={cn(
                        'label-mono shrink-0 transition-colors duration-500',
                        isActive ? 'text-cyan' : 'text-slate/60',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className={cn(
                        'numeral text-[clamp(1.75rem,5vw,4.25rem)] font-semibold uppercase transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isActive
                          ? 'translate-x-0 text-ink'
                          : 'text-transparent lg:-translate-x-1 [-webkit-text-stroke:1px_var(--color-slate)]',
                      )}
                    >
                      {pillar.title}
                    </h3>
                  </div>
                  <p
                    className={cn(
                      'max-w-[46ch] text-[0.98rem] leading-relaxed transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:col-span-4 lg:col-start-9',
                      isActive
                        ? 'translate-y-0 text-steel/85 opacity-100'
                        : 'text-slate/70 lg:translate-y-1.5 lg:opacity-45',
                    )}
                  >
                    {pillar.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
