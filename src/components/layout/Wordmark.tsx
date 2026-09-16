import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * The brand lockup: the phoenix mark alongside the wordmark.
 * The mark is decorative here because the adjacent text already names the
 * company — the link's accessible name comes from the wordmark itself.
 */
export function Wordmark({
  className,
  markClassName,
  href = '/',
  showMark = true,
}: {
  className?: string
  markClassName?: string
  href?: string | null
  showMark?: boolean
}) {
  const inner = (
    <>
      {showMark && (
        <Image
          src="/brand/phoenix-mark.png"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          priority
          className={cn('size-7 shrink-0 object-contain sm:size-8', markClassName)}
        />
      )}
      <span className="font-display text-[0.9rem] font-semibold uppercase leading-none tracking-[0.2em] sm:text-base">
        Phoenix Rizing
      </span>
    </>
  )

  const classes = cn('inline-flex items-center gap-2.5 sm:gap-3', className)

  if (!href) return <span className={classes}>{inner}</span>

  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  )
}
