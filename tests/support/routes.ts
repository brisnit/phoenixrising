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
  { path: '/process', name: 'process' },
  { path: '/work', name: 'work' },
  { path: '/work/consumer-enclosure-programme', name: 'work-case-study' },
  { path: '/insights', name: 'insights' },
  { path: '/insights/what-dfm-actually-means', name: 'insight-article' },
  { path: '/contact', name: 'contact' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/this-route-does-not-exist', name: 'not-found', expect404: true },
]

/** Routes that carry the heaviest scroll choreography. */
export const MOTION_ROUTES = ['/', '/process'] as const
