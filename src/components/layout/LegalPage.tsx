import { PageHero } from '@/components/layout/PageHero'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'

/**
 * Shared shell for the two legal routes.
 *
 * The content is a deliberate placeholder rather than boilerplate text.
 * Publishing generic privacy or terms copy would be a legal claim about how
 * Phoenix Rising handles data, which is not something to generate — the
 * structure is here, the words are for a lawyer.
 */
export function LegalPage({
  title,
  eyebrow,
  sections,
}: {
  title: string
  eyebrow: string
  sections: string[]
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} lines={[title]} plate="grid" seed={71} />
      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule lg:mx-auto lg:max-w-[70ch]">
          <PlaceholderNote className="mb-12">
            Awaiting legal copy — do not publish as-is
          </PlaceholderNote>
          <p className="text-lead text-steel/85">
            This page is a structural placeholder. Replace the sections below with the policy
            reviewed and approved for {title.toLowerCase()}.
          </p>
          <ul className="mt-12 border-t rule-light">
            {sections.map((section) => (
              <li key={section} className="border-b rule-light py-5">
                <p className="label-mono text-slate">{section}</p>
                <p className="mt-2 text-[0.95rem] text-slate">[Section content]</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
