import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageIntakeForm } from '@/components/sections/intake/StageIntakeForm'
import { prototypeIntake, productionIntake } from '@/data/intake'

beforeEach(() => {
  try {
    sessionStorage.clear()
  } catch {
    /* not available in every environment */
  }
})

describe('StageIntakeForm — structure', () => {
  it('renders choice groups as real fieldsets with legends', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={productionIntake} />)

    await user.type(screen.getByLabelText(/^name/i), 'Test Person')
    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.type(screen.getByRole('textbox', { name: /product/i }), 'A moulded enclosure')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const group = screen.getByRole('group', { name: /production status/i })
    expect(group.tagName).toBe('FIELDSET')
    expect(within(group).getAllByRole('radio').length).toBeGreaterThan(3)
  })

  it('shows progress and the current step position', () => {
    render(<StageIntakeForm definition={prototypeIntake} />)
    expect(screen.getByRole('navigation', { name: /progress/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /about you/i })).toBeInTheDocument()
  })
})

describe('StageIntakeForm — validation', () => {
  it('blocks progress and associates the error with the field', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={prototypeIntake} />)

    await user.click(screen.getByRole('button', { name: /continue/i }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)
    /* Still on step one — the form did not advance past a missing required
       answer. */
    expect(screen.getByRole('heading', { level: 2, name: /about you/i })).toBeInTheDocument()

    const email = screen.getByLabelText(/^email/i)
    expect(email).toHaveAttribute('aria-invalid', 'true')
  })

  it('clears an error as soon as the visitor corrects it', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={prototypeIntake} />)

    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)

    await user.type(screen.getByLabelText(/^name/i), 'Test Person')
    const nameField = screen.getByLabelText(/^name/i)
    expect(nameField).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('rejects a malformed email with a specific message', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={prototypeIntake} />)

    await user.type(screen.getByLabelText(/^name/i), 'Test Person')
    await user.type(screen.getByLabelText(/^email/i), 'nope')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByText(/does not look like an email/i)).toBeInTheDocument()
  })
})

describe('StageIntakeForm — review and edit', () => {
  async function completeSteps(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^name/i), 'Test Person')
    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.type(screen.getByLabelText(/what are you developing/i), 'A sealed handheld device')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.click(screen.getByRole('radio', { name: /functional prototype/i }))
    await user.click(screen.getByRole('checkbox', { name: /^cad files$/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.click(screen.getByRole('button', { name: /review/i }))
  }

  it('summarises the answers and marks what was left open', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={prototypeIntake} />)
    await completeSteps(user)

    expect(screen.getByRole('heading', { name: /does this look right/i })).toBeInTheDocument()
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    expect(screen.getByText('A sealed handheld device')).toBeInTheDocument()
    expect(screen.getByText('Functional prototype')).toBeInTheDocument()
    /* Unanswered optional fields are shown as not provided, not as blanks. */
    expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0)
  })

  it('returns to a single section without restarting the intake', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={prototypeIntake} />)
    await completeSteps(user)

    await user.click(screen.getByRole('button', { name: /edit the product/i }))

    /* Landed on that step with the earlier answer intact. */
    expect(screen.getByRole('heading', { level: 2, name: /the product/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/what are you developing/i)).toHaveValue(
      'A sealed handheld device',
    )
  })

  it('never claims the project was sent', async () => {
    const user = userEvent.setup()
    render(<StageIntakeForm definition={prototypeIntake} />)
    await completeSteps(user)
    await user.click(screen.getByRole('button', { name: /that looks right/i }))

    expect(await screen.findByText(/summary is ready/i)).toBeInTheDocument()
    expect(screen.getByText(/isn't connected yet|has not reached/i)).toBeInTheDocument()

    const body = document.body.textContent ?? ''
    for (const forbidden of [
      'we have it',
      'we received',
      'submitted to phoenix',
      'has been delivered',
      'thank you, we have',
    ]) {
      expect(body.toLowerCase(), `completion copy claims "${forbidden}"`).not.toContain(forbidden)
    }
  })
})
