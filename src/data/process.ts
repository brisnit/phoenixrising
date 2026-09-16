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
  activities: string[]
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
      'Product brief review and feature prioritisation',
      'Target cost, volume and launch window',
      'Regulatory and market requirements',
      'Engineering and supply-chain feasibility review',
      'Scope, milestones and commercial proposal',
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
      'Industrial design and surfacing',
      'Mechanical design, structure and assembly strategy',
      'Electronics, PCB layout and firmware where applicable',
      'Material, finish and process selection',
      'Bill of materials development and cost modelling',
      'Engineering validation against requirements',
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
      'Additive and CNC prototype builds',
      'Functional testing against defined criteria',
      'Appearance models for colour, material and finish',
      'Assembly and serviceability evaluation',
      'Design iteration and re-validation',
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
      'Final DFM close-out and mould-flow analysis',
      'Tooling strategy, cavitation and tool-life specification',
      'Mould, jig and fixture manufacture',
      'First trial samples measured and reported',
      'Tool adjustment and re-trial to approval',
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
      'Pre-production sample approval',
      'Component sourcing and incoming control',
      'Production scheduling and capacity booking',
      'Assembly line setup and operator training',
      'In-process monitoring and yield reporting',
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
      'Written quality standard and defect classification',
      'Golden sample approval',
      'Incoming component inspection',
      'In-line process audits',
      'Finished-goods inspection and reporting',
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
      'Retail and transit packaging production',
      'Compliance labelling and documentation',
      'Freight forwarding and customs clearance',
      'Delivery into warehouse or fulfilment',
      'Reorder planning and ongoing support',
    ],
    deliverable: 'Delivered goods and a repeatable reorder path',
    plate: 'route',
  },
]
