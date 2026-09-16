/* ===========================================================================
 * CAPABILITIES
 * ---------------------------------------------------------------------------
 * Four capability stories. Each drives (a) an immersive homepage section and
 * (b) a full detail page at /capabilities/[slug]. `plate` selects the coded
 * art-direction composition rendered in place of photography — swap a slot for
 * a real image by passing `image` instead (see components/media/MediaFrame).
 * ======================================================================== */

import type { PlateVariant } from '@/components/media/plates'

export type Capability = {
  slug: string
  index: string
  title: string
  titleLines: string[]
  summary: string
  lead: string
  plate: PlateVariant
  /* Sub-disciplines shown as an indexed technical list. */
  disciplines: { title: string; body: string }[]
  /* What the client physically receives at the end of this phase. */
  deliverables: string[]
  /* The failure mode this capability exists to prevent. */
  risk: { title: string; body: string }
}

export const capabilitiesIntro = {
  eyebrow: 'Capabilities',
  lines: ['From first sketch', 'to final shipment.'],
  body: 'Four disciplines, run by one team, against one schedule. Nothing is thrown over a wall — the engineers who specify the part are the ones who answer for it on the line.',
} as const

export const capabilities: Capability[] = [
  {
    slug: 'design-for-manufacturability',
    index: '01',
    title: 'Design for manufacturability',
    titleLines: ['Design for', 'manufacturability'],
    summary: 'Engineering decisions made for real-world production.',
    lead: 'A design is only finished when a factory can build it repeatedly, at cost, without heroics. We pressure-test geometry, materials and tolerances against the process that will actually make them — before anyone cuts steel.',
    plate: 'caliper',
    disciplines: [
      {
        title: 'Industrial design refinement',
        body: 'Form, ergonomics and surfacing resolved against real manufacturing constraints — draft, parting lines, wall sections and finish — so the product that ships still looks like the product that was designed.',
      },
      {
        title: 'Mechanical engineering',
        body: 'Structure, fastening, sealing, thermal and assembly strategy worked through in CAD, with load paths and failure modes understood rather than assumed.',
      },
      {
        title: 'Material selection',
        body: 'Polymers, metals, elastomers and finishes chosen for the duty cycle, the regulatory context and the process — then validated against availability and lead time, not just a datasheet.',
      },
      {
        title: 'Tolerance analysis',
        body: 'Stack-up analysis across mating parts so fit, gap and flush are specified deliberately. Tolerances get tightened where they matter and opened everywhere else, which is where cost lives.',
      },
      {
        title: 'Manufacturing feasibility',
        body: 'Process selection and simulation — including mould-flow behaviour, sink, warpage and knit lines — to confirm the part can be made the way the design assumes.',
      },
      {
        title: 'Cost engineering',
        body: 'Landed unit cost modelled early and revisited at every design decision, so the margin conversation happens while change is still cheap.',
      },
      {
        title: 'Production risk review',
        body: 'A written register of what could go wrong in tooling, assembly and volume — each risk owned, mitigated or explicitly accepted before the programme moves on.',
      },
    ],
    deliverables: [
      'DFM report with annotated CAD feedback',
      'Validated CAD and 2D drawing package',
      'Material and finish specification',
      'Tolerance stack-up analysis',
      'Costed bill of materials',
      'Production risk register',
    ],
    risk: {
      title: 'Beautiful, but unbuildable',
      body: 'The most expensive hardware failure is a design that only reveals its manufacturing problems after tooling is paid for. At that point every fix is measured in weeks and steel. DFM moves those discoveries forward to where they cost a revision instead of a mould.',
    },
  },
  {
    slug: 'prototyping-tooling',
    index: '02',
    title: 'Prototyping + tooling',
    titleLines: ['Prototyping', '+ tooling'],
    summary: 'Turn digital designs into physical proof.',
    lead: 'A screen will agree with you. A part will not. We build progressively more production-like physical units until the design has stopped arguing, then commit that resolved design to tooling.',
    plate: 'mold',
    disciplines: [
      {
        title: 'Additive prototyping',
        body: 'SLA, SLS and FDM parts for fast proof of concept and iteration — fit checks, ergonomics and layout resolved in days rather than weeks.',
      },
      {
        title: 'CNC machining',
        body: 'Machined parts in production-representative materials when a print will not answer the question: stiffness, finish, thread strength or investor-grade appearance.',
      },
      {
        title: 'Functional prototypes',
        body: 'Units built to be used and broken. Tested against the duty cycle, environment and abuse the product will genuinely meet.',
      },
      {
        title: 'Appearance prototypes',
        body: 'Cosmetically finished units matching intended colour, texture, gloss and trim — for photography, user testing and stakeholder sign-off.',
      },
      {
        title: 'Soft and bridge tooling',
        body: 'Silicone and composite moulds for elastomeric parts and low-volume runs, bridging the gap between prototype and hard tooling.',
      },
      {
        title: 'Production tooling',
        body: 'Hardened steel moulds and fixtures specified for the required cavitation, cycle time and tool life — built, benched and trialled under supervision.',
      },
      {
        title: 'Trial samples and pilot runs',
        body: 'First-shot samples measured against drawing, then a pilot build that runs the real assembly sequence to expose problems a sample set never will.',
      },
    ],
    deliverables: [
      'Iterative prototype units at each fidelity',
      'Test results against defined criteria',
      'Tooling strategy and cavitation plan',
      'First-trial sample inspection report',
      'Pilot-run build and findings',
      'Tooling handover documentation',
    ],
    risk: {
      title: 'Tooling is where money is made or lost',
      body: 'A mould is the single largest irreversible commitment in a hardware programme. Everything before it exists to make that commitment safe — which is why we do not cut steel until the physical parts have stopped surprising us.',
    },
  },
  {
    slug: 'production',
    index: '03',
    title: 'Production',
    titleLines: ['Production'],
    summary: 'Move from approved prototype into repeatable manufacturing.',
    lead: 'Volume manufacturing is a logistics and control problem as much as an engineering one. We assemble the supply chain, define the process, and manage the people and parts that turn an approved sample into a shipment.',
    plate: 'lattice',
    disciplines: [
      {
        title: 'Supplier identification and audit',
        body: 'Partners selected against capability, capacity and quality record — then audited in person rather than trusted on a profile.',
      },
      {
        title: 'Component sourcing',
        body: 'Critical components specified and sourced deliberately, with approved alternates identified before a shortage forces an improvised decision.',
      },
      {
        title: 'Production planning',
        body: 'Capacity, long-lead items, seasonal shutdowns and buffer stock scheduled backwards from your launch date.',
      },
      {
        title: 'Assembly engineering',
        body: 'Work instructions, fixtures, jigs and line balance defined so the build sequence is the same on every shift, at every station.',
      },
      {
        title: 'Process control',
        body: 'Parameters recorded and held — moulding conditions, torque values, cure times — so units built in month six match units built in month one.',
      },
      {
        title: 'Scalability',
        body: 'Tooling and supply arrangements structured so a successful launch can be met with more units rather than a redesign.',
      },
    ],
    deliverables: [
      'Approved pre-production sample',
      'Assembly work instructions and fixtures',
      'Production schedule with long-lead flags',
      'Supplier list with audit records',
      'Process parameter sheets',
      'Production and yield reporting',
    ],
    risk: {
      title: 'The second run is the real test',
      body: 'Anyone can get one good batch out of a factory with enough attention. The programmes that survive are the ones where the process, not the supervision, produces the quality — so run two looks like run one without a person standing over it.',
    },
  },
  {
    slug: 'quality-logistics',
    index: '04',
    title: 'Quality + delivery',
    titleLines: ['Quality', '+ delivery'],
    summary: 'Control what gets built and how it reaches the market.',
    lead: 'Quality is a document before it is an outcome. We write the standard, inspect against it at every level, then take responsibility for getting approved goods through packaging, compliance and freight into your market.',
    plate: 'grid',
    disciplines: [
      {
        title: 'Quality assurance',
        body: 'The system that prevents defects: written standards, defined defect classes, operator training and station-level checks agreed before production starts.',
      },
      {
        title: 'Quality control',
        body: 'The inspection that catches them: sampling plans, measurement against drawing, and documented dispositions for anything out of specification.',
      },
      {
        title: 'Component inspection',
        body: 'Incoming parts checked against specification before they enter assembly, so a supplier problem does not become a finished-goods problem.',
      },
      {
        title: 'Finished-goods inspection',
        body: 'Final units inspected cosmetically and functionally against the approved golden sample, with reports issued before shipment is authorised.',
      },
      {
        title: 'Packaging',
        body: 'Retail and transit packaging designed and drop-tested, with labelling, barcoding and palletisation specified for the destination channel.',
      },
      {
        title: 'Certification support',
        body: 'Coordination of the testing and documentation your target markets require, with the right lab engaged early enough not to delay shipment.',
      },
      {
        title: 'Freight and logistics',
        body: 'Forwarding, incoterms, customs documentation and delivery into warehouse or fulfilment — managed as part of the programme rather than handed off.',
      },
    ],
    deliverables: [
      'Written quality standard and defect classification',
      'Approved golden sample',
      'Incoming and in-line inspection records',
      'Finished-goods inspection report',
      'Packaging specification and test results',
      'Shipping documentation and tracking',
    ],
    risk: {
      title: 'Undefined quality is unenforceable quality',
      body: 'If the standard is not written down before production, every disagreement about a defective unit becomes a negotiation. Agreeing acceptance criteria in advance is what turns quality from an opinion into a specification.',
    },
  },
]

export const capabilityBySlug = (slug: string) => capabilities.find((c) => c.slug === slug)
