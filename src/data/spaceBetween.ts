/* ===========================================================================
 * THE SPACE BETWEEN DESIGN AND DELIVERY
 * ---------------------------------------------------------------------------
 * Replaces the Round 1 IP / supply-chain section, which described a
 * methodology Phoenix Rising never confirmed and which Round 2 does not
 * position around. That section and its quarantined claim were deleted, not
 * verified — see the note in the Phase 4 commit.
 *
 * The purpose here is to show where the difficulty in manufacturing actually
 * lives: in the chain of decisions between a design and a finished product.
 *
 * CLAIM INTEGRITY: every entry is framed as a QUESTION the work has to answer,
 * not a service Phoenix Rising performs. "What relationships have to stay
 * consistent" is a manufacturing concept; "we perform tolerance stack-up
 * analysis" would be a capability claim, and that capability is unverified.
 * The same applies to tooling — the question is what approach a product
 * requires, not who manufactures the tool.
 * ======================================================================== */

export type DecisionLayer = {
  id: string
  label: string
  /** The question this layer exists to answer. */
  question: string
  note: string
}

export const spaceBetween = {
  eyebrow: 'Between design and delivery',
  lines: ['The drawing', "isn't the product."],
  body: [
    'Between a design and a finished product sits a chain of decisions about materials, components, processes, approvals, quality and production. Most of them are never drawn, and each one quietly changes what the product becomes.',
    'Phoenix Rising works to keep those decisions connected to what the product is supposed to be — so that what gets manufactured is still recognisably the thing that was intended.',
  ],
  /* Ordered as the product moves from intent toward delivery. */
  layers: [
    {
      id: 'design-intent',
      label: 'Design intent',
      question: 'What is actually essential about this product?',
      note: 'Which qualities define it, and which were incidental to how it was first drawn.',
    },
    {
      id: 'material-questions',
      label: 'Material questions',
      question: 'Which properties genuinely matter?',
      note: 'Behaviour under real use, availability and lead time — not just what a datasheet says.',
    },
    {
      id: 'component-decisions',
      label: 'Component decisions',
      question: 'What should be a component, and what should be an assembly?',
      note: 'The split changes cost, tooling, serviceability and who has to get it right.',
    },
    {
      id: 'tolerances-fit',
      label: 'Tolerances + fit',
      question: 'Which relationships have to stay consistent?',
      note: 'Where variation is acceptable and where it is not, decided deliberately rather than by default.',
    },
    {
      id: 'tooling-questions',
      label: 'Tooling questions',
      question: 'What manufacturing approach does this product require?',
      note: 'The process shapes the design as much as the design shapes the process.',
    },
    {
      id: 'factory-communication',
      label: 'Factory communication',
      question: 'How does intent become unambiguous manufacturing information?',
      note: 'Anything left to interpretation will be interpreted, and not always the way you meant.',
    },
    {
      id: 'client-approvals',
      label: 'Client approvals',
      question: 'Which decisions have to come back to the product owner?',
      note: 'Some trade-offs are technical. Others are commercial, and are not ours to make.',
    },
    {
      id: 'quality-criteria',
      label: 'Quality criteria',
      question: 'What does acceptable mean, before anything is built?',
      note: 'Agreed in advance it is a specification. Agreed afterwards it is a negotiation.',
    },
    {
      id: 'packaging',
      label: 'Packaging',
      question: 'How does it survive handling and reach its destination?',
      note: 'A product that arrives damaged was not finished, however well it was made.',
    },
    {
      id: 'logistics',
      label: 'Logistics',
      question: 'What still has to happen after manufacturing?',
      note: 'Documentation, movement and the conditions it travels under.',
    },
  ] as DecisionLayer[],
} as const
