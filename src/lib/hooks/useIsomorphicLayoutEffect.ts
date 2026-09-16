import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 * GSAP setup must run before paint to avoid a flash of un-positioned content,
 * but `useLayoutEffect` warns during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
