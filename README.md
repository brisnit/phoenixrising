# Phoenix Rising

Marketing site for Phoenix Rising — product development, engineering, prototyping, sourcing and manufacturing.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger.

**System architecture and trust boundaries: [`ARCHITECTURE.md`](ARCHITECTURE.md).**
Read it before changing ProjectContext, evidence, claims, knowledge, Ask
Phoenix, Ideation, Fit Review, routing, session persistence or AI provider
behaviour. This file covers day-to-day conventions; that one covers the systems
and the rules they are built to keep.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build

npm run verify     # typecheck + lint + unit tests + build
npm test           # unit + component (Vitest)
npm run test:e2e   # browser regression + a11y (Playwright, 4 breakpoints)
```

---

## Testing

Round 1 shipped six real defects past a green typecheck, lint and production
build — masked headings that never revealed, a button whose label rendered
white-on-white, pinned sections taller than the viewport, colliding SVG ids.
None were detectable without rendering the page and measuring it. That is what
this suite is for.

| Suite | Runner | Covers |
| --- | --- | --- |
| `tests/unit` | Vitest | Claim guard, company naming, content-integrity rules, the approved-fact ledger |
| `tests/component` | Vitest + Testing Library | Unverified/placeholder markers render visibly |
| `tests/e2e/audit.spec.ts` | Playwright | Horizontal overflow, dangling ARIA refs, duplicate ids, unresolved SVG paint refs, stuck reveals, heading count, console/page errors — every route × 4 breakpoints |
| `tests/e2e/motion.spec.ts` | Playwright | Masked-line resting positions, reduced motion, the no-bundle failsafe, pinned-section viewport fit, ScrollTrigger cleanup across navigation |
| `tests/e2e/process-timeline.spec.ts` | Playwright | The pinned timeline never loses a legible stage — swept finely at settled positions, during slow and fast scrolling, after client-side navigation, and across a resize |
| `tests/e2e/routing.spec.ts` | Playwright | Redirects, canonical routes, no internal links to retired paths, nav/footer architecture |
| `tests/e2e/a11y.spec.ts` | Playwright + axe | WCAG 2.1 A/AA per route, keyboard operability, mobile menu focus management |
| `tests/e2e/company-story.spec.ts` | Playwright | The California ↔ Guangzhou frame holds, advances through both directions and fits its viewport — direct and navigated-in — and the whole story survives with motion off |

Breakpoints: **1440 · 1280 · 1512×790 · 1024 · 768 · 375**. The short-laptop
height exists because pinned sections express their scroll ranges and band
heights in viewport units, so height is a real axis of failure, not just width. 1024 matters most for pinned
sections — it is the shortest viewport where the desktop layout is active, and
where pinned content is most likely to overflow.

Elements marked `data-decorative="true"` are excluded from the contrast sweep.
These are oversized watermark numerals and background words whose content is
also present in readable form nearby — WCAG 1.4.3's "pure decoration"
exemption. The exemption is declared in `tests/e2e/a11y.spec.ts` rather than
applied silently.

---

## Where the content lives

**All editable copy is in `src/data/`. No component hard-codes marketing text.**

| File | Contains |
| --- | --- |
| `site.ts` | Company, contact, social, navigation, hero, statement, why-us pillars, reality section, final CTA, SEO |
| `capabilities.ts` | The four capability families, the claim dispositions and the quarantine ledger |
| `process.ts` | The five development stages, the quality principle, the homepage preview |
| `spaceBetween.ts` | The decisions between a design and a finished product |
| `projects.ts` | The evidence model, the (currently empty) project list and the internal content request |
| `testimonials.ts` | Client quotes |
| `insights.ts` | Articles (`/insights` and `/insights/[slug]`) |
| `company.ts` | About page, the California ↔ Guangzhou story, the approved-fact ledger and the founder seam |
| `contactForm.ts` | Intake form fields, stage/volume/budget options |
| `shells.ts` | Copy for routes whose experience arrives in a later phase |

Changing a headline, adding a project or reordering the process is a data edit, not a component edit.

---

## ⚠️ Placeholder inventory — read before launch

Nothing in this site claims a fact about Phoenix Rising that was not supplied. Anything unverified is marked `placeholder: true` in the data layer and, where a visitor could otherwise mistake it for real, is labelled in the interface too.

```bash
grep -rn "placeholder: true" src/data     # everything awaiting real content
```

### Company facts

Phoenix Rising has supplied exactly four facts about itself. They are recorded
with their sources in `approvedCompanyFacts` (`src/data/company.ts`), and
`pendingCompanyInformation` records everything the About page would need and
does not have. Both are asserted by tests, so no fact can reach the page
without being added to the ledger first.

```bash
grep -n "approvedCompanyFacts\|pendingCompanyInformation" -A20 src/data/company.ts
```

### Capability claims — all dispositioned

Round 1 asserted technical capabilities inferred from a reference site rather
than supplied by Phoenix Rising. Phase 0 quarantined nine; Phases 1 and 4
removed four as their sections were retired. **Phase 6 dispositioned the
remaining six individually. None was verified** — verification needs client
evidence and cannot be inferred from context, industry norms or a previous
draft. `ClaimDisposition` cannot express `verified`, by design.

| Claim | Disposition |
| --- | --- |
| Mechanical engineering | **Reframed** — DEVELOP names the engineering questions without asserting who answers them |
| Manufacturing feasibility / mould-flow simulation | **Reframed** — the question survives, the named simulation services do not |
| Production tooling under supervision | **Reframed** — PRODUCE treats tooling as a commitment point, not a service performed |
| Tolerance analysis (+ stack-up deliverable) | **Removed** — a specific service, unnecessary to the new architecture |
| Supplier identification and in-person audit | **Removed** — asserted physical presence and inspection activity |
| Certification support | **Quarantined** — plausibly relevant, still unconfirmed |

```bash
grep -n "claimDispositions" -A40 src/data/capabilities.ts
```

The one remaining quarantined claim lives in `quarantinedClaims` and is
**rendered nowhere**. Phases 0–5 published quarantined claims behind a visible
"Unverified" marker, which was right while they were load-bearing content;
under *claim less, show more* they are not, and a marker still puts the words
in front of a reader. `tests/unit/capabilities.test.ts` and
`tests/e2e/capabilities-evidence.spec.ts` assert the vocabulary reaches no
rendered page.

Round 1's unquarantined inspection and freight language — incoming and
finished-goods inspection, golden samples, sampling plans, incoterms, customs
documentation — went with the restructure too. It had never been quarantined
because Phase 0 only audited claims flagged during the Round 2 audit, but it
asserted just as much.

### Placeholder content

Currently awaiting real information:

- **Projects** (`projects.ts`) — none. Round 1's four placeholder case studies were removed in Phase 6. Publishing is *derived*, not declared: `publishedProjects` filters on `isPublishable`, which requires at least one evidence item whose provenance is not `illustrative` or `pending`. A project cannot be published by flipping a boolean. See `projectContentRequest` for what a real project needs.
- **Testimonials** (`testimonials.ts`) — placeholder text describing the *kind* of quote expected. No real or borrowed endorsements.
- **Contact details** (`site.ts`) — email, phone, addresses, hours.
- **Social links** (`site.ts`) — all point at `#`.
- **Production domain** (`seo.url`). The legal entity is confirmed: Phoenix Rising Trading Company, LTD.
- **Founders, founding date and addresses** (`company.ts` — `pendingCompanyInformation`). No founder section is published because no founder has been supplied; `founders.published` is the switch.
- **Privacy / Terms** (`/privacy`, `/terms`) — section scaffolding only. These are legal claims about how data is handled; they need a lawyer, not generated boilerplate.
- **Article dates** (`insights.ts`). The article bodies themselves are general engineering guidance and make no Phoenix Rising-specific claims — they are publishable as written.

