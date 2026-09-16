import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { informationFlow, type ExchangeDirection } from '@/data/company'

const DIRECTIONS: readonly ExchangeDirection[] = ['outbound', 'return']

/**
 * The bidirectional exchange, written out.
 *
 * This is the accessible, animation-free statement of what the signature
 * section above illustrates: seven beats, grouped by direction, each one a
 * real list item in a real ordered list. No meaning is carried by position,
 * colour or movement — the direction is a written heading, and the order is
 * the document order.
 *
 * It exists as its own section rather than inside the held frame because the
 * held frame has a viewport to fit into, and these notes are the part of the
 * story that a reader most needs to be able to sit with.
 */
export function InformationFlow() {
  return (
    <section
      data-tone="light"
      aria-labelledby="information-flow-heading"
      className="bg-paper py-(--spacing-section)"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-8">{informationFlow.eyebrow}</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="information-flow-heading"
              lines={informationFlow.lines}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-slate']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text={informationFlow.lead}
              className="text-lead max-w-[46ch] text-steel/85"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-2 lg:gap-16">
          {DIRECTIONS.map((direction) => (
            <div key={direction}>
              <p className="label-mono flex items-center gap-3 text-blue">
                <span aria-hidden="true">{direction === 'outbound' ? '↓' : '↑'}</span>
                {informationFlow.directionLabels[direction]}
              </p>
              <Reveal
                as="ol"
                stagger={0.08}
                className="mt-6 border-t rule-light"
              >
                {informationFlow.exchanges
                  .filter((exchange) => exchange.direction === direction)
                  .map((exchange) => (
                    <li key={exchange.index} className="border-b rule-light py-6">
                      <div className="grid gap-2 sm:grid-cols-12 sm:gap-6">
                        <p className="label-mono text-slate sm:col-span-2">{exchange.index}</p>
                        <div className="sm:col-span-10">
                          <h3 className="font-display text-[1.15rem] font-medium uppercase tracking-[-0.01em]">
                            {exchange.label}
                          </h3>
                          <p className="mt-2 max-w-[44ch] text-[0.95rem] leading-relaxed text-steel/85">
                            {exchange.note}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </Reveal>
            </div>
          ))}
        </div>

        <p className="text-lead mt-14 max-w-[64ch] text-ink">{informationFlow.closing}</p>
      </div>
    </section>
  )
}
