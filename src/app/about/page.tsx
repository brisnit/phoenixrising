import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { TwoWorlds } from '@/components/sections/TwoWorlds'
import { InformationFlow } from '@/components/sections/InformationFlow'
import { DistanceStatement } from '@/components/sections/DistanceStatement'
import { CTASection } from '@/components/sections/CTASection'
import { Reveal } from '@/components/motion/Reveal'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import { Eyebrow } from '@/components/ui/Eyebrow'
import {
  aboutCta,
  aboutHero,
  companyThesis,
  founders,
  howThisChangesTheWork,
  locations,
  origin,
} from '@/data/company'

export const metadata: Metadata = {
  title: 'About',
  description: aboutHero.lead,
}

/**
 * About — the company story.
 *
 * Sequence: the position, the two worlds, the exchange between them, what is
 * actually hard about it, where the company came from, and what the whole
 * arrangement changes about the work. Tonally dark → cream → dark → cream →
 * dark → cream → dark, so no two full-bleed bands of the same tone sit
 * adjacent.
 *
 * There is no people section. No founder name, role, biography or portrait
 * has been supplied, and a page of placeholder cards would be a worse answer
 * than an honest gap — see `founders` in data/company, which this page
 * already branches on.
 *
 * Nor does this page render `pendingCompanyInformation`. The site's
 * convention is to mark placeholders VISIBLY where a visitor could otherwise
 * mistake them for real content — but nothing unconfirmed is published here
 * in the first place, so there is nothing to mark. Rendering the gap list
 * would only put unconfirmed detail ("Stockton") and internal brief-
 * versioning notes on a public marketing page. The list stays in
 * data/company for Phoenix Rising to work through.
 */
export default function AboutPage() {
  const showPeople = founders.published && founders.people.length > 0

  return (
    <>
      <PageHero
        eyebrow={aboutHero.eyebrow}
        lines={aboutHero.lines}
        body={aboutHero.lead}
        plate="wave"
        seed={31}
        meta={[...aboutHero.meta]}
      />

      {/* --- Thesis ----------------------------------------------------- */}
      <section
        data-tone="light"
        aria-labelledby="thesis-heading"
        className="bg-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">{companyThesis.eyebrow}</Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="thesis-heading"
                lines={companyThesis.lines}
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-slate']}
              />
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t rule-light pt-10 sm:mt-24 lg:grid-cols-12 lg:gap-8">
            <p className="label-mono max-w-[22ch] leading-[1.7] text-slate lg:col-span-3">
              {companyThesis.axisLabel}
            </p>
            <Reveal stagger={0.12} className="grid gap-6 lg:col-span-7 lg:col-start-5">
              {companyThesis.body.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? 'text-lead max-w-[58ch] text-ink'
                      : 'text-lead max-w-[58ch] text-steel/80'
                  }
                >
                  {para}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <TwoWorlds />
      <InformationFlow />
      <DistanceStatement />

      {/* --- Origin and where the work happens --------------------------- */}
      <section
        data-tone="light"
        aria-labelledby="origin-heading"
        className="bg-paper py-(--spacing-section)"
      >
        <div className="container-rule">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">{origin.eyebrow}</Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="origin-heading"
                lines={origin.lines}
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-slate']}
              />
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t rule-light pt-10 sm:mt-24 lg:grid-cols-12 lg:gap-8">
            <p className="max-w-[26ch] font-display text-h3 font-medium tracking-[-0.02em] text-ink lg:col-span-4">
              {origin.question}
            </p>
            <Reveal stagger={0.12} className="grid gap-6 lg:col-span-7 lg:col-start-6">
              {origin.body.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? 'text-lead max-w-[58ch] text-ink'
                      : 'text-lead max-w-[58ch] text-steel/80'
                  }
                >
                  {para}
                </p>
              ))}
              <p className="text-lead max-w-[58ch] text-blue">{origin.answer}</p>
            </Reveal>
          </div>

          {/* Places, not premises. */}
          <div className="mt-16 border-t rule-light pt-10 sm:mt-24">
            <h3 className="label-mono text-slate">{locations.eyebrow}</h3>
            <dl className="mt-8 grid gap-10 sm:grid-cols-2 sm:gap-8">
              {locations.places.map((place) => (
                <div key={place.id}>
                  <dt className="numeral text-[clamp(1.75rem,3.4vw,3rem)] font-semibold uppercase">
                    {place.name}
                    <span className="ml-3 label-mono align-middle text-slate">{place.region}</span>
                  </dt>
                  <dd className="mt-3 max-w-[38ch] text-[0.95rem] leading-relaxed text-steel/85">
                    {place.role}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-[64ch] text-[0.95rem] leading-relaxed text-slate">
              {locations.note}
            </p>
          </div>
        </div>
      </section>

      {/* --- People — rendered only when real people exist ---------------- */}
      {showPeople && (
        <section
          data-tone="light"
          aria-labelledby="people-heading"
          className="bg-paper pb-(--spacing-section)"
        >
          <div className="container-rule border-t rule-light pt-14">
            <Eyebrow className="mb-8">{founders.eyebrow}</Eyebrow>
            <h2 id="people-heading" className="text-h2 font-semibold uppercase">
              {founders.headline}
            </h2>
            <p className="text-lead mt-5 max-w-[48ch] text-steel/85">{founders.lead}</p>
            <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {founders.people.map((person) => (
                <li key={person.id}>
                  <p className="label-mono text-blue">{person.perspective}</p>
                  <h3 className="mt-3 text-h3 font-semibold uppercase">{person.name}</h3>
                  <p className="label-mono mt-2 text-slate">{person.role}</p>
                  <p className="mt-4 max-w-[38ch] text-[0.95rem] leading-relaxed text-steel/85">
                    {person.bio}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* --- What the position changes about the work --------------------- */}
      <section
        data-tone="light"
        aria-labelledby="changes-heading"
        className="bg-paper pb-(--spacing-section)"
      >
        <div className="container-rule border-t rule-light pt-(--spacing-section)">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">{howThisChangesTheWork.eyebrow}</Eyebrow>
              <AnimatedHeadline
                as="h2"
                id="changes-heading"
                lines={howThisChangesTheWork.lines}
                className="text-h2 font-semibold uppercase"
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
              <p className="text-lead max-w-[46ch] text-steel/85">
                {howThisChangesTheWork.lead}
              </p>
            </div>
          </div>

          <ol className="mt-16 border-t rule-light sm:mt-20">
            {howThisChangesTheWork.items.map((item) => (
              <li key={item.index} className="border-b rule-light py-8">
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                  <p className="label-mono text-blue lg:col-span-1">{item.index}</p>
                  <h3 className="numeral text-[clamp(1.5rem,3.4vw,2.75rem)] font-semibold uppercase lg:col-span-4">
                    {item.title}
                  </h3>
                  <p className="max-w-[52ch] text-[0.98rem] leading-relaxed text-steel/85 lg:col-span-6 lg:col-start-7">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

        </div>
      </section>

      <CTASection
        lines={aboutCta.lines}
        body={aboutCta.body}
        primary={aboutCta.primary}
        secondary={aboutCta.secondary}
      />
    </>
  )
}
