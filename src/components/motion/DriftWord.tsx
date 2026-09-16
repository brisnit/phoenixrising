'use client'

import { useGsap } from '@/lib/hooks/useGsap'
import { cn } from '@/lib/utils'

type Props = {
  text: string
  /** Positive drifts right, negative drifts left. Percentage of own width. */
  drift?: number
  className?: string
}

/**
 * An oversized background word that slides horizontally as the section is
 * scrolled. Purely typographic texture — hidden from assistive technology
 * because the word always duplicates content stated elsewhere in the section.
 */
export function DriftWord({ text, drift = -14, className }: Props) {
  const ref = useGsap<HTMLDivElement>(({ self, gsap, reduced }) => {
    if (reduced) return
    gsap.fromTo(
      self,
      { xPercent: -drift },
      {
        xPercent: drift,
        ease: 'none',
        scrollTrigger: { trigger: self, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    )
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'pointer-events-none select-none whitespace-nowrap font-display font-semibold uppercase leading-none tracking-[-0.045em]',
        className,
      )}
    >
      {text}
    </div>
  )
}
