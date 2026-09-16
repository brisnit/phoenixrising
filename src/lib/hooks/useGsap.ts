'use client'

import { useRef, type DependencyList, type RefObject } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type SetupFn = (ctx: {
  self: HTMLElement
  gsap: typeof gsap
  reduced: boolean
}) => void | (() => void)

/**
 * Scopes a GSAP animation to a container element and reverts it on unmount.
 *
 * `gsap.context` handles the hard part of cleanup: every tween, timeline and
 * ScrollTrigger created inside `setup` is tracked and killed together, and any
 * inline styles GSAP wrote are removed. Without this, navigating between
 * routes leaves orphaned ScrollTriggers that fight over scroll position.
 *
 * When reduced motion is active, `setup` still runs — it receives `reduced:
 * true` so it can render end states instantly rather than animating.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: SetupFn,
  deps: DependencyList = [],
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useIsomorphicLayoutEffect(() => {
    const self = ref.current
    if (!self) return

    const reduced = prefersReducedMotion()
    let cleanup: void | (() => void)

    const ctx = gsap.context(() => {
      cleanup = setup({ self, gsap, reduced })
    }, self)

    return () => {
      if (typeof cleanup === 'function') cleanup()
      ctx.revert()
    }
     
  }, deps)

  return ref
}
