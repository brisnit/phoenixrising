/* ===========================================================================
 * ABOUT
 * ---------------------------------------------------------------------------
 * NOTE: contains no founding date, headcount, location or history claims —
 * none have been supplied. Placeholders are marked.
 * ======================================================================== */

export const about = {
  eyebrow: 'About',
  lines: ['We exist where', 'design meets steel.'],
  lead: 'Phoenix Rizing is a product development and manufacturing partner. We take responsibility for the whole distance between an idea and a delivered product — engineering it, proving it physically, tooling it, building it and shipping it.',
  body: [
    'Most hardware programmes are assembled from parts. A design studio produces something beautiful. An engineering consultancy makes it work. A factory quotes it, then quietly changes it to suit their process. Each party is competent and none of them is accountable for the result.',
    'We are built the other way round. The engineers who specify a part are the ones who answer for it when it comes off a tool. The people managing your suppliers understand why a tolerance was set where it was. Nothing crosses a boundary where context gets lost, because there are no boundaries to cross.',
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
