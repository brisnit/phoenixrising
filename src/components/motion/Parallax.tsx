'use client'

import type { ReactNode } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'

type Props = {
  children: ReactNode
  /** Pixels of travel across the full scroll of the element. */
  distance?: number
  className?: string
}

/** Subtle vertical drift for non-media elements — captions, numerals, rules. */
export function Parallax({ children, distance = 60, className }: Props) {
  const ref = useGsap<HTMLDivElement>(({ self, gsap, reduced }) => {
    if (reduced) return
    gsap.fromTo(
      self,
      { y: distance },
      {
        y: -distance,
        ease: 'none',
        scrollTrigger: { trigger: self, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    )
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
