import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { AskPhoenixPanel } from '@/components/askPhoenix/AskPhoenixPanel'
import { askPhoenix as askPhoenixConfig } from '@/data/site'

/**
 * The Ask Phoenix panel, driven the way a visitor drives it.
 *
 * The suggestion lifecycle is the important part. A model proposing text is
 * fine; a model's text silently appearing in someone's project brief is not.
 * These assert that Accept is the only path that calls back, that Dismiss and
 * Edit-without-Accept call back never, and that clearing the conversation
 * leaves the project alone.
 */

const suggestionResponse = {
  answer: 'Camping use suggests some questions about temperature and cleaning.',
  boundary: 'general',
  knowledgeSources: [],
  suggestedQuestions: [],
  suggestedUpdates: [
    {
      fieldId: 'person.environment',
      label: 'Where it gets used',
      value: 'Outdoors, in campsites and while travelling.',
      rationale: 'You mentioned camping.',
      requiresApproval: true,
    },
  ],
}

const groundedResponse = {
  answer: 'Phoenix Rising works between product development and manufacturing.',
  boundary: 'phoenix',
  knowledgeSources: [{ id: 'what-phoenix-does', label: 'Home', route: '/' }],
  suggestedQuestions: ['Can I start with just an idea?'],
  suggestedUpdates: [],
}

const mockFetch = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch(200, groundedResponse))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the feature flag', () => {
  it('is enabled now that a provider is connected and evaluated', () => {
    /* Flipped in Phase 9 after the real evaluation was run and read. The flag
       gates RENDERING; the endpoint independently answers 503 without a
       credential, so a deployment missing one degrades to a truthful "not
       connected" panel rather than a broken one. */
    expect(askPhoenixConfig.enabled).toBe(true)
  })

  it('is only rendered by the workspace when the flag is on', () => {
    const source = readFileSync('src/components/ideation/IdeationWorkspace.tsx', 'utf8')
    expect(source).toMatch(/askPhoenixConfig\.enabled && \(?\s*<AskPhoenixPanel|askPhoenixConfig\.enabled &&/)
  })
})

describe('asking a question', () => {
  it('shows page-aware starters and sends one', async () => {
    const user = userEvent.setup()
    render(<AskPhoenixPanel route="/onboarding" />)

    const starter = screen.getByRole('button', { name: /what is a fit review\?/i })
    await user.click(starter)

    await waitFor(() =>
      expect(screen.getByText(/works between product development/i)).toBeInTheDocument(),
    )
  })

  it('labels what kind of answer it gave, in words', async () => {
    const user = userEvent.setup()
    render(<AskPhoenixPanel route="/" />)
    await user.type(screen.getByLabelText(/ask a question/i), 'What do you do?')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    await waitFor(() =>
      expect(screen.getByText(/based on what phoenix rising has published/i)).toBeInTheDocument(),
    )
    /* Sources are links to real pages, not internal file references. */
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('says plainly when it is not connected, and offers real routes', async () => {
    vi.stubGlobal('fetch', mockFetch(503, { error: 'not-configured' }))
    const user = userEvent.setup()
    render(<AskPhoenixPanel route="/" />)
    await user.type(screen.getByLabelText(/ask a question/i), 'Anything?')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    /* Scoped to the failure block: the same sentence is also announced from
       the polite live region, which is deliberate, not a duplicate. */
    const block = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-ask-failure="not-configured"]')
      if (!el) throw new Error('no failure block yet')
      return el
    })
    expect(within(block).getByText(/not connected yet/i)).toBeInTheDocument()
    expect(within(block).getByRole('link', { name: /how we develop products/i })).toBeInTheDocument()
    expect(within(block).getByRole('link', { name: /contact phoenix rising/i })).toBeInTheDocument()
  })

  it('survives an upstream failure without losing the conversation', async () => {
    vi.stubGlobal('fetch', mockFetch(502, { error: 'upstream' }))
    const user = userEvent.setup()
    render(<AskPhoenixPanel route="/" />)
    await user.type(screen.getByLabelText(/ask a question/i), 'My question')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    await waitFor(() =>
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument(),
    )
    /* What the visitor asked is still on screen. */
    expect(screen.getByText('My question')).toBeInTheDocument()
  })
})

