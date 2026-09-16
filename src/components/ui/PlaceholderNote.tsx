import { cn } from '@/lib/utils'

/**
 * Marks content that is awaiting real Phoenix Rising information.
 *
 * This is intentionally visible rather than a code comment: placeholder copy
 * that looks finished is how unverified claims end up published. Remove the
 * note at the same time you replace the content in `src/data`.
 */
export function PlaceholderNote({
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
        'label-mono inline-flex items-center gap-2.5 border px-3 py-2',
        tone === 'light' ? 'rule-light text-slate' : 'rule-dark text-slate-2',
        className,
      )}
    >
      <span aria-hidden="true" className="block size-1.5 bg-cyan" />
      {children}
    </p>
  )
}
