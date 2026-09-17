import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectDetail } from '@/components/sections/ProjectDetail'
import type { EvidenceItem, Project } from '@/data/projects'

/**
 * The project detail template, exercised against fixtures.
 *
 * No project is published, so this template generates no routes — which would
 * normally mean it ships untested. Rendering it directly is the alternative to
 * publishing a fictional project in order to prove the code works, and that
 * trade is the whole point of the phase.
 *
 * What matters here is what the template does with a SPARSE project, because
 * that is what the first real one will be: a few photographs, no outcome, no
 * measured result. It must render those and nothing else — no empty headings,
 * and no illustrative plate that reads as a photograph of work done.
 */

const evidence = (over: Partial<EvidenceItem> = {}): EvidenceItem => ({
  id: 'e',
  stage: 'prototype',
  title: 'Prototype',
  provenance: 'client-provided',
  ...over,
})

const project = (over: Partial<Project> = {}): Project => ({
  slug: 'fixture',
  name: 'Fixture project',
  summary: 'A summary of the fixture.',
  evidence: [],
  ...over,
})

describe('a sparse project renders only what it has', () => {
  it('shows no evidence headings for stages with no evidence', () => {
    render(
      <ProjectDetail
        project={project({
          evidence: [evidence({ id: 'a', stage: 'prototype', title: 'First prototype' })],
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: /^prototype$/i })).toBeInTheDocument()
    /* The other four stages must not appear at all. */
    for (const absent of ['Development', 'Manufacturing', 'Product', 'Outcome']) {
      expect(
        screen.queryByRole('heading', { name: new RegExp(`^${absent}$`, 'i') }),
        `renders an empty "${absent}" evidence section`,
      ).toBeNull()
    }
  })

  it('omits the narrative block entirely when there is no narrative', () => {
    render(<ProjectDetail project={project({ evidence: [evidence()] })} />)
    expect(screen.queryByRole('heading', { name: /project background/i })).toBeNull()
    expect(screen.queryByText(/the challenge/i)).toBeNull()
  })

  it('renders only the narrative sections that have copy', () => {
    render(
      <ProjectDetail
        project={project({
          challenge: 'The stated challenge.',
          currentState: 'Where it is now.',
          evidence: [evidence()],
        })}
      />,
    )
    expect(screen.getByText('The stated challenge.')).toBeInTheDocument()
    expect(screen.getByText('Where it is now.')).toBeInTheDocument()
    /* Sections with no copy leave no label behind. */
    expect(screen.queryByText(/where it started/i)).toBeNull()
    expect(screen.queryByText(/what changed/i)).toBeNull()
  })

  it('adds no journey CTA unless the project chose one', () => {
    const { container } = render(<ProjectDetail project={project({ evidence: [evidence()] })} />)
    expect(container.textContent).not.toMatch(/have a prototype\?/i)
  })

  it('uses the project-specific journey CTA when there is one', () => {
    render(
      <ProjectDetail
        project={project({
          evidence: [evidence()],
          journeyCta: {
            prompt: 'Have a prototype?',
            label: 'Continue development',
            href: '/start/prototype',
          },
        })}
      />,
    )
    const link = screen.getByRole('link', { name: /continue development/i })
    expect(link).toHaveAttribute('href', '/start/prototype')
  })
})

describe('illustrative material cannot pass as project evidence', () => {
  it('labels illustrative items in text, not by styling alone', () => {
    render(
      <ProjectDetail
        project={project({
          evidence: [
            evidence({ id: 'a', provenance: 'illustrative', title: 'Assembly concept' }),
          ],
        })}
      />,
    )
    expect(screen.getByText('Illustrative')).toBeInTheDocument()
    /* And says so in a full sentence, so the distinction survives being read
       aloud or skimmed. */
    expect(screen.getByText(/not a photograph of this project/i)).toBeInTheDocument()
  })

  it('marks a pending slot as awaiting evidence rather than showing nothing', () => {
    render(
      <ProjectDetail
        project={project({
          evidence: [evidence({ id: 'a', provenance: 'pending', title: 'Production samples' })],
        })}
      />,
    )
    expect(screen.getByText('Awaiting evidence')).toBeInTheDocument()
    expect(screen.getByText(/no evidence has been supplied/i)).toBeInTheDocument()
  })

  it('does not append a disclaimer to real evidence', () => {
    render(
      <ProjectDetail
        project={project({
          evidence: [evidence({ id: 'a', provenance: 'client-provided', title: 'Final unit' })],
        })}
      />,
    )
    expect(screen.getByText('Client provided')).toBeInTheDocument()
    expect(screen.queryByText(/not a photograph of this project/i)).toBeNull()
    expect(screen.queryByText(/no evidence has been supplied/i)).toBeNull()
  })

  it('states provenance for every item, whatever its kind', () => {
    render(
      <ProjectDetail
        project={project({
          evidence: [
            evidence({ id: 'a', stage: 'product', provenance: 'verified', title: 'Shipped unit' }),
            evidence({ id: 'b', stage: 'product', provenance: 'illustrative', title: 'Exploded view' }),
          ],
        })}
      />,
    )
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Illustrative')).toBeInTheDocument()
  })
})
