'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IdeationField } from './IdeationField'
import { BriefRail } from './BriefRail'
import { ProjectBriefView } from './ProjectBriefView'
import { AskPhoenixPanel } from '@/components/askPhoenix/AskPhoenixPanel'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { AnimatedHeadline } from '@/components/motion/AnimatedHeadline'
import {
  ideationSections,
  resetCopy,
  workspaceIntro,
  type IdeationSection,
} from '@/data/ideation'
import { buildBrief, briefToText, hasIdeationContent } from '@/data/ideationBrief'
import {
  createProjectContext,
  deserialiseProjectContext,
  serialiseProjectContext,
  setAnswer,
  type InformationState,
  type ProjectContext,
} from '@/data/projectContext'
import { askPhoenix as askPhoenixConfig } from '@/data/site'
import { answerState } from '@/data/projectContext'
import { buildBrief as buildBriefForAsk } from '@/data/ideationBrief'
import { allIdeationFields } from '@/data/ideation'
import type { AskProjectContext, AskSuggestedUpdate } from '@/lib/askPhoenix/schema'
import { cn } from '@/lib/utils'

/**
 * Session key, scoped to ideation.
 *
 * Deliberately distinct from `phoenix-intake:*`, which holds the Phase 3
 * project context. Reset clears only this key — wiping a visitor's /start
 * answers because they reset a different tool would be a real data loss, and
 * §26 calls it out specifically.
 */
const STORAGE_KEY = 'phoenix-ideation'

type Phase = 'intro' | 'working' | 'brief'

/**
 * The ideation workspace.
 *
 * Three columns on a wide screen: navigation, the thinking surface, and the
 * brief assembling itself on the right. One column on a narrow one, with the
 * brief reachable as a separate view rather than crushed into a third of the
 * width.
 *
 * Everything is local. The context lives in React state, is mirrored into
 * sessionStorage for reloads, and goes nowhere else. There is no assistant,
 * no scoring and no submission — see `lib/ideationAssistant.ts` for the seam
 * Phase 9 will use.
 */