Remove the `PlaceholderNote` badge in the UI at the same time you replace the content.

---

## Imagery

Photography slots are currently filled by **generated SVG compositions** (`src/components/media/plates.tsx`) — dimension drawings, cavity layouts, assembly lattices, contour maps, logistics networks. They are deterministic, weigh nothing, and need no licensing.

Swapping in real photography is per-slot and does not touch layout:

```tsx
// before
<MediaFrame plate="caliper" ratio="aspect-[4/5]" />

// after
<MediaFrame plate="caliper" image="/media/tooling-01.jpg" alt="…" ratio="aspect-[4/5]" />
```

`MediaFrame` renders `image` when present and falls back to the plate when not, so slots can be filled one at a time. Reveal, parallax and scale behaviour are identical either way.

---

## Motion

Motion is a small system, not per-component animation. Everything routes through `src/lib/gsap.ts` and the `useGsap` hook, which scopes each animation to its container and reverts it on unmount — so no ScrollTrigger survives a route change.

| Primitive | Used for |
| --- | --- |
| `AnimatedHeadline` | Masked line-by-line reveals for display type |
| `SplitTextReveal` | Word-level reveal for lead paragraphs |
| `Reveal` | Quiet fade-and-rise for supporting content |
| `MediaFrame` | Clip-path wipes, parallax and scale on media |
| `DriftWord` | Oversized background words that track scroll |
| `StatCounter` | Oversized figures (counts only real values) |

