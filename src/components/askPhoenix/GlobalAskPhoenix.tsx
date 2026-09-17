'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AskPhoenixPanel } from './AskPhoenixPanel'
import { askPhoenix as askPhoenixConfig } from '@/data/site'
import { cn } from '@/lib/utils'

/**
 * The global Ask Phoenix surface.
 *
 * ONE MOUNTED INSTANCE, ALWAYS. The panel lives in the root layout, so it
 * survives client-side navigation — which is what lets a conversation started
 * on /capabilities still be there on /how-we-develop — and there is nowhere
 * else for a second global panel to come from.
 *
 * It does NOT render on /ideate. The workspace has its own Ask Phoenix in the
 * third column, in project-aware `develop` mode with its own consent gate, and
 * mounting the global one alongside it would mean two panels, two
 * conversations and two opened events. Phase 9 shipped exactly that bug at
 * 768px; the fix there was to pick one in JS rather than hide one in CSS, and
 * the same rule applies here.
 *
 * UNDERSTAND MODE ONLY. No `project` prop is passed, ever. Opening this panel
 * is not consent to transmit anything — and the server independently discards
 * project context outside `develop` mode, so the guarantee does not depend on
 * this component behaving.
 */

type AskPhoenixContextValue = {
  /** Whether the global surface is available on this route at all. */
  available: boolean
  open: () => void
  close: () => void
  isOpen: boolean
}

const AskPhoenixContext = createContext<AskPhoenixContextValue>({
  available: false,
  open: () => {},
  close: () => {},
  isOpen: false,
})

export const useAskPhoenix = () => useContext(AskPhoenixContext)

/** Routes that provide their own Ask Phoenix surface. */
const OWNS_ITS_OWN_PANEL = ['/ideate']

export function AskPhoenixProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  /* The element focus returns to on close — whichever trigger opened it. */
  const openerRef = useRef<HTMLElement | null>(null)

  const available =
    askPhoenixConfig.enabled && !OWNS_ITS_OWN_PANEL.some((r) => pathname.startsWith(r))

  const open = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null
    setIsOpen(true)
  }, [])

  /* Set when a close has been requested, cleared once focus has been restored. */
  const restoreFocus = useRef(false)

  const close = useCallback(() => {
    restoreFocus.current = true
    setIsOpen(false)
  }, [])

  /**
   * Return focus to whatever opened the panel.
   *
   * Deliberately an effect rather than a line inside `close()`. Calling
   * `.focus()` there runs BEFORE React commits `isOpen: false`, so the focus
   * trap below is still listening — it sees focus leaving the panel and pulls
   * it straight back, and the trigger never gets it. Waiting for the commit
   * means the trap has been torn down by the time focus moves.
   */
  useEffect(() => {
    if (isOpen || !restoreFocus.current) return
    restoreFocus.current = false
    openerRef.current?.focus?.()
  }, [isOpen])

  /* Leaving for a route that owns its own panel closes this one, so the two
     can never be on screen together. */
  useEffect(() => {
    if (!available) setIsOpen(false)
  }, [available, pathname])

  /* Modal semantics: Escape closes, background scroll locks, focus moves in. */
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    document.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    /* Focus the panel itself rather than the composer: a screen reader should
       hear what this is before being dropped into a text field. */
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, close])

  /* Keep focus inside while open. */
  useEffect(() => {
    if (!isOpen) return
    const onFocusIn = (e: FocusEvent) => {
      /* Never fight a close that is already under way. */
      if (restoreFocus.current) return
      const panel = panelRef.current
      if (panel && e.target instanceof Node && !panel.contains(e.target)) {
        panel.focus()
      }
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [isOpen])

  return (
    <AskPhoenixContext.Provider value={{ available, open, close, isOpen }}>
      {children}

      {available && (
        <>
          {/* Backdrop. Dismisses on click; decorative to assistive tech. */}
          <div
            aria-hidden="true"
            onClick={close}
            className={cn(
              'fixed inset-0 z-90 bg-ink-deep/40 backdrop-blur-[2px] transition-opacity duration-500',
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          />

          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Ask Phoenix"
            data-global-ask-phoenix
            /* Kept mounted so the conversation survives closing, reopening and
               navigating. `inert` while closed removes it from the tab order
               and the accessibility tree without unmounting it. */
            inert={!isOpen}
            className={cn(
              'fixed inset-y-0 right-0 z-95 w-full outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:max-w-[min(34rem,92vw)]',
              'border-l rule-light bg-paper shadow-[-24px_0_60px_-30px_rgba(12,24,42,0.45)]',
              isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full',
            )}
          >
            <AskPhoenixPanel
              route={pathname}
              mode="understand"
              onClose={close}
              /* Sources navigate the page behind the panel, so the panel gets
                 out of the way. The conversation is untouched — it is still
                 there when the trigger is used again. */
              onSourceNavigate={close}
              className="h-full"
            />
          </div>
        </>
      )}
    </AskPhoenixContext.Provider>
  )
}

/**
 * The header action.
 *
 * A text action, deliberately: a bubble, orb or sparkle would say something
 * untrue about what this is. It sits beside "Start a project" and is styled
 * one step quieter, because starting a project is the conversion and this is
 * the way to understand the company first.
 */
export function AskPhoenixTrigger({
  className,
  onDark,
  compactLabel = false,
}: {
  className?: string
  onDark?: boolean
  compactLabel?: boolean
}) {
  const { available, open, isOpen } = useAskPhoenix()
  if (!available) return null

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      /* The accessible name is always the full label, even where the visible
         text is shortened for a narrow header. */
      aria-label="Ask Phoenix"
      data-ask-phoenix-trigger
      className={cn(
        'label-mono group/ask relative inline-flex items-center gap-2 border-b px-1 py-3 transition-colors duration-500',
        onDark ? 'border-white/25 hover:border-cyan' : 'border-ink/25 hover:border-cyan',
        'hover:text-blue',
        className,
      )}
    >
      {compactLabel ? (
        <>
          <span className="sm:hidden">Ask</span>
          <span className="hidden sm:inline">Ask Phoenix</span>
        </>
      ) : (
        'Ask Phoenix'
      )}
    </button>
  )
}
