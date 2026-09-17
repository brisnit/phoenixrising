/* ===========================================================================
 * KNOWLEDGE RETRIEVAL
 * ---------------------------------------------------------------------------
 * Deterministic retrieval over the approved corpus.
 *
 * NO VECTOR DATABASE. The corpus is roughly twenty entries. Embedding it would
 * add a dependency, a build step, an index to keep in sync and a class of
 * failure that is hard to debug — in exchange for worse behaviour than
 * keyword matching at this size. `KnowledgeRetriever` exists so semantic
 * retrieval can replace this implementation later without Ask Phoenix
 * knowing: the swap is one constructor argument.
 *
 * FAILS CLOSED. When nothing scores above the floor, this returns an empty
 * result rather than the least-bad entry. That is the important behaviour: an
 * empty result is what makes the model say "Phoenix Rising has not published
 * that", and a weak-but-nonzero match is exactly how a model ends up
 * confidently answering from irrelevant context.
 * ======================================================================== */

import { knowledgeCorpus, type KnowledgeEntry } from '@/data/knowledge'

export type RetrievalQuery = {
  text: string
  /** The public route the visitor asked from, if any. */
  route?: string
  /** Maximum entries to return. */
  limit?: number
}

export type RetrievalHit = {
  entry: KnowledgeEntry
  score: number
  /** Which query terms matched, for debugging and tests. */
  matched: string[]
}

export type RetrievalResult = {
  hits: RetrievalHit[]
  /** True when nothing cleared the floor — the model must not guess. */
  empty: boolean
}

export interface KnowledgeRetriever {
  retrieve(query: RetrievalQuery): RetrievalResult
}

/** Words carrying no retrieval signal in any question. */
const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'could', 'did', 'do', 'does',
  'for', 'from', 'get', 'got', 'has', 'have', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'just', 'me', 'my', 'of', 'on', 'or', 'our', 'so', 'some', 'tell', 'that', 'the', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'to', 'up', 'us', 'was', 'we', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would', 'you', 'your',
])

/**
 * The company's own name — a stop word ONLY when something else survives.
 *
 * In a corpus where every entry is about Phoenix Rising, the name appears in
 * most bodies and inflates every score by a similar amount, drowning the term
 * that actually discriminates: "Where is Phoenix Rising based?" once ranked
 * six unrelated entries above the geography entry.
 *
 * But stripping it unconditionally is worse. "What does Phoenix Rising do?"
 * is ALL stop words plus the name, so it normalised to nothing, retrieval
 * came back empty, and the model correctly refused to describe the company —
 * on the single most important question the site can be asked. Production
 * answered "That isn't something Phoenix Rising has published yet."
 *
 * So the name is dropped only when the question has other signal to offer,
 * and kept when it is all the signal there is.
 */
const COMPANY_NAME = new Set(['phoenix', 'rising'])

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    /* Keep letters, digits and internal hyphens; everything else is a break. */
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ''))
    .filter((t) => t.length > 1 && !STOP.has(t))
}

export function normalise(text: string): string[] {
  const tokens = tokenise(text)
  const withoutName = tokens.filter((t) => !COMPANY_NAME.has(t))
  return withoutName.length > 0 ? withoutName : tokens
}

/**
 * Minimum score an entry must reach to be returned at all.
 *
 * Tuned so a question about something Phoenix has never published — pricing,
 * factory counts, certification — returns nothing rather than the entry that
 * happens to share a common word.
 */
const SCORE_FLOOR = 2

const WEIGHT = {
  /** A term in the title is a strong signal. */
  title: 3,
  /** Explicit retrieval keywords are what they exist for. */
  keyword: 3,
  /** Body matches are the bulk of the signal but individually weak. */
  content: 1,
  /** Asked from a route this entry belongs to. */
  route: 2,
  /** Multi-word keyword phrase appearing intact in the question. */
  phrase: 4,
} as const

export class DeterministicRetriever implements KnowledgeRetriever {
  constructor(private readonly corpus: readonly KnowledgeEntry[] = knowledgeCorpus) {}

  retrieve({ text, route, limit = 4 }: RetrievalQuery): RetrievalResult {
    const terms = normalise(text)
    if (terms.length === 0) return { hits: [], empty: true }

    const lowered = text.toLowerCase()

    const scored = this.corpus.map((entry) => {
      const title = new Set(normalise(entry.title))
      const content = new Set(normalise(entry.content))
      const keywordTerms = new Set(entry.keywords.flatMap((k) => normalise(k)))

      let score = 0
      const matched: string[] = []

      for (const term of terms) {
        let hit = false
        if (title.has(term)) {
          score += WEIGHT.title
          hit = true
        }
        if (keywordTerms.has(term)) {
          score += WEIGHT.keyword
          hit = true
        }
        if (content.has(term)) {
          score += WEIGHT.content
          hit = true
        }
        if (hit) matched.push(term)
      }

      /* A multi-word keyword appearing intact ("fit review", "how we develop")
         is a far better signal than its words separately. */
      for (const keyword of entry.keywords) {
        if (keyword.includes(' ') && lowered.includes(keyword.toLowerCase())) {
          score += WEIGHT.phrase
          matched.push(keyword)
        }
      }

      /* Route weighting IMPROVES relevance; it never creates it. Applied only
         to entries that already matched, so opening the panel on /about
         cannot make an unrelated About entry answer a pricing question. */
      if (score > 0 && route && entry.routes.includes(route)) {
        score += WEIGHT.route
      }

      return { entry, score, matched: [...new Set(matched)] }
    })

    const hits = scored
      .filter((h) => h.score >= SCORE_FLOOR)
      .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
      .slice(0, limit)

    return { hits, empty: hits.length === 0 }
  }
}

export const defaultRetriever: KnowledgeRetriever = new DeterministicRetriever()
