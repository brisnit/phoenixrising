/* ===========================================================================
 * TECHNICAL PLATES — coded art direction
 * ---------------------------------------------------------------------------
 * Photography slots across the site are filled by generated SVG compositions
 * rather than stock imagery. Each plate is a piece of drawn engineering
 * language — dimension lines, cavity layouts, assembly lattices, contour maps
 * — rendered deterministically so server and client markup match exactly.
 *
 * Every plate is a drop-in replacement for a photograph: see MediaFrame, which
 * renders `image` when one is supplied and falls back to a plate when not.
 * ======================================================================== */

'use client'

import { useId } from 'react'
import { seeded } from '@/lib/utils'

export type PlateVariant =
  | 'caliper'
  | 'mold'
  | 'lattice'
  | 'grid'
  | 'wave'
  | 'burst'
  | 'route'

export type PlateTone = 'dark' | 'light'

type PlateProps = {
  variant: PlateVariant
  tone?: PlateTone
  seed?: number
  className?: string
}

/* Ink values per tone. Kept literal rather than tokenised because these are
   SVG paint attributes, not Tailwind utilities. */
type Ink = {
  bg0: string
  bg1: string
  line: string
  lineSoft: string
  fill: string
  accent: string
  text: string
}

const INK: Record<PlateTone, Ink> = {
  dark: {
    bg0: '#0c182a',
    bg1: '#060d18',
    line: 'rgba(148,178,200,0.34)',
    lineSoft: 'rgba(148,178,200,0.15)',
    fill: 'rgba(64,139,179,0.16)',
    accent: '#80e9f2',
    text: 'rgba(200,222,235,0.62)',
  },
  light: {
    bg0: '#e3e7eb',
    bg1: '#d0d7de',
    line: 'rgba(12,24,42,0.32)',
    lineSoft: 'rgba(12,24,42,0.13)',
    fill: 'rgba(40,91,138,0.1)',
    accent: '#285b8a',
    text: 'rgba(12,24,42,0.55)',
  },
}

const W = 1200
const H = 800

/* ------------------------------------------------------------------ CALIPER
 * Engineering drawing language: a part silhouette carrying dimension lines,
 * extension lines, arrowheads and tolerance callouts.
 * --------------------------------------------------------------------- */
function Caliper({ c, rand }: { c: Ink; rand: () => number }) {
  const dims = [0, 1, 2].map((i) => ({
    y: 170 + i * 200,
    x1: 200 + Math.round(rand() * 80),
    x2: 760 + Math.round(rand() * 180),
    tol: ['±0.05', '±0.10', '+0.02 / −0.00'][i],
  }))

  return (
    <g>
      {/* Part silhouette — a chamfered housing profile */}
      <path
        d="M300 190 L820 190 L880 250 L880 560 L820 620 L300 620 L240 560 L240 250 Z"
        fill={c.fill}
        stroke={c.line}
        strokeWidth="1.5"
      />
      <path
        d="M300 250 L820 250 L820 560 L300 560 Z"
        fill="none"
        stroke={c.lineSoft}
        strokeWidth="1"
      />
      {/* Internal bosses */}
      {[340, 500, 660, 780].map((x) => (
        <g key={x}>
          <circle cx={x} cy={405} r="34" fill="none" stroke={c.line} strokeWidth="1.25" />
          <circle cx={x} cy={405} r="16" fill="none" stroke={c.lineSoft} strokeWidth="1" />
          <path
            d={`M${x - 46} 405 H${x + 46} M${x} 359 V451`}
            stroke={c.lineSoft}
            strokeWidth="0.75"
            strokeDasharray="6 5"
          />
        </g>
      ))}

      {/* Dimension lines */}
      {dims.map((d, i) => (
        <g key={i}>
          <path
            d={`M${d.x1} ${d.y} H${d.x2}`}
            stroke={i === 1 ? c.accent : c.line}
            strokeWidth="1"
          />
          {[d.x1, d.x2].map((x, j) => (
            <path
              key={j}
              d={`M${x} ${d.y - 7} V${d.y + 7}`}
              stroke={i === 1 ? c.accent : c.line}
              strokeWidth="1"
            />
          ))}
          <text
            x={(d.x1 + d.x2) / 2}
            y={d.y - 14}
            fill={i === 1 ? c.accent : c.text}
            fontSize="17"
            fontFamily="ui-monospace, monospace"
            letterSpacing="2"
            textAnchor="middle"
          >
            {d.tol}
          </text>
        </g>
      ))}

      {/* Leader line with callout */}
      <path d="M880 250 L1000 170 H1090" stroke={c.line} strokeWidth="1" fill="none" />
      <circle cx="880" cy="250" r="3.5" fill={c.accent} />
      <text
        x="1000"
        y="158"
        fill={c.text}
        fontSize="16"
        fontFamily="ui-monospace, monospace"
        letterSpacing="2"
      >
        DRAFT 1.5°
      </text>
    </g>
  )
}

