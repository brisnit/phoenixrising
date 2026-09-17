'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { navigation, primaryCta, social, contact, footerGroups, type NavLink } from '@/data/site'
import { Wordmark } from './Wordmark'
import { useAskPhoenix } from '@/components/askPhoenix/GlobalAskPhoenix'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
}

/**
 * Fullscreen navigation.
 *
 * Used below `xl`, not just on phones — see the note in Header on why the
 * horizontal bar does not appear at 1024–1279.
 *
 * Focus is moved into the panel on open and returned to the trigger on close,
 * Escape dismisses, and background scroll is locked while it is up. The panel
 * is removed from the accessibility tree entirely when closed rather than just
 * hidden, so it never appears in the tab order behind the page.
 */
/* Everything reachable from the footer that is not already in the primary
   navigation, de-duplicated and flattened. */
/* `/start` is excluded: it is already the panel's prominent call to action. */
const PRIMARY_HREFS = new Set([...navigation.map((item) => item.href), primaryCta.href])
const secondaryLinks: NavLink[] = footerGroups
  .flatMap((group) => [...group.links])
  .filter((link) => !PRIMARY_HREFS.has(link.href))
  .filter((link, index, all) => all.findIndex((other) => other.href === link.href) === index)

export function MobileMenu({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const askPhoenix = useAskPhoenix()

  /* Animate the panel and its contents. */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const items = panel.querySelectorAll('[data-menu-item]')
    const reduced = prefersReducedMotion()

    if (open) {
      const tl = gsap.timeline()
      if (reduced) {
        gsap.set(panel, { clipPath: 'none', autoAlpha: 1 })
        gsap.set(items, { yPercent: 0, opacity: 1 })
      } else {
        tl.fromTo(
          panel,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' },
        ).fromTo(
          items,
          { yPercent: 108, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05 },
          '-=0.42',
        )
      }
      return () => {
        tl.kill()
      }
    }
  }, [open])

  /* Escape to dismiss, scroll lock, and initial focus. */
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      className={cn(
        'is-dark fixed inset-0 z-90 flex flex-col bg-ink-deep text-paper xl:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none invisible',
      )}
      style={open ? undefined : { clipPath: 'inset(0% 0% 100% 0%)' }}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b rule-dark px-(--spacing-gutter) py-5">
        <Wordmark />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="label-mono -mr-2 p-2 text-slate-2 transition-colors hover:text-cyan"
        >
          Close
        </button>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-(--spacing-gutter) py-10">
        <ul>
          {navigation.map((item) => (
            <li key={item.href} className="border-b rule-dark">
              <span className="line-clip">
                <Link
                  data-menu-item
                  href={item.href}
                  onClick={onClose}
                  className="block py-5 font-display text-[clamp(1.75rem,8vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[-0.04em] transition-colors hover:text-cyan"
                >
                  {item.label}
                </Link>
              </span>
            </li>
          ))}
        </ul>

        {/* Below xl this panel is the only navigation, so it carries the
            routes the header omits rather than leaving them footer-only. */}
        <ul data-menu-item className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {secondaryLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="label-mono text-slate transition-colors hover:text-cyan"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div data-menu-item className="mt-12 grid gap-3">
          <Link
            href={primaryCta.href}
            onClick={onClose}
            className="label-mono flex items-center justify-between border rule-dark px-6 py-5 text-paper transition-colors hover:bg-cyan hover:text-ink"
          >
            {primaryCta.label}
            <span aria-hidden="true">↗</span>
          </Link>

          {/* Closing the menu first matters: both are fullscreen below xl, and
              two stacked overlays would trap focus in the wrong one. */}
          {askPhoenix.available && (
            <button
              type="button"
              onClick={() => {
                onClose()
                askPhoenix.open()
              }}
              aria-haspopup="dialog"
              className="label-mono flex items-center justify-between border border-white/25 px-6 py-5 text-slate-2 transition-colors hover:border-cyan hover:text-cyan"
            >
              Ask Phoenix
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        <div data-menu-item className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="label-mono text-slate">Contact</p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 block text-lead text-paper underline decoration-slate underline-offset-4 transition-colors hover:text-cyan"
            >
              {contact.email}
            </a>
          </div>
          <div>
            <p className="label-mono text-slate">Follow</p>
            <ul className="mt-3 space-y-1.5">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-lead text-slate-2 transition-colors hover:text-cyan"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}
