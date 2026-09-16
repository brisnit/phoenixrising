import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { qualityPrinciple } from '@/data/process'

/**
 * Quality as a thread through development, not a gate at the end.
 *
 * Deliberately a principle about how manufacturing works rather than a claim
 * about Phoenix Rising's inspection services — several of those remain
 * unverified. The touchpoints name where quality expectations bear on a
 * decision, not what we do at each one.
 */
export function QualityPrinciple() {
  return (
    <section
      data-tone="light"
      aria-labelledby="quality-heading"
      className="bg-paper py-(--spacing-section)"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-8">{qualityPrinciple.eyebrow}</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="quality-heading"
              lines={qualityPrinciple.lines}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-slate']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text={qualityPrinciple.body}
              className="text-lead max-w-[46ch] text-steel/85"
            />
          </div>
        </div>

        <Reveal
          as="ol"
          stagger={0.06}
          className="mt-16 grid gap-x-8 gap-y-7 border-t rule-light pt-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4"
        >
          {qualityPrinciple.touchpoints.map((point, index) => (
            <li key={point.label}>
              <p className="label-mono text-blue">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-3 font-display text-[1.05rem] font-medium uppercase tracking-[-0.01em]">
                {point.label}
              </p>
              <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-steel/80">
                {point.note}
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
