import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['gsap'],
  },

  /**
   * Round 2 route migration.
   *
   * These exist for resilience — inbound links, bookmarks, anything already
   * shared — not as the site's own navigation. No internal link should rely
   * on them; `tests/e2e/routing.spec.ts` asserts both the redirects and the
   * absence of internal links pointing at the old paths.
   */
  async redirects() {
    /* Phase 6 retired the four capability detail pages and the four
       placeholder case studies. Their URLs were live and may be linked, so
       each resolves to the page that replaced it rather than 404ing.

       The retired capability slugs are listed individually rather than
       matched with `/capabilities/:slug`. A wildcard would also swallow any
       future detail route, which is a trap worth not setting. */
    const retiredCapabilities = [
      'design-for-manufacturability',
      'prototyping-tooling',
      'production',
      'quality-logistics',
    ]

    return [
      { source: '/process', destination: '/how-we-develop', permanent: true },
      { source: '/work', destination: '/projects', permanent: true },
      /* Every old case-study URL now lands on the evidence library: the
         projects they pointed at were placeholders and are gone, so there is
         no per-slug destination left to preserve. */
      { source: '/work/:slug', destination: '/projects', permanent: true },
      ...retiredCapabilities.map((slug) => ({
        source: `/capabilities/${slug}`,
        destination: '/capabilities',
        permanent: true,
      })),
      ...[
        'consumer-enclosure-programme',
        'precision-hardware-programme',
        'housewares-programme',
        'outdoor-equipment-programme',
      ].map((slug) => ({
        source: `/projects/${slug}`,
        destination: '/projects',
        permanent: true,
      })),
    ]
  },
}

export default nextConfig