### Two traps worth knowing about

**1. Masked reveals must use `LINE_HIDDEN` / `LINE_SHOWN` from `lib/gsap`, never a bare `yPercent`.**
The CSS fallback offsets these elements with a `transform` so content is never invisible before GSAP initialises. GSAP parses whatever transform it finds into its own baseline, then animates `yPercent` on top of it — so zeroing `yPercent` alone leaves the line permanently displaced by exactly one line-height. The shared constants declare `y: 0` to hand the whole transform to GSAP. This is documented at the constants.

**2. Scrubbed timelines must explicitly declare their easing behaviour and
must never implicitly inherit the global GSAP default.**
The global default is `expo.out`, which applies 82% of its change in the first
25% of a tween. That is right for an entrance and wrong for a scrub: on a
crossfade it means the outgoing element is effectively gone the moment its
window opens, before the incoming one has started. This is what made the
pinned development timeline render as an empty light-grey band for a stretch
of scroll — both stages sat near 15% opacity at the same time. In a scrubbed
timeline the playhead is the reader's scroll position, so any extra easing
decouples what is on screen from where they have scrolled. Opt individual
tweens into easing deliberately. Guarded by `tests/e2e/process-timeline.spec.ts`.

**3. Pinned experiences must satisfy both a width and a height requirement,
with CSS and JavaScript using the same eligibility rule.**
A pin holds content still, so anything taller than the viewport is unreachable
for the pin's whole duration. Width alone does not decide that — a 1920x700
window is wide and too short. The single definition lives in two places that
must stay identical: the `pinnable` variant in `globals.css`
(`min-width: 1024px and min-height: 780px`) and `PINNABLE_QUERY` / `useCanPin`
in `lib/hooks/useMediaQuery`. Layout branches on the first, animation on the
second; if they drift, a section renders its pinned layout without the
animation that makes it legible. Below the threshold, pinned sections fall
back to their vertical layout. Guarded by the pinned-fit grid in
`tests/e2e/process-timeline.spec.ts`.

**4. Inside a scrubbed timeline, read `progress`, not `tl.time()`.**
ScrollTrigger's `onUpdate` fires on scroll change, while the scrub is still easing the playhead toward that position. Reading the playhead there reports a stale time — which is what left the process rail label a full stage behind the copy on screen.

### Reduced motion

`prefers-reduced-motion: reduce` is honoured everywhere. Every pre-animation state is neutralised in CSS, `useGsap` passes `reduced: true` so setups render end states instead of animating, and pinned sections drop their pins. Verified: no content is hidden under reduced motion.

---

## Positioning

The company story gives that axis a geography: **CALIFORNIA ↔ GUANGZHOU**,
which is the same relationship expressed as two places rather than three
roles. Guangzhou is stated plainly and is not the whole proposition — see
`tests/unit/company-story.test.ts`, which caps how much of the story the word
"China" is allowed to carry.

The site is built around one idea: **a product has to work in two worlds** —
it has to make sense to the people who will buy it, and to the people who have
to build it. The axis is `Customer ↔ Product ↔ Factory`, stated explicitly in
the homepage statement section and carried through the why-us principles.

