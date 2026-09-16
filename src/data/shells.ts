/* ===========================================================================
 * ROUTE SHELLS
 * ---------------------------------------------------------------------------
 * Content for routes whose full experience arrives in a later phase.
 *
 * These are not placeholders in the "unfinished" sense — each explains, in
 * plain language, what the route is for and what is not built yet. The rule
 * is that a visitor who lands here must never be misled about what exists:
 * no fake stage selector, no fake conversation, no invented commercial terms.
 *
 * `arriving` names the phase so the copy can be replaced deliberately rather
 * than discovered later.
 *
 * /start no longer uses a shell — Phase 3 replaced it with the real stage
 * selector. What remains here is /ideate and /onboarding.
 * ======================================================================== */

export type Shell = {
  eyebrow: string
  lines: readonly string[]
  lead: string
  /* Explains the route's purpose without implying the mechanism exists. */
  body: readonly string[]
  /* What a visitor can actually do right now. */
  available: { label: string; href: string; note: string }[]
  notice: string
  arriving: string
}

export const ideateShell: Shell = {
  eyebrow: 'Ideation workspace',
  lines: ['Start with what', 'you know.'],
  lead: 'You do not need a finished specification to start a useful conversation. Most products begin as a clear problem and a rough idea of the answer.',
  body: [
    'This workspace is being built to help organise an early idea into something a development team can act on: what is known, what is still open, what has to be decided before anything can be costed or built — collected into a project brief you can edit and send for review.',
    'It is a structured working session, not a replacement for engineering judgement. Whatever it produces is prepared for a person to review, not approved by a machine.',
  ],
  available: [
    {
      label: 'Describe your idea directly',
      href: '/contact',
      note: 'Tell us what you are trying to make and we will help shape it.',
    },
    {
      label: 'Read how development works',
      href: '/how-we-develop',
      note: 'What happens between an idea and a production run.',
    },
  ],
  notice: 'The workspace is not built yet — nothing here is interactive',
  arriving: 'Phase 9',
}

export const onboardingShell: Shell = {
  eyebrow: 'Onboarding',
  lines: ['Before we build,', 'we define.'],
  lead: 'Professional product development starts before a factory does. Requirements have to be settled, unknowns identified, and a manufacturing approach planned — and that work takes real time from experienced people.',
  body: [
    'Phoenix Rising treats that definition work as a scoped engagement in its own right, agreed in writing before it begins, so both sides know what is being produced and what happens next.',
    'What that scope contains depends on the product and the stage it arrives at. The specifics — deliverables, responsibilities, timing and fee — are set out for each project rather than sold as a package, and are not published here.',
  ],
  available: [
    {
      label: 'Talk to us about your project',
      href: '/contact',
      note: 'Scope is proposed per project, after we understand what you are building.',
    },
    {
      label: 'See what development involves',
      href: '/how-we-develop',
      note: 'The stages an engagement is scoped against.',
    },
  ],
  notice: 'Scope, deliverables and fees are agreed per project and are not published',
  arriving: 'Phase 7',
}
