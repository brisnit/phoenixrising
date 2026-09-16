import Link from 'next/link'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { processPreview } from '@/data/process'

/**
 * Compressed development story for the homepage.
 *
 * Four beats rather than the full five stages: the homepage needs to convey
 * that there is one continuous path, not reproduce the page that explains it.
 * The labels compress the same sequence, so the two never describe different
 * models — both read from data/process.
 */
export function ProcessPreview() {
  return (
    <section
      data-tone="light"
      aria-labelledby="process-preview-heading"
      className="bg-paper pb-(--spacing-section)"
    >
      <div className="container-rule border-t rule-light pt-(--spacing-section)">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-8">{processPreview.eyebrow}</Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="process-preview-heading"
              lines={processPreview.lines}
              className="text-h1 font-semibold uppercase"
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <SplitTextReveal
              text={processPreview.body}
              className="text-lead max-w-[46ch] text-steel/85"
            />
          </div>
        </div>

        <Reveal
          as="ol"
          stagger={0.09}
          className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {processPreview.beats.map((beat, index) => (
            <li key={beat.label}>
              <span aria-hidden="true" className="block h-px w-full bg-ink/18" />
              <p className="label-mono mt-4 text-blue">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-3 numeral text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold uppercase">
                {beat.label}
              </p>
              <p className="mt-2 max-w-[26ch] text-[0.95rem] leading-relaxed text-steel/80">
                {beat.note}
              </p>
            </li>
          ))}
        </Reveal>

        <div className="mt-12">
          <Link
            href={processPreview.cta.href}
            className="group/more label-mono inline-flex items-center gap-3 border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
          >
            {processPreview.cta.label}
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
