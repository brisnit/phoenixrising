'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { capabilityFamilies } from '@/data/capabilities'
import { cn } from '@/lib/utils'

const FAMILIES = capabilityFamilies

/**
 * The four capability families, against one product becoming progressively
 * more real.
 *
 * The object beside the list accumulates: a line, then a dimensioned form,
 * then something with internal structure, then something boxed. It is the
 * argument of the section made visually — that these are four states of one
 * product rather than four services on a menu.
 *
 * NOT PINNED, and no scrubbed timeline. The object is held with `position:
 * sticky` and advanced by ordinary enter triggers, which is all this needs:
 * there is no crossfade to mistime and no fixed positioning to be broken by a
 * transformed ancestor. The diagram is decorative and `aria-hidden`; the list
 * beside it carries every word and is complete on its own.
 */
export function CapabilityProgression() {
  const [active, setActive] = useState(0)

  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    if (reduced) {
      /* Show the finished object rather than freezing at the first state —
         the end state is the one that makes sense without the sequence. */
      setActive(FAMILIES.length - 1)
      return
    }
    const rows = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-family]'))
    rows.forEach((row, index) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 62%',
          end: 'bottom 40%',
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        },
      })
    })
  }, [])

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="capability-families-heading"
      className="is-dark bg-ink py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark" className="mb-8">
              Four families
            </Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="capability-families-heading"
              lines={['Develop. Prototype.', 'Produce. Deliver.']}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-cyan']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text="One product, four states of being real. Each family is a kind of work the product passes through — not a service sold separately from the others."
              className="text-lead max-w-[46ch] text-slate-2"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* Progressive technical object — decorative. */}
          <div aria-hidden="true" className="hidden lg:col-span-4 lg:block">
            <div className="lg:sticky lg:top-[16vh]">
              <ProgressObject state={active} />
              <p className="label-mono mt-6 text-slate">
                {FAMILIES[active].index} / {String(FAMILIES.length).padStart(2, '0')} —{' '}
                {FAMILIES[active].objectState.label}
              </p>
              <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-slate">
                {FAMILIES[active].objectState.note}
              </p>
              <p className="mt-5 label-mono text-slate">Illustrative, not a product.</p>
            </div>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {FAMILIES.map((family, index) => (
              <li
                key={family.id}
                id={family.id}
                data-family={family.id}
                className={cn(
                  'scroll-mt-28 border-t py-12 transition-colors duration-500 first:pt-0 lg:py-16',
                  index === active ? 'rule-dark' : 'border-white/10',
                )}
              >
                <p
                  className={cn(
                    'label-mono flex items-center gap-3 transition-colors duration-500',
                    index === active ? 'text-cyan' : 'text-slate',
                  )}
                >
                  <span>{family.index}</span>
                  {family.objectState.label}
                </p>

                <h3 className="numeral mt-4 text-[clamp(2.25rem,6vw,4.5rem)] font-semibold uppercase">
                  {family.title}
                </h3>
                <p className="mt-4 max-w-[30ch] font-display text-h3 font-medium tracking-[-0.02em] text-slate-2">
                  {family.headline.join(' ')}
                </p>

                <p className="text-lead mt-6 max-w-[52ch] text-paper">{family.lead}</p>

                <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {family.focus.map((item) => (
                    <li key={item.label} className="border-t border-white/12 pt-3">
                      <p className="font-mono text-[0.78rem] uppercase tracking-[0.06em] text-paper">
                        {item.label}
                      </p>
                      <p className="mt-1.5 max-w-[34ch] text-[0.9rem] leading-relaxed text-slate">
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Where the copy stops short deliberately, it says so. */}
                {family.caveat && (
                  <p className="mt-8 max-w-[56ch] border-l-2 border-cyan/50 pl-5 text-[0.95rem] leading-relaxed text-slate-2">
                    {family.caveat}
                  </p>
                )}

                {family.cta && (
                  <Link
                    href={family.cta.href}
                    className="group/cta label-mono mt-8 inline-flex items-center gap-3 border-b border-white/25 pb-2 transition-colors hover:border-cyan hover:text-cyan"
                  >
                    {family.cta.label}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/**
 * One product drawn at four levels of resolution.
 *
 * Each layer is additive: the idea stays underneath the form, the form stays
 * underneath the packaged object. Nothing is randomised, so server and client
 * render identically.
 */
function ProgressObject({ state }: { state: number }) {
  const on = (n: number) => state >= n
  const live = (n: number) => state === n
  const stroke = (n: number) => (live(n) ? 'var(--color-cyan)' : 'var(--color-slate)')

  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 400 400" className="h-full w-full" role="presentation">
        {/* 01 — IDEA: a line and a gesture. No dimensions yet. */}
        <g style={{ opacity: on(0) ? 1 : 0.1, transition: 'opacity 700ms var(--ease-out-expo)' }}>
          <line x1="90" y1="200" x2="310" y2="200" stroke={stroke(0)} strokeWidth={live(0) ? 1.6 : 0.8} />
          <path
            d="M120 200 C150 160, 250 160, 280 200"
            fill="none"
            stroke={stroke(0)}
            strokeWidth={live(0) ? 1.4 : 0.7}
            strokeDasharray="4 5"
          />
        </g>

        {/* 02 — DEFINED FORM: dimensioned, specific enough to disagree with. */}
        <g style={{ opacity: on(1) ? 1 : 0.1, transition: 'opacity 700ms var(--ease-out-expo)' }}>
          <rect
            x="130"
            y="140"
            width="140"
            height="120"
            fill="none"
            stroke={stroke(1)}
            strokeWidth={live(1) ? 1.6 : 0.9}
          />
          {/* Dimension witness lines */}
          <line x1="130" y1="115" x2="270" y2="115" stroke={stroke(1)} strokeWidth="0.6" />
          <line x1="130" y1="108" x2="130" y2="122" stroke={stroke(1)} strokeWidth="0.6" />
          <line x1="270" y1="108" x2="270" y2="122" stroke={stroke(1)} strokeWidth="0.6" />
          <line x1="295" y1="140" x2="295" y2="260" stroke={stroke(1)} strokeWidth="0.6" />
        </g>

        {/* 03 — PRODUCTION OBJECT: internal structure, assembly points. */}
        <g style={{ opacity: on(2) ? 1 : 0.1, transition: 'opacity 700ms var(--ease-out-expo)' }}>
          <line x1="130" y1="180" x2="270" y2="180" stroke={stroke(2)} strokeWidth="0.8" />
          <line x1="185" y1="180" x2="185" y2="260" stroke={stroke(2)} strokeWidth="0.8" />
          <line x1="225" y1="180" x2="225" y2="260" stroke={stroke(2)} strokeWidth="0.8" />
          {[
            [142, 152],
            [258, 152],
            [142, 248],
            [258, 248],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={live(2) ? 3.2 : 2} fill={stroke(2)} />
          ))}
        </g>

        {/* 04 — PACKAGED: protected, labelled, going somewhere. */}
        <g style={{ opacity: on(3) ? 1 : 0.1, transition: 'opacity 700ms var(--ease-out-expo)' }}>
          <rect
            x="92"
            y="102"
            width="216"
            height="196"
            fill="none"
            stroke={stroke(3)}
            strokeWidth={live(3) ? 1.5 : 0.9}
          />
          <line x1="92" y1="132" x2="308" y2="132" stroke={stroke(3)} strokeWidth="0.7" />
          <rect x="104" y="264" width="54" height="22" fill="none" stroke={stroke(3)} strokeWidth="0.7" />
          {[110, 116, 122, 130, 136, 144, 150].map((x) => (
            <line key={x} x1={x} y1="268" x2={x} y2="282" stroke={stroke(3)} strokeWidth="1.1" />
          ))}
        </g>
      </svg>
    </div>
  )
}
