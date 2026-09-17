# Phoenix Rising — architecture

The system as it exists at **`v2.0-phase9-ask-phoenix`**.

This is the authoritative internal document for how the site is put together and
which rules it is built to keep. `README.md` covers day-to-day conventions —
where copy lives, motion traps, colour, testing commands. This covers the
systems and the boundaries between them.

**Read [Before changing a core system](#before-changing-a-core-system) first if
you are about to touch anything below.**

---

## 1. Public experience

Sixteen routes. All static except `/api/ask-phoenix`.

| Route | Purpose | Where it sends people |
| --- | --- | --- |
| `/` | The thesis: a product has to work in two worlds — the market it serves and the factory that builds it. Capabilities, process, manufacturing reality, why-us, evidence, geography. | `/start`, `/capabilities`, `/how-we-develop`, `/about`, `/projects` |
| `/capabilities` | Four families — **Develop · Prototype · Produce · Deliver** — describing what has to happen to a product, not a service menu. | `/ideate`, `/start/prototype`, `/start/production` |
| `/how-we-develop` | The five-stage development model, the decisions between a design and a finished product, and quality as a thread rather than a gate. | `/ideate`, `/start/prototype`, `/start/production`, `/about` |
| `/projects` | An **evidence library**, not a portfolio. Currently empty, and says why. | `/ideate`, `/start/prototype`, `/start/production` |
| `/about` | Company story: *one product, two worlds*, California ↔ Guangzhou, and the bidirectional exchange between market and manufacturing. | `/start`, `/how-we-develop` |
| `/start` | Stage selector. Three journeys: idea, prototype, production. | `/ideate`, `/start/prototype`, `/start/production`, `/onboarding#fit-review` |
| `/start/prototype`, `/start/production` | Structured intake for each stage, ending in a browser-local summary. | `/contact`, `/onboarding` |
| `/onboarding` | What happens between "here is my project" and work starting: **Start → Fit review → Define the engagement → Onboard → Begin the work**. | `/start`, `/how-we-develop`, `/contact` |
| `/ideate` | The **ideation workspace**. Turns a rough idea into a project brief the visitor owns. | `/contact`, `/onboarding#fit-review` |
| `/contact` | The direct, human path. Deliberately separate from `/start` and never redirected into it. | — |
| `/insights`, `/insights/[slug]` | General engineering guidance. Makes no Phoenix-specific claims. | — |
| `/privacy`, `/terms` | Section scaffolding only. These are legal claims and need a lawyer, not generated boilerplate. | — |
| `/projects/[slug]` | Project detail template. Generates **no routes** — there are no published projects. | — |

**Ask Phoenix** is not a route. It is a panel backed by
`POST /api/ask-phoenix`, surfaced two ways:

- **Globally**, from an `Ask Phoenix` action in the header on every public
  route, opening a right-side drawer in `understand` mode.
- **Inside `/ideate`**, sharing the third column with the project brief, in
  project-aware `develop` mode with its own consent gate.

The two never appear together — see [§4](#surfaces).

### The intended journey

Discover the company → understand how it works → recognise your own stage →
either think the idea through (`/ideate`) or describe it (`/start`) → understand
what happens next (`/onboarding`) → talk to a person (`/contact`).

Two entry points exist on purpose and must stay distinct: **Start a project**
(`/start`) is the structured journey; **Contact** (`/contact`) is for anyone who
would rather just write to someone.

---

## 2. Product journey — live vs. future

```
IDEA
 └─ IDEATION WORKSPACE   ● live, browser-local
     └─ PROJECT BRIEF    ● live, browser-local, visitor-owned
         └─ FIT REVIEW           ○ future handoff — not connected
             └─ DEFINE ENGAGEMENT ○ human process, described only
                 └─ ONBOARD       ○ human process, described only
                     └─ DEVELOPMENT / PROTOTYPE / PRODUCTION  ○ described only
```

**Live today.** The workspace, the brief, the stage selector, both intakes, and
Ask Phoenix. All of it runs in the browser; the only server call is the model
request.

**Not connected.** Nothing the visitor writes is delivered to Phoenix Rising.
There is no submission, no queue, no record, no account, no portal, no payment.
`/onboarding` *describes* fit review and engagement as a human process — it does
not perform them.

Two seams exist, typed and deliberately unavailable:

| Seam | Constant | Behaviour |
| --- | --- | --- |
| `lib/requestFitReview.ts` | `FIT_REVIEW_AVAILABLE === false` | Returns the payload it *would* send, never a success |
| `lib/ideationAssistant.ts` | `IDEATION_ASSISTANT_AVAILABLE === false` | Superseded in practice by Ask Phoenix; retained as the typed suggestion contract |

`data/engagementLifecycle.ts` declares the six-state lifecycle (`draft` →
`ready-for-review` → `fit-review` → `engagement-definition` → `onboarding` →
`active`) as a **future-state model in its own file**. Only the first two are
reachable. A test walks every file in `src/app` and `src/components` and fails if
any of them imports it — a lifecycle value must never become a UI label, because
every value past the first asserts a process that has not happened.

---

## 3. Project context

One model, `data/projectContext.ts`, used by both tools.

```ts
type ProjectContext = {
  stage: ProjectStage | null           // 'idea' | 'prototype' | 'production'
  answers: Record<string, Answer>      // keyed by field id, sparse
  startedAt: string | null
  updatedAt: string | null
}

type Answer = {
  value: string | string[]
  provenance: Provenance
  state?: InformationState             // absent means 'known'
}
```

### Known / assumed / unknown

`InformationState` is `'known' | 'assumed' | 'unknown'`, and is **separate from
provenance on purpose**: *who said it* and *how sure they are* are different
questions. A visitor can supply a value while being explicit that it is a guess,
and the brief has to show that rather than flattening it into fact.

`unknown` is a recorded answer, not an absence. It appears in the brief as an
open item **and keeps the matching derived question alive** — saying "I don't
know" must never look like progress.

### Provenance

| Value | Produced today | Meaning |
| --- | --- | --- |
| `user` | yes | The visitor typed it |
| `user-confirmed` | yes | The visitor reviewed and accepted it — this is what an accepted AI suggestion becomes |
| `unknown` | yes | Recorded as not yet known |
| `ai` | **no** | Declared so a suggestion has somewhere truthful to live before approval |
| `phoenix-reviewed` | **no** | Declared for a future human review |

`PRODUCIBLE_PROVENANCE` names the three the product can create. Tests assert
nothing assigns `ai` or `phoenix-reviewed`.

### Session behaviour and reset boundaries

| Tool | Session key | Reset clears |
| --- | --- | --- |
| Ideation workspace | `phoenix-ideation` | Only that key |
| Stage intake | `phoenix-intake:prototype`, `phoenix-intake:production` | Not reachable from the workspace |
| Ask Phoenix conversation | none — React state only | Conversation only |

Session storage is per-tab and never leaves the browser. An **empty** ideation
context removes its key rather than writing an empty record, so a reset does not
leave a lingering claim that a draft exists.

Resets are scoped and must stay that way: clearing the workspace must not touch
intake answers, and clearing a conversation must not touch either.

### The user owns the brief

> **THE USER OWNS THE BRIEF.**

The project brief reproduces what the visitor wrote, **verbatim**. No
summarising, no rewording, no interpretation — all three would put words they
did not write into a document they may forward to an investor, a supplier or an
engineer.

AI may question, explain, organise and propose. Only visitor confirmation writes
to `ProjectContext`, and what it writes is recorded as `user-confirmed`.

---

## 4. Phoenix Intelligence

**Ask Phoenix** is the public interface. `data/site.ts` → `askPhoenix.enabled`
gates **rendering only**; the endpoint independently answers `503` when no
provider is configured, so a deployment missing a credential degrades to a
truthful "not connected" panel rather than a broken one.

### Surfaces

| | Global | Ideation |
| --- | --- | --- |
| Where | Header action on every public route | Third column of `/ideate`, beside the brief |
| Mode | `understand` | `develop` |
| Presentation | Right-side drawer (`sm+`), full screen below | Column panel (`lg+`), full-width surface below |
| Project context | **never** | only with explicit consent |
| Suggested updates | **never** — stripped server-side outside `develop` | Accept / Edit / Dismiss |
| Conversation | survives navigation; lives in the root layout | lives with the workspace |

**Exactly one panel is mounted at a time.** The global panel is rendered by
`AskPhoenixProvider` in the root layout — which is what lets a conversation
started on `/capabilities` still be there on `/how-we-develop` — and it is
suppressed entirely on routes listed in `OWNS_ITS_OWN_PANEL` (currently
`/ideate`). That suppression is a JS branch, not a CSS `hidden`: Phase 9
shipped two mounted panels at 768px, each with its own conversation and its own
opened event, and hiding one in CSS is what allowed it.

Tests assert instance **count**, not visible count.

#### Desktop

`Ask Phoenix` sits in the header action group beside `Start a project`, styled
one step quieter — an underlined text action next to a bordered button.
Starting a project is the conversion; this is the way to understand the company
first. It is a text action deliberately: a bubble, orb, sparkle or bot avatar
would say something untrue about what this is.

#### Tablet and mobile

The same text action stays in the header at every width — shortened to `Ask`
below `sm`, with the accessible name always the full `Ask Phoenix`. It is not
buried in the menu, though the fullscreen menu carries an entry too. Opening
from the menu closes the menu first: both are fullscreen below `xl`, and two
stacked overlays would trap focus in the wrong one.

#### Modal behaviour

`role="dialog"`, `aria-modal="true"`, background scroll locked, Escape closes,
focus moves to the panel on open and returns to the trigger on close. While
closed the panel stays mounted but `inert`, so the conversation survives
without the panel sitting in the tab order.

Focus return is an effect on the close, not a call inside the close handler:
calling `.focus()` there runs before React commits the state change, so the
focus trap is still listening and pulls focus straight back off the trigger.

Following a source link closes the panel so the page behind it is readable. The
conversation is **not** cleared — reopening shows the same exchange.

#### Global conversation state

The conversation follows the visitor across public routes for the browser
session, because the panel is mounted in the layout rather than per page. It is
React state only — nothing is written to storage and nothing survives a reload.
Page-aware starters read the **current** route, so a fresh conversation always
offers questions relevant to where the visitor is standing. Global
`understand` state and ideation `develop` state are separate objects in
separate components and never mix.

### Provider

| | |
| --- | --- |
| Provider | DeepSeek, via its OpenAI-compatible `/chat/completions` endpoint |
| Model | whatever `ASK_PHOENIX_MODEL` names — sent **verbatim**, never defaulted |
| Transport | direct `fetch`. No SDK, no AI framework |
| Mode | JSON mode, `temperature: 0.2`, no reasoning/extended-thinking field |

Environment variable **names** (values live in Vercel and nowhere else):

```
ASK_PHOENIX_API_KEY     server-only credential
ASK_PHOENIX_MODEL       model id, required — no key + no model means NO provider
ASK_PHOENIX_BASE_URL    API root; defaults to DeepSeek's documented endpoint
```

`ModelProvider` is the abstraction. DeepSeek-specific detail — endpoint path,
payload shape, envelope shape, `finish_reason` handling — lives only in
`DeepSeekProvider`. Another provider is a new class, not a rewrite.

A missing **model** fails closed as firmly as a missing key: guessing a model is
a cost and behaviour decision nobody made.

### Knowledge and retrieval

A **20-entry approved corpus** in `data/knowledge.ts`, derived from the same data
structures the site renders. Deterministic retrieval in
`lib/knowledge/retriever.ts` selects which entries a given request may use.

See [§7](#7-ai-knowledge-model) for why it is derived rather than scraped, and
why retrieval is deterministic.

### Phoenix-specific vs general knowledge

Every answer carries a `boundary`:

| Boundary | Meaning |
| --- | --- |
| `phoenix` | Grounded in retrieved approved knowledge |
| `general` | General product-development education — **not** a description of Phoenix's services |
| `mixed` | Both, with the parts distinguished in the answer |
| `unknown` | Phoenix has not published this; the answer says so |

The model may explain what a BOM is, what tooling means, or how a prototype
differs from production readiness. It may not let such an explanation read as a
Phoenix capability claim.

**No supporting knowledge means no Phoenix claim.** If retrieval comes back
empty and the model nonetheless returns `phoenix` or `mixed`, the handler
downgrades it to `unknown` and strips the sources — unsupported by definition.

### Structured output

Model replies are JSON, validated server-side against `AskPhoenixResponse`.
Prose is never parsed to decide application behaviour.

- Sources citing ids that were not retrieved are **dropped** — a model citing a
  page it was never given is inventing provenance.
- Suggestions naming fields that do not exist in the ideation schema are
  **dropped**.
- Suggestions are stripped entirely outside `develop` mode, whatever the model
  returns.
- Malformed output → `502`, never partially-applied state.

### Suggested-update workflow

```
AI SUGGESTS  →  VISITOR REVIEWS  →  ACCEPT / EDIT / DISMISS  →  ProjectContext
```

`requiresApproval` is the **literal type `true`**, not `boolean`. A suggestion
cannot be expressed in a form that skips the visitor.

| Action | Effect on ProjectContext and brief |
| --- | --- |
| Suggestion arrives | unchanged |
| Dismiss | unchanged |
| Edit without accepting | unchanged |
| **Accept** | writes the visitor-approved text, provenance `user-confirmed` |

### Source handling

Grounded answers show **From Phoenix Rising** with links to the real pages the
knowledge came from. Never internal file paths or implementation detail.

### Consent

Project context is sent **only** in `develop` mode and **only** after the visitor
turns on "Use my project notes" in the workspace. This is a server-side
guarantee, not a client promise: `parseAskRequest` discards project context
outright when the mode is not `develop`, so a general question cannot carry
project data whatever the client sends.

---

## 5. Trust boundaries

These are the rules the whole system exists to keep. Each is enforced by tests,
not by care.

| Rule | Where it is held |
| --- | --- |
| **No invented Phoenix facts** | Four approved facts in `approvedCompanyFacts`, each with a source. Retrieval fails closed; boundary downgrades on empty retrieval |
| **No pending facts published** | `pendingCompanyInformation` is never rendered and never imported by the corpus |
| **No quarantined claims** | `quarantinedClaims` is rendered nowhere; vocabulary banned in corpus and page copy |
| **No fabricated evidence** | Publishing is derived from provenance, not declared — see [§6](#6-evidence-model) |
| **No fabricated commercial terms** | No fee, rate, minimum, deposit, schedule, cancellation or refund policy anywhere; currency patterns banned by test |
| **No AI feasibility verdicts** | System instruction forbids conclusions on high-risk subjects; verified against the real model |
| **No silent ProjectContext modification** | Accept is the only write path; `requiresApproval: true` is a literal type |
| **No AI-authored brief content without confirmation** | Accepted text is recorded `user-confirmed`; the brief stays verbatim |
| **No client-side provider secrets** | Credential read only in `provider.ts`; never `NEXT_PUBLIC_`; verified absent from built bundles |
| **No ProjectContext outside develop mode** | Discarded in `parseAskRequest` before the provider is reached |
| **No ProjectContext without consent** | Panel sends it only when the visitor has enabled it |

Two supporting rules worth stating: **the visitor's message, their project
notes and retrieved knowledge are DATA, never instructions** — they arrive
fenced, in user messages, and cannot reach the system instruction. And **the
client cannot select** the provider, model, system prompt or knowledge;
`parseAskRequest` simply does not read such fields.

---

## 6. Evidence model

Introduced in Phase 6, in `data/projects.ts`.

```ts
type EvidenceProvenance =
  | 'verified' | 'client-provided' | 'phoenix-provided'   // real evidence
  | 'illustrative' | 'pending'                            // not evidence
```

**Publishing is derived, not declared.** `publishedProjects` filters on
`isPublishable`, which requires at least one evidence item whose provenance is
real. There is no `published: boolean` to flip, so a project cannot be published
by editing a flag.

Five evidence stages: **development · prototype · manufacturing · product ·
outcome**. A project renders only the stages it has. No empty headings.

Provenance renders as **text**, never colour or position alone, and anything that
is not real evidence additionally carries a full sentence saying so — on a
projects page, a coded technical plate is the thing most likely to be mistaken
for proof.

### What can and cannot become public evidence

**Can:** a photograph, drawing, sample, CAD export or documented decision with a
named source and permission to publish.

**Cannot:** generated SVG plates, stock imagery, placeholder narrative, an
outcome without substantiation, a metric without its source, a client name or
testimonial without written approval.

**Current state: zero published projects, zero testimonials.** Round 1's four
placeholder case studies were removed rather than dressed up. `/projects`
explains the standard instead of implying a body of work.

---

## 7. AI knowledge model

### How information becomes eligible

An entry in `knowledgeCorpus` is eligible. Nothing else is. Each carries
`id`, `topic`, `title`, `content`, `source` (label + route), `verification`,
`routes` and `keywords`.

`verification` has exactly two values: `approved` (a client-confirmed fact —
only the company-facts entry) and `published` (something the site states about
how it works). There is deliberately no third value; anything that would need one
does not belong in the corpus.

### Why derived, not scraped

The corpus is built **from the same data structures the site renders**, not from
rendered HTML and not hand-copied.

- **Hand-copying drifts.** Copy changes, the corpus does not, and the model keeps
  confidently stating something the site no longer says — invisibly.
- **Rendered HTML carries everything**, including placeholder markers, internal
  notes, navigation chrome and anything a future page happens to include.

Deriving it means the corpus cannot describe a Phoenix Rising that does not exist
on the page.

**Exclusion is by import boundary, not filtering.** `knowledge.ts` imports none
of `pendingCompanyInformation`, `quarantinedClaims`, `claimDispositions`,
`projectContentRequest`, `ENGAGEMENT_LIFECYCLE` or placeholder contact details —
you cannot forget to filter what you never imported. A test asserts those
identifiers never appear in the file.

### `KnowledgeRetriever`

```ts
interface KnowledgeRetriever {
  retrieve(query: { text: string; route?: string; limit?: number }): RetrievalResult
}
```

`DeterministicRetriever` scores on term matches in title (3), keywords (3) and
content (1), a multi-word keyword phrase appearing intact (4), and a route match
(2) applied only to entries that already matched — route weighting improves
relevance, it never creates it. Entries below `SCORE_FLOOR` are discarded.

**Why deterministic, not vectors.** At twenty entries, embeddings would add a
dependency, a build step, an index to keep in sync and a class of failure that is
hard to debug — in exchange for worse behaviour than keyword matching at this
size. The interface exists so semantic retrieval can replace this implementation
without Ask Phoenix knowing: the swap is one constructor argument.

**It fails closed.** No match returns empty rather than the least-bad entry. An
empty result is what makes the model say Phoenix has not published something; a
weak-but-nonzero match is how a model ends up answering confidently from
irrelevant context.

One subtlety worth keeping: the company's own name is dropped from a query
**only when other terms survive**. It appears in most entries, so it inflates
every score equally and drowns the discriminating term — but stripping it
unconditionally left *"What does Phoenix Rising do?"* with zero terms, and
production answered that Phoenix had not published it.

---

## 8. Session and data model

Everything a visitor writes stays in their browser.

| Data | Where it lives | Leaves the browser? |
| --- | --- | --- |
| Ideation answers and brief | `sessionStorage['phoenix-ideation']` | Only as Ask Phoenix context, in `develop` mode, with consent |
| Stage intake answers | `sessionStorage['phoenix-intake:<stage>']` | **Never** |
| Ask Phoenix conversation | React state only | Sent as conversation history with each request |

Stated plainly, because each has been a source of confusion:

- **Ideation data is not automatically received by Phoenix Rising.** The brief is
  the visitor's document. Copy Brief exists precisely because submission is not
  connected.
- **Phase 3 intake is not automatically received by Phoenix Rising.** The
  completion screen says so, and offers `/contact` as the real action.
- **Ask Phoenix conversation state is not a Phoenix project record.** It is not
  stored server-side, not associated with anyone, and ends with the tab.
- **Resetting the AI conversation does not reset `ProjectContext`.**
- **Resetting the workspace does not touch intake context**, and the reset copy
  says so.

---

## 9. Server architecture

`POST /api/ask-phoenix` — the only server endpoint in the project. Everything
else is static.

Pipeline order matters: **size → shape → provider → retrieval → model →
validation.** A malformed or oversized request never reaches a paid endpoint.

| Control | Value |
| --- | --- |
| Request body | 32,000 bytes — rejected by `content-length` before reading |
| Single message | 2,000 characters |
| Conversation history | 12 turns; older turns dropped, not rejected |
| Project context | 40 fields, 1,500 characters per value |
| Output tokens | **1,600** |
| Server timeout | 25s (`AbortController`) |
| Client timeout | 30s |
| Caching | `cache-control: no-store` |
| Methods | `POST` only; `GET` → 405 |

**Status codes:** `400` malformed · `413` too large · `502` upstream or
malformed model output · `503` not configured · `504` timeout.

**Errors are sanitised.** The provider's response body — which can contain the
API key on a 401 — is captured for internal detail and discarded before the
response. No stack traces, no filesystem paths, no provider detail reaches a
visitor. Tests assert a planted key never appears in a response.

Truncation is reported distinctly from upstream failure: the provider reads
`finish_reason` and returns `truncated` when our own ceiling clipped the reply.
That distinction is what turned "malformed output" from a mystery into a
diagnosable condition.

---

## 10. Known production hardening

### Durable rate limiting is not yet implemented

There is **no durable application-level rate limiting** on `/api/ask-phoenix`.

The per-request limits above bound the cost of any *single* call. They do not
bound how many calls one client can make.

**Why per-instance counters would not fix it.** On Vercel's serverless model each
invocation may run in a fresh instance, instances are created and destroyed
freely, and several can run concurrently. An in-memory counter is therefore
per-instance and per-lifetime: it resets constantly and is trivially bypassed by
concurrency. Shipping one would create the *appearance* of protection without the
substance, which is worse than the documented gap.

Real protection needs shared state or an edge layer — Vercel KV, Upstash, or WAF
rules. That is a deliberate infrastructure decision, not something to improvise.

**Do not implement this without deciding the infrastructure first.**

### Low priority: consent-panel density

In the desktop ideation layout, Ask Phoenix occupies a 3-of-12 column. The
project-consent block takes enough vertical space that only one conversation
starter is visible before scrolling. It is legible, reachable, keyboard-operable
and free of overflow at all six breakpoints — so this is a refinement, not a
defect. A wider panel, or making the consent block collapsible once answered,
would improve it.

---

## 11. Checkpoint history

| Tag | What it marks |
| --- | --- |
| `v2.0-phase0-guardrails` | Rename, claim quarantine, accessibility tokens |
| `v2.0-phase1-positioning` | Customer ↔ Product ↔ Factory positioning |
| `v2.0-phase2-ia` | Information architecture, navigation, routing |
| `v2.0-phase3-stages` | Stage selector and the three visitor journeys |
| `v2.0-phase4-process` | Five-stage development model, manufacturing reality |
| `v2.0-phase5-company-story` | Company story, California ↔ Guangzhou, About |
| `v2.0-phase6-evidence` | Capability families, evidence model, global CTA fix |
| `v2.0-phase7-onboarding` | Fit review, engagement path, testimonial removal |
| `v2.0-phase8-ideation` | The ideation workspace |
| `v2.0-phase9-ask-phoenix` | Ask Phoenix, connected to DeepSeek |

### The Phase 5 tag

`v2.0-phase5-company-story` points at **`2741e35`**. The immediate
content-integrity correction that followed it — `ee6df56`, which stopped the
About page publishing the internal company-gap list — is a **separate commit
after the tag**, and the tag was deliberately **not moved**.

This is recorded because it looks like an oversight and is not. A checkpoint tag
marks what was actually shipped and verified at that moment. Moving it would have
hidden that the defect existed and that production verification is what caught
it. The history is more useful truthful than tidy.

---

## Before changing a core system

Work touching any of the following must start by understanding the architecture
above **and the standing regression tests** that protect it:

`ProjectContext` · evidence · claims · knowledge · Ask Phoenix · Ideation ·
Fit Review · routing · session persistence · AI provider behaviour

> **Tests are part of the product contract, not cleanup.**

Most of the tests in this repository do not check that code works. They check
that the product does not start claiming things that are not true — that a
removed capability stays removed, that an unconfirmed fact stays unpublished,
that a suggestion cannot write itself into someone's brief. A test that fails
after a change is usually telling you the change crossed a boundary, not that the
test is stale.

Three habits this codebase was built on, each learned from a real defect:

1. **Verify against the rendered page, not the passing test.** Every phase found
   defects that tests did not: a composer pushed outside its own panel, a
   duplicate component, a panel unreachable below 1024px, a heading colliding
   with the fixed header.
2. **A zero-sample measurement is a failure, not a pass.** Expectation is derived
   from the viewport, never from whether the thing happened to occur. A sweep
   that finds nothing must fail loudly.
3. **Prove a regression test fails against the defect** before accepting the fix.

If a boundary genuinely needs to move, change it deliberately: update the rule,
update the test, and say so in the commit message. Do not weaken an assertion to
make a build green.
