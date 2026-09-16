/**
 * Every route the regression suite sweeps.
 *
 * `hasH1: false` marks routes that legitimately render no <h1> — currently
 * none, but the field exists so a future route can opt out explicitly rather
 * than by weakening the assertion for everyone.
 */
export type RouteSpec = {
  path: string
  name: string
  /** Expect exactly one <h1>. */
  hasH1?: boolean
  /** Route is expected to return a 404 status. */
  expect404?: boolean
}

export const ROUTES: RouteSpec[] = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/capabilities', name: 'capabilities' },
  { path: '/capabilities/design-for-manufacturability', name: 'capability-dfm' },
  { path: '/capabilities/prototyping-tooling', name: 'capability-prototyping' },
  { path: '/capabilities/production', name: 'capability-production' },
  { path: '/capabilities/quality-logistics', name: 'capability-quality' },
  { path: '/how-we-develop', name: 'how-we-develop' },
  { path: '/projects', name: 'projects' },
  { path: '/projects/consumer-enclosure-programme', name: 'project-case-study' },
  { path: '/start', name: 'start' },
  { path: '/ideate', name: 'ideate' },
  { path: '/onboarding', name: 'onboarding' },
  { path: '/insights', name: 'insights' },
  { path: '/insights/what-dfm-actually-means', name: 'insight-article' },
  { path: '/contact', name: 'contact' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/this-route-does-not-exist', name: 'not-found', expect404: true },
]

/** Routes that carry the heaviest scroll choreography. */
export const MOTION_ROUTES = ['/', '/how-we-develop'] as const

/**
 * Round 2 route migration. These must return a permanent redirect — they
 * exist for inbound links only and nothing internal may depend on them.
 */
export const REDIRECTS: { from: string; to: string }[] = [
  { from: '/process', to: '/how-we-develop' },
  { from: '/work', to: '/projects' },
  { from: '/work/consumer-enclosure-programme', to: '/projects/consumer-enclosure-programme' },
  { from: '/work/precision-hardware-programme', to: '/projects/precision-hardware-programme' },
]

/** Width at which the horizontal navigation replaces the fullscreen menu. */
export const DESKTOP_NAV_MIN_WIDTH = 1280
