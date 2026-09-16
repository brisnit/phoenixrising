/* ===========================================================================
 * PROCESS — seven stages, discovery through delivery.
 * Drives the pinned scroll timeline on the homepage and the /process page.
 * ======================================================================== */

import type { PlateVariant } from '@/components/media/plates'

export type ProcessStep = {
  index: string
  id: string
  title: string
  summary: string
  body: string
  /* `pending` entries are capabilities inferred during the Round 1 build and
     not yet confirmed by Phoenix Rising. They render with a visible marker. */
  activities: { text: string; verification?: 'pending' }[]
  deliverable: string
  plate: PlateVariant
}

export const processIntro = {
  eyebrow: 'Process',
  lines: ['One partner.', 'The entire journey.'],
  body: 'Seven stages, one accountable team. Each stage ends in something you can hold, read or approve — never a status update.',
} as const

export const processSteps: ProcessStep[] = [
  {
    index: '01',
    id: 'discovery',
    title: 'Discovery',
    summary: 'Understand the product, the market and the constraints that actually bind.',
    body: 'Before proposing anything we establish what the product has to do, who it is for, what it can cost, and when it has to exist. Most programmes fail on a constraint nobody wrote down — so we write them down.',
    activities: [
      { text: 'Product brief review and feature prioritisation' },
      { text: 'Target cost, volume and launch window' },
      { text: 'Regulatory and market requirements' },
      { text: 'Engineering and supply-chain feasibility review' },
      { text: 'Scope, milestones and commercial proposal' },
    ],
    deliverable: 'Feasibility review and a scoped development proposal',
    plate: 'burst',
  },
  {
    index: '02',
    id: 'development',
    title: 'Development',
    summary: 'Turn intent into an engineered, costed, manufacturable design.',
    body: 'Industrial design, mechanical engineering and — where applicable — electronics run in parallel against the constraints agreed in discovery. You approve each design decision as it is made rather than reviewing a finished thing you cannot change.',
    activities: [
      { text: 'Industrial design and surfacing' },
      { text: 'Mechanical design, structure and assembly strategy' },
      { text: 'Electronics, PCB layout and firmware where applicable', verification: 'pending' },
      { text: 'Material, finish and process selection' },
      { text: 'Bill of materials development and cost modelling' },
      { text: 'Engineering validation against requirements' },
    ],
    deliverable: 'Released CAD, drawings, BOM and a functional alpha unit',
    plate: 'caliper',
  },
  {
    index: '03',
    id: 'prototyping',
    title: 'Prototyping',
    summary: 'Build physical proof before committing to anything irreversible.',
    body: 'Prototypes at increasing fidelity answer the questions CAD cannot: does it feel right, does it survive, can it be assembled by a person in a reasonable time, and does it still look like the design.',
    activities: [
      { text: 'Additive and CNC prototype builds' },
      { text: 'Functional testing against defined criteria' },
      { text: 'Appearance models for colour, material and finish' },
      { text: 'Assembly and serviceability evaluation' },
      { text: 'Design iteration and re-validation' },
    ],
    deliverable: 'Tested prototype units and a documented iteration record',
    plate: 'wave',
  },
  {
    index: '04',
    id: 'tooling',
    title: 'Tooling',
    summary: 'Finalise DFM, then commit the design to production tooling.',
    body: 'This is the point of no easy return. DFM is closed out, tooling strategy is fixed, moulds and fixtures are built, and first samples are measured against drawing before a single production unit is authorised.',
    activities: [
      { text: 'Final DFM close-out and mould-flow analysis', verification: 'pending' },
      { text: 'Tooling strategy, cavitation and tool-life specification' },
      { text: 'Mould, jig and fixture manufacture' },
      { text: 'First trial samples measured and reported' },
      { text: 'Tool adjustment and re-trial to approval' },
    ],
    deliverable: 'Approved first-trial samples and validated production tooling',
    plate: 'mold',
  },
  {
    index: '05',
    id: 'production',
    title: 'Production',
    summary: 'Coordinate suppliers, components, manufacturing and assembly.',
    body: 'Production is scheduled backwards from your launch date, with long-lead components ordered against a plan rather than a hope. We manage the suppliers, the line and the build so you manage your business.',
    activities: [
      { text: 'Pre-production sample approval' },
      { text: 'Component sourcing and incoming control' },
      { text: 'Production scheduling and capacity booking' },
      { text: 'Assembly line setup and operator training' },
      { text: 'In-process monitoring and yield reporting' },
    ],
    deliverable: 'A manufactured, inspected production batch',
    plate: 'lattice',
  },
  {
    index: '06',
    id: 'quality-control',
    title: 'Quality control',
    summary: 'Validate components and finished product against approved specification.',
    body: 'The standard is written and agreed before production starts. Inspection then measures against that document at component, in-process and finished-goods level — and shipment is authorised against the report, not the schedule.',
    activities: [
      { text: 'Written quality standard and defect classification' },
      { text: 'Golden sample approval' },
      { text: 'Incoming component inspection' },
      /* Same operational claim as the manufacturing-presence pillar Phase 1
         removed from the why-us section: asserts Phoenix Rising auditing a
         production line in person. Quarantined pending verification. */
      { text: 'In-line process audits', verification: 'pending' },
      { text: 'Finished-goods inspection and reporting' },
    ],
    deliverable: 'Inspection reports and shipment authorisation',
    plate: 'grid',
  },
  {
    index: '07',
    id: 'delivery',
    title: 'Delivery',
    summary: 'Packaging, freight, logistics and ongoing production support.',
    body: 'Approved goods are packed, documented and moved to where they need to be. Then we stay — because the second order, the running change and the seasonal shutdown are all still ahead of you.',
    activities: [
      { text: 'Retail and transit packaging production' },
      { text: 'Compliance labelling and documentation' },
      { text: 'Freight forwarding and customs clearance' },
      { text: 'Delivery into warehouse or fulfilment' },
      { text: 'Reorder planning and ongoing support' },
    ],
    deliverable: 'Delivered goods and a repeatable reorder path',
    plate: 'route',
  },
]
