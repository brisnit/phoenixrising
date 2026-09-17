import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdeationWorkspace } from '@/components/ideation/IdeationWorkspace'

/**
 * The workspace, driven the way a person drives it.
 *
 * These are behaviour tests rather than markup assertions: the questions that
 * matter are whether work survives moving around, whether "I don't know" is
 * treated as an answer, and whether resetting destroys only what it should.
 */

const start = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<IdeationWorkspace />)
  await user.click(screen.getByRole('button', { name: /start with the idea/i }))
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('entering the workspace', () => {
  it('states the local-session promise before anything is typed', () => {
    render(<IdeationWorkspace />)
    expect(screen.getByText(/stays in this browser session/i)).toBeInTheDocument()
    expect(screen.getByText(/phoenix rising cannot see it/i)).toBeInTheDocument()
  })

  it('opens on the first section', async () => {
    const user = userEvent.setup()
    await start(user)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/what are you thinking/i)
  })
})

describe('the live brief', () => {
  it('fills in as the visitor writes', async () => {
    const user = userEvent.setup()
    await start(user)

    const rail = screen.getAllByLabelText(/project brief — so far/i)[0]
    expect(within(rail).getAllByText(/nothing recorded here yet/i).length).toBeGreaterThan(0)

    await user.type(screen.getByLabelText('The idea'), 'A portable espresso maker')
    expect(within(rail).getByText(/a portable espresso maker/i)).toBeInTheDocument()
  })

  it('counts areas and questions, never a score', async () => {
    const user = userEvent.setup()
    await start(user)
    const rail = screen.getAllByLabelText(/project brief — so far/i)[0]
    const counts = within(rail).getByText(/areas explored/i)
    expect(counts).toHaveTextContent(/\d+ of \d+ areas explored/)
    expect(counts).toHaveTextContent(/questions? to resolve/)
    expect(counts.textContent ?? '').not.toMatch(/%|score|ready/i)
  })
})

describe('unknown is an answer, not an error', () => {
  it('records it and disables the input', async () => {
    const user = userEvent.setup()
    await start(user)
    /* Move to Problem, whose fields can be marked not-yet-known. */
    await user.click(screen.getByRole('button', { name: /^continue$/i }))
    const unknowns = screen.getAllByRole('button', { name: /i don’t know yet/i })
    await user.click(unknowns[0])

    expect(unknowns[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/recorded as not yet known/i)).toBeInTheDocument()
  })

  it('shows it in the brief as an open item rather than hiding it', async () => {
    const user = userEvent.setup()
    await start(user)
    const unknowns = screen.getAllByRole('button', { name: /i don’t know yet/i })
    await user.click(unknowns[0])

    const rail = screen.getAllByLabelText(/project brief — so far/i)[0]
    expect(within(rail).getByText(/not yet known/i)).toBeInTheDocument()
  })
})

