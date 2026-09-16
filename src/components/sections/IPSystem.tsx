'use client'

import { useState } from 'react'
import { useGsap } from '@/lib/hooks/useGsap'
import { PIN_PRIORITY } from '@/lib/gsap'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { SplitTextReveal } from '@/components/motion/SplitTextReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ipSystem } from '@/data/ipSystem'
import { cn } from '@/lib/utils'

const LAYERS = ipSystem.layers

/**
 * Exploded product system.
 *
 * A stack of plates representing the layers of a manufactured product sits in
 * 3D space. As the section is scrolled the stack separates along its axis and
 * each layer's label becomes current — the diagram and the list are driven by
 * one scrubbed timeline, so what is highlighted in text is always what has
 * just moved.
 *
 * The diagram is decorative and hidden from assistive technology; the ordered
 * list beside it carries the actual content and is complete on its own.
 */
export function IPSystem() {
  const [active, setActive] = useState(0)
  const isDesktop = useIsDesktop()

  const ref = useGsap<HTMLElement>(
    ({ self, gsap, reduced }) => {
      const stack = self.querySelector<HTMLElement>('[data-stack]')
      const plates = gsap.utils.toArray<HTMLElement>(self.querySelectorAll('[data-plate]'))
      if (!stack || !plates.length) return

      /* Reduced motion, or narrow viewports: show the system already
         separated and leave every label active. */
      if (reduced || !isDesktop) {
        plates.forEach((plate, i) => {
          gsap.set(plate, { z: (plates.length - 1 - i) * 54, opacity: 1 })
        })
        setActive(LAYERS.length - 1)
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: self,
          start: 'top top',
          end: `+=${LAYERS.length * 260}`,
          pin: '[data-pin]',
          refreshPriority: PIN_PRIORITY,
          scrub: 0.8,
          onUpdate: ({ progress }) => {
            setActive(Math.min(LAYERS.length - 1, Math.floor(progress * LAYERS.length)))
          },
        },
      })

      tl.to(stack, { rotateZ: -52, duration: LAYERS.length }, 0)

      plates.forEach((plate, i) => {
        tl.fromTo(
          plate,
          { z: 0, opacity: i === plates.length - 1 ? 1 : 0.35 },
          { z: (plates.length - 1 - i) * 62, opacity: 1, duration: 1, ease: 'power2.out' },
          i * 0.72,
        )
      })
    },
    [isDesktop],
  )

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="ip-heading"
      className="is-dark relative bg-ink text-paper"
    >
      {/* Pinned content must fit one viewport — see the note in Reality. */}
      <div data-pin className="lg:flex lg:min-h-screen lg:items-center lg:overflow-hidden">
        <div className="container-rule w-full py-(--spacing-section) lg:py-[clamp(4rem,9vh,7rem)]">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow tone="dark" className="mb-8">
                {ipSystem.eyebrow}
              </Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="ip-heading"
                lines={ipSystem.headline}
                className="text-h1 font-semibold uppercase"
              />
              <SplitTextReveal
                text={ipSystem.body[0]}
                className="text-lead mt-8 max-w-[46ch] text-slate-2"
              />
              <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-relaxed text-slate">
                {ipSystem.body[1]}
              </p>
            </div>

            {/* Exploded stack */}
            <div
              aria-hidden="true"
              className="relative flex min-h-[320px] items-center justify-center lg:col-span-3 lg:min-h-[520px]"
              style={{ perspective: '1400px' }}
            >
              <div
                data-stack
                className="relative size-[190px] sm:size-[230px]"
                style={{ transformStyle: 'preserve-3d', transform: 'rotateX(62deg) rotateZ(-14deg)' }}
              >
                {LAYERS.map((layer, i) => (
                  <div
                    key={layer.id}
                    data-plate
                    className={cn(
                      'absolute inset-0 border transition-colors duration-500',
                      active === i
                        ? 'border-cyan bg-cyan/12'
                        : 'border-slate/40 bg-blue/10',
                    )}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Internal detail so each plate reads as a component layer */}
                    <div className="absolute inset-3 border border-current opacity-20" />
                    <div
                      className={cn(
                        'absolute left-3 top-3 size-1.5',
                        active === i ? 'bg-cyan' : 'bg-slate/60',
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Labels */}
            <ol className="lg:col-span-3 lg:col-start-10 lg:self-center">
              {LAYERS.map((layer, i) => (
                <li
                  key={layer.id}
                  className={cn(
                    'border-t py-4 transition-colors duration-500',
                    active === i ? 'rule-dark' : 'border-white/8',
                  )}
                >
                  <p
                    className={cn(
                      'label-mono flex items-center gap-3 transition-colors duration-500',
                      active === i ? 'text-cyan' : 'text-slate',
                    )}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {layer.label}
                  </p>
                  <p
                    className={cn(
                      'mt-2 max-w-[34ch] text-sm transition-colors duration-500',
                      active === i ? 'text-paper/90' : 'text-slate/70',
                    )}
                  >
                    {layer.note}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
