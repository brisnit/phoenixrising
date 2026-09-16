import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MediaFrame } from '@/components/media/MediaFrame'
import type { PlateVariant } from '@/components/media/plates'

type Props = {
  eyebrow: string
  lines: readonly string[]
  body?: string
  plate?: PlateVariant
  seed?: number
  /** Small key/value pairs set into the base rule — a drawing title block. */
  meta?: { label: string; value: string }[]
}

/**
 * Inner-page opening.
 *
 * Shorter than the homepage hero — roughly three quarters of a viewport — so
 * that subpages establish themselves without making the reader scroll past a
 * full screen of atmosphere to reach the content they navigated for.
 */
export function PageHero({ eyebrow, lines, body, plate = 'grid', seed = 3, meta }: Props) {
  return (
    <section
      data-tone="dark"
      className="is-dark relative overflow-hidden bg-ink-deep text-paper"
    >
      <div className="absolute inset-0">
        <MediaFrame plate={plate} tone="dark" seed={seed} reveal={false} className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/72 to-ink-deep/85"
      />

      <div className="container-rule relative flex min-h-[74svh] flex-col justify-end pb-12 pt-[124px] sm:pb-16 sm:pt-[160px]">
        <Eyebrow tone="dark" className="mb-8 sm:mb-10">
          {eyebrow}
        </Eyebrow>

        <AnimatedHeadline
          as="h1"
          lines={lines}
          immediate
          delay={0.25}
          className="text-h1 font-semibold uppercase"
        />

        {body && (
          <SplitTextReveal
            text={body}
            delay={0.5}
            className="text-lead mt-9 max-w-[52ch] text-slate-2"
          />
        )}

        {meta && meta.length > 0 && (
          <dl className="mt-12 grid gap-px border-t rule-dark pt-6 sm:grid-cols-3 sm:gap-8">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="label-mono text-slate">{m.label}</dt>
                <dd className="mt-2 text-[0.95rem] text-paper/90">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
