'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { spaceBetween } from '@/data/spaceBetween'
import { processBridge } from '@/data/company'
import { cn } from '@/lib/utils'

const LAYERS = spaceBetween.layers

/**
 * The decisions between a design and a finished product.
 *
 * A technical object accumulates layers as the reader moves down the list —
 * a plain outline at the top, progressively enclosed by the decisions that
 * turn it into something manufacturable. Deliberately NOT pinned: the list is
 * ten items long and reads better as a continuous scroll than as a held
 * frame, and it keeps this section clear of the pinning rules entirely.
 *
 * The diagram is decorative; the list beside it carries the content and is
 * complete on its own.
 */
export function SpaceBetween() {
  const [active, setActive] = useState(0)

  const ref = useGsap<HTMLElement>(({ self, gsap, reduced }) => {
    if (reduced) {
      setActive(LAYERS.length - 1)
      return
    }
    const rows = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-layer]'))
    rows.forEach((row, index) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 68%',
          end: 'bottom 38%',
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
      aria-labelledby="space-between-heading"
      className="is-dark bg-ink py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark" className="mb-8">
              {spaceBetween.eyebrow}
            </Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="space-between-heading"
              lines={spaceBetween.lines}
              className="text-h1 font-semibold uppercase"
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text={spaceBetween.body[0]}
              className="text-lead max-w-[46ch] text-slate-2"
            />
            <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-relaxed text-slate">
              {spaceBetween.body[1]}
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* Accumulating technical object — decorative, sticky beside the list. */}
          <div aria-hidden="true" className="hidden lg:col-span-4 lg:block">
            <div className="lg:sticky lg:top-[18vh]">
              <div className="relative aspect-square w-full">
                <svg viewBox="0 0 400 400" className="h-full w-full" role="presentation">
                  {/* The product itself — present from the start. */}
                  <rect
                    x="150"
                    y="150"
                    width="100"
                    height="100"
                    fill="none"
                    stroke="var(--color-cyan)"
                    strokeWidth="1.5"
                  />
                  {LAYERS.map((layer, index) => {
                    const inset = 150 - (index + 1) * 13
                    const size = 100 + (index + 1) * 26
                    const reached = index <= active
                    return (
                      <g
                        key={layer.id}
                        style={{
                          opacity: reached ? 1 : 0.12,
                          transition: 'opacity 700ms cubic-bezier(0.16,1,0.3,1)',
                        }}
                      >
                        <rect
                          x={inset}
                          y={inset}
                          width={size}
                          height={size}
                          fill="none"
                          stroke={index === active ? 'var(--color-cyan)' : 'var(--color-slate)'}
                          strokeWidth={index === active ? 1.4 : 0.7}
                          strokeDasharray={index === active ? undefined : '3 4'}
                        />
                        <circle
                          cx={inset}
                          cy={inset}
                          r={index === active ? 3.5 : 1.8}
                          fill={index === active ? 'var(--color-cyan)' : 'var(--color-slate)'}
                        />
                      </g>
                    )
                  })}
                </svg>
              </div>
              <p className="mt-6 label-mono text-slate">
                {String(active + 1).padStart(2, '0')} / {String(LAYERS.length).padStart(2, '0')} —{' '}
                {LAYERS[active].label}
              </p>
              <p className="mt-2 max-w-[30ch] text-sm text-slate">Illustrative, not a product.</p>
            </div>
          </div>

          {/* The decisions themselves */}
          <ol className="lg:col-span-7 lg:col-start-6">
            {LAYERS.map((layer, index) => (
              <li
                key={layer.id}
                data-layer
                onMouseEnter={() => setActive(index)}
                className={cn(
                  'border-t py-7 transition-colors duration-500',
                  index === active ? 'rule-dark' : 'border-white/10',
                )}
              >
                <p
                  className={cn(
                    'label-mono flex items-center gap-3 transition-colors duration-500',
                    index === active ? 'text-cyan' : 'text-slate',
                  )}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {layer.label}
                </p>
                <p
                  className={cn(
                    'mt-3 max-w-[40ch] font-display text-h3 font-medium tracking-[-0.02em] transition-colors duration-500',
                    index === active ? 'text-paper' : 'text-paper/80',
                  )}
                >
                  {layer.question}
                </p>
                <p className="mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-slate">
                  {layer.note}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* One line out to the company story. The decisions above are the
            same ones that cross between a market and a manufacturing
            environment — which is the About page's subject, not this one's.
            Deliberately a single sentence and a link: process pages that
            start carrying company history stop being process pages. */}
        <div className="mt-16 grid gap-6 border-t rule-dark pt-8 lg:mt-20 lg:grid-cols-12 lg:items-baseline lg:gap-8">
          <p className="max-w-[52ch] text-[0.98rem] leading-relaxed text-slate-2 lg:col-span-7">
            {processBridge.text}
          </p>
          <Link
            href={processBridge.cta.href}
            className="group/more label-mono inline-flex items-center gap-3 self-start border-b border-white/25 pb-2 transition-colors hover:border-cyan hover:text-cyan lg:col-span-4 lg:col-start-9"
          >
            {processBridge.cta.label}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
