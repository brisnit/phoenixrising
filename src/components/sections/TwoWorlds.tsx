'use client'

import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { ScrollTrigger } from '@/lib/gsap'
import { useCanPin } from '@/lib/hooks/useMediaQuery'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { twoWorlds, informationFlow } from '@/data/company'
import { cn } from '@/lib/utils'

const WORLDS = twoWorlds.worlds
const EXCHANGES = informationFlow.exchanges
const OUTBOUND_COUNT = EXCHANGES.filter((e) => e.direction === 'outbound').length
const RETURN_COUNT = EXCHANGES.length - OUTBOUND_COUNT

/* SVG user-space geometry for the exchange channel. The viewBox is stretched
   to the container width, so these are proportions, not pixels. */
const CHANNEL_W = 1000
const PACKET_W = 34

/**
 * CALIFORNIA ↔ GUANGZHOU — the signature section.
 *
 * Three columns: the market side, the product, the manufacturing side. A
 * channel runs beneath them and information travels along it — outward to
 * manufacturing, then back again. The point of the section is that second
 * direction; a diagram with one arrow would state the opposite of the
 * company's position.
 *
 * HELD WITH `position: sticky`, NOT A SCROLLTRIGGER PIN.
 *
 * This is a deliberate departure from ProcessTimeline. Sticky costs nothing
 * per frame, cannot desynchronise from scroll, and — unlike `position: fixed`
 * — is unaffected by a transformed ancestor, which is the exact failure that
 * made pinned sections render blank when navigated into. The scrubbed
 * timeline here drives the travelling packets only: if it never ran at all,
 * every word of this section would still be on screen and in the right order.
 *
 * Everything the section says is in the markup. The channel is decorative and
 * hidden from assistive technology; the active-beat readout is an enhancement
 * shown only when the viewport can hold the composition. The full seven-step
 * exchange, with its notes, is spelled out in the section that follows — so
 * reduced motion, a narrow viewport and a failed bundle all lose the
 * animation and none of the narrative.
 */
