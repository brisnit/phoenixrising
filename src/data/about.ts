/* ===========================================================================
 * ABOUT
 * ---------------------------------------------------------------------------
 * NOTE: contains no founding date, headcount, location or history claims —
 * none have been supplied. Placeholders are marked.
 * ======================================================================== */

export const about = {
  eyebrow: 'About',
  /* Phase 2 alignment only. The Round 1 lead framed the company purely around
     product ↔ factory, which now contradicts the homepage. This states the
     broader customer ↔ product ↔ factory position without pre-empting the
     founder story or the dual-market section — both Phase 5. */
  lines: ['Between idea,', 'market and making.'],
  lead: 'Phoenix Rising works across product thinking, development and manufacturing — connecting what a product needs to be for its intended customer with what it needs to become for reliable production.',
  body: [
    'Most hardware programmes are assembled from parts. A design studio produces something beautiful. An engineering consultancy makes it work. A factory quotes it, then quietly changes it to suit their process. Each party is competent and none of them is accountable for the result.',
    /* Reworded in Phase 2: the Round 1 version asserted the same in-person
       production presence that is quarantined elsewhere, and framed the
       company purely around product ↔ factory. */
    'We are built the other way round. One team carries a product from what it has to do for the person buying it through to what a factory has to do to build it repeatedly. Context is not lost at a handover, because there is no handover.',
  ],
  principles: [
    {
      index: '01',
      title: 'Constraints before concepts',
      body: 'Cost, volume, process and schedule are established before a design direction is chosen. A concept that ignores its constraints is not a starting point — it is a detour.',
    },
    {
      index: '02',
      title: 'Physical proof over confidence',
      body: 'Opinions about how a part will behave are cheap and frequently wrong. We build the thing and test it, at increasing fidelity, until it stops surprising us.',
    },
    {
      index: '03',
      title: 'Write it down',
      body: 'Specifications, tolerances, acceptance criteria and process parameters are documented before they are contested. A written standard is enforceable; an understanding is not.',
    },
    {
      index: '04',
      title: 'Design for the second run',
      body: 'Any programme can be pushed through one good batch. We set up tooling, suppliers and documentation so that the tenth batch looks like the first without anybody standing over it.',
    },
    {
      index: '05',
      title: 'Own the whole distance',
      body: 'We do not hand your product to someone else at the hard part. From first sketch to delivered freight, one team remains accountable.',
    },
  ],
  /* PLACEHOLDER — team, history and locations await real information. */
  team: {
    placeholder: true,
    headline: 'The team',
    body: '[Placeholder — add team structure, disciplines represented and named leadership once confirmed. Do not publish headcount or credentials that have not been verified.]',
  },
  presence: {
    placeholder: true,
    headline: 'Where we work',
    body: '[Placeholder — add studio and production locations, time-zone coverage and travel/on-site capability once confirmed.]',
  },
} as const
