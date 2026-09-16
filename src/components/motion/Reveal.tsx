'use client'

import type { ElementType, ReactNode } from 'react'
import { createElement } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { ENTER } from '@/lib/gsap'

type Props = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Vertical offset in pixels the element travels. */
  y?: number
  delay?: number
  /** Stagger direct children instead of animating the container as one. */
  stagger?: number
  start?: string
}

/**
 * A restrained fade-and-rise for supporting content — body copy, lists, small
 * blocks. Display type uses AnimatedHeadline instead; this is deliberately
 * quieter so the two do not compete.
 */
export function Reveal({
  children,
  as = 'div',
  className,
  y = 26,
  delay = 0,
  stagger,
  start = ENTER,
}: Props) {
  const ref = useGsap<HTMLDivElement>(({ self, gsap, reduced }) => {
    const targets = stagger ? Array.from(self.children) : [self]
    if (reduced) {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'all' })
      return
    }
    gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        delay,
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: self, start, once: true },
      },
    )
  }, [])

  /* When staggering, the children are the animated targets — not this
     element. They are marked as a group so the browser audit can detect a
     stagger that never fired, the way it already does for single reveals. */
  return createElement(
    as,
    {
      className,
      ref,
      'data-reveal': stagger ? undefined : '',
      'data-reveal-group': stagger ? '' : undefined,
    },
    children,
  )
}
