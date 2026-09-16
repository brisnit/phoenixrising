'use client'

import { useGsap } from '@/lib/hooks/useGsap'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { DriftWord } from '@/components/motion/DriftWord'
import { statement } from '@/data/site'

/**
 * The thesis of the site, set as large as the page will carry.
 *
 * Each line reveals on its own trigger rather than as a group, so the two
 * halves of the statement land as two separate assertions — the second only
 * arriving once the first has been read.
 */
export function Statement() {
  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    if (reduced) return
    const lines = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-statement-line]'))

    lines.forEach((line) => {
      gsap.fromTo(
        line,
        { yPercent: 106 },
        {
          yPercent: 0,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: line.parentElement, start: 'top 90%', once: true },
        },
      )
    })
  }, [])

  return (
    <section
      ref={ref}
      data-tone="light"
      aria-labelledby="statement-heading"
      className="relative overflow-hidden bg-paper py-(--spacing-section)"
    >
      {/* Oversized background word, drifting with scroll. */}
      <DriftWord
        text="Engineered to exist"
        drift={-9}
        className="absolute left-0 top-[6%] text-[26vw] text-ink/[0.035]"
      />

      <div className="container-rule relative">
        <Eyebrow className="mb-12 sm:mb-16">{statement.eyebrow}</Eyebrow>

        <h2 id="statement-heading" className="text-h1 font-semibold uppercase">
          {statement.lines.map((line, i) => (
            <span key={i} className="line-clip">
              <span
                data-statement-line
                className={i === 1 ? 'block text-slate lg:pl-[12%]' : 'block'}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className="mt-16 grid gap-8 border-t rule-light pt-10 sm:mt-24 lg:grid-cols-12 lg:gap-8">
          <p className="label-mono text-slate lg:col-span-3">The work</p>
          <Reveal stagger={0.12} className="grid gap-6 lg:col-span-7 lg:col-start-5">
            {statement.body.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'text-lead max-w-[58ch] text-ink'
                    : 'text-lead max-w-[58ch] text-steel/80'
                }
              >
                {para}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
