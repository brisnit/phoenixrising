'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { navigation, primaryCta } from '@/data/site'
import { useNavTone } from './useNavTone'
import { Wordmark } from './Wordmark'
import { MobileMenu } from './MobileMenu'
import { cn } from '@/lib/utils'

/**
 * Fixed header.
 *
 * Three behaviours, each tied to something real rather than decoration:
 *  1. It enters with the page rather than being present at first paint, so the
 *     hero typography lands before the interface does.
 *  2. Its colour follows the band of the page currently beneath it, which is
 *     what allows the same header to sit over cream and near-black sections.
 *  3. Past the first viewport it gains a backdrop so it stays readable over
 *     image-heavy content without ever becoming a solid chrome bar.
 *
 * The horizontal navigation appears at `xl` rather than `lg`: the Round 2
 * labels are long enough that 1024–1279 would leave the nav and the primary
 * CTA almost touching. Those widths use the fullscreen menu instead.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const tone = useNavTone()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  /* Entrance — after the hero has begun its own reveal. */
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 })
      return
    }
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: -18 },
      { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.85 },
    )
    return () => {
      tween.kill()
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close the panel whenever the route changes. */
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const onDark = tone === 'on-dark'

  return (
    <>
      <a
        href="#main"
        className="label-mono sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        style={{ opacity: 0 }}
        className={cn(
          'fixed inset-x-0 top-0 z-80 transition-colors duration-500',
          onDark ? 'is-dark text-paper' : 'text-ink',
          scrolled &&
            (onDark
              ? 'bg-ink-deep/72 backdrop-blur-xl'
              : 'bg-paper/78 backdrop-blur-xl'),
        )}
      >
        <div
          className={cn(
            'container-rule flex h-[68px] items-center justify-between gap-6 border-b transition-colors duration-500 sm:h-[84px]',
            scrolled ? (onDark ? 'rule-dark' : 'rule-light') : 'border-transparent',
          )}
        >
          <Wordmark />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-7 2xl:gap-10">
              {navigation.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className="group/nav label-mono relative block py-2"
                    >
                      <span className="relative grid overflow-hidden">
                        <span className="col-start-1 row-start-1 transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:-translate-y-[130%]">
                          {item.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="col-start-1 row-start-1 translate-y-[130%] text-cyan transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:translate-y-0"
                        >
                          {item.label}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-cyan transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                          active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100',
                        )}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={primaryCta.href}
              className={cn(
                'label-mono group/cta relative hidden items-center gap-2.5 overflow-hidden border px-4 py-3 transition-colors duration-500 xl:inline-flex 2xl:px-5',
                onDark ? 'rule-dark hover:text-ink' : 'rule-light hover:text-ink',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-cyan transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:scale-y-100"
              />
              <span className="relative">{primaryCta.label}</span>
              <span
                aria-hidden="true"
                className="relative transition-transform duration-500 group-hover/cta:translate-x-[3px] group-hover/cta:-translate-y-[3px]"
              >
                ↗
              </span>
            </Link>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="label-mono -mr-2 flex items-center gap-2.5 p-2 xl:hidden"
            >
              Menu
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false)
          triggerRef.current?.focus()
        }}
      />
    </>
  )
}