describe('the project-context consent gate', () => {
  it('is off by default and sends no project data', async () => {
    const fetchSpy = mockFetch(200, groundedResponse)
    vi.stubGlobal('fetch', fetchSpy)
    const user = userEvent.setup()

    render(
      <AskPhoenixPanel
        route="/ideate"
        mode="develop"
        project={{
          section: 'idea',
          answers: [{ id: 'idea.description', label: 'The idea', value: 'MY-SECRET', state: 'known' }],
          openQuestions: [],
        }}
        projectConsent={false}
        onToggleProjectConsent={() => {}}
      />,
    )

    await user.type(screen.getByLabelText(/ask a question/i), 'What am I missing?')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
    const sent = String(fetchSpy.mock.calls[0][1].body)
    expect(sent, 'project notes were sent without consent').not.toContain('MY-SECRET')
  })

  it('explains what turning it on does', () => {
    render(
      <AskPhoenixPanel route="/ideate" mode="develop" projectConsent={false} onToggleProjectConsent={() => {}} />,
    )
    expect(screen.getByText(/needs to send what you have written/i)).toBeInTheDocument()
    expect(screen.getByText(/nothing is sent until you turn this on/i)).toBeInTheDocument()
  })

  it('sends project notes once consent is given', async () => {
    const fetchSpy = mockFetch(200, groundedResponse)
    vi.stubGlobal('fetch', fetchSpy)
    const user = userEvent.setup()

    render(
      <AskPhoenixPanel
        route="/ideate"
        mode="develop"
        project={{
          section: 'idea',
          answers: [{ id: 'idea.description', label: 'The idea', value: 'MY-SECRET', state: 'known' }],
          openQuestions: [],
        }}
        projectConsent
        onToggleProjectConsent={() => {}}
      />,
    )

    await user.type(screen.getByLabelText(/ask a question/i), 'What am I missing?')
    await user.click(screen.getByRole('button', { name: /^send$/i }))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
    expect(String(fetchSpy.mock.calls[0][1].body)).toContain('MY-SECRET')
  })
})

describe('suggested updates require the visitor', () => {
  const renderWithSuggestion = async (onAccept = vi.fn()) => {
    vi.stubGlobal('fetch', mockFetch(200, suggestionResponse))
    const user = userEvent.setup()
    render(
      <AskPhoenixPanel
        route="/ideate"
        mode="develop"
        projectConsent
        onToggleProjectConsent={() => {}}
        onAcceptSuggestion={onAccept}
      />,
    )
    await user.type(screen.getByLabelText(/ask a question/i), 'It is for camping')
    await user.click(screen.getByRole('button', { name: /^send$/i }))
    await waitFor(() => expect(screen.getByText(/suggested update/i)).toBeInTheDocument())
    return { user, onAccept }
  }

  it('shows a proposal, and says nothing is added without approval', async () => {
    const { onAccept } = await renderWithSuggestion()
    expect(screen.getByText(/where it gets used/i)).toBeInTheDocument()
    expect(screen.getByText(/nothing is added to your brief unless you accept it/i)).toBeInTheDocument()
    /* Arriving is not accepting. */
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('writes nothing when dismissed', async () => {
    const { user, onAccept } = await renderWithSuggestion()
    await user.click(screen.getByRole('button', { name: /^dismiss$/i }))
    expect(onAccept).not.toHaveBeenCalled()
    expect(screen.queryByText(/suggested update/i)).not.toBeInTheDocument()
  })

  it('writes nothing when merely edited', async () => {
    const { user, onAccept } = await renderWithSuggestion()
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    const box = screen.getByRole('textbox', { name: /where it gets used/i })
    await user.clear(box)
    await user.type(box, 'Rewritten by me')
    /* Editing is not accepting either. */
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('writes only on accept, with whatever the visitor edited it to', async () => {
    const { user, onAccept } = await renderWithSuggestion()
    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    const box = screen.getByRole('textbox', { name: /where it gets used/i })
    await user.clear(box)
    await user.type(box, 'Rewritten by me')
    await user.click(screen.getByRole('button', { name: /^accept$/i }))

    expect(onAccept).toHaveBeenCalledTimes(1)
    const [update, value] = onAccept.mock.calls[0]
    expect(update.fieldId).toBe('person.environment')
    expect(value).toBe('Rewritten by me')
  })

  it('accepts the proposal as written when it is not edited', async () => {
    const { user, onAccept } = await renderWithSuggestion()
    await user.click(screen.getByRole('button', { name: /^accept$/i }))
    expect(onAccept.mock.calls[0][1]).toBe('Outdoors, in campsites and while travelling.')
  })
})

describe('clearing the conversation', () => {
  it('leaves the project alone', async () => {
    const onAccept = vi.fn()
    vi.stubGlobal('fetch', mockFetch(200, suggestionResponse))
    const user = userEvent.setup()
    render(
      <AskPhoenixPanel
        route="/ideate"
        mode="develop"
        projectConsent
        onToggleProjectConsent={() => {}}
        onAcceptSuggestion={onAccept}
      />,
    )
    await user.type(screen.getByLabelText(/ask a question/i), 'It is for camping')
    await user.click(screen.getByRole('button', { name: /^send$/i }))
    await waitFor(() => expect(screen.getByText(/suggested update/i)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /new conversation/i }))

    expect(screen.queryByText(/suggested update/i)).not.toBeInTheDocument()
    /* Resetting a conversation must never reach into the project. */
    expect(onAccept).not.toHaveBeenCalled()
    expect(screen.getByText(/try asking/i)).toBeInTheDocument()
  })
})

describe('the workspace writes accepted suggestions as the visitor’s own', () => {
  it('records provenance as user-confirmed, never ai', () => {
    const source = readFileSync('src/components/ideation/IdeationWorkspace.tsx', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
    /* The accept handler is the only path from a suggestion into context, and
       by the time it runs a person has read and chosen the text. */
    expect(source).toMatch(/setAnswer\(current, update\.fieldId, value, 'user-confirmed'\)/)
    expect(source).not.toMatch(/'ai'/)
  })
})
