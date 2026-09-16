'use client'

import Image from 'next/image'
import { useGsap } from '@/lib/hooks/useGsap'
import { Plate, type PlateTone, type PlateVariant } from './plates'
import { cn } from '@/lib/utils'

type Props = {
  /** Coded composition used until real photography is supplied. */
  plate: PlateVariant
  tone?: PlateTone
  seed?: number
  /** Supply a real image path to replace the plate. Nothing else changes. */
  image?: string
  /** Required whenever `image` is set — plates are decorative. */
  alt?: string
  className?: string
  /** Aspect ratio utility, e.g. 'aspect-[4/5]'. Omit when the parent sizes it. */
  ratio?: string
  /** Reveal the frame by wiping a clip-path open rather than fading. */
  reveal?: boolean
  /** Slow scale as the frame crosses the viewport. */
  scale?: boolean
  /** Vertical drift of the inner media within its crop. */
  parallax?: number
  priority?: boolean
  sizes?: string
  children?: React.ReactNode
}

/**
 * The single media slot used everywhere on the site.
 *
 * Media always lives inside a crop that is smaller than the media itself, so
 * parallax and scale have room to move without exposing an edge. The reveal is
 * a clip-path wipe rather than an opacity fade — closer to a shutter opening,
 * and it keeps the composition's edges crisp while it animates.
 */
export function MediaFrame({
  plate,
  tone = 'dark',
  seed = 7,
  image,
  alt,
  className,
  ratio,
  reveal = true,
  scale = false,
  parallax = 0,
  priority = false,
  sizes = '100vw',
  children,
}: Props) {
  const ref = useGsap<HTMLDivElement>(({ self, gsap, reduced }) => {
    const inner = self.querySelector<HTMLElement>('[data-media-inner]')

    if (reduced) {
      gsap.set(self, { clipPath: 'none' })
      if (inner) gsap.set(inner, { clearProps: 'all' })
      return
    }

    if (reveal) {
      gsap.fromTo(
        self,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: self, start: 'top 88%', once: true },
        },
      )
    }

    if (!inner) return

    if (scale) {
      gsap.fromTo(
        inner,
        { scale: 1.18 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: self, start: 'top bottom', end: 'bottom top', scrub: 1 },
        },
      )
    }

    if (parallax) {
      gsap.fromTo(
        inner,
        { yPercent: -parallax },
        {
          yPercent: parallax,
          ease: 'none',
          scrollTrigger: { trigger: self, start: 'top bottom', end: 'bottom top', scrub: 1 },
        },
      )
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden bg-ink-deep', ratio, className)}
    >
      <div
        data-media-inner
        className="absolute inset-0 h-full w-full"
        /* Oversized so parallax and scale never reveal an edge. */
        style={parallax ? { insetBlock: `-${parallax + 4}%`, height: `${100 + (parallax + 4) * 2}%` } : undefined}
      >
        {image ? (
          <Image
            src={image}
            alt={alt ?? ''}
            fill
            sizes={sizes}
            priority={priority}
            className="h-full w-full object-cover"
          />
        ) : (
          <Plate variant={plate} tone={tone} seed={seed} className="h-full w-full" />
        )}
      </div>
      {children}
    </div>
  )
}
