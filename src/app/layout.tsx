import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { AskPhoenixProvider } from '@/components/askPhoenix/GlobalAskPhoenix'
import { seo, company } from '@/data/site'

/* Archivo carries a width axis, which is what makes the oversized headlines
   possible without a second display face. Plex Mono handles every technical
   label, index and numeral. */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.description,
  openGraph: {
    title: seo.defaultTitle,
    description: seo.description,
    siteName: company.name,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0c182a',
  colorScheme: 'light',
}

/**
 * Sets `.motion-ready` on <html> before first paint.
 *
 * Pre-animation states (hidden text, closed clip paths) are scoped to this
 * class so that without JavaScript every element renders in its final,
 * visible state. The class is applied synchronously in <head> to avoid a
 * flash of already-visible content that then hides itself.
 *
 * The timeout is a failsafe for the case in between: JavaScript is enabled,
 * so the class gets added, but the bundle never arrives — a chunk 404s
 * against a stale cache after a deploy, or the network drops. Without it the
 * page would render with every headline permanently invisible. `lib/gsap`
 * clears the timer the moment the motion system loads, so on a healthy page
 * this never fires.
 */
const MOTION_READY = `try{var d=document.documentElement;d.classList.add('motion-ready');window.__prMotionFailsafe=setTimeout(function(){d.classList.remove('motion-ready')},4000)}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_READY }} />
      </head>
      <body className="bg-paper text-ink antialiased">
        {/* The provider wraps the app so the global panel is mounted ONCE, at
            the root, and survives client-side navigation — which is what lets
            a conversation follow the visitor between pages. */}
        <AskPhoenixProvider>
          <Header />
          <PageTransition>
            <main id="main">{children}</main>
            <Footer />
          </PageTransition>
        </AskPhoenixProvider>
      </body>
    </html>
  )
}
