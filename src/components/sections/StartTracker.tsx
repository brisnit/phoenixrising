'use client'

import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'

/** Records that the stage selector was reached. Renders nothing. */
export function StartTracker() {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    track({ name: 'START_PROJECT_OPENED' })
  }, [])
  return null
}