Manufacturing remains the core business. Market and customer thinking informs
product development; it does not replace it. When editing copy, keep the
hierarchy: product development, engineering, prototyping, manufacturing,
quality — then, later and subordinate, brand and partnerships.

Avoid: revolutionary, disruptive, unparalleled, game-changing,
industry-leading, best-in-class. Prefer plain statements of what the work
actually is.

## Colour and contrast

`slate` is the quiet text colour and resolves differently by surface: a darker
value on the cream page, a lighter one inside `.is-dark` bands. The brand
swatch from `Color.png` (`#708597`) sits at 3.4:1 on cream — below WCAG AA for
the 11px technical labels it was being used for — so it is retained as
`slate-brand` for rules, hairlines and decoration, and is not used for text.

Practical consequence: use `text-slate` on either surface and it stays legible.
Avoid opacity modifiers on text (`text-slate/70`); they compound and were the
source of most of the contrast failures found in Phase 0.

Cyan is a dark-surface accent — it drops to 1.25:1 on cream. Use `text-blue` as
the light-surface equivalent.

## Architecture notes

- **Prefer `position: sticky` to a ScrollTrigger pin.** `TwoWorlds` (the
  California ↔ Guangzhou section) holds its composition with sticky and uses a
  scrubbed timeline only to move the packets along the exchange channel. That
  is the pattern to copy for anything new. Sticky costs nothing per frame,
  cannot desynchronise from scroll, and is unaffected by a transformed
  ancestor — which is the exact defect that made pinned sections render blank
  when navigated into. Reach for a pin only when the content genuinely has to
  leave normal flow.
- **Pinned sections must fit one viewport.** `ProcessTimeline` and `Reality` pin their content; anything below the fold during a pin is unreachable for the whole pin duration. Their desktop layouts are built around that constraint.
- **Capability media uses CSS `position: sticky`, not a ScrollTrigger pin** — it costs nothing per frame and cannot desynchronise from scroll.
- **Header colour** follows the band beneath it. Every full-bleed section declares `data-tone="dark" | "light"`; `useNavTone` samples a one-pixel band at the header line with an IntersectionObserver. This reads live layout, so it stays correct through pinning, font swaps and resizes.
- **The form is front-end only, and says so.** `src/lib/submitEnquiry.ts` is the single seam for an API route, email service or CRM. Until one is connected, the completion state states plainly that the enquiry has *not* reached Phoenix Rising and offers the email address instead. Update that copy at the same time you wire up delivery.

---

## Routes

```
/                                          /projects
/about                                     /projects/[slug]
/capabilities                              /insights
/capabilities/design-for-manufacturability /insights/[slug]
/capabilities/prototyping-tooling          /contact
/capabilities/production                   /privacy · /terms
/capabilities/quality-logistics            (404)
/how-we-develop
/start          ← shell, Phase 3
/ideate         ← shell, Phase 9
/onboarding     ← shell, Phase 7
```

All 29 pages prerender as static HTML.

### Redirects

`/process → /how-we-develop` · `/work → /projects` · `/work/:slug → /projects/:slug`

These are permanent (308) and exist for inbound links only. No internal link
may depend on them — `tests/e2e/routing.spec.ts` asserts both the redirects
and the absence of internal links pointing at the retired paths.

### Evidence provenance

Every project evidence item declares where it came from — `verified`,
`client-provided`, `phoenix-provided`, `illustrative` or `pending` — and the
`ProvenanceTag` renders that **as text**, never as colour or position alone.
Anything that is not real evidence additionally carries a full sentence saying
so, because a caption under a convincing technical drawing is not enough: on a
projects page a coded plate is the thing most likely to be mistaken for proof.

### Navigation

The header carries five items and one call to action. `Insights`, `Contact`
and `Onboarding` are deliberately footer-only; the footer groups everything
under Explore / Start / Company.

`Start a project` (`/start`) and `Contact` (`/contact`) are different things
and must stay separate: the first is the structured project journey, the
second is the direct path for anyone who would rather just write to a person.
`/contact` must never redirect into the structured flow.

The horizontal navigation appears at `xl` (1280px), not `lg`. The Round 2
labels are long enough that 1024–1279 left the nav and the CTA almost
touching; those widths use the fullscreen menu, which also carries the
footer-only routes since it is the only navigation there.
