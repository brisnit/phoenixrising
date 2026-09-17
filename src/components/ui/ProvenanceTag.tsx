import { PROVENANCE_LABEL, type EvidenceProvenance } from '@/data/projects'
import { cn } from '@/lib/utils'

/**
 * Says where an evidence item came from.
 *
 * ALWAYS TEXT. The distinction between a photograph of real work and a coded
 * illustration is the single most consequential thing on a projects page, so
 * it is never carried by colour, position or a border style alone — a reader
 * who cannot see the accent, or who is listening to the page, gets exactly
 * the same information as everyone else.
 *
 * `illustrative` is styled to read as a caution rather than a credential,
 * because the failure mode is a generated plate quietly passing as proof.
 */
export function ProvenanceTag({
  provenance,
  tone = 'light',
  className,
}: {
  provenance: EvidenceProvenance
  tone?: 'light' | 'dark'
  className?: string
}) {
  const soft = provenance === 'illustrative' || provenance === 'pending'

  return (
    <span
      className={cn(
        'label-mono inline-flex shrink-0 items-center gap-1.5 border px-2 py-1',
        soft
          ? tone === 'light'
            ? 'border-ink/25 text-slate'
            : 'border-white/25 text-slate-2'
          : tone === 'light'
            ? 'border-blue/40 text-blue'
            : 'border-cyan/40 text-cyan',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('block size-1.5', soft ? 'bg-slate' : tone === 'light' ? 'bg-blue' : 'bg-cyan')}
      />
      {PROVENANCE_LABEL[provenance]}
    </span>
  )
}
