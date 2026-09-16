'use client'

import { useEffect, useState } from 'react'

export type NavTone = 'on-dark' | 'on-light'

/**
 * Keeps the fixed header legible as it passes over alternating cream and
 * near-black bands.
 *
 * Every full-bleed band declares `data-tone="dark" | "light"`. An
 * IntersectionObserver watches a one-pixel horizontal band at the header's own
 * vertical centre; whichever section is crossing that line is the one painted
 * beneath the header, and the header takes its colour from it.
 *
 * This is deliberately not driven by ScrollTrigger. Pinned sections insert
 * spacer elements and change document height on refresh, which makes any
 * scroll-offset arithmetic go stale exactly where the site pins most. An
 * observer reads live layout instead, so it stays correct through pinning,
 * font swaps, route changes and resizes without needing to be told about them.
 */
export function useNavTone(offset = 44): NavTone {
  const [tone, setTone] = useState<NavTone>('on-dark')

  useEffect(() => {
    const bands = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'))
    if (!bands.length) return

    const active = new Set<Element>()

    const resolve = () => {
      /* Bands can overlap during a pin handoff. The one latest in document
         order is the one painted on top. */
      let current: HTMLElement | null = null
      for (const band of bands) if (active.has(band)) current = band
      if (current) setTone(current.dataset.tone === 'light' ? 'on-light' : 'on-dark')
    }

    const build = () => {
      const bottom = Math.max(0, window.innerHeight - offset - 1)
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) active.add(entry.target)
            else active.delete(entry.target)
          }
          resolve()
        },
        { rootMargin: `-${offset}px 0px -${bottom}px 0px`, threshold: 0 },
      )
      bands.forEach((band) => observer.observe(band))
      return observer
    }

    let observer = build()

    /* The sampling band is expressed in pixels, so it has to be rebuilt when
       the viewport height changes. */
    const onResize = () => {
      observer.disconnect()
      active.clear()
      observer = build()
    }
    window.addEventListener('resize', onResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [offset])

  return tone
}