/* --------------------------------------------------------------------- MOLD
 * Cavity layout: concentric tool rings, runner and gate channels, ejector
 * pattern and a parting-line axis.
 * --------------------------------------------------------------------- */
function Mold({ c, rand }: { c: Ink; rand: () => number }) {
  const cav = [
    { x: 400, y: 280 },
    { x: 800, y: 280 },
    { x: 400, y: 540 },
    { x: 800, y: 540 },
  ]
  return (
    <g>
      {/* Bolster outline */}
      <rect
        x="210"
        y="110"
        width="780"
        height="600"
        fill="none"
        stroke={c.line}
        strokeWidth="1.5"
      />
      <rect
        x="250"
        y="150"
        width="700"
        height="520"
        fill={c.fill}
        stroke={c.lineSoft}
        strokeWidth="1"
      />

      {/* Runner system from a central sprue */}
      <path
        d="M600 410 L400 410 M600 410 L800 410 M400 410 V280 M400 410 V540 M800 410 V280 M800 410 V540"
        stroke={c.accent}
        strokeWidth="2"
        fill="none"
        opacity="0.85"
      />
      <circle cx="600" cy="410" r="14" fill="none" stroke={c.accent} strokeWidth="2" />
      <circle cx="600" cy="410" r="5" fill={c.accent} />

      {/* Cavities */}
      {cav.map((p, i) => (
        <g key={i}>
          {[104, 82, 58, 34].map((r, j) => (
            <circle
              key={r}
              cx={p.x}
              cy={p.y}
              r={r}
              fill="none"
              stroke={j === 0 ? c.line : c.lineSoft}
              strokeWidth={j === 0 ? 1.4 : 0.9}
            />
          ))}
          {/* Ejector pins */}
          {Array.from({ length: 6 }).map((_, k) => {
            const a = (k / 6) * Math.PI * 2 + rand() * 0.2
            return (
              <circle
                key={k}
                cx={p.x + Math.cos(a) * 70}
                cy={p.y + Math.sin(a) * 70}
                r="5"
                fill="none"
                stroke={c.line}
                strokeWidth="1"
              />
            )
          })}
        </g>
      ))}

      {/* Guide pillars */}
      {[
        [250, 150],
        [950, 150],
        [250, 670],
        [950, 670],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="20" fill="none" stroke={c.line} strokeWidth="1.25" />
          <circle cx={x} cy={y} r="9" fill="none" stroke={c.lineSoft} strokeWidth="1" />
        </g>
      ))}

      {/* Parting-line axis */}
      <path
        d="M120 410 H1080"
        stroke={c.lineSoft}
        strokeWidth="1"
        strokeDasharray="22 8 4 8"
      />
    </g>
  )
}

/* ------------------------------------------------------------------ LATTICE
 * Isometric assembly lattice — nodes and struts, a structure being built.
 * --------------------------------------------------------------------- */
function Lattice({ c, rand }: { c: Ink; rand: () => number }) {
  const cols = 13
  const rows = 9
  const dx = 112
  const dy = 92
  const ox = -170
  const oy = -40
  const pt = (i: number, j: number) => ({
    x: ox + i * dx + j * 44,
    y: oy + j * dy,
  })

  const nodes: { x: number; y: number; hot: boolean }[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const p = pt(i, j)
      nodes.push({ ...p, hot: rand() > 0.9 })
    }
  }

  return (
    <g>
      {/* Struts */}
      {Array.from({ length: rows }).map((_, j) =>
        Array.from({ length: cols }).map((_, i) => {
          const a = pt(i, j)
          const right = i < cols - 1 ? pt(i + 1, j) : null
          const down = j < rows - 1 ? pt(i, j + 1) : null
          return (
            <g key={`${i}-${j}`}>
              {right && (
                <path
                  d={`M${a.x} ${a.y} L${right.x} ${right.y}`}
                  stroke={c.lineSoft}
                  strokeWidth="1"
                />
              )}
              {down && (
                <path
                  d={`M${a.x} ${a.y} L${down.x} ${down.y}`}
                  stroke={c.lineSoft}
                  strokeWidth="1"
                />
              )}
            </g>
          )
        }),
      )}
      {/* Highlighted load path */}
      <path
        d={`M${pt(1, 8).x} ${pt(1, 8).y} L${pt(4, 6).x} ${pt(4, 6).y} L${pt(6, 4).x} ${
          pt(6, 4).y
        } L${pt(8, 2).x} ${pt(8, 2).y} L${pt(11, 0).x} ${pt(11, 0).y}`}
        stroke={c.accent}
        strokeWidth="2"
        fill="none"
      />
      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.hot ? 5 : 2.6}
          fill={n.hot ? c.accent : c.line}
        />
      ))}
    </g>
  )
}

