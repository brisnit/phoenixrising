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
    return [
      { source: '/process', destination: '/how-we-develop', permanent: true },
      { source: '/work', destination: '/projects', permanent: true },
      { source: '/work/:slug', destination: '/projects/:slug', permanent: true },
    ]
  },
}

export default nextConfig
