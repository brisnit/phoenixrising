import Link from 'next/link'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { capabilityFamilies } from '@/data/capabilities'

/**
 * Homepage capability preview.
 *
 * Four families and the state each one brings the product to — nothing more.
 * Round 1 ran the full capability stories here, four immersive sections deep,
 * which made the homepage argue the same case twice and carried the
 * quarantined discipline lists onto the front page.
 *
 * Reads from `data/capabilities`, so the homepage and /capabilities cannot
 * drift into describing different architectures.
 */
export function Capabilities() {
  return (
    <section
      data-tone="light"
      aria-labelledby="capabilities-preview-heading"
      className="bg-paper py-(--spacing-section)"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-8">Capabilities</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="capabilities-preview-heading"
              lines={['What has to happen', 'to a product.']}
              className="text-h1 font-semibold uppercase"
              lineClassName={[undefined, 'text-slate']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text="Four kinds of work, and one product becoming progressively more real as it passes through them."
              className="text-lead max-w-[46ch] text-steel/85"
            />
          </div>
        </div>

        <Reveal
          as="ol"
          stagger={0.09}
          className="mt-14 grid gap-x-8 gap-y-10 border-t rule-light pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {capabilityFamilies.map((family) => (
            <li key={family.id}>
              <p className="label-mono text-blue">{family.index}</p>
              <p className="numeral mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold uppercase">
                {family.title}
              </p>
              <p className="mt-3 max-w-[26ch] font-display text-[1.05rem] font-medium tracking-[-0.01em] text-ink">
                {family.headline.join(' ')}
              </p>
              <p className="mt-2 max-w-[28ch] text-[0.9rem] leading-relaxed text-steel/80">
                {family.objectState.note}
              </p>
            </li>
          ))}
        </Reveal>

        <div className="mt-12">
          <Link
            href="/capabilities"
            className="group/more label-mono inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
          >
            What each one involves
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:translate-x-1 group-hover/more:-translate-y-1"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
