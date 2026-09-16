import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ProjectIntakeForm } from '@/components/sections/ProjectIntakeForm'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { contactIntro, productStages } from '@/data/contactForm'
import { contact } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: contactIntro.body,
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow={contactIntro.eyebrow}
        lines={contactIntro.lines}
        body={contactIntro.body}
        plate="route"
        seed={33}
      />

      <section data-tone="light" className="bg-paper py-(--spacing-section)">
        <div className="container-rule grid gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Aside — context and direct contact */}
          <aside className="lg:sticky lg:top-32 lg:col-span-3 lg:self-start">
            <Eyebrow className="mb-6">Where you are</Eyebrow>
            <ul className="border-t rule-light">
              {productStages.map((stage) => (
                <li key={stage} className="border-b rule-light py-3 label-mono text-steel">
                  {stage}
                </li>
              ))}
            </ul>

            <div id="team" className="mt-12 scroll-mt-32">
              <Eyebrow className="mb-6">Talk to our team</Eyebrow>
              <a
                href={`mailto:${contact.email}`}
                className="text-lead block break-words text-ink underline decoration-slate/50 underline-offset-4 transition-colors hover:text-blue hover:decoration-cyan"
              >
                {contact.email}
              </a>
              <p className="mt-2 text-lead text-slate">{contact.phone}</p>
              <p className="mt-6 label-mono text-slate">{contact.hours}</p>
              {contact.placeholder && (
                <PlaceholderNote className="mt-6">Placeholder contact details</PlaceholderNote>
              )}
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-8 lg:col-start-5">
            <h2 className="sr-only">Project enquiry form</h2>
            <ProjectIntakeForm />
          </div>
        </div>
      </section>
    </>
  )
}
