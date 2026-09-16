# Phoenix Rizing

Marketing site for Phoenix Rizing — product development, engineering, prototyping, sourcing and manufacturing.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
npm run lint
```

---

## Where the content lives

**All editable copy is in `src/data/`. No component hard-codes marketing text.**

| File | Contains |
| --- | --- |
| `site.ts` | Company, contact, social, navigation, hero, statement, why-us pillars, reality section, final CTA, SEO |
| `stats.ts` | The four proof figures |
| `capabilities.ts` | The four capability stories + their detail pages |
| `process.ts` | The seven process stages |
| `projects.ts` | Case studies (`/work` and `/work/[slug]`) |
| `testimonials.ts` | Client quotes |
| `insights.ts` | Articles (`/insights` and `/insights/[slug]`) |
| `ipSystem.ts` | IP / supply-chain section and its exploded-diagram layers |
| `about.ts` | About page narrative and operating principles |
| `contactForm.ts` | Intake form fields, stage/volume/budget options |

Changing a headline, adding a project or reordering the process is a data edit, not a component edit.

---

## ⚠️ Placeholder inventory — read before launch

Nothing in this site claims a fact about Phoenix Rizing that was not supplied. Anything unverified is marked `placeholder: true` in the data layer and, where a visitor could otherwise mistake it for real, is labelled in the interface too.

```bash
grep -rn "placeholder: true" src/data     # everything awaiting real content
```

Currently awaiting real information:

- **Statistics** (`stats.ts`) — all four render as `XX` and deliberately do **not** animate a count. Set `value` to a number and `placeholder: false` to publish one.
- **Projects** (`projects.ts`) — all four are structural placeholders with generic engineering narratives. They contain no invented clients, revenue, backer counts, awards or launch figures, and every `result` field is left explicitly unfilled.
- **Testimonials** (`testimonials.ts`) — placeholder text describing the *kind* of quote expected. No real or borrowed endorsements.
- **Contact details** (`site.ts`) — email, phone, addresses, hours.
- **Social links** (`site.ts`) — all point at `#`.
- **Legal entity name** (`site.ts`), **production domain** (`seo.url`).
- **Team and locations** (`about.ts`).
- **Privacy / Terms** (`/privacy`, `/terms`) — section scaffolding only. These are legal claims about how data is handled; they need a lawyer, not generated boilerplate.
- **Article dates** (`insights.ts`). The article bodies themselves are general engineering guidance and make no Phoenix Rizing-specific claims — they are publishable as written.

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

**2. Inside a scrubbed timeline, read `progress`, not `tl.time()`.**
ScrollTrigger's `onUpdate` fires on scroll change, while the scrub is still easing the playhead toward that position. Reading the playhead there reports a stale time — which is what left the process rail label a full stage behind the copy on screen.

### Reduced motion

`prefers-reduced-motion: reduce` is honoured everywhere. Every pre-animation state is neutralised in CSS, `useGsap` passes `reduced: true` so setups render end states instead of animating, and pinned sections drop their pins. Verified: no content is hidden under reduced motion.

---

## Architecture notes

- **Pinned sections must fit one viewport.** `IPSystem`, `ProcessTimeline` and `Reality` pin their content; anything below the fold during a pin is unreachable for the whole pin duration. Their desktop layouts are built around that constraint.
- **Capability media uses CSS `position: sticky`, not a ScrollTrigger pin** — it costs nothing per frame and cannot desynchronise from scroll.
- **Header colour** follows the band beneath it. Every full-bleed section declares `data-tone="dark" | "light"`; `useNavTone` samples a one-pixel band at the header line with an IntersectionObserver. This reads live layout, so it stays correct through pinning, font swaps and resizes.
- **The form is front-end only.** `src/lib/submitEnquiry.ts` is the single seam for an API route, email service or CRM. Nothing in the UI changes when you wire one in.

---

## Routes

```
/                                          /work
/about                                     /work/[slug]
/capabilities                              /insights
/capabilities/design-for-manufacturability /insights/[slug]
/capabilities/prototyping-tooling          /contact
/capabilities/production                   /privacy · /terms
/capabilities/quality-logistics            (404)
/process
```

All 24 pages prerender as static HTML.
