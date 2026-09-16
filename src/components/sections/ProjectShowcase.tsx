'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/hooks/useGsap'
import { MediaFrame } from '@/components/media/MediaFrame'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { projects, workIntro } from '@/data/projects'
import { cn } from '@/lib/utils'

/**
 * Editorial project index.
 *
 * DESKTOP — the projects are a list of names at display scale. Hovering a row
 * lifts a single floating panel that follows the pointer and swaps to that
 * project's composition; the row itself indents and the rest of the list
 * recedes, so attention is directed by the type rather than by a card.
 *
 * The floating panel is decorative. Every row is an ordinary link with a real
 * accessible name, so the list works identically by keyboard — focusing a row
 * produces the same indent and de-emphasis without needing a pointer.
 *
 * MOBILE — the same projects become full-width media blocks, since a hover
 * affordance would be meaningless and the imagery should carry the section.
 */
export function ProjectShowcase() {
  const [hovered, setHovered] = useState<number | null>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const ref = useGsap<HTMLElement>(({ self, gsap: g, reduced }) => {
    if (reduced) return
    const rows = g.utils.toArray<HTMLElement>(self.querySelectorAll('[data-project-row]'))
    g.fromTo(
      rows,
      { yPercent: 60, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: self, start: 'top 72%', once: true },
      },
    )
  }, [])

  const onMove = (e: React.MouseEvent) => {
    const el = floatRef.current
    const list = listRef.current
    if (!el || !list || prefersReducedMotion()) return
    const r = list.getBoundingClientRect()
    gsap.to(el, {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      duration: 0.75,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const setActive = (i: number | null) => {
    setHovered(i)
    const el = floatRef.current
    if (!el || prefersReducedMotion()) return
    gsap.to(el, {
      autoAlpha: i === null ? 0 : 1,
      scale: i === null ? 0.94 : 1,
      duration: 0.5,
      ease: 'expo.out',
    })
  }

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="work-heading"
      className="is-dark relative overflow-hidden bg-ink-deep text-paper"
    >
      <div className="container-rule pb-16 pt-(--spacing-section)">
        <SectionIntro
          id="work-heading"
          eyebrow={workIntro.eyebrow}
          lines={workIntro.lines}
          body={workIntro.body}
          tone="dark"
        />
        <PlaceholderNote tone="dark" className="mt-10">
          Placeholder projects — awaiting approved case studies
        </PlaceholderNote>
      </div>

      {/* --------------------------------------------------------- DESKTOP */}
      <div className="relative hidden lg:block">
        <ul
          ref={listRef}
          className="container-rule relative border-t rule-dark"
          onMouseMove={onMove}
          onMouseLeave={() => setActive(null)}
        >
          {projects.map((project, i) => (
            <li key={project.slug} className="border-b rule-dark">
              <div className="line-clip">
                <div data-project-row>
                  <Link
                    href={`/work/${project.slug}`}
                    data-cursor="View"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      'group/row flex items-baseline gap-8 py-8 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                      hovered !== null && hovered !== i ? 'opacity-35' : 'opacity-100',
                      'hover:pl-6 focus-visible:pl-6',
                    )}
                  >
                    <span className="label-mono w-10 shrink-0 text-slate transition-colors duration-500 group-hover/row:text-cyan">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="numeral flex-1 text-[clamp(2.5rem,5.4vw,5.5rem)] font-semibold uppercase">
                      {project.name}
                    </span>
                    <span className="label-mono w-52 shrink-0 text-slate-2">
                      {project.category}
                    </span>
                    <span
                      aria-hidden="true"
                      className="block translate-x-[-8px] text-2xl opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:translate-x-0 group-focus-visible/row:opacity-100"
                    >
                      ↗
                    </span>
                  </Link>
                </div>
              </div>
            </li>
          ))}

          {/* Floating preview */}
          <div
            ref={floatRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 -ml-[13rem] -mt-[9rem] w-[26rem] opacity-0"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {projects.map((project, i) => (
                <div
                  key={project.slug}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-[450ms]',
                    hovered === i ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <MediaFrame
                    plate={project.plate}
                    tone="dark"
                    seed={i * 41 + 3}
                    reveal={false}
                    className="h-full w-full"
                    sizes="26rem"
                  />
                </div>
              ))}
            </div>
          </div>
        </ul>

        <div className="container-rule pb-(--spacing-section) pt-12">
          <Link
            href="/work"
            className="group/all label-mono inline-flex items-center gap-3 border-b border-paper/25 pb-2 transition-colors hover:border-cyan hover:text-cyan"
          >
            View all work
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/all:translate-x-[4px] group-hover/all:-translate-y-[4px]"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------------- MOBILE */}
      <div className="lg:hidden">
        <ul className="container-rule border-t rule-dark">
          {projects.map((project, i) => (
            <li key={project.slug} className="border-b rule-dark py-8">
              <Link href={`/work/${project.slug}`} className="group/card block">
                <MediaFrame
                  plate={project.plate}
                  tone="dark"
                  seed={i * 41 + 3}
                  ratio="aspect-[4/3]"
                  sizes="100vw"
                />
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="numeral text-[clamp(1.75rem,8vw,2.5rem)] font-semibold uppercase">
                    {project.name}
                  </h3>
                  <span aria-hidden="true" className="text-xl text-cyan">
                    ↗
                  </span>
                </div>
                <p className="mt-2 label-mono text-slate">{project.category}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-2">
                  {project.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="container-rule pb-(--spacing-section) pt-10">
          <Link href="/work" className="label-mono inline-flex items-center gap-3 text-cyan">
            View all work <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
