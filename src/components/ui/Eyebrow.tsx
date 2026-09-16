import { cn } from '@/lib/utils'

/**
 * Technical section label — mono, tracked, preceded by a short rule. Used once
 * per section to index it, the way a drawing sheet carries a title block.
 */
export function Eyebrow({
  children,
  className,
  tone = 'light',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <p
      className={cn(
        'label-mono flex items-center gap-3',
        tone === 'light' ? 'text-slate' : 'text-slate-2',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('block h-px w-8 shrink-0', tone === 'light' ? 'bg-slate/45' : 'bg-slate-2/45')}
      />
      {children}
    </p>
  )
}
