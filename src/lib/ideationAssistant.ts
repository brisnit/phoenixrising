/**
 * IDEATION ASSISTANT SEAM
 * -----------------------------------------------------------------------
 * The typed shape of the assistance Phase 9 will add. Nothing behind it.
 *
 * THERE IS NO AI IN THIS BUILD. No model, no endpoint, no key, no fake
 * responses, no thinking indicator. `askIdeationAssistant` returns
 * `available: false` and that is the only result it can return. The workspace
 * is deterministic and is meant to be useful exactly as it is — a page that
 * performs intelligence it does not have is worse than one that admits it has
 * none.
 *
 * THE PRINCIPLE THIS INTERFACE ENCODES: AI CAN SUGGEST. THE USER DECIDES.
 *
 * Note the return type. An assistant may propose `SuggestedUpdate`s, and each
 * one carries `requiresApproval: true` with no way to express otherwise. A
 * suggestion therefore cannot be written into the project context by the
 * assistant itself — the UI has to hand it to the visitor, who accepts it,
 * at which point it becomes `user-confirmed` rather than `ai`. That is a
 * structural guarantee rather than a convention someone has to remember.
 *
 * To connect a model later:
 *   const res = await fetch('/api/ideation-assistant', { ... })
 *   return { available: true, questions, explanation, suggestions }
 *
 * and update `workspaceIntro.privacy` in data/ideation.ts in the same commit —
 * the copy currently promises that nothing leaves the browser, which would
 * stop being true the moment this posts anywhere.
 */

import type { ProjectContext, Provenance } from '@/data/projectContext'

/** What a future assistant would be given. */
export type AssistantRequest = {
  context: ProjectContext
  /** Which workspace section the visitor is working in. */
  section: string
  /** Field ids with a usable value. */
  known: string[]
  /** Field ids with nothing, or explicitly marked not known. */
  unknown: string[]
  /** Reserved for Phase 9. Always empty here. */
  history: readonly { role: 'user' | 'assistant'; content: string }[]
}

/**
 * A proposed change to the project context.
 *
 * `requiresApproval` is `true` and cannot be `false`. An assistant may only
 * ever propose; the visitor is the one who decides whether a value becomes
 * part of their brief.
 */
export type SuggestedUpdate = {
  fieldId: string
  value: string | string[]
  /** Why the assistant thinks this — shown to the visitor before accepting. */
  rationale: string
  requiresApproval: true
  /** Always `ai` until a person accepts it. */
  provenance: Extract<Provenance, 'ai'>
}

export type AssistantResult =
  /* The only result this build can produce. */
  | { available: false; reason: string }
  /* Reserved for Phase 9. Nothing returns this yet. */
  | {
      available: true
      clarifyingQuestions: string[]
      explanation: string | null
      suggestions: SuggestedUpdate[]
    }

export async function askIdeationAssistant(request: AssistantRequest): Promise<AssistantResult> {
  /* Deliberately unused: there is nothing to send it to. It is accepted so
     that call sites are already correct on the day one is connected. */
  void request

  return {
    available: false,
    reason:
      'No assistant is connected. The workspace is deterministic and your information stays in this browser.',
  }
}

/**
 * Whether the UI may offer conversational assistance.
 *
 * Components branch on this rather than hard-coding absence, so Phase 9 turns
 * the affordance on in one place. While it is false, nothing in the interface
 * may suggest that an assistant exists.
 */
export const IDEATION_ASSISTANT_AVAILABLE = false
