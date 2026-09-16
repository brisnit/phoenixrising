'use client'

import Link from 'next/link'
import { useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type Variant = 'solid' | 'invert' | 'outline' | 'ghost'

type Props = {
  href?: string
  children: ReactNode
  variant?: Variant
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
  /** Renders the diagonal arrow. */
  arrow?: boolean
}

/**
 * The site's only button.
 *
 * Deliberately not a rounded pill: a hard-edged rectangle with a hairline
 * border, a fill that wipes up from the bottom edge on hover, and a label that
 * swaps for a duplicate travelling in from below. The arrow moves diagonally,
 * which is the one gesture repeated across every interactive element.
 *
 * On pointer-capable, non-reduced-motion devices the button also drifts
 * slightly toward the cursor. That drift is decorative — the hit area itself
 * never moves, so it cannot cause a miss.
 */
export function MagneticButton({
  href,
  children,
  variant = 'solid',
  className,
  type = 'button',
  onClick,
  disabled,
  arrow = true,
}: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = innerRef.current
    const wrap = wrapRef.current
    if (!el || !wrap || prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const r = wrap.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    gsap.to(el, { x: x * 0.18, y: y * 0.28, duration: 0.6, ease: 'power3.out', overwrite: true })
  }

  const onLeave = () => {
    const el = innerRef.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: true })
  }

  const styles = cn(
    'group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden',
    'px-7 py-4 sm:px-9 sm:py-[1.15rem]',
    'label-mono whitespace-nowrap transition-colors duration-500',
    'disabled:pointer-events-none disabled:opacity-45',
    variant === 'solid' && 'bg-ink text-paper hover:text-ink',
    /* `invert` is `solid` for dark bands: paper plate, ink label. It exists as
       a variant rather than a className override because Tailwind resolves
       competing utilities by stylesheet order, not by the order they are
       written — so `className="bg-paper text-ink"` on a solid button is not
       guaranteed to win, and silently produced a blank white button. */
    variant === 'invert' && 'bg-paper text-ink',
    variant === 'outline' && 'border rule-light text-ink hover:text-paper',
    variant === 'ghost' && 'border rule-dark text-paper hover:text-ink',
    className,
  )

  const content = (
    <>
      {/* Fill wipe — scales up from the bottom edge on hover. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          'group-hover/btn:scale-y-100 group-focus-visible/btn:scale-y-100',
          variant === 'solid' && 'bg-cyan',
          variant === 'invert' && 'bg-cyan',
          variant === 'outline' && 'bg-ink',
          variant === 'ghost' && 'bg-cyan',
        )}
      />
      {/* Label: the visible copy slides out as a duplicate slides in. */}
      <span className="relative grid overflow-hidden">
        <span className="col-start-1 row-start-1 transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-[130%] group-focus-visible/btn:-translate-y-[130%]">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 translate-y-[130%] transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0"
        >
          {children}
        </span>
      </span>
      {arrow && (
        <span
          aria-hidden="true"
          className="relative block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-[3px] group-hover/btn:-translate-y-[3px]"
        >
          ↗
        </span>
      )}
    </>
  )

  return (
    <span
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block"
    >
      <span ref={innerRef} className="inline-block will-change-transform">
        {href ? (
          <Link href={href} className={styles}>
            {content}
          </Link>
        ) : (
          <button type={type} onClick={onClick} disabled={disabled} className={styles}>
            {content}
          </button>
        )}
      </span>
    </span>
  )
}
