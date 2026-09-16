import { StatCounter } from '@/components/motion/StatCounter'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { stats, statsIntro } from '@/data/stats'

/**
 * Oversized proof figures.
 *
 * Every value is currently a placeholder, and the component is built to keep
 * that obvious: placeholders render as `XX` and never animate a count. A
 * standing note above the grid says so in the interface rather than only in
 * the source.
 */
export function Stats() {
  const allPlaceholder = stats.every((s) => s.placeholder)

  return (
    <section
      data-tone="light"
      aria-labelledby="stats-heading"
      className="bg-paper pb-(--spacing-section)"
    >
      <div className="container-rule">
        <div className="flex flex-col gap-6 border-t rule-light pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow className="mb-6">{statsIntro.eyebrow}</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="stats-heading"
              lines={[statsIntro.headline]}
              className="text-h2 font-semibold uppercase"
            />
          </div>
          {allPlaceholder && (
            <PlaceholderNote>Awaiting verified figures</PlaceholderNote>
          )}
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCounter key={stat.id} stat={stat} index={i} />
          ))}
        </div>

        <p className="mt-12 max-w-[62ch] text-sm text-slate">{statsIntro.body}</p>
      </div>
    </section>
  )
}
