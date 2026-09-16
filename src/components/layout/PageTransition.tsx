'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Route transition.
 *
 * A single panel wipes down over the viewport and lifts away as the new route
 * mounts, while the incoming content settles up into place. Navigation is not
 * intercepted or delayed — the wipe plays over content that has already
 * rendered, so a route change is never slower than it would otherwise be.
 *
 * It also does the housekeeping every scroll-driven site needs on navigation:
 * reset scroll position, recalculate every ScrollTrigger against the new
 * document height, and — critically — leave no transform behind on the
 * wrapper. See the note on the incoming tween: a lingering identity transform
 * silently breaks `position: fixed`, which is how every pinned section on a
 * navigated-to route ended up rendering blank.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => {
    const panel = panelRef.current
    const content = contentRef.current
    if (!panel || !content) return

    /* Land at the top of the new route before anything measures itself. */
    if (!first.current) window.scrollTo(0, 0)

    if (prefersReducedMotion()) {
      gsap.set(panel, { scaleY: 0 })
      gsap.set(content, { opacity: 1, y: 0 })
      ScrollTrigger.refresh()
      first.current = false
      return
    }

    const tl = gsap.timeline({
      onComplete: () => ScrollTrigger.refresh(),
    })

    if (first.current) {
      /* First load belongs to the hero entrance, not to a wipe. */
      gsap.set(panel, { scaleY: 0 })
      tl.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      first.current = false
    } else {
      tl.set(panel, { transformOrigin: 'bottom', scaleY: 1 })
        .to(panel, { scaleY: 0, duration: 0.75, ease: 'expo.inOut' })
        .fromTo(
          content,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'expo.out',
            /* Load-bearing. GSAP leaves `transform: matrix(1,0,0,1,0,0)` behind
               when a transform tween finishes, and ANY transform — including an
               identity one — makes this element a containing block for
               `position: fixed` descendants. Every pinned section inside then
               resolves its pin against this wrapper instead of the viewport and
               scrolls away, rendering the section blank. `y: 0` is not enough;
               the property has to be removed entirely. */
            onComplete: () => {
              gsap.set(content, { clearProps: 'transform' })
              ScrollTrigger.refresh()
            },
          },
          '-=0.45',
        )
    }

    return () => {
      tl.kill()
    }
  }, [pathname])

  return (
    <>
      <div
        ref={panelRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-95 origin-bottom scale-y-0 bg-ink-deep"
      />
      <div ref={contentRef}>{children}</div>
    </>
  )
}
