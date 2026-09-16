import Link from 'next/link'
import { footerGroups, footerMeta, social, contact, company } from '@/data/site'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'
import { Wordmark } from './Wordmark'

/**
 * The footer closes the page the way the hero opened it — with the name at
 * full scale. The wordmark is set as a two-line block that fills the measure,
 * so the composition ends on typography rather than on links.
 */
export function Footer() {
  return (
    <footer data-tone="dark" className="is-dark relative bg-ink-deep text-paper">
      <div className="container-rule pb-10 pt-(--spacing-section)">
        <div className="grid gap-12 border-b rule-dark pb-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Wordmark markClassName="size-9 sm:size-10" />
            <p className="mt-6 max-w-[32ch] text-lead text-slate-2">{company.description}</p>
          </div>

          {/* The footer carries the routes the header deliberately omits. */}
          <nav aria-label="Footer" className="lg:col-span-7 lg:col-start-6">
            <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <Eyebrow tone="dark">{group.title}</Eyebrow>
                  <ul className="mt-6 space-y-3">
                    {group.links.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group/link inline-flex items-baseline gap-2 text-[0.98rem] text-paper/90 transition-colors hover:text-cyan"
                        >
                          {item.label}
                          <span
                            aria-hidden="true"
                            className="translate-y-px opacity-0 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:opacity-100"
                          >
                            ↗
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:-mt-6">
            <Eyebrow tone="dark">Contact</Eyebrow>
            <address className="mt-6 not-italic">
              <a
                href={`mailto:${contact.email}`}
                className="text-lead text-paper underline decoration-slate/60 underline-offset-4 transition-colors hover:text-cyan hover:decoration-cyan"
              >
                {contact.email}
              </a>
              <p className="mt-2 text-lead text-slate-2">{contact.phone}</p>
              {contact.offices.map((office) => (
                <div key={office.label} className="mt-6">
                  <p className="label-mono text-slate">{office.label}</p>
                  {office.lines.map((line) => (
                    <p key={line} className="text-sm text-slate-2">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </address>

            <div className="mt-8">
              <Eyebrow tone="dark">Follow</Eyebrow>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="label-mono text-slate-2 transition-colors hover:text-cyan"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <PlaceholderNote tone="dark" className="mt-8">
              Contact details are placeholders
            </PlaceholderNote>
          </div>
        </div>

        {/* Closing wordmark — set to the full measure as a composition, not a logo. */}
        <div aria-hidden="true" className="select-none pt-14 sm:pt-20">
          <p className="numeral text-[19.5vw] font-semibold uppercase text-paper/92">Phoenix</p>
          <p className="numeral -mt-[0.06em] text-[19.5vw] font-semibold uppercase text-transparent [-webkit-text-stroke:1px_var(--color-slate)] sm:[-webkit-text-stroke:1.5px_var(--color-slate)]">
            Rising
          </p>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-5 border-t rule-dark pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-slate">
            © {new Date().getFullYear()} {company.legalName}
          </p>
          <ul className="flex gap-7">
            {footerMeta.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label-mono text-slate transition-colors hover:text-cyan"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