export function IdeationWorkspace() {
  const [context, setContext] = useState<ProjectContext>(() => createProjectContext('idea'))
  const [phase, setPhase] = useState<Phase>('intro')
  const [sectionIndex, setSectionIndex] = useState(0)
  const [resuming, setResuming] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [mobileBrief, setMobileBrief] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  /* Third column: the brief, or Ask Phoenix. Never four columns. */
  const [rail, setRail] = useState<'brief' | 'ask'>('brief')
  /* §16 — project notes travel only after the visitor turns this on. */
  const [projectConsent, setProjectConsent] = useState(false)

  const headingRef = useRef<HTMLDivElement>(null)
  const resetRef = useRef<HTMLDivElement>(null)
  const hydrated = useRef(false)

  const section: IdeationSection = ideationSections[sectionIndex]
  const brief = useMemo(() => buildBrief(context), [context])

  /* Restore this tab's work, if any. */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const restored = deserialiseProjectContext(JSON.parse(raw))
        if (hasIdeationContent(restored)) {
          setContext(restored)
          setResuming(true)
        }
      }
    } catch {
      /* Private mode or blocked storage — the workspace works without it. */
    }
    hydrated.current = true
  }, [])

  /* Mirror to the session.
     
     Skipped until hydration so an empty initial state cannot overwrite
     restored work on first render.
     
     An EMPTY context removes the key rather than writing an empty record.
     Without that, resetting left `{"answers":[]}` behind: `doReset` removed
     the key and this effect — reacting to the new empty context — immediately
     wrote it back. The data was gone either way, but a lingering key is a
     lingering claim that there is a draft here. */
  useEffect(() => {
    if (!hydrated.current) return
    try {
      if (hasIdeationContent(context)) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serialiseProjectContext(context)))
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      /* Not being able to persist is not a reason to fail. */
    }
  }, [context])

  /* Move focus to the section heading on change, so keyboard and screen
     reader users are taken to the new content rather than left behind. */
  const [focusToken, setFocusToken] = useState(0)
  useEffect(() => {
    if (focusToken === 0) return
    headingRef.current?.focus()
  }, [focusToken])

  useEffect(() => {
    if (!confirmingReset) return
    resetRef.current?.focus()
  }, [confirmingReset])

  const update = useCallback((id: string, value: string | string[]) => {
    setContext((current) => setAnswer(current, id, value))
  }, [])

  const updateState = useCallback((id: string, state: InformationState | undefined) => {
    setContext((current) => {
      const existing = current.answers[id]
      if (state === 'unknown') {
        /* Unknown is recorded, not erased — the brief shows it as an open
           item, which is more useful than a silent gap. */
        return setAnswer(current, id, 'Not yet known', 'user', 'unknown')
      }
      const value = existing && existing.state !== 'unknown' ? existing.value : ''
      if (!value || (Array.isArray(value) ? value.length === 0 : value.trim() === '')) {
        const next = { ...current.answers }
        delete next[id]
        return { ...current, answers: next, updatedAt: new Date().toISOString() }
      }
      return setAnswer(current, id, value, 'user', state)
    })
  }, [])

  /**
   * The project context Ask Phoenix may see.
   *
   * Built here rather than sending the raw ProjectContext: this is a
   * deliberate projection containing only what a question about the project
   * needs — field labels, values, settledness and the open questions. No
   * timestamps, no serialised internals, and nothing from the Phase 3 intake,
   * which is a different tool with its own session key.
   */
  const askContext = useCallback((): AskProjectContext => {
    const built = buildBriefForAsk(context)
    return {
      section: section.id,
      answers: Object.entries(context.answers).map(([id, answer]) => ({
        id,
        label: allIdeationFields.find((f) => f.id === id)?.label ?? id,
        value: Array.isArray(answer.value) ? answer.value.join(', ') : answer.value,
        state: answerState(answer),
      })),
      openQuestions: built.questions.map((q) => q.question),
    }
  }, [context, section.id])

  /**
   * The ONLY path from a model suggestion into the project context.
   *
   * Reached from the panel's Accept button and nowhere else. The provenance
   * is `user-confirmed`, not `ai`: by the time a value lands here a person has
   * read it and chosen it, possibly after editing it, and the brief records
   * whose decision that was.
   */
  const acceptSuggestion = useCallback((update: AskSuggestedUpdate, value: string) => {
    setContext((current) => setAnswer(current, update.fieldId, value, 'user-confirmed'))
    setAnnouncement(`Added to your brief: ${update.label}`)
  }, [])

  const goToSection = useCallback((index: number) => {
    setSectionIndex(index)
    setPhase('working')
    setMobileBrief(false)
    setFocusToken((n) => n + 1)
  }, [])

  const jumpToSectionId = useCallback(
    (id: string) => {
      const index = ideationSections.findIndex((s) => s.id === id)
      goToSection(index >= 0 ? index : 0)
    },
    [goToSection],
  )

  const copyBrief = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(briefToText(context))
      setAnnouncement('Brief copied to clipboard')
      return true
    } catch {
      setAnnouncement('Could not copy automatically — select the brief text to copy it manually')
      return false
    }
  }, [context])

  const doReset = useCallback(() => {
    setContext(createProjectContext('idea'))
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* Nothing to clear if storage was never available. */
    }
    setConfirmingReset(false)
    setSectionIndex(0)
    setPhase('intro')
    setResuming(false)
    setAnnouncement('Workspace cleared')
  }, [])

  /* ------------------------------------------------------------- INTRO */
  if (phase === 'intro') {
    return (
      <section data-tone="light" className="bg-paper" data-workspace-phase="intro">
        <Announcer message={announcement} />
        <div className="container-rule py-(--spacing-section)">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-8">{workspaceIntro.eyebrow}</Eyebrow>
              <AnimatedHeadline
                as="h1"
                lines={workspaceIntro.lines}
                immediate
                className="text-h1 font-semibold uppercase"
                lineClassName={[undefined, 'text-slate']}
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
              <p className="text-lead max-w-[46ch] text-steel/85">{workspaceIntro.lead}</p>
            </div>
          </div>

          {/* §25 — visible, brief, and true. */}
          <div className="mt-12 max-w-[64ch] border-l-2 border-blue/40 pl-6">
            <p className="label-mono text-slate">{workspaceIntro.privacy.label}</p>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-steel/85">
              {workspaceIntro.privacy.body}
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <MagneticButton type="button" variant="solid" onClick={() => goToSection(0)}>
              {resuming ? workspaceIntro.resume : workspaceIntro.start}
            </MagneticButton>
            {resuming && (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="label-mono border-b border-ink/25 pb-2 text-slate transition-colors hover:border-cyan hover:text-blue"
              >
                {resetCopy.action}
              </button>
            )}
          </div>

          {confirmingReset && (
            <ResetConfirm
              ref={resetRef}
              onCancel={() => setConfirmingReset(false)}
              onConfirm={doReset}
            />
          )}

          <ol className="mt-16 grid gap-x-8 gap-y-6 border-t rule-light pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {ideationSections.map((s) => (
              <li key={s.id}>
                <p className="label-mono text-blue">{s.index}</p>
                <p className="mt-2 font-display text-[1.05rem] font-medium uppercase tracking-[-0.01em]">
                  {s.nav}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  /* -------------------------------------------------------------- BRIEF */
  if (phase === 'brief') {
    return (
      <section data-tone="light" className="bg-paper" data-workspace-phase="brief">
        <Announcer message={announcement} />
        <div className="container-rule pt-[104px] sm:pt-[124px]">
          <button
            type="button"
            onClick={() => goToSection(sectionIndex)}
            className="label-mono border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
          >
            ← Back to the workspace
          </button>
        </div>
        <ProjectBriefView brief={brief} onJump={jumpToSectionId} onCopy={copyBrief} />
        <div className="container-rule pb-(--spacing-section)">
          <div className="border-t rule-light pt-8">
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="label-mono text-slate underline decoration-slate/40 underline-offset-4 transition-colors hover:text-blue"
            >
              {resetCopy.action}
            </button>
            {confirmingReset && (
              <ResetConfirm
                ref={resetRef}
                onCancel={() => setConfirmingReset(false)}
                onConfirm={doReset}
              />
            )}
          </div>
        </div>
      </section>
    )
  }

  /* ------------------------------------------------------------ WORKING */
  return (
    <section data-tone="light" className="bg-paper" data-workspace-phase="working">
      <Announcer message={announcement} />
      {/* The header is fixed and overlays the page, so the workspace has to
          clear it explicitly — unlike every other route, this one has no hero
          band absorbing that space. */}
      <div className="container-rule pb-16 pt-[104px] sm:pt-[124px]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* --- Navigation --------------------------------------------- */}
          {/* Order: on a phone the thinking surface comes first. The section
              list is useful but it is not what someone arrived to do, and in
              source order it filled the entire first screen before the prompt.
              Desktop places columns by grid position, so ordering is reset. */}
          <nav aria-label="Workspace sections" className="order-2 lg:order-none lg:col-span-2">
            <div className="lg:sticky lg:top-[14vh]">
              <p className="label-mono text-slate">Sections</p>
              <ol className="mt-4 grid gap-1">
                {ideationSections.map((s, i) => {
                  const current = i === sectionIndex
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        data-nav-section={s.id}
                        aria-current={current ? 'step' : undefined}
                        onClick={() => goToSection(i)}
                        className={cn(
                          'flex w-full items-baseline gap-2 border-l-2 py-1.5 pl-3 text-left text-[0.9rem] transition-colors',
                          current
                            ? 'border-blue font-medium text-ink'
                            : 'border-ink/12 text-slate hover:border-cyan hover:text-blue',
                        )}
                      >
                        <span className="label-mono">{s.index}</span>
                        {s.nav}
                      </button>
                    </li>
                  )
                })}
              </ol>

              <button
                type="button"
                onClick={() => {
                  setPhase('brief')
                  setFocusToken((n) => n + 1)
                }}
                className="label-mono mt-6 w-full border border-ink/25 px-3 py-2 text-left transition-colors hover:border-cyan hover:text-blue"
              >
                View project brief
              </button>
            </div>
          </nav>

          {/* --- Thinking surface --------------------------------------- */}
          <div className="order-1 lg:order-none lg:col-span-6 lg:col-start-4">
            <div ref={headingRef} tabIndex={-1} className="outline-none">
              <p className="label-mono text-blue">
                {section.index} / {String(ideationSections.length).padStart(2, '0')} — {section.nav}
              </p>
              <h1 className="mt-4 text-h2 font-semibold uppercase">
                {section.prompt[0]} <span className="text-slate">{section.prompt[1]}</span>
              </h1>
              <p className="text-lead mt-5 max-w-[52ch] text-steel/85">{section.lead}</p>
            </div>

            <div className="mt-12 grid gap-10">
              {section.fields.map((field) => (
                <IdeationField
                  key={field.id}
                  field={field}
                  answer={context.answers[field.id]}
                  onChange={(value) => update(field.id, value)}
                  onState={(state) => updateState(field.id, state)}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4 border-t rule-light pt-8">
              {sectionIndex > 0 && (
                <button
                  type="button"
                  onClick={() => goToSection(sectionIndex - 1)}
                  className="label-mono border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue"
                >
                  Back
                </button>
              )}
              {sectionIndex < ideationSections.length - 1 ? (
                <MagneticButton
                  type="button"
                  variant="solid"
                  onClick={() => goToSection(sectionIndex + 1)}
                >
                  Continue
                </MagneticButton>
              ) : (
                <MagneticButton
                  type="button"
                  variant="solid"
                  onClick={() => {
                    setPhase('brief')
                    setFocusToken((n) => n + 1)
                  }}
                >
                  See the project brief
                </MagneticButton>
              )}

              {/* Brief as a separate view on narrow screens — never a third
                  column crushed into a phone. */}
              <button
                type="button"
                onClick={() => setMobileBrief((v) => !v)}
                aria-expanded={mobileBrief}
                className="label-mono ml-auto border-b border-ink/25 pb-2 transition-colors hover:border-cyan hover:text-blue lg:hidden"
              >
                {mobileBrief ? 'Hide brief' : 'Brief so far'}
              </button>
            </div>

            {mobileBrief && (
              <BriefRail
                brief={brief}
                onJump={jumpToSectionId}
                className="mt-10 border-l-0 pl-0 lg:hidden"
              />
            )}
          </div>

          {/* --- Third column: brief OR Ask Phoenix, never both -------- */}
          <div className="order-3 hidden lg:order-none lg:col-span-3 lg:col-start-10 lg:block">
            <div className="lg:sticky lg:top-[14vh]">
              {askPhoenixConfig.enabled && (
                <div className="mb-4 flex gap-2" role="tablist" aria-label="Workspace panel">
                  {(['brief', 'ask'] as const).map((which) => (
                    <button
                      key={which}
                      type="button"
                      role="tab"
                      aria-selected={rail === which}
                      onClick={() => setRail(which)}
                      className={cn(
                        'label-mono border px-3 py-1.5 transition-colors',
                        rail === which
                          ? 'border-blue bg-blue/10 text-blue'
                          : 'border-ink/25 text-slate hover:border-cyan hover:text-blue',
                      )}
                    >
                      {which === 'brief' ? 'Brief' : 'Ask Phoenix'}
                    </button>
                  ))}
                </div>
              )}

              {/* Both are kept mounted: switching panels must never cost the
                  visitor their conversation or their place in the brief. */}
              <div hidden={askPhoenixConfig.enabled && rail !== 'brief'}>
                <BriefRail brief={brief} onJump={jumpToSectionId} />
              </div>
              {askPhoenixConfig.enabled && (
                <div hidden={rail !== 'ask'} className="h-[70vh] border rule-light">
                  <AskPhoenixPanel
                    route="/ideate"
                    mode="develop"
                    project={askContext()}
                    projectConsent={projectConsent}
                    onToggleProjectConsent={() => setProjectConsent((v) => !v)}
                    onAcceptSuggestion={acceptSuggestion}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * One polite live region for the whole workspace.
 *
 * Discrete events only — clipboard results, reset. The brief rail is
 * deliberately not live; announcing it would read the document back on every
 * keystroke.
 */
function Announcer({ message }: { message: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  )
}

function ResetConfirm({
  ref,
  onCancel,
  onConfirm,
}: {
  ref: React.RefObject<HTMLDivElement | null>
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={resetCopy.title}
      data-reset-confirm
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel()
      }}
      className="mt-8 max-w-[64ch] border border-ink/20 p-6 outline-none"
    >
      <p className="font-display text-h3 font-medium tracking-[-0.02em]">{resetCopy.title}</p>
      <p className="mt-3 text-[0.98rem] leading-relaxed text-steel/85">{resetCopy.body}</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onConfirm}
          className="label-mono border border-ink px-4 py-2 transition-colors hover:border-cyan hover:text-blue"
        >
          {resetCopy.confirm}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="label-mono border-b border-ink/25 pb-1 transition-colors hover:border-cyan hover:text-blue"
        >
          {resetCopy.cancel}
        </button>
      </div>
    </div>
  )
}
