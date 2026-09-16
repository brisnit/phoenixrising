/* ===========================================================================
 * IP / SUPPLY CHAIN
 * ---------------------------------------------------------------------------
 * ⚠️ UNVERIFIED — this section describes an approach to structuring supplier
 * relationships that was inferred during the Round 1 build. Phoenix Rising
 * has not confirmed that it operates this way, so the whole section renders
 * behind a visible "unverified" notice.
 *
 * Round 2 retires this section entirely: Phase 4 repurposes the exploded
 * component visual for "The Space Between Design and Delivery". Do not invest
 * further in the IP concept — just stop it asserting a methodology we cannot
 * support in the meantime.
 * ======================================================================== */

export const ipSystem = {
  /* Blocks the section from presenting as an approved Phoenix Rising method
     until Phase 4 replaces it. */
  verification: 'pending' as const,
  eyebrow: 'IP & supply chain',
  headline: ['Your product', 'is your advantage.'],
  body: [
    'Phoenix Rising structures manufacturing relationships to help reduce unnecessary exposure of product IP while maintaining control over critical components, suppliers and production quality.',
    'In practice that means deciding deliberately which partner sees which part of your product, sourcing the components that carry your advantage ourselves, and keeping the documentation that defines your product in your hands rather than a factory drawer.',
  ],
  /* Layers of the exploded system diagram, top to bottom. */
  layers: [
    {
      id: 'component-sourcing',
      label: 'Component sourcing',
      note: 'Critical parts specified and bought directly, not delegated.',
    },
    {
      id: 'supplier-control',
      label: 'Supplier control',
      note: 'Scope limited per partner. Capability audited, not assumed.',
    },
    {
      id: 'quality-validation',
      label: 'Quality validation',
      note: 'Incoming parts measured against your specification.',
    },
    {
      id: 'assembly',
      label: 'Assembly',
      note: 'Build sequence and fixtures defined and owned by the programme.',
    },
    {
      id: 'documentation',
      label: 'Documentation',
      note: 'CAD, drawings, BOM and process records stay with you.',
    },
    {
      id: 'final-inspection',
      label: 'Final inspection',
      note: 'Finished goods signed off against the approved standard.',
    },
  ],
} as const
