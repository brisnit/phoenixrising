import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { distanceStatement } from '@/data/company'

/**
 * The editorial turn.
 *
 * Everything before this section describes an arrangement — two places, three
 * columns, seven exchanges. This one says what the arrangement is actually
 * for, and it is deliberately the quietest section on the page: no diagram,
 * no motion beyond the type arriving, one idea held at size.
 *
 * The point being made is not about shipping or time zones. Naming that
 * explicitly matters, because a page with two cities on it invites exactly
 * the wrong reading.
 */
export function DistanceStatement() {
  return (
    <section
      data-tone="dark"
      aria-labelledby="distance-heading"
      className="is-dark bg-ink-deep py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <Eyebrow tone="dark" className="mb-10">
          {distanceStatement.eyebrow}
        </Eyebrow>

        <AnimatedHeadline
          as="h2"
          id="distance-heading"
          lines={distanceStatement.lines}
          className="text-display font-semibold uppercase"
          lineClassName={[undefined, 'text-slate lg:pl-[10%]']}
        />

        <div className="mt-16 grid gap-10 border-t rule-dark pt-12 sm:mt-24 lg:grid-cols-12 lg:gap-8">
          <p className="font-display text-h3 font-medium tracking-[-0.02em] text-cyan lg:col-span-5">
            {distanceStatement.pullQuote}
          </p>
          <Reveal stagger={0.12} className="grid gap-6 lg:col-span-6 lg:col-start-7">
            {distanceStatement.body.map((para, i) => (
              <p
                key={i}
                className={i === 0 ? 'text-lead text-paper' : 'text-lead text-slate-2'}
              >
                {para}
              </p>
            ))}
          </Reveal>
        </div>

        <p className="numeral mt-16 max-w-[26ch] text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold uppercase sm:mt-20">
          {distanceStatement.closing}
        </p>
      </div>
    </section>
  )
}
