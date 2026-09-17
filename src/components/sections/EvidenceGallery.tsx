import { MediaFrame } from '@/components/media/MediaFrame'
import { ProvenanceTag } from '@/components/ui/ProvenanceTag'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { isRealEvidence, type EvidenceItem } from '@/data/projects'

/**
 * One stage of a project's evidence.
 *
 * Renders nothing at all when it has no items — a heading with an empty body
 * is how a sparse project starts looking like a broken one, and the phase
 * brief is explicit that there should be no empty sections.
 *
 * Every item states its provenance in words. Items that are not real evidence
 * additionally carry a sentence saying so, because a caption under a
 * convincing technical drawing is not enough on its own: on a projects page,
 * a coded plate is the thing most likely to be mistaken for proof.
 *
 * No hover affordance carries meaning (§20) — captions and provenance are
 * always visible, so the gallery is identical with a pointer, a keyboard or a
 * screen reader.
 */
export function EvidenceSection({
  title,
  note,
  items,
  headingId,
}: {
  title: string
  note?: string
  items: readonly EvidenceItem[]
  headingId: string
}) {
  if (items.length === 0) return null

  return (
    <section
      data-tone="light"
      data-evidence-stage={items[0].stage}
      aria-labelledby={headingId}
      className="bg-paper pb-(--spacing-section)"
    >
      <div className="container-rule border-t rule-light pt-12">
        <Eyebrow className="mb-6">Evidence</Eyebrow>
        <h2 id={headingId} className="text-h2 font-semibold uppercase">
          {title}
        </h2>
        {note && <p className="text-lead mt-4 max-w-[52ch] text-steel/85">{note}</p>}

        <Reveal
          as="ul"
          stagger={0.08}
          className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => {
            const real = isRealEvidence(item)
            return (
              <li key={item.id} data-evidence-item={item.id} data-provenance={item.provenance}>
                {item.media && (
                  <MediaFrame
                    plate={item.media.plate ?? 'grid'}
                    image={item.media.image}
                    alt={item.media.alt}
                    ratio="aspect-[4/3]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <ProvenanceTag provenance={item.provenance} />
                  {item.date && <span className="label-mono text-slate">{item.date}</span>}
                </div>
                <h3 className="mt-3 font-display text-[1.1rem] font-medium uppercase tracking-[-0.01em]">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-2 max-w-[38ch] text-[0.95rem] leading-relaxed text-steel/85">
                    {item.description}
                  </p>
                )}
                {item.caption && (
                  <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-slate">
                    {item.caption}
                  </p>
                )}
                {!real && (
                  <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-slate">
                    {item.provenance === 'pending'
                      ? 'No evidence has been supplied for this yet.'
                      : 'A generated illustration of the idea. Not a photograph of this project.'}
                  </p>
                )}
              </li>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
