'use client'

import { useRef } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { LINE_HIDDEN, LINE_SHOWN } from '@/lib/gsap'
import type { Stat } from '@/data/stats'

/**
 * Oversized statistic.
 *
 * Placeholder stats (`value: null`) render literal `XX` glyphs and are never
 * animated as a count — a counting animation on a fabricated number would read
 * as a real measurement. Only supplied values count up.
 */
export function StatCounter({ stat, index }: { stat: Stat; index: number }) {
  const numRef = useRef<HTMLSpanElement>(null)

  const ref = useGsap<HTMLDivElement>(({ self, gsap, reduced }) => {
    const line = self.querySelector('[data-reveal-line]')

    if (!reduced && line) {
      gsap.fromTo(
        line,
        LINE_HIDDEN,
        {
          ...LINE_SHOWN,
          duration: 1.2,
          ease: 'expo.out',
          delay: index * 0.07,
          scrollTrigger: { trigger: self, start: 'top 88%', once: true },
        },
      )
    }

    if (stat.value == null || !numRef.current) return

    const target = { n: 0 }
    const el = numRef.current

    if (reduced) {
      el.textContent = String(stat.value)
      return
    }

    gsap.to(target, {
      n: stat.value,
      duration: 2,
      ease: 'power2.out',
      delay: index * 0.07,
      onUpdate: () => {
        el.textContent = Math.round(target.n).toLocaleString()
      },
      scrollTrigger: { trigger: self, start: 'top 88%', once: true },
    })
  }, [])

  return (
    <div ref={ref} className="group border-t rule-light pt-5 sm:pt-7">
      <div className="line-clip">
        <div data-reveal-line className="numeral text-[clamp(3.5rem,9vw,8.5rem)] font-semibold">
          {stat.value == null ? (
            <span className="text-slate/55" title="Awaiting verified figure">
              XX
            </span>
          ) : (
            <span ref={numRef}>0</span>
          )}
          <span className="text-cyan">{stat.suffix}</span>
        </div>
      </div>
      <p className="mt-4 label-mono text-ink">{stat.label}</p>
      {stat.note && <p className="mt-2 max-w-[24ch] text-sm text-slate">{stat.note}</p>}
    </div>
  )
}
