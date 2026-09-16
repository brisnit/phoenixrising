'use client'

import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query. Returns `false` on the first render so server
 * and client markup agree, then updates after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Desktop breakpoint used to gate the heavier pinned-scroll choreography. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
