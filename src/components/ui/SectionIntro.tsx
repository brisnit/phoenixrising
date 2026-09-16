import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from './Eyebrow'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  /** Forwarded to the heading so an enclosing aria-labelledby resolves. */
  id?: string
  lines: readonly string[]
  body?: string
  tone?: 'light' | 'dark'
  align?: 'left' | 'split'
  as?: 'h1' | 'h2'
  className?: string
}

/**
 * Standard section opener: label, oversized headline, optional lead paragraph.
 * `align="split"` places the lead in the right column of the page grid, which
 * is the asymmetric composition used for most major sections.
 */
export function SectionIntro({
  eyebrow,
  id,
  lines,
  body,
  tone = 'light',
  align = 'split',
  as = 'h2',
  className,
}: Props) {
  return (
    <div className={cn(align === 'split' && 'grid gap-10 lg:grid-cols-12 lg:gap-12', className)}>
      <div className={cn(align === 'split' && 'lg:col-span-7')}>
        {eyebrow && <Eyebrow tone={tone} className="mb-7 sm:mb-10">{eyebrow}</Eyebrow>}
        <AnimatedHeadline
          as={as}
          id={id}
          lines={lines}
          className={cn(
            'text-h1 font-semibold uppercase',
            tone === 'light' ? 'text-ink' : 'text-paper',
          )}
        />
      </div>
      {body && (
        <div className={cn(align === 'split' && 'lg:col-span-4 lg:col-start-9 lg:pt-3')}>
          <SplitTextReveal
            text={body}
            className={cn(
              'text-lead max-w-[46ch]',
              tone === 'light' ? 'text-steel/85' : 'text-slate-2',
            )}
          />
        </div>
      )}
    </div>
  )
}
