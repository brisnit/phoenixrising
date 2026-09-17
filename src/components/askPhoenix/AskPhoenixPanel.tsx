'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { askPhoenixCopy, startersFor } from '@/data/askPhoenix'
import { askPhoenix } from '@/lib/askPhoenix/client'
import type {
  AskMode,
  AskPhoenixResponse,
  AskProjectContext,
  AskSuggestedUpdate,
  AskTurn,
} from '@/lib/askPhoenix/schema'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * Ask Phoenix — a workbench, not a chat bubble.
 *
 * Rendered as a substantial panel: a right-hand column on a wide screen, a
 * full surface on a narrow one. There is no floating orb, no sparkle and no
 * assistant avatar, because none of those would say anything true about what
 * this is.
 *
 * WHAT IT WILL NOT DO
 * It does not stream a typing indicator while nothing is happening, and it
 * has no "thinking" state that is not an actual in-flight request. When the
 * model is unreachable — which, with no provider configured, is always — it
 * says so and offers the deterministic routes that answer the same questions.
 *
 * Suggested updates are rendered as proposals with Accept / Edit / Dismiss.
 * The panel never writes to the project context itself; `onAccept` is the
 * workspace's own handler, and it is the only path to a write.
 */
export function AskPhoenixPanel({
  route,
  mode = 'understand',
  project = null,
  projectConsent,
  onToggleProjectConsent,
  onAcceptSuggestion,
  onClose,
  onSourceNavigate,
  className,
}: {
  route: string
  mode?: AskMode
  project?: AskProjectContext | null
  /** Only meaningful in develop mode. */
  projectConsent?: boolean
  onToggleProjectConsent?: () => void
  onAcceptSuggestion?: (update: AskSuggestedUpdate, value: string) => void
  onClose?: () => void
  /** Called when a source link is followed, so a modal host can step aside. */
  onSourceNavigate?: () => void
  className?: string
}) {
  const [turns, setTurns] = useState<AskTurn[]>([])
  const [answers, setAnswers] = useState<Record<number, AskPhoenixResponse>>({})
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<{ kind: 'not-configured' | 'error'; message: string } | null>(
    null,
  )
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [announcement, setAnnouncement] = useState('')

  const composerId = useId()
  const logRef = useRef<HTMLDivElement>(null)
  const opened = useRef(false)

  useEffect(() => {
    if (opened.current) return
    opened.current = true
    track({ name: 'ASK_PHOENIX_OPENED', route, mode })
  }, [route, mode])

  /* Keep the newest exchange in view without yanking focus from the composer.
     
     Optional-called: scrolling is an enhancement, and an environment without
     `Element.scrollTo` (jsdom, and some embedded browsers) must not take the
     whole panel down with it. */
  useEffect(() => {
    const log = logRef.current
    log?.scrollTo?.({ top: log.scrollHeight })
  }, [turns.length, pending])

  const send = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || pending) return

      setDraft('')
      setFailure(null)
      setPending(true)
      const history = turns
      setTurns((t) => [...t, { role: 'user', content: message }])

      const outcome = await askPhoenix({
        message,
        mode,
        route,
        history,
        /* The consent gate. Project notes travel only when the visitor has
           turned this on, in the workspace, deliberately. */
        project: mode === 'develop' && projectConsent ? project : null,
      })

      setPending(false)

      if (!outcome.ok) {
        setFailure({ kind: outcome.kind, message: outcome.message })
        setAnnouncement(outcome.message)
        return
      }

      setTurns((t) => {
        const next = [...t, { role: 'assistant' as const, content: outcome.response.answer }]
        setAnswers((a) => ({ ...a, [next.length - 1]: outcome.response }))
        return next
      })
      setAnnouncement('Ask Phoenix answered.')
    },
    [mode, pending, project, projectConsent, route, turns],
  )

  const reset = () => {
    /* Clears the conversation ONLY. The workspace and the project brief are
       a different thing and are not touched — §15. */
    setTurns([])
    setAnswers({})
    setFailure(null)
    setDismissed(new Set())
    setEditing({})
    setAnnouncement('Conversation cleared.')
  }

  const starterList = startersFor(route)

  return (
    <section
      aria-label={askPhoenixCopy.title}
      data-ask-phoenix
      className={cn('flex h-full flex-col bg-paper', className)}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* --- Header ------------------------------------------------------ */}
      <div className="flex items-start justify-between gap-4 border-b rule-light px-6 py-5">
        <div>
          <h2 className="font-display text-h3 font-medium uppercase tracking-[-0.02em]">
            {askPhoenixCopy.title}
          </h2>
          <p className="mt-1 max-w-[42ch] text-sm leading-relaxed text-slate">
            {askPhoenixCopy.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {turns.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="label-mono border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
            >
              {askPhoenixCopy.newConversation}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={askPhoenixCopy.close}
              className="label-mono border border-ink/25 px-2.5 py-1.5 transition-colors hover:border-cyan hover:text-blue"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* --- Project consent, workspace only ----------------------------- */}
      {mode === 'develop' && onToggleProjectConsent && (
        <div className="max-h-[38%] shrink-0 overflow-y-auto border-b rule-light px-6 py-4">
          <p className="label-mono text-slate">{askPhoenixCopy.projectConsent.label}</p>
          <p className="mt-2 max-w-[54ch] text-[0.9rem] leading-relaxed text-steel/85">
            {askPhoenixCopy.projectConsent.body}
          </p>
          <button
            type="button"
            aria-pressed={!!projectConsent}
            onClick={() => {
              if (!projectConsent) track({ name: 'IDEATION_AI_CONTEXT_ENABLED' })
              onToggleProjectConsent()
            }}
            className={cn(
              'label-mono mt-3 border px-3 py-1.5 transition-colors',
              projectConsent
                ? 'border-blue bg-blue/10 text-blue'
                : 'border-ink/25 text-slate hover:border-cyan hover:text-blue',
            )}
          >
            {projectConsent
              ? askPhoenixCopy.projectConsent.enabled
              : askPhoenixCopy.projectConsent.enable}
          </button>
        </div>
      )}

      {/* --- Conversation ------------------------------------------------ */}
      {/* `min-h-0` is load-bearing. A flex child that scrolls will not shrink
          below its content height without it, so at a short viewport the
          conversation kept its natural height and pushed the composer out of
          the panel entirely — measured at 1024x768 with the Send button 105px
          below the fold and unclickable. */}
      <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {turns.length === 0 && !failure && (
          <div>
            <p className="label-mono text-slate">Try asking</p>
            <ul className="mt-4 grid gap-2">
              {starterList.map((starter) => (
                <li key={starter}>
                  <button
                    type="button"
                    onClick={() => send(starter)}
                    className="w-full border rule-light px-4 py-3 text-left text-[0.95rem] leading-relaxed transition-colors hover:border-cyan hover:text-blue"
                  >
                    {starter}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[48ch] text-sm text-slate">{askPhoenixCopy.persistence}</p>
          </div>
        )}

        <ol className="grid gap-6">
          {turns.map((turn, i) => {
            const response = answers[i]
            return (
              <li key={i} data-turn={turn.role}>
                {turn.role === 'user' ? (
                  <p className="ml-auto max-w-[44ch] border-l-2 border-blue/40 bg-paper-2 px-4 py-3 text-[0.98rem] leading-relaxed text-ink">
                    {turn.content}
                  </p>
                ) : (
                  <div>
                    <p className="max-w-[58ch] whitespace-pre-line text-[0.98rem] leading-relaxed text-ink">
                      {turn.content}
                    </p>

                    {response && (
                      <>
                        {/* Boundary: what kind of answer this is. Always text. */}
                        <p className="label-mono mt-4 text-slate" data-boundary={response.boundary}>
                          {askPhoenixCopy.boundaryLabel[response.boundary]}
                        </p>

                        {response.knowledgeSources.length > 0 && (
                          <div className="mt-3">
                            <p className="label-mono text-slate">{askPhoenixCopy.sourcesLabel}</p>
                            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                              {response.knowledgeSources.map((s) => (
                                <li key={s.id}>
                                  <Link
                                    href={s.route}
                                    onClick={() => {
                                      track({ name: 'ASK_PHOENIX_SOURCE_OPENED', sourceId: s.id })
                                      /* The conversation is NOT cleared — the
                                         panel stays mounted, so reopening it
                                         shows the same exchange. */
                                      onSourceNavigate?.()
                                    }}
                                    className="label-mono border-b border-ink/25 pb-0.5 transition-colors hover:border-cyan hover:text-blue"
                                  >
                                    {s.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {response.suggestedUpdates
                          .filter((u) => !dismissed.has(u.fieldId))
                          .map((update) => (
                            <Suggestion
                              key={update.fieldId}
                              update={update}
                              draft={editing[update.fieldId]}
                              onEdit={(v) =>
                                setEditing((e) => ({ ...e, [update.fieldId]: v }))
                              }
                              onAccept={(value) => {
                                onAcceptSuggestion?.(update, value)
                                track({
                                  name: 'IDEATION_SUGGESTION_ACCEPTED',
                                  fieldId: update.fieldId,
                                })
                                setDismissed((d) => new Set(d).add(update.fieldId))
                                setAnnouncement(askPhoenixCopy.suggestion.accepted)
                              }}
                              onDismiss={() => {
                                track({
                                  name: 'IDEATION_SUGGESTION_DISMISSED',
                                  fieldId: update.fieldId,
                                })
                                setDismissed((d) => new Set(d).add(update.fieldId))
                              }}
                            />
                          ))}

                        {response.suggestedQuestions.length > 0 && (
                          <ul className="mt-5 grid gap-2">
                            {response.suggestedQuestions.map((q) => (
                              <li key={q}>
                                <button
                                  type="button"
                                  onClick={() => send(q)}
                                  className="label-mono border-b border-ink/25 pb-1 text-left transition-colors hover:border-cyan hover:text-blue"
                                >
                                  {q}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        {pending && (
          /* A real in-flight state, not a performance. */
          <p className="mt-6 label-mono text-slate">Working…</p>
        )}

        {failure && (
          <div className="mt-6 border-l-2 border-blue/40 pl-5" data-ask-failure={failure.kind}>
            <p className="font-display text-[1.1rem] font-medium tracking-[-0.01em]">
              {failure.kind === 'not-configured'
                ? askPhoenixCopy.unavailable.title
                : askPhoenixCopy.error.title}
            </p>
            <p className="mt-2 max-w-[52ch] text-[0.95rem] leading-relaxed text-steel/85">
              {failure.kind === 'not-configured'
                ? askPhoenixCopy.unavailable.body
                : askPhoenixCopy.error.body}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {askPhoenixCopy.unavailable.routes.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="label-mono border-b border-ink/25 pb-0.5 transition-colors hover:border-cyan hover:text-blue"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --- Composer ---------------------------------------------------- */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
        }}
        className="border-t rule-light px-6 py-5"
      >
        <label htmlFor={composerId} className="sr-only">
          {askPhoenixCopy.placeholder}
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id={composerId}
            rows={2}
            value={draft}
            disabled={pending}
            placeholder={askPhoenixCopy.placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              /* Enter sends; Shift+Enter is a newline. */
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(draft)
              }
            }}
            className="w-full resize-none border border-ink/20 bg-transparent px-4 py-3 text-[0.98rem] leading-relaxed outline-none transition-colors placeholder:text-slate/70 focus-visible:border-blue"
          />
          <button
            type="submit"
            disabled={pending || draft.trim().length === 0}
            className="label-mono shrink-0 border border-ink px-4 py-3 transition-colors hover:border-cyan hover:text-blue disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-slate"
          >
            {askPhoenixCopy.send}
          </button>
        </div>
      </form>
    </section>
  )
}

/**
 * One proposed update.
 *
 * Renders as a proposal, never as a change. The visitor accepts it as written,
 * edits it first, or dismisses it — and only the accept path calls back into
 * the workspace.
 */
function Suggestion({
  update,
  draft,
  onEdit,
  onAccept,
  onDismiss,
}: {
  update: AskSuggestedUpdate
  draft: string | undefined
  onEdit: (value: string) => void
  onAccept: (value: string) => void
  onDismiss: () => void
}) {
  const [open, setOpen] = useState(false)
  const value = draft ?? update.value
  const id = useId()

  return (
    <div className="mt-5 border border-ink/20 p-4" data-suggestion={update.fieldId}>
      <p className="label-mono text-blue">{askPhoenixCopy.suggestion.label}</p>
      <p className="label-mono mt-2 text-slate">
        {askPhoenixCopy.suggestion.target}: {update.label}
      </p>

      {open ? (
        <>
          <label htmlFor={id} className="sr-only">
            {update.label}
          </label>
          <textarea
            id={id}
            rows={4}
            value={value}
            onChange={(e) => onEdit(e.target.value)}
            className="mt-3 w-full resize-y border border-ink/20 bg-transparent px-3 py-2 text-[0.95rem] leading-relaxed outline-none focus-visible:border-blue"
          />
        </>
      ) : (
        <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink">{value}</p>
      )}

      {update.rationale && (
        <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-slate">{update.rationale}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onAccept(value)}
          className="label-mono border border-ink px-3 py-1.5 transition-colors hover:border-cyan hover:text-blue"
        >
          {askPhoenixCopy.suggestion.accept}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v)
            if (!open) track({ name: 'IDEATION_SUGGESTION_EDITED', fieldId: update.fieldId })
          }}
          className="label-mono border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
        >
          {askPhoenixCopy.suggestion.edit}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="label-mono border-b border-ink/25 pb-1 text-slate transition-colors hover:border-cyan hover:text-blue"
        >
          {askPhoenixCopy.suggestion.dismiss}
        </button>
      </div>

      <p className="mt-3 text-sm text-slate">{askPhoenixCopy.suggestion.note}</p>
    </div>
  )
}
