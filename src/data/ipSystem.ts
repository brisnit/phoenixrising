/* ===========================================================================
 * IP / SUPPLY CHAIN
 * ---------------------------------------------------------------------------
 * NOTE ON CLAIMS: this section describes a structural approach to managing
 * supplier relationships. It deliberately does NOT claim a proprietary,
 * named or guaranteed IP-protection method, because none has been supplied.
 * Keep the language structural ("helps reduce exposure") unless Phoenix
 * Rizing has a specific, defensible process to describe.
 * ======================================================================== */

export const ipSystem = {
  eyebrow: 'IP & supply chain',
  headline: ['Your product', 'is your advantage.'],
  body: [
    'Phoenix Rizing structures manufacturing relationships to help reduce unnecessary exposure of product IP while maintaining control over critical components, suppliers and production quality.',
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