describe('moving around preserves work', () => {
  it('keeps an answer when the visitor navigates away and back', async () => {
    const user = userEvent.setup()
    await start(user)

    await user.type(screen.getByLabelText('The idea'), 'A portable espresso maker')
    await user.click(screen.getByRole('button', { name: /04.*product/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/what does it/i)

    await user.click(screen.getByRole('button', { name: /01.*idea/i }))
    expect(screen.getByLabelText('The idea')).toHaveValue('A portable espresso maker')
  })

  it('marks the current section for assistive technology', async () => {
    const user = userEvent.setup()
    await start(user)
    expect(screen.getByRole('button', { name: /01.*idea/i })).toHaveAttribute(
      'aria-current',
      'step',
    )
    await user.click(screen.getByRole('button', { name: /03.*person/i }))
    expect(screen.getByRole('button', { name: /03.*person/i })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByRole('button', { name: /01.*idea/i })).not.toHaveAttribute('aria-current')
  })
})

describe('the brief is not a dead end', () => {
  it('reaches the brief and returns to a section to edit', async () => {
    const user = userEvent.setup()
    await start(user)
    await user.type(screen.getByLabelText('The idea'), 'A portable espresso maker')

    await user.click(screen.getByRole('button', { name: /view project brief/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/your idea/i)
    expect(screen.getByText('A portable espresso maker')).toBeInTheDocument()

    /* Jump back, change it, and the brief must reflect the change. */
    const ideaSection = screen.getByText('The idea', { selector: 'h2' }).closest('section')!
    await user.click(within(ideaSection).getByRole('button', { name: /edit this/i }))

    const field = screen.getByLabelText('The idea')
    await user.clear(field)
    await user.type(field, 'A hand-pumped espresso maker')

    await user.click(screen.getByRole('button', { name: /view project brief/i }))
    expect(screen.getByText('A hand-pumped espresso maker')).toBeInTheDocument()
    expect(screen.queryByText('A portable espresso maker')).not.toBeInTheDocument()
  })

  it('never claims the brief was submitted', async () => {
    const user = userEvent.setup()
    await start(user)
    await user.click(screen.getByRole('button', { name: /view project brief/i }))

    expect(screen.getByText(/has not received this brief/i)).toBeInTheDocument()
    expect(screen.getByText(/no review has started/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact phoenix rising/i })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('lists questions derived from what is missing', async () => {
    const user = userEvent.setup()
    await start(user)
    await user.click(screen.getByRole('button', { name: /view project brief/i }))

    expect(screen.getByText(/who is the primary user\?/i)).toBeInTheDocument()
    expect(screen.getByText(/what production volume/i)).toBeInTheDocument()
  })
})

describe('reset', () => {
  it('asks before destroying anything', async () => {
    const user = userEvent.setup()
    await start(user)
    await user.type(screen.getByLabelText('The idea'), 'A portable espresso maker')
    await user.click(screen.getByRole('button', { name: /view project brief/i }))

    await user.click(screen.getByRole('button', { name: /reset workspace/i }))
    expect(screen.getByText(/clear this workspace\?/i)).toBeInTheDocument()

    /* Backing out must leave the work alone. */
    await user.click(screen.getByRole('button', { name: /keep my work/i }))
    expect(screen.getByText('A portable espresso maker')).toBeInTheDocument()
  })

  it('clears only the ideation session key', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('phoenix-intake:prototype', '{"keep":"me"}')

    await start(user)
    await user.type(screen.getByLabelText('The idea'), 'A portable espresso maker')
    await user.click(screen.getByRole('button', { name: /view project brief/i }))
    await user.click(screen.getByRole('button', { name: /reset workspace/i }))
    await user.click(screen.getByRole('button', { name: /clear the workspace/i }))

    expect(sessionStorage.getItem('phoenix-ideation')).toBeNull()
    /* The Phase 3 intake is a different tool and must survive untouched. */
    expect(sessionStorage.getItem('phoenix-intake:prototype')).toBe('{"keep":"me"}')
  })

  it('explains that /start information is unaffected', async () => {
    const user = userEvent.setup()
    await start(user)
    await user.click(screen.getByRole('button', { name: /view project brief/i }))
    await user.click(screen.getByRole('button', { name: /reset workspace/i }))
    expect(screen.getByText(/is separate and is not affected/i)).toBeInTheDocument()
  })
})

describe('session persistence', () => {
  it('offers to continue a draft left in this tab', async () => {
    const user = userEvent.setup()
    await start(user)
    await user.type(screen.getByLabelText('The idea'), 'A portable espresso maker')

    /* Simulate returning to the route. */
    const stored = sessionStorage.getItem('phoenix-ideation')
    expect(stored).toContain('A portable espresso maker')

    render(<IdeationWorkspace />)
    expect(
      await screen.findByRole('button', { name: /continue where you left off/i }),
    ).toBeInTheDocument()
  })
})