/* --------------------------------------------------------------------- GRID
 * Inspection plate: precision grid, registration crosshairs, sample points.
 * --------------------------------------------------------------------- */
function Grid({ c, rand }: { c: Ink; rand: () => number }) {
  const step = 50
  const pts = Array.from({ length: 14 }).map(() => ({
    x: 140 + Math.round((rand() * 920) / step) * step,
    y: 110 + Math.round((rand() * 580) / step) * step,
    pass: rand() > 0.22,
  }))
  return (
    <g>
      {/* Fine grid */}
      {Array.from({ length: Math.floor(W / step) + 1 }).map((_, i) => (
        <path
          key={`v${i}`}
          d={`M${i * step} 0 V${H}`}
          stroke={c.lineSoft}
          strokeWidth={i % 4 === 0 ? 0.9 : 0.4}
        />
      ))}
      {Array.from({ length: Math.floor(H / step) + 1 }).map((_, i) => (
        <path
          key={`h${i}`}
          d={`M0 ${i * step} H${W}`}
          stroke={c.lineSoft}
          strokeWidth={i % 4 === 0 ? 0.9 : 0.4}
        />
      ))}

      {/* Registration crosshairs at the corners of the inspection field */}
      {[
        [200, 150],
        [1000, 150],
        [200, 650],
        [1000, 650],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="26" fill="none" stroke={c.line} strokeWidth="1.25" />
          <path
            d={`M${x - 40} ${y} H${x + 40} M${x} ${y - 40} V${y + 40}`}
            stroke={c.line}
            strokeWidth="1"
          />
        </g>
      ))}

      <rect
        x="200"
        y="150"
        width="800"
        height="500"
        fill="none"
        stroke={c.line}
        strokeWidth="1.25"
        strokeDasharray="10 6"
      />

      {/* Sample points */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="8"
            fill="none"
            stroke={p.pass ? c.line : c.accent}
            strokeWidth={p.pass ? 1 : 2}
          />
          {!p.pass && <circle cx={p.x} cy={p.y} r="2.5" fill={c.accent} />}
        </g>
      ))}
    </g>
  )
}

/* --------------------------------------------------------------------- WAVE
 * Contour map of a machined surface — topographic lines with a tool path.
 * --------------------------------------------------------------------- */
function Wave({ c, rand }: { c: Ink; rand: () => number }) {
  const lines = 26
  const paths = Array.from({ length: lines }).map((_, i) => {
    const t = i / (lines - 1)
    const y = 90 + t * 620
    const amp = 46 * Math.sin(t * Math.PI) + 10
    const phase = rand() * 0.6
    let d = `M-40 ${y}`
    for (let x = -40; x <= W + 40; x += 40) {
      const yy =
        y +
        Math.sin(x / 200 + phase + t * 2.4) * amp +
        Math.sin(x / 91 + t * 3.1) * (amp * 0.28)
      d += ` L${x} ${yy.toFixed(1)}`
    }
    return { d, hot: i === 12 || i === 13 }
  })

  return (
    <g>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={p.hot ? c.accent : c.line}
          strokeWidth={p.hot ? 1.8 : 0.9}
          opacity={p.hot ? 0.95 : 0.55}
        />
      ))}
      {/* Tool path cross-section marker */}
      <path d="M600 40 V760" stroke={c.lineSoft} strokeWidth="1" strokeDasharray="8 8" />
      <circle cx="600" cy="400" r="9" fill="none" stroke={c.accent} strokeWidth="2" />
    </g>
  )
}

/* -------------------------------------------------------------------- BURST
 * An abstraction of the brand mark's sweeping feather geometry. Radial arcs
 * emerging from a single origin — transformation, not a literal phoenix.
 * --------------------------------------------------------------------- */
