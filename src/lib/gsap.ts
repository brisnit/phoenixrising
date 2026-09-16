'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Single registration point for GSAP plugins.
 *
 * ScrollTrigger is registered once at module scope on the client. Importing
 * `gsap` and `ScrollTrigger` from here (rather than from the package) means a
 * component can never use a plugin that has not been registered.
 */
declare global {
  interface Window {
    __prMotionFailsafe?: ReturnType<typeof setTimeout>
  }
}

if (typeof window !== 'undefined') {
  /* The motion system is live, so the layout's "bundle never arrived"
     failsafe is no longer needed. See the note in app/layout.tsx. */
  if (window.__prMotionFailsafe) {
    clearTimeout(window.__prMotionFailsafe)
    window.__prMotionFailsafe = undefined
  }

  gsap.registerPlugin(ScrollTrigger)

  /* Defaults tuned for the editorial pacing of the site: long, eased, calm.
   *
   * ⚠️ These suit ENTRANCE animations, which play on their own clock. They are
   * wrong for anything driven by `scrub`. `expo.out` applies 82% of its change
   * in the first 25% of a tween, so on a scrubbed crossfade the outgoing
   * element is effectively gone as soon as its window opens — which is how the
   * pinned development timeline ended up rendering blank for a stretch of
   * scroll while both stages sat near 15% opacity.
   *
   * RULE: scrubbed timelines must explicitly declare their easing behaviour
   * and must never implicitly inherit this global default. Declare
   * `defaults: { ease: 'none' }` on the timeline and opt individual tweens
   * into easing deliberately. In a scrubbed timeline the playhead IS the
   * reader's scroll position; extra easing decouples what is on screen from
   * where they have scrolled. See ProcessTimeline and Reality. */
  gsap.defaults({ ease: 'expo.out', duration: 1.1 })

  /* Recalculate trigger positions after fonts land, since display type at
     this scale shifts layout substantially between fallback and webfont. */
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }
}

export { gsap, ScrollTrigger }

/** True when the user has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Shared easing tokens so motion feels like one system across components. */
export const EASE = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  soft: 'power2.out',
} as const

/**
 * Pre- and post-animation states for masked line reveals.
 *
 * `y: 0` looks redundant next to `yPercent` but is load-bearing. The CSS
 * fallback in globals.css offsets these elements with
 * `transform: translate3d(0, 105%, 0)` so that content is never invisible
 * before GSAP initialises. GSAP parses whatever transform it finds on an
 * element into its own cache — so it starts life believing the element has a
 * baseline `y` of one line-height *in pixels*, and then animates `yPercent` on
 * top of that. Zeroing `yPercent` therefore leaves the line permanently
 * displaced by exactly one line-height, which reads as the reveal never
 * having fired at all.
 *
 * Declaring `y` explicitly hands the entire transform to GSAP and clears the
 * inherited baseline. Any new masked reveal must use these, not a bare
 * `yPercent`.
 */
export const LINE_HIDDEN = { yPercent: 105, y: 0 } as const
export const LINE_SHOWN = { yPercent: 0, y: 0 } as const

/** Standard ScrollTrigger start position for content entering the viewport. */
export const ENTER = 'top 82%'

/**
 * Refresh priority for triggers that pin.
 *
 * On refresh, ScrollTrigger recalculates start/end positions in priority order
 * (highest first). Pinning inserts spacer elements and changes the height of
 * the document, so every trigger below — and every reveal *inside* the pinned
 * section — measures against a stale layout unless the pin is resolved first.
 * That is what silently prevented headings inside pinned sections from ever
 * reaching their reveal trigger.
 */
export const PIN_PRIORITY = 1