export function TwoWorlds() {
  const canPin = useCanPin()
  /** Index of the exchange currently crossing, or null for "no emphasis". */
  const [active, setActive] = useState<number | null>(null)

  const ref = useGsap<HTMLElement>(
    ({ self, gsap, reduced }) => {
      /* No motion, a short viewport or a narrow one: drop the emphasis
         entirely so every beat renders in its resting, fully legible state. */
      if (reduced || !canPin) {
        setActive(null)
        return
      }

      const q = gsap.utils.selector(self)
      const track = self.querySelector<HTMLElement>('[data-exchange-track]')
      if (!track) return

      /* Scrubbed timeline — easing is declared, never inherited. The global
         default is `expo.out`, which would land the packet at the far side of
         the channel within the first quarter of the scroll. See lib/gsap. */
      const tl = gsap.timeline({ defaults: { ease: 'none' } })

      tl.set(q('[data-packet="return"]'), { opacity: 0 }, 0)
        .fromTo(
          q('[data-packet="outbound"]'),
          { x: -PACKET_W },
          { x: CHANNEL_W, duration: OUTBOUND_COUNT },
          0,
        )
        .set(q('[data-packet="outbound"]'), { opacity: 0 }, OUTBOUND_COUNT)
        .set(q('[data-packet="return"]'), { opacity: 1 }, OUTBOUND_COUNT)
        .fromTo(
          q('[data-packet="return"]'),
          { x: CHANNEL_W },
          { x: -PACKET_W, duration: RETURN_COUNT },
          OUTBOUND_COUNT,
        )

      ScrollTrigger.create({
        animation: tl,
        trigger: track,
        /* Exactly the sticky element's own range: it locks when the track
           reaches the top of the viewport and releases when the track's
           bottom does. */
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        /* Read `progress`, not `tl.time()` — the playhead is still easing
           toward the scroll position while a scrub settles. */
        onUpdate: ({ progress }) => {
          const step = Math.floor(progress * EXCHANGES.length)
          setActive(Math.min(EXCHANGES.length - 1, Math.max(0, step)))
        },
      })

      setActive(0)
    },
    [canPin],
  )

  const current = active === null ? null : EXCHANGES[active]
  const axis =
    current === null
      ? 'California ↔ Guangzhou'
      : current.direction === 'outbound'
        ? 'California ⟶ Guangzhou'
        : 'California ⟵ Guangzhou'

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="two-worlds-heading"
      className="is-dark bg-ink py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark" className="mb-8">
              {twoWorlds.eyebrow}
            </Eyebrow>
            <AnimatedHeadline
              as="h2"
              id="two-worlds-heading"
              lines={twoWorlds.lines}
              className="text-h1 font-semibold uppercase"
              /* The arrow carries a line of its own, in the accent, because
                 the relationship is the subject — not either place. */
              lineClassName={[undefined, 'text-cyan', 'lg:pl-[14%]']}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3 lg:self-end">
            <SplitTextReveal
              text={twoWorlds.lead}
              className="text-lead max-w-[46ch] text-slate-2"
            />
          </div>
        </div>
      </div>

      {/* --- The held frame -------------------------------------------- */}
      <div data-exchange-track className="relative mt-16 lg:mt-24 pinnable:h-[260vh]">
        <div
          data-exchange-frame
          /* Test hook: the browser suite asserts that this frame actually
             sticks and that the beat advances through all seven. */
          data-active-exchange={active ?? ''}
          className="pinnable:sticky pinnable:top-0 pinnable:flex pinnable:h-svh pinnable:flex-col pinnable:justify-center pinnable:pt-[88px] pinnable:pb-10"
        >
          <div className="container-rule w-full">
            <ol className="grid gap-10 pinnable:grid-cols-3 pinnable:gap-8">
              {WORLDS.map((world, i) => {
                const centre = i === 1
                /* The world the exchange is passing through right now. Only
                   an emphasis: `null` (no motion, narrow or short viewport)
                   renders every world in its resting state. */
                const live = current !== null && current.at === world.id
                return (
                  <li key={world.id} className="relative">
                    {/* Vertical connector between stacked worlds. Replaced by
                        the horizontal channel once there is room for it. */}
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-7 left-0 font-mono text-sm text-cyan pinnable:hidden"
                      >
                        ↓
                      </span>
                    )}
                    <div
                      data-world={world.id}
                      data-live={live ? '' : undefined}
                      className={cn(
                        'border-t pt-5 transition-colors duration-500',
                        live ? 'border-cyan' : centre ? 'border-cyan/70' : 'border-white/15',
                      )}
                    >
                      <p
                        className={cn(
                          'label-mono transition-colors duration-500',
                          live ? 'text-cyan' : 'text-slate',
                        )}
                      >
                        {world.role}
                      </p>
                      <h3
                        className={cn(
                          'numeral mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold uppercase',
                          centre ? 'text-cyan' : 'text-paper',
                        )}
                      >
                        {world.place}
                      </h3>
                      <p className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-slate">
                        {world.summary}
                      </p>
                      <ul className="mt-5 grid gap-1.5">
                        {world.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 font-mono text-[0.75rem] leading-[1.5] tracking-[0.04em] text-paper"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.5em] block size-1 shrink-0 bg-slate-brand"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )
              })}
            </ol>

            {/* Exchange channel — decorative. The content it illustrates is
                the section below, which is complete without it. */}
            <div aria-hidden="true" className="mt-7 hidden pinnable:block">
              <svg
                viewBox={`0 0 ${CHANNEL_W} 80`}
                preserveAspectRatio="none"
                role="presentation"
                className="h-20 w-full"
              >
                <rect
                  x="0"
                  y="26"
                  width={CHANNEL_W}
                  height="1"
                  fill="var(--color-slate-brand)"
                  opacity="0.3"
                />
                <rect
                  x="0"
                  y="54"
                  width={CHANNEL_W}
                  height="1"
                  fill="var(--color-slate-brand)"
                  opacity="0.3"
                />
                {/* Station marks under the three columns. */}
                {[166, 500, 834].map((x) => (
                  <rect
                    key={x}
                    x={x}
                    y="12"
                    width="1"
                    height="56"
                    fill="var(--color-slate-brand)"
                    opacity="0.55"
                  />
                ))}
                <g data-packet="outbound">
                  <rect x={-PACKET_W * 2.6} y="23" width={PACKET_W * 2.6} height="7" fill="var(--color-cyan)" opacity="0.18" />
                  <rect x="0" y="22" width={PACKET_W} height="9" fill="var(--color-cyan)" />
                </g>
                <g data-packet="return">
                  <rect x={PACKET_W} y="51" width={PACKET_W * 2.6} height="7" fill="var(--color-cyan)" opacity="0.18" />
                  <rect x="0" y="50" width={PACKET_W} height="9" fill="var(--color-cyan)" />
                </g>
              </svg>
            </div>

            {/* Live readout. An enhancement only — it names what the channel
                is doing, and the same seven beats are written out in full,
                in order, in the next section. */}
            <div className="mt-6 hidden items-baseline justify-between gap-6 border-t rule-dark pt-5 pinnable:flex">
              <p className="label-mono text-slate">{axis}</p>
              <p className="label-mono text-cyan">
                {current
                  ? `${current.index} — ${current.label}`
                  : informationFlow.lines.join(' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The two things this section is most likely to be misread as. */}
      <div className="container-rule mt-16 lg:mt-20">
        <dl className="grid gap-8 border-t rule-dark pt-8 lg:grid-cols-2 lg:gap-16">
          {twoWorlds.clarifications.map((note) => (
            <div key={note.id}>
              <dt className="label-mono text-slate">{note.label}</dt>
              <dd className="mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-slate-2">
                {note.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
