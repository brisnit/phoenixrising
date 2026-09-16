import Link from 'next/link'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { navigation } from '@/data/site'

export default function NotFound() {
  return (
    <section
      data-tone="dark"
      className="is-dark flex min-h-[100svh] flex-col justify-center bg-ink-deep py-(--spacing-section) text-paper"
    >
      <div className="container-rule">
        <Eyebrow tone="dark" className="mb-10">
          Error 404
        </Eyebrow>
        <h1 className="text-display font-semibold uppercase">
          <span className="block">This part</span>
          <span className="block text-slate">doesn&rsquo;t exist.</span>
        </h1>
        <p className="text-lead mt-10 max-w-[44ch] text-slate-2">
          The page you asked for is not in the assembly. Everything that is, is listed below.
        </p>

        <nav aria-label="Site" className="mt-12 border-t rule-dark">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group/l flex items-baseline justify-between gap-6 border-b rule-dark py-5 transition-colors hover:text-cyan"
            >
              <span className="numeral text-[clamp(1.5rem,4vw,2.75rem)] font-semibold uppercase">
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-500 group-hover/l:translate-x-1.5 group-hover/l:-translate-y-1.5"
              >
                ↗
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-12">
          <MagneticButton href="/" variant="ghost">
            Back to home
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
