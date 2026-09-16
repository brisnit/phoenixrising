import { cn } from '@/lib/utils'

/**
 * Marks a single assertion that has not yet been confirmed by Phoenix Rising.
 *
 * Distinct from PlaceholderNote, which marks missing *content*. This marks
 * present content whose *accuracy* is unconfirmed — a capability inferred
 * during the Round 1 build rather than supplied by the business. It exists so
 * that an unverified claim cannot visually pass as an approved one.
 *
 * Every instance should disappear as verification arrives; none should ship.
 */
export function PendingTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'label-mono ml-2 inline-flex shrink-0 items-center gap-1.5 border border-current/30 px-1.5 py-0.5 align-middle text-[0.5625rem] text-slate',
        className,
      )}
      title="This capability has not yet been confirmed by Phoenix Rising"
    >
      <span aria-hidden="true" className="block size-1 bg-cyan" />
      Unverified
    </span>
  )
}