function Burst({ c, rand }: { c: Ink; rand: () => number }) {
  const arcs = Array.from({ length: 26 }).map((_, i) => {
    const t = i / 25
    const a0 = -Math.PI * 0.86 + t * Math.PI * 0.92
    const r0 = 60 + t * 40
    const r1 = 330 + t * 300 + rand() * 40
    const cx = 620
    const cy = 700
    const x0 = cx + Math.cos(a0) * r0
    const y0 = cy + Math.sin(a0) * r0
    const x1 = cx + Math.cos(a0 - 0.5) * r1
    const y1 = cy + Math.sin(a0 - 0.5) * r1
    const cxx = cx + Math.cos(a0 - 0.1) * r1 * 0.72
    const cyy = cy + Math.sin(a0 - 0.1) * r1 * 0.72
    return { d: `M${x0} ${y0} Q${cxx} ${cyy} ${x1} ${y1}`, hot: i % 7 === 3 }
  })

  return (
    <g>
      {arcs.map((a, i) => (
        <path
          key={i}
          d={a.d}
          fill="none"
          stroke={a.hot ? c.accent : c.line}
          strokeWidth={a.hot ? 1.8 : 1}
          opacity={a.hot ? 0.9 : 0.42}
          strokeLinecap="round"
        />
      ))}
      <circle cx="620" cy="700" r="140" fill="none" stroke={c.lineSoft} strokeWidth="1" />
      <circle cx="620" cy="700" r="230" fill="none" stroke={c.lineSoft} strokeWidth="0.75" />
    </g>
  )
}

/* -------------------------------------------------------------------- ROUTE
 * Logistics network — origin, nodes, arcs and a destination.
 * --------------------------------------------------------------------- */
function Route({ c, rand }: { c: Ink; rand: () => number }) {
  const nodes = Array.from({ length: 11 }).map(() => ({
    x: 140 + rand() * 920,
    y: 140 + rand() * 520,
  }))
  const origin = { x: 210, y: 560 }
  const dest = { x: 1010, y: 220 }

  return (
    <g>
      {/* Latitude bands */}
      {Array.from({ length: 7 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${120 + i * 95} Q600 ${90 + i * 95} ${W} ${120 + i * 95}`}
          stroke={c.lineSoft}
          strokeWidth="0.8"
          fill="none"
        />
      ))}

      {/* Secondary legs */}
      {nodes.map((n, i) => (
        <path
          key={i}
          d={`M${origin.x} ${origin.y} Q${(origin.x + n.x) / 2} ${
            Math.min(origin.y, n.y) - 110
          } ${n.x} ${n.y}`}
          stroke={c.line}
          strokeWidth="0.9"
          fill="none"
          opacity="0.5"
        />
      ))}

      {/* Primary lane */}
      <path
        d={`M${origin.x} ${origin.y} Q600 120 ${dest.x} ${dest.y}`}
        stroke={c.accent}
        strokeWidth="2.2"
        fill="none"
      />

      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="4" fill={c.line} />
      ))}

      {[origin, dest].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="15" fill="none" stroke={c.accent} strokeWidth="2" />
          <circle cx={p.x} cy={p.y} r="5" fill={c.accent} />
        </g>
      ))}
    </g>
  )
}

const RENDERERS = {
  caliper: Caliper,
  mold: Mold,
  lattice: Lattice,
  grid: Grid,
  wave: Wave,
  burst: Burst,
  route: Route,
} as const

/**
 * Renders a technical plate scaled to fill its container.
 * Decorative by definition — hidden from assistive technology, since the
 * surrounding section always carries the meaning in text.
 */
export function Plate({ variant, tone = 'dark', seed = 7, className }: PlateProps) {
  const c = INK[tone]
  const rand = seeded(seed * 1013 + variant.length * 97)
  const Renderer = RENDERERS[variant]
  /* The gradient ids must be unique per rendered instance, not per
     variant/tone/seed — the same plate is legitimately used more than once on
     a page, and `url(#id)` resolves to the first match in the document, so
     colliding ids silently cross-wire one plate's paint to another's defs.
     React's useId is stable across server and client render; the colons it
     produces are stripped because they are awkward inside url() references. */
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="38%" cy="28%" r="88%">
          <stop offset="0%" stopColor={c.bg0} />
          <stop offset="100%" stopColor={c.bg1} />
        </radialGradient>
        <linearGradient id={`veil-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.bg1} stopOpacity="0" />
          <stop offset="100%" stopColor={c.bg1} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#bg-${uid})`} />
      <Renderer c={c} rand={rand} />
      <rect width={W} height={H} fill={`url(#veil-${uid})`} />
    </svg>
  )
}
