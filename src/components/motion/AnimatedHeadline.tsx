'use client'

import { createElement, type ReactNode } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { ENTER, LINE_HIDDEN, LINE_SHOWN } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type Props = {
  lines: readonly string[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  /** Forwarded to the heading element, for aria-labelledby references. */
  id?: string
  className?: string
  /** A string applied to every line, or a function called with the line index. */
  lineClassName?: string | ((index: number) => string | undefined)
  /** Stagger between lines, in seconds. */
  stagger?: number
  /** Delay before the first line moves. */
  delay?: number
  /** Play on mount instead of on scroll — used by the hero entrance. */
  immediate?: boolean
  /** Rendered after the final line, inside the same block. */
  children?: ReactNode
}

/**
 * The site's core typographic reveal: each line sits in its own clipping
 * container and is translated up from below, so the type appears to rise out
 * of the page rather than fade onto it.
 *
 * Accessibility: the lines are real text in a real heading element. The clip
 * container is presentational only, and `prefers-reduced-motion` neutralises
 * the transform in CSS before GSAP ever runs.
 */
export function AnimatedHeadline({
  lines,
  as = 'h2',
  id,
  className,
  lineClassName,
  stagger = 0.09,
  delay = 0,
  immediate = false,
  children,
}: Props) {
  const ref = useGsap<HTMLDivElement>(
    ({ self, gsap, reduced }) => {
      const targets = self.querySelectorAll('[data-reveal-line]')
      if (!targets.length) return

      if (reduced) {
        gsap.set(targets, { ...LINE_SHOWN, clearProps: 'transform' })
        return
      }

      gsap.fromTo(
        targets,
        LINE_HIDDEN,
        {
          ...LINE_SHOWN,
          duration: 1.15,
          ease: 'expo.out',
          stagger,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: self, start: ENTER, once: true } }),
        },
      )
    },
    [lines.join('|'), immediate],
  )

  return createElement(
    as,
    { className, ref, id },
    <>
      {lines.map((line, i) => (
        <span key={i} className="line-clip">
          <span
            data-reveal-line
            className={cn(
              'block',
              typeof lineClassName === 'function' ? lineClassName(i) : lineClassName,
            )}
          >
            {line}
          </span>
        </span>
      ))}
      {children}
    </>,
  )
}
