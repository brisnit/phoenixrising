import { cn } from '@/lib/utils'

type Props = {
  steps: { id: string; title: string }[]
  current: number
  /** Index of the review step, rendered as the final marker. */
  reviewLabel: string
}

/**
 * Step progress.
 *
 * A labelled list rather than a bare bar: on desktop every step is named so
 * the visitor can see how much is left and what is coming; on mobile the
 * names collapse to rules with the current one spelled out, which keeps the
 * indicator to a single line above the keyboard.
 */
export function IntakeProgress({ steps, current, reviewLabel }: Props) {
  const all = [...steps.map((s) => s.title), reviewLabel]

  return (
    <nav aria-label="Progress" className="border-b rule-light pb-5">
      <p className="label-mono mb-3 text-slate sm:hidden">
        Step {Math.min(current + 1, all.length)} of {all.length} — {all[current] ?? reviewLabel}
      </p>

      <ol className="flex gap-2">
        {all.map((title, index) => {
          const isDone = index < current
          const isCurrent = index === current
          return (
            <li key={title} className="min-w-0 flex-1">
              <span
                aria-hidden="true"
                className={cn(
                  'block h-px transition-colors duration-500',
                  isDone && 'bg-blue',
                  isCurrent && 'bg-ink',
                  !isDone && !isCurrent && 'bg-ink/18',
                )}
              />
              <span
                className={cn(
                  'label-mono mt-3 hidden truncate transition-colors duration-500 sm:block',
                  isCurrent ? 'text-ink' : isDone ? 'text-slate' : 'text-slate',
                )}
              >
                {title}
              </span>
              {isCurrent && <span className="sr-only">(current step)</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
