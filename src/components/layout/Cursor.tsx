'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * Custom cursor.
 *
 * Deliberately additive: the real cursor is never hidden, so precision,
 * text selection and accessibility tooling are untouched. This renders a
 * trailing ring beside it that expands into a labelled disc over elements
 * declaring `data-cursor="View"`, which is how project imagery signals it
 * is clickable without needing an overlay.
 *
 * Skipped entirely on touch devices and under reduced-motion.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const el = dotRef.current
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.42, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.42, ease: 'power3' })

    /* Hidden until the pointer's real position is known — otherwise the ring
       paints at the origin in the top-left corner on first load. */
    gsap.set(el, { autoAlpha: 0 })
    let seen = false

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      if (!seen) {
        seen = true
        gsap.set(el, { x: e.clientX, y: e.clientY })
        gsap.to(el, { autoAlpha: 1, duration: 0.3 })
      }
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      setLabel(target?.dataset.cursor ?? null)
    }

    const onLeave = () => gsap.to(el, { autoAlpha: 0, duration: 0.25 })
    const onEnter = () => gsap.to(el, { autoAlpha: 1, duration: 0.25 })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      xTo.tween?.kill()
      yTo.tween?.kill()
    }
  }, [enabled])

  useEffect(() => {
    const el = dotRef.current
    if (!enabled || !el) return
    gsap.to(el, {
      width: label ? 84 : 14,
      height: label ? 84 : 14,
      backgroundColor: label ? 'var(--color-cyan)' : 'transparent',
      borderColor: label ? 'var(--color-cyan)' : 'var(--color-cyan)',
      duration: 0.45,
      ease: 'expo.out',
    })
  }, [label, enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      data-label={label ? 'true' : 'false'}
      /* The bare ring blends against whichever band it is over; once it
         becomes a labelled disc it needs normal compositing so the text on
         the cyan fill stays legible. */
      className="pointer-events-none fixed left-0 top-0 z-100 -ml-[7px] -mt-[7px] flex size-[14px] items-center justify-center rounded-full border border-cyan data-[label=false]:mix-blend-difference"
    >
      <span
        data-show={label ? 'true' : 'false'}
        className="label-mono text-[0.6rem] text-ink opacity-0 transition-opacity duration-300 data-[show=true]:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}
