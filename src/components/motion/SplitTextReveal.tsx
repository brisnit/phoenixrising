'use client'

import { useGsap } from '@/lib/hooks/useGsap'
import { ENTER } from '@/lib/gsap'
import { toWords } from '@/lib/utils'

type Props = {
  text: string
  className?: string
  delay?: number
}

/**
 * Word-level reveal for lead paragraphs. Each word rises independently with a
 * short stagger, which reads as the sentence assembling itself.
 *
 * The words are wrapped in spans rather than split at character level so the
 * text remains selectable, searchable and readable by screen readers as a
 * normal sentence.
 */
export function SplitTextReveal({ text, className, delay = 0 }: Props) {
  const words = toWords(text)

  const ref = useGsap<HTMLParagraphElement>(
    ({ self, gsap, reduced }) => {
      const targets = self.querySelectorAll('[data-word]')
      if (!targets.length) return
      if (reduced) {
        gsap.set(targets, { yPercent: 0, opacity: 1, clearProps: 'all' })
        return
      }
      gsap.fromTo(
        targets,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          /* `amount` caps the TOTAL stagger span rather than spacing each
             word by a fixed interval. Without it a 45-word paragraph takes
             nearly two seconds to finish arriving, and a reader who has
             already scrolled to it watches the last words trickle in. */
          stagger: { each: 0.022, amount: 0.45 },
          delay,
          scrollTrigger: { trigger: self, start: ENTER, once: true },
        },
      )
    },
    [text],
  )

  return (
    <p className={className} ref={ref}>
      {words.map((word, i) => (
        <span key={i} className="line-clip inline-block align-bottom">
          <span data-word className="inline-block">
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </p>
  )
}
