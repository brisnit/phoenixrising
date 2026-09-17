'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { engagementPath } from '@/data/onboarding'
import { cn } from '@/lib/utils'

const STAGES = engagementPath

/**
 * The five stages, against information assembling itself.
 *
 * The object beside the list is the same nine fragments throughout — they
 * scatter, group, get bounded, organise, and finally align into a path. That
 * is the argument of the page made visually: nothing new arrives, the same
 * information simply stops being in pieces. Clarity before commitment.
 *
 * Held with `position: sticky` and driven by enter triggers — no pin, no
 * scrubbed timeline, nothing that can desynchronise from scroll. The diagram
 * is decorative and `aria-hidden`; the list carries every word.
 */
export function EngagementPath() {
  const [active, setActive] = useState(0)

  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    if (reduced) {
      /* Resolved is the state that makes sense without the sequence. */
      setActive(STAGES.length - 1)
      return
    }
    const rows = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-stage]'))
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
      aria-labelledby="engagement-path-heading"
      className="is-dark bg-ink py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark" className="mb-8">
              The engagement path
            </Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="engagement-path-heading"
              lines={['From a project', 'to an engagement.']}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-cyan']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text="Five stages between telling us about a product and work starting on it. None of them is automated, and none of them happens without both sides agreeing to it."
              className="text-lead max-w-[46ch] text-slate-2"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* Assembling dossier — decorative. */}
          <div aria-hidden="true" className="hidden lg:col-span-4 lg:block">
            <div className="lg:sticky lg:top-[16vh]">
              <Dossier state={active} />
              <p className="label-mono mt-6 text-slate">
                {STAGES[active].index} / {String(STAGES.length).padStart(2, '0')} —{' '}
                {STAGES[active].objectState.label}
              </p>
              <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-slate">
                {STAGES[active].objectState.note}
              </p>
              <p className="mt-5 label-mono text-slate">Illustrative, not a document.</p>
            </div>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {STAGES.map((stage, index) => (
              <li
                key={stage.id}
                id={stage.id}
                data-stage={stage.id}
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
                  <span>{stage.index}</span>
                  {stage.objectState.label}
                </p>

                <h3 className="numeral mt-4 text-[clamp(2rem,5vw,3.75rem)] font-semibold uppercase">
                  {stage.title}
                </h3>
                <p className="mt-4 max-w-[30ch] font-display text-h3 font-medium tracking-[-0.02em] text-slate-2">
                  {stage.headline.join(' ')}
                </p>

                <p className="text-lead mt-6 max-w-[52ch] text-paper">{stage.lead}</p>

                {stage.covers && (
                  <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {stage.covers.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 border-t border-white/12 pt-3 font-mono text-[0.78rem] leading-[1.5] tracking-[0.04em] text-paper"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.45em] block size-1 shrink-0 bg-slate-brand"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {stage.caveat && (
                  <p className="mt-8 max-w-[56ch] border-l-2 border-cyan/50 pl-5 text-[0.95rem] leading-relaxed text-slate-2">
                    {stage.caveat}
                  </p>
                )}

                {stage.cta && (
                  <Link
                    href={stage.cta.href}
                    className="group/cta label-mono mt-8 inline-flex items-center gap-3 border-b border-white/25 pb-2 transition-colors hover:border-cyan hover:text-cyan"
                  >
                    {stage.cta.label}
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

/* Nine fragments, five arrangements. Same pieces every time — they only ever
   change position, which is the whole point. Coordinates are explicit rather
   than generated so server and client cannot disagree. */
const FRAGMENTS: readonly { x: number; y: number; r: number }[][] = [
  /* 01 scattered — information exists, in no order */
  [
    { x: 46, y: 74, r: -18 },
    { x: 152, y: 44, r: 12 },
    { x: 268, y: 92, r: -7 },
    { x: 62, y: 188, r: 22 },
    { x: 178, y: 152, r: -14 },
    { x: 298, y: 198, r: 9 },
    { x: 92, y: 298, r: -11 },
    { x: 208, y: 276, r: 16 },
    { x: 312, y: 316, r: -20 },
  ],
  /* 02 grouped — three clusters: known, assumed, missing */
  [
    { x: 84, y: 96, r: -3 },
    { x: 110, y: 124, r: 2 },
    { x: 94, y: 152, r: -1 },
    { x: 226, y: 96, r: 3 },
    { x: 252, y: 124, r: -2 },
    { x: 236, y: 152, r: 1 },
    { x: 154, y: 256, r: -2 },
    { x: 180, y: 284, r: 2 },
    { x: 164, y: 312, r: -3 },
  ],
  /* 03 bounded — the same clusters, inside an agreed edge */
  [
    { x: 120, y: 128, r: 0 },
    { x: 190, y: 128, r: 0 },
    { x: 260, y: 128, r: 0 },
    { x: 120, y: 186, r: 0 },
    { x: 190, y: 186, r: 0 },
    { x: 260, y: 186, r: 0 },
    { x: 155, y: 244, r: 0 },
    { x: 225, y: 244, r: 0 },
    { x: 190, y: 292, r: 0 },
  ],
  /* 04 organised — an ordered dossier */
  [
    { x: 130, y: 132, r: 0 },
    { x: 196, y: 132, r: 0 },
    { x: 262, y: 132, r: 0 },
    { x: 130, y: 182, r: 0 },
    { x: 196, y: 182, r: 0 },
    { x: 262, y: 182, r: 0 },
    { x: 130, y: 232, r: 0 },
    { x: 196, y: 232, r: 0 },
    { x: 262, y: 232, r: 0 },
  ],
  /* 05 resolved — aligned into the development path */
  [
    { x: 64, y: 200, r: 0 },
    { x: 96, y: 200, r: 0 },
    { x: 128, y: 200, r: 0 },
    { x: 160, y: 200, r: 0 },
    { x: 192, y: 200, r: 0 },
    { x: 224, y: 200, r: 0 },
    { x: 256, y: 200, r: 0 },
    { x: 288, y: 200, r: 0 },
    { x: 320, y: 200, r: 0 },
  ],
]

function Dossier({ state }: { state: number }) {
  const positions = FRAGMENTS[Math.min(state, FRAGMENTS.length - 1)]
  const ease = 'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease'

  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 400 400" className="h-full w-full" role="presentation">
        {/* The agreed edge — appears when the engagement is bounded, and
            dissolves again at `resolved`. It was scaffolding: once the
            project is on the path the box is not the point, and leaving it
            up puts fragments outside their own container. */}
        <rect
          x="92"
          y="100"
          width="216"
          height="216"
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth="1"
          style={{ opacity: state === 2 || state === 3 ? 0.75 : 0, transition: ease }}
        />
        {/* Header rule of an organised dossier. Belongs to that state only. */}
        <line
          x1="92"
          y1="118"
          x2="308"
          y2="118"
          stroke="var(--color-slate)"
          strokeWidth="0.8"
          style={{ opacity: state === 3 ? 1 : 0, transition: ease }}
        />
        {/* The path the resolved project enters. */}
        <g style={{ opacity: state >= 4 ? 1 : 0, transition: ease }}>
          <line x1="48" y1="200" x2="352" y2="200" stroke="var(--color-cyan)" strokeWidth="1" />
          <path d="M344 193 L354 200 L344 207" fill="none" stroke="var(--color-cyan)" strokeWidth="1.2" />
        </g>

        {positions.map((p, i) => (
          <rect
            key={i}
            x={-13}
            y={-9}
            width={26}
            height={18}
            fill="none"
            stroke={state >= 3 ? 'var(--color-cyan)' : 'var(--color-slate)'}
            strokeWidth={state >= 3 ? 1 : 0.8}
            style={{
              transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`,
              transition: ease,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
