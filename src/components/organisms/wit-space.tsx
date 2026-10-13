'use client'

import { cx } from '@/lib/cx'
import * as React from 'react'

/** wit logo (arr/media/wit_logo.svg) — 4 paths in viewBox 0 227 150 70:
    the fused V + the navy bar (w mark) + the two-part it ligature.
    Colors are the logo's: blue #1a6ded, navy #162b3d. */
/** parse "x,y x,y …" into viewBox points */
const poly = (s: string) => s.split(' ').map((p) => p.split(',').map(Number) as [number, number])

/** fused "t" — paper.js boolean union of the two source paths
    (true bezier outline; the shared seam inside is removed) */
const T_RING = poly('109.38,257.26 112.31,251.96 112.49,251.58 112.81,250.82 113.1,250.07 113.36,249.34 113.59,248.63 113.79,247.93 113.96,247.24 114.1,246.57 114.22,245.92 114.3,245.28 114.37,244.65 114.41,244.04 114.42,243.44 114.42,242.86 114.39,242.29 114.34,241.74 114.27,241.2 114.18,240.67 114.07,240.15 113.95,239.65 113.81,239.17 113.65,238.69 113.48,238.23 113.29,237.79 113.09,237.35 112.88,236.93 112.66,236.52 112.43,236.13 112.18,235.74 111.93,235.37 111.68,235.01 111.41,234.67 111.14,234.33 110.86,234.01 110.58,233.7 110.3,233.41 110.01,233.12 109.72,232.84 109.43,232.58 109.14,232.33 108.71,231.97 108.15,231.54 107.6,231.15 107.07,230.8 106.58,230.49 106.12,230.22 105.7,230 105.34,229.81 104.91,229.61 104.58,229.46 104.53,229.45 110.78,229.43 126.73,229.39 131.75,229.37 131.91,229.38 132.68,229.45 133.26,229.54 133.71,229.61 134.21,229.71 134.74,229.83 135.31,229.97 135.91,230.14 136.53,230.34 137.17,230.58 137.65,230.77 137.98,230.92 138.31,231.07 138.64,231.23 138.98,231.4 139.31,231.59 139.64,231.78 139.97,231.98 140.29,232.2 140.62,232.42 140.94,232.66 141.25,232.91 141.56,233.18 141.87,233.45 142.17,233.74 142.46,234.04 142.75,234.36 143.03,234.69 143.3,235.03 143.56,235.39 143.81,235.76 144.05,236.15 144.28,236.55 144.5,236.97 144.7,237.41 144.89,237.86 145.07,238.33 145.23,238.81 145.38,239.31 145.52,239.83 145.63,240.37 145.73,240.92 145.82,241.5 145.88,242.09 145.92,242.7 145.95,243.33 145.96,243.65 145.96,243.97 145.94,244.6 145.91,245.22 145.85,245.81 145.78,246.38 145.69,246.94 145.58,247.48 145.46,248 145.32,248.5 145.16,248.99 144.99,249.46 144.81,249.92 144.61,250.35 144.4,250.78 144.18,251.18 143.95,251.58 143.7,251.95 143.45,252.32 143.19,252.66 142.91,253 142.63,253.32 142.34,253.63 142.05,253.92 141.75,254.2 141.44,254.47 141.13,254.73 140.81,254.97 140.49,255.2 140.17,255.42 139.85,255.63 139.52,255.83 139.19,256.02 138.86,256.2 138.53,256.37 138.21,256.53 137.88,256.68 137.4,256.88 136.76,257.13 136.15,257.34 135.55,257.52 134.99,257.67 134.46,257.8 133.96,257.91 133.51,257.99 132.93,258.08 132.16,258.17 132.01,258.18 124.34,257.98 124.7,280.73 124.7,280.88 124.62,281.65 124.54,282.23 124.47,282.69 124.37,283.18 124.25,283.72 124.11,284.28 123.94,284.88 123.74,285.5 123.5,286.14 123.31,286.63 123.16,286.96 123.01,287.29 122.85,287.62 122.68,287.95 122.49,288.28 122.3,288.61 122.1,288.94 121.88,289.26 121.65,289.59 121.42,289.91 121.17,290.23 120.9,290.54 120.63,290.84 120.34,291.14 120.04,291.44 119.72,291.72 119.39,292 119.05,292.27 118.69,292.53 118.32,292.78 117.93,293.02 117.53,293.25 117.11,293.47 116.67,293.67 116.22,293.87 115.75,294.04 115.27,294.21 114.77,294.36 114.25,294.49 113.71,294.61 113.16,294.71 112.58,294.79 111.99,294.85 111.38,294.9 110.75,294.92 110.43,294.93 110.11,294.93 109.48,294.91 108.86,294.88 108.27,294.83 107.7,294.75 107.14,294.66 106.6,294.56 106.08,294.43 105.57,294.29 105.09,294.14 104.62,293.97 104.16,293.78 103.72,293.59 103.3,293.38 102.89,293.15 102.5,292.92 102.12,292.68 101.76,292.42 101.41,292.16 101.08,291.89 100.76,291.61 100.45,291.32 100.16,291.02 99.88,290.72 99.61,290.41 99.35,290.1 99.11,289.79 98.88,289.47 98.65,289.14 98.44,288.82 98.25,288.49 98.06,288.16 97.88,287.84 97.71,287.51 97.55,287.18 97.4,286.85 97.2,286.37 96.95,285.74 96.74,285.12 96.56,284.53 96.4,283.96 96.28,283.43 96.17,282.93 96.09,282.48 96,281.9 95.91,281.14 95.9,280.98')

/** flattened bar outline at tol 0.01 (the d keeps its beziers) */
const BAR_RING = poly('109.51,250.83 109.58,250.68 109.86,249.98 110.06,249.44 110.2,249.01 110.34,248.53 110.48,248.01 110.61,247.45 110.73,246.85 110.84,246.22 110.93,245.55 110.99,244.86 111.02,244.32 111.04,243.96 111.04,243.59 111.03,243.21 111.01,242.84 110.99,242.45 110.95,242.07 110.9,241.68 110.85,241.29 110.77,240.9 110.69,240.5 110.59,240.11 110.48,239.71 110.36,239.31 110.21,238.92 110.06,238.52 109.89,238.13 109.7,237.73 109.49,237.34 109.27,236.95 109.03,236.56 108.77,236.18 108.49,235.79 108.19,235.42 107.87,235.04 107.53,234.67 107.17,234.31 106.78,233.95 106.38,233.6 105.95,233.25 105.5,232.91 105.02,232.58 104.52,232.26 103.99,231.94 103.72,231.78 103.44,231.63 102.89,231.35 102.35,231.09 101.82,230.86 101.29,230.65 100.77,230.47 100.26,230.31 99.75,230.17 99.25,230.05 98.76,229.95 98.27,229.87 97.79,229.81 97.32,229.77 96.86,229.75 96.4,229.75 95.95,229.76 95.51,229.79 95.07,229.83 94.64,229.89 94.22,229.96 93.81,230.05 93.41,230.14 93.01,230.25 92.62,230.37 92.24,230.51 91.87,230.65 91.5,230.8 91.15,230.96 90.8,231.12 90.46,231.3 90.13,231.48 89.8,231.67 89.49,231.86 89.19,232.05 88.74,232.36 88.19,232.77 87.66,233.18 87.18,233.6 86.73,234.01 86.32,234.42 85.95,234.8 85.62,235.17 85.32,235.5 84.96,235.95 84.51,236.55 84.42,236.68 63.76,273.32 63.69,273.46 63.38,274.17 63.16,274.73 63.01,275.16 62.85,275.65 62.69,276.18 62.54,276.75 62.4,277.36 62.27,278.01 62.17,278.68 62.1,279.21 62.07,279.57 62.04,279.94 62.02,280.31 62.01,280.68 62.01,281.07 62.01,281.45 62.03,281.84 62.06,282.23 62.1,282.63 62.15,283.03 62.22,283.43 62.3,283.83 62.39,284.24 62.49,284.64 62.61,285.05 62.75,285.45 62.9,285.86 63.07,286.26 63.26,286.67 63.46,287.07 63.68,287.47 63.92,287.87 64.19,288.26 64.47,288.65 64.77,289.04 65.09,289.42 65.43,289.8 65.8,290.18 66.19,290.54 66.6,290.91 67.04,291.26 67.5,291.61 67.99,291.96 68.5,292.29 69.04,292.62 69.32,292.78 69.6,292.94 70.16,293.23 70.71,293.49 71.26,293.73 71.8,293.95 72.33,294.14 72.85,294.3 73.37,294.44 73.88,294.56 74.38,294.66 74.88,294.74 75.36,294.8 75.84,294.83 76.32,294.85 76.78,294.85 77.24,294.84 77.69,294.8 78.13,294.75 78.56,294.69 78.99,294.61 79.41,294.52 79.82,294.41 80.22,294.29 80.61,294.16 80.99,294.02 81.37,293.87 81.74,293.7 82.1,293.53 82.45,293.36 82.79,293.17 83.13,292.98 83.45,292.78 83.77,292.57 84.08,292.36 84.37,292.15 84.66,291.94 85.08,291.61 85.61,291.16 86.09,290.72 86.54,290.28 86.95,289.86 87.32,289.45 87.66,289.06 87.95,288.71 88.32,288.24 88.76,287.6 88.85,287.47')

/** V outline — flattened union ring at tol 0.01 */
const V_RING = poly('39.6,251.06 47.72,236.64 47.81,236.51 48.26,235.91 48.62,235.47 48.92,235.13 49.25,234.77 49.62,234.38 50.03,233.98 50.48,233.57 50.97,233.15 51.49,232.73 52.05,232.32 52.49,232.02 52.79,231.82 53.11,231.63 53.43,231.45 53.76,231.27 54.1,231.09 54.45,230.92 54.81,230.76 55.17,230.61 55.54,230.47 55.92,230.34 56.31,230.22 56.71,230.11 57.11,230.01 57.53,229.93 57.95,229.86 58.37,229.8 58.81,229.75 59.25,229.73 59.7,229.71 60.16,229.72 60.63,229.74 61.1,229.78 61.58,229.84 62.06,229.92 62.56,230.01 63.06,230.13 63.56,230.27 64.08,230.43 64.6,230.62 65.12,230.83 65.66,231.06 66.2,231.32 66.74,231.6 67.02,231.75 67.29,231.91 67.82,232.22 68.32,232.55 68.8,232.88 69.25,233.22 69.68,233.57 70.09,233.92 70.47,234.28 70.83,234.64 71.17,235.01 71.49,235.38 71.79,235.76 72.07,236.14 72.33,236.53 72.57,236.91 72.8,237.3 73,237.7 73.19,238.09 73.36,238.49 73.52,238.88 73.66,239.28 73.78,239.68 73.89,240.07 73.99,240.47 74.08,240.86 74.15,241.26 74.21,241.65 74.26,242.03 74.29,242.42 74.32,242.8 74.33,243.18 74.34,243.55 74.34,243.92 74.33,244.29 74.3,244.82 74.23,245.51 74.15,246.18 74.04,246.81 73.92,247.41 73.78,247.98 73.64,248.5 73.5,248.97 73.36,249.4 73.17,249.95 72.88,250.65 72.82,250.79 52.15,287.43 52.07,287.55 51.68,288.11 51.36,288.53 51.11,288.85 50.82,289.2 50.49,289.57 50.13,289.95 49.74,290.35 49.31,290.76 48.85,291.18 48.36,291.59 47.83,292 47.28,292.4 46.84,292.69 46.54,292.88 46.23,293.06 45.91,293.24 45.59,293.41 45.26,293.57 44.92,293.73 44.57,293.88 44.22,294.01 43.86,294.15 43.49,294.27 43.12,294.38 42.73,294.48 42.34,294.57 41.95,294.64 41.55,294.71 41.13,294.76 40.72,294.79 40.29,294.82 39.86,294.82 39.43,294.82 38.98,294.79 38.53,294.75 38.08,294.7 37.61,294.62 37.14,294.53 36.67,294.41 36.18,294.28 35.69,294.13 35.2,293.95 34.95,293.86 34.8,293.8 34.5,293.68 34.06,293.5 33.5,293.23 32.96,292.94 32.7,292.79 32.66,292.77 32.62,292.75 32.32,292.58 31.74,292.22 31.2,291.86 30.68,291.49 30.19,291.11 29.73,290.73 29.3,290.34 28.9,289.94 28.52,289.53 28.16,289.12 27.83,288.7 27.53,288.28 27.25,287.86 26.99,287.43 26.75,287 26.53,286.57 26.43,286.35 6.53,251.07 6.46,250.93 6.15,250.21 5.93,249.66 5.78,249.22 5.62,248.74 5.47,248.21 5.31,247.63 5.17,247.02 5.05,246.38 4.94,245.7 4.87,245.17 4.84,244.81 4.81,244.45 4.79,244.08 4.78,243.7 4.78,243.32 4.79,242.93 4.8,242.54 4.83,242.15 4.87,241.75 4.92,241.36 4.99,240.95 5.07,240.55 5.16,240.15 5.26,239.74 5.39,239.34 5.52,238.93 5.67,238.52 5.84,238.12 6.03,237.72 6.23,237.31 6.46,236.91 6.7,236.52 6.96,236.12 7.24,235.73 7.54,235.34 7.86,234.96 8.21,234.58 8.57,234.21 8.96,233.84 9.37,233.47 9.81,233.12 10.27,232.77 10.76,232.42 11.27,232.09 11.81,231.76 12.09,231.6 12.37,231.44 12.93,231.15 13.48,230.89 14.03,230.65 14.57,230.44 15.1,230.25 15.62,230.08 16.14,229.94 16.65,229.82 17.15,229.72 17.65,229.64 18.13,229.59 18.61,229.55 19.09,229.53 19.55,229.53 20.01,229.55 20.46,229.58 20.9,229.63 21.33,229.7 21.76,229.78 22.18,229.87 22.59,229.98 22.99,230.09 23.38,230.23 23.77,230.37 24.14,230.52 24.51,230.68 24.87,230.85 25.22,231.03 25.56,231.22 25.9,231.41 26.22,231.61 26.54,231.81 26.85,232.02 27.14,232.23 27.43,232.45 27.85,232.78 28.37,233.22 28.86,233.66 29.31,234.1 29.72,234.53 30.09,234.94 30.43,235.32 30.72,235.68 31.08,236.15 31.53,236.79 31.62,236.92')

const LOGO_PATHS = [
  {
    // fused "t" — boolean union of the two source paths (the shared seam
    // inside the letter is removed)
    d: 'M112.31,251.96C119.92,235.42,104.53,229.45,104.53,229.45C110.55,229.42,127.91,229.39,131.75,229.37C131.75,229.37,145.83,229.79,145.96,243.65C146.08,257.51,132.01,258.18,132.01,258.18L124.34,257.98L124.70,280.73L124.70,280.73C124.70,280.73,124.29,294.81,110.43,294.93C96.57,295.05,95.90,280.98,95.90,280.98L109.38,257.26C109.38,257.26,109.38,257.26,109.38,257.26L112.31,251.96Z',
    fill: '#162b3d',
    verts: [
      [95.9, 280.98], [109.38, 257.26], [104.53, 229.45],
      [131.75, 229.37], [145.96, 243.65], [132.01, 258.18],
      [124.7, 280.73], [110.43, 294.93],
    ],
    outline: T_RING,
  },
  {
    // the V — boolean union of the original two blue bars, so the overlap
    // has no internal edge (computed via polygon-clipping union)
    d: 'M31.62,236.92L39.60,251.06L47.72,236.64C47.72,236.64,55.23,225.17,67.02,231.75C78.81,238.33,72.82,250.79,72.82,250.79L52.15,287.43L52.15,287.43C52.15,287.43,45.64,298.01,34.95,293.86C34.14,293.56,33.39,293.19,32.70,292.79C32.67,292.78,32.65,292.76,32.62,292.75C29.38,290.92,27.48,288.67,26.43,286.35L6.53,251.07C6.53,251.07,0.02,238.41,12.09,231.60C24.16,224.80,31.62,236.92,31.62,236.92L31.62,236.92Z',
    fill: '#1a6ded',
    verts: [
      [12.09, 231.6], [31.62, 236.92], [47.72, 236.64],
      [67.02, 231.75], [72.82, 250.79], [52.15, 287.43],
      [32.62, 292.75], [26.43, 286.35], [6.53, 251.07],
    ],
    outline: V_RING,

  },
  {
    d: 'm 88.850679,287.46649 20.662351,-36.64013 c 0,0 5.99693,-12.46189 -5.79654,-19.04342 -11.793439,-6.58149 -19.295145,4.89346 -19.295145,4.89346 l -20.662412,36.64019 c 0,0 -6.511624,12.65591 5.559725,19.46332 12.071336,6.80736 19.531971,-5.3134 19.531971,-5.3134 z',
    fill: '#162b3d',
    verts: [
      [88.85, 287.47], [109.51, 250.83], [103.72, 231.78],
      [84.42, 236.68], [63.76, 273.32], [69.32, 292.78],
    ],
    outline: BAR_RING,

  },
]

const LAYERS = 2 // front + back faces only — no depth stack

/** Depth edges — rods connecting front and back faces. The outline is
    unrolled into one long strip: starting at the top-left outline point,
    rods are spaced evenly by arc length (perimeter / n, n ≈ per/3).
    Positions are viewBox fractions (x/150, (y-227)/70); the driver
    re-derives orientation each frame so they follow the faces' shear. */
const ROD_SPACING = 3
const sampleRods = (ring: [number, number][]) => {
  const n = ring.length
  const lens = ring.map(([x, y], i) => {
    const [x1, y1] = ring[(i + 1) % n]
    return Math.hypot(x1 - x, y1 - y)
  })
  const perimeter = lens.reduce((a, b) => a + b, 0)
  let start = 0
  let best = Infinity
  ring.forEach(([x, y], i) => {
    if (x + y < best) {
      best = x + y
      start = i
    }
  })
  const count = Math.max(1, Math.round(perimeter / ROD_SPACING))
  const step = perimeter / count
  const out: [number, number][] = []
  let target = 0
  let acc = 0
  for (let k = 0; k < n && out.length < count; k++) {
    const i = (start + k) % n
    const seg = lens[i]
    while (acc + seg >= target) {
      const t = seg ? (target - acc) / seg : 0
      const [ax, ay] = ring[i]
      const [bx, by] = ring[(i + 1) % n]
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t])
      target += step
    }
    acc += seg
  }
  return out
}
const EDGES = LOGO_PATHS.flatMap((p) =>
  sampleRods(p.outline).map(([x, y]) => ({ x, y, fill: p.fill })),
)

/** Face labels — text + anchor point + direction angle (svg units, deg).
    Rendered in the 2D overlay, not inside the layer planes: the
    compositor re-sorts coplanar preserve-3d content on rebuild
    (reload, window occlusion), making in-plane labels appear to jump
    to the other face. Two anchor points per label give screen
    position, projected angle and scale each frame. */
const LABEL_FONT = 4.475
const LABELS = [
  { text: 'front•end', layer: LAYERS - 1, x: 15, y: 261, a: 60 },
  { text: 'back•end', layer: 0, x: 122, y: 281, a: 269 },
] as const

/** flat index of a vertex inside one face — paths render in
    LOGO_PATHS order (t 0–7, V 8–16, bar 17–22); the same set repeats
    per layer, so DOM order is layer0's 23 verts then layer1's */
const VERT_OFFSETS = LOGO_PATHS.map((_, j) =>
  LOGO_PATHS.slice(0, j).reduce((n, q) => n + q.verts.length, 0),
)
/** Vertices off-limits for author cards — 19 (bar top, 103.7,231.8)
    nearly overlaps 2 (t top, 104.5,229.5), so their cards would
    stack. Authors assigned here are ignored. */
const OFF_LIMITS_VERTS = new Set([19])

export interface WitSpaceAuthor {
  /** Flat vertex index within a face (see VERT_OFFSETS). */
  vert: number
  /** Which face's copy triggers and anchors the card — omit for either.
      `near` = the +z face closest to the viewer (readable logo),
      `far` = the copy behind it. */
  face?: 'near' | 'far'
  name: string
  role?: string
  /** Avatar image URL (CMS Media url resolved at call site). */
  picture?: string
  /** Link target — card renders as an anchor (e.g. the agent's blog page). */
  href?: string
}

export interface WitSpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logo width in px. */
  size?: number
  /** Max tilt per axis in degrees (pointer at viewport edge). */
  maxTilt?: number
  /** Extrusion depth in px (default size * 0.15). */
  depth?: number
  /** Author cards revealed on vertex hover — one entry per vertex. */
  authors?: WitSpaceAuthor[]
}

/** Vector-space logo — the wit mark extruded through stacked SVG layers,
    shearing under inertial lag; tilts toward the pointer. */
const WitSpace: React.FC<WitSpaceProps> = ({
  className,
  size = 900,
  maxTilt = 30,
  depth,
  authors = [],
  ...props
}) => {
  const cubeRef = React.useRef<HTMLDivElement>(null)
  const d = depth ?? size * 0.15

  // per-face authored vert sets — drives data-author (hover target)
  // in markup; face-less authors mark both copies
  const authoredByFace = {
    near: new Set(
      authors
        .filter((a) => a.face !== 'far' && !OFF_LIMITS_VERTS.has(a.vert))
        .map((a) => a.vert),
    ),
    far: new Set(
      authors
        .filter((a) => a.face !== 'near' && !OFF_LIMITS_VERTS.has(a.vert))
        .map((a) => a.vert),
    ),
  }

  React.useEffect(() => {
    const cube = cubeRef.current
    if (!cube || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // layer metadata — z position + shear factor (symmetric around the
    // stack center: back trails +1, front leads −1 — like a pivoting
    // solid) + a small per-layer random gain
    const layers = Array.from(cube.querySelectorAll('.wit-space-layer')).map((el, i) => ({
      el: el as HTMLElement,
      z: (i / (LAYERS - 1) - 0.5) * d,
      k: (1 - (2 * i) / (LAYERS - 1)) * (0.9 + Math.random() * 0.2),
    }))
    // depth edges — vertex anchor point in px (left/top set in markup)
    const edges = Array.from(cube.querySelectorAll('.wit-space-edge')).map((el) => ({
      el: el as HTMLElement,
      bx: (el as HTMLElement).offsetLeft,
      by: (el as HTMLElement).offsetTop,
    }))
    // vertex hover — JS proximity check, because CSS :hover can't reach
    // a vertex occluded by the other face in 3D: every vert whose
    // projected hit disc covers the pointer gets -near, depth order
    // doesn't matter. Only authored verts participate (data-author
    // in markup) — the rest keep their dot but are inert
    const overlay = cube.parentElement!.querySelector('.wit-space-overlay') as HTMLElement
    const verts = Array.from(cube.querySelectorAll('.wit-space-layer')).flatMap(
      (svg, li) =>
        Array.from(svg.querySelectorAll('.wit-space-vert[data-author]')).map((el) => ({ el, li })),
    ).map(({ el, li }) => {
      // 2D overlay copy of the halo+dot — the svg vert can't be lifted
      // out of its layer plane (preserve-3d doesn't cross into svg), so
      // a back-face vert's halo renders behind the front face. This
      // screen-space twin is drawn on top at the measured position
      const ov = document.createElement('i')
      ov.className = 'wit-space-ov'
      const ring = document.createElement('b')
      ring.className = 'wit-space-ov-ring'
      const ringW = document.createElement('b')
      ringW.className = 'wit-space-ov-ringw'
      const dot = document.createElement('b')
      dot.className = 'wit-space-ov-dot'
      const fill = el.querySelector('.wit-space-dot')!.getAttribute('fill')!
      ring.style.borderColor = fill
      dot.style.background = fill
      ov.append(ring, ringW, dot)
      overlay.appendChild(ov)
      return {
        el: el as SVGGElement,
        hit: el.querySelector('.wit-space-hit') as SVGCircleElement,
        ov: { el: ov, ring, ringW, dot },
        vIdx: Number(el.getAttribute('data-vert')),
        // DOM order is far-face verts first, near-face (+z) last
        isNear: li === LAYERS - 1,
      }
    })
    // face labels — 2D overlay spans pinned to two anchor points inside
    // the layer svgs (in-plane text gets re-sorted by the compositor,
    // appearing to jump faces; see LABELS)
    const labels = Array.from(cube.querySelectorAll('.wit-space-label-anchor')).map((el) => {
      const span = document.createElement('span')
      span.className = 'wit-space-label'
      span.textContent = el.getAttribute('data-text')
      overlay.appendChild(span)
      return {
        a: el.querySelector('.wit-space-label-a') as SVGCircleElement,
        b: el.querySelector('.wit-space-label-b') as SVGCircleElement,
        el: span,
      }
    })
    // author boxes — overlay cards revealed on vertex proximity, one
    // entry per vertex+face; `any` authors reveal from either copy,
    // `near`/`far` authors only from their own face's copy, offset
    // 30px toward the component center
    const authorBoxes = new Map<
      string,
      { el: HTMLElement; near: boolean; x: number; y: number }
    >()
    for (const a of authors) {
      if (OFF_LIMITS_VERTS.has(a.vert)) continue
      const box = document.createElement(a.href ? 'a' : 'div')
      if (a.href) {
        ;(box as HTMLAnchorElement).href = a.href
        // aria-hidden subtree — pointer-only card must not take focus
        box.tabIndex = -1
      }
      box.className = 'wit-space-author'
      if (a.picture) {
        const img = document.createElement('img')
        img.className = 'wit-space-author-pic'
        img.src = a.picture
        img.alt = ''
        box.appendChild(img)
      } else {
        const ph = document.createElement('i')
        ph.className = 'wit-space-author-pic wit-space-author-pic-empty'
        box.appendChild(ph)
      }
      const info = document.createElement('div')
      info.className = 'wit-space-author-info'
      const nm = document.createElement('b')
      nm.className = 'wit-space-author-name'
      nm.textContent = a.name
      info.appendChild(nm)
      if (a.role) {
        const rl = document.createElement('span')
        rl.className = 'wit-space-author-role'
        rl.textContent =
          a.role.length > 40 ? a.role.slice(0, 39).trimEnd() + '…' : a.role
        info.appendChild(rl)
      }
      box.appendChild(info)
      overlay.appendChild(box)
      authorBoxes.set(`${a.face ?? 'any'}:${a.vert}`, { el: box, near: false, x: 0, y: 0 })
    }
    const pointer = { x: -1e4, y: -1e4 }

    const target = { rx: -20, ry: 20 }
    let raf = 0
    let sleeping = false
    const wake = () => {
      if (!sleeping) return
      sleeping = false
      raf = requestAnimationFrame(tick)
    }
    // pointermove covers mouse + pen + touch drag (mobile has no hover)
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      target.ry = ((e.clientX / window.innerWidth) * 2 - 1) * maxTilt
      target.rx = -((e.clientY / window.innerHeight) * 2 - 1) * maxTilt
      wake()
    }
    window.addEventListener('pointermove', onMove)

    const cur = { rx: -20, ry: 20 }
    const lag = { x: 0, y: 0, vx: 0, vy: 0 }
    const tick = () => {
      const prx = cur.rx
      const pry = cur.ry
      cur.rx += (target.rx - cur.rx) * 0.12
      cur.ry += (target.ry - cur.ry) * 0.12
      cube.style.setProperty('--wit-space-rx', `${cur.rx}deg`)
      cube.style.setProperty('--wit-space-ry', `${cur.ry}deg`)

      // inertial shear — a springed lag vector opposing the angular
      // velocity offsets each layer by its depth factor, so the extrusion
      // leans while turning and springs back at rest
      const wx = -(cur.ry - pry)
      const wy = cur.rx - prx
      const w = Math.hypot(wx, wy)
      const t = Math.min(w * 32, 128)
      const tx = w > 0 ? (wx / w) * t : 0
      const ty = w > 0 ? (wy / w) * t : 0
      lag.vx += (tx - lag.x) * 0.09
      lag.vy += (ty - lag.y) * 0.09
      lag.vx = lag.vx * 0.86 + (Math.random() - 0.5) * w * 0.5
      lag.vy = lag.vy * 0.86 + (Math.random() - 0.5) * w * 0.5
      lag.x += lag.vx
      lag.y += lag.vy
      for (const l of layers) {
        l.el.style.transform =
          `translate(${(lag.x * l.k).toFixed(2)}px,${(lag.y * l.k).toFixed(2)}px) ` +
          `translateZ(${l.z.toFixed(2)}px)`
      }
      // depth edges — rod from front vertex (offset −lag) to back vertex
      // (offset +lag): point its +x axis along the 3D direction via
      // yaw(rotateY) + pitch(rotateZ) + stretch
      for (const e of edges) {
        const dx = 2 * lag.x
        const dy = 2 * lag.y
        const len = Math.hypot(dx, dy, d)
        const yaw = Math.atan2(d, dx)
        const pitch = Math.asin(dy / len)
        e.el.style.transform =
          `translate3d(${(-lag.x).toFixed(2)}px,${(-lag.y).toFixed(2)}px,${(d / 2).toFixed(2)}px) ` +
          `rotateY(${yaw.toFixed(4)}rad) rotateZ(${pitch.toFixed(4)}rad) scaleX(${(len / d).toFixed(3)})`
      }
      // vertex hover — flag every hit disc under the pointer for the
      // halo (CSS :hover can't reach verts occluded in 3D) and place
      // the 2D overlay twin on top at the measured screen position
      const ob = overlay.getBoundingClientRect()
      for (const a of authorBoxes.values()) a.near = false
      for (const v of verts) {
        const r = v.hit.getBoundingClientRect()
        const dx = r.left + r.width / 2 - pointer.x
        const dy = r.top + r.height / 2 - pointer.y
        const near = Math.hypot(dx, dy) < r.width / 2
        v.el.classList.toggle('wit-space-vert-near', near)
        v.ov.el.style.opacity = near ? '1' : '0'
        // `any` authors update from both copies — DOM order puts the
        // near face last, so it wins the anchor; face authors only
        // ever see their own face's copy
        for (const ab of [
          authorBoxes.get(`any:${v.vIdx}`),
          authorBoxes.get(v.isNear ? `near:${v.vIdx}` : `far:${v.vIdx}`),
        ]) {
          if (!ab) continue
          ab.near ||= near
          ab.x = r.left + r.width / 2 - ob.left
          ab.y = r.top + r.height / 2 - ob.top
        }
        if (near) {
          const s = r.width / 6 // px per svg unit (hit disc diameter = 6)
          v.ov.el.style.transform =
            `translate(${(r.left + r.width / 2 - ob.left).toFixed(1)}px,` +
            `${(r.top + r.height / 2 - ob.top).toFixed(1)}px)`
          v.ov.ring.style.cssText =
            `width:${(2.625 * s).toFixed(1)}px;height:${(2.625 * s).toFixed(1)}px;` +
            `margin:${(-1.3125 * s).toFixed(1)}px 0 0 ${(-1.3125 * s).toFixed(1)}px;` +
            `border-width:${(0.25 * s).toFixed(1)}px`
          v.ov.ringW.style.cssText =
            `width:${(2 * s).toFixed(1)}px;height:${(2 * s).toFixed(1)}px;` +
            `margin:${(-s).toFixed(1)}px 0 0 ${(-s).toFixed(1)}px;` +
            `border-width:${(0.4 * s).toFixed(1)}px`
          v.ov.dot.style.cssText =
            `width:${(1.41 * s).toFixed(1)}px;height:${(1.41 * s).toFixed(1)}px;` +
            `margin:${(-0.705 * s).toFixed(1)}px 0 0 ${(-0.705 * s).toFixed(1)}px`
        }
      }
      // face labels — projected position/angle/scale from the two
      // anchors (b−a is a 10-unit direction vector in svg space)
      for (const l of labels) {
        const ra = l.a.getBoundingClientRect()
        const rb = l.b.getBoundingClientRect()
        const ax = ra.left + ra.width / 2 - ob.left
        const ay = ra.top + ra.height / 2 - ob.top
        const ang = Math.atan2(
          rb.top + rb.height / 2 - ob.top - ay,
          rb.left + rb.width / 2 - ob.left - ax,
        )
        const s = Math.hypot(rb.left + rb.width / 2 - ob.left - ax, rb.top + rb.height / 2 - ob.top - ay) / 10
        l.el.style.transform =
          `translate(${ax.toFixed(1)}px,${ay.toFixed(1)}px) ` +
          `rotate(${ang.toFixed(4)}rad) translateY(-0.8em)`
        l.el.style.fontSize = `${(LABEL_FONT * s).toFixed(2)}px`
      }
      // author boxes — show when the vertex was near on any face or
      // the card itself is hovered (so a link card stays up long
      // enough to click); offset toward the component center
      // (left half → +30, right → −30)
      for (const a of authorBoxes.values()) {
        a.el.classList.toggle(
          'wit-space-author-near',
          a.near || a.el.matches(':hover'),
        )
        if (a.near) {
          const off = a.x < ob.width / 2 ? 30 : -30
          a.el.style.transform =
            `translate(${(a.x + off).toFixed(1)}px,${a.y.toFixed(1)}px) translateY(-50%)`
        }
      }
      // sleep when settled — stop scheduling rAF until the pointer moves
      const still =
        w < 0.01 &&
        Math.abs(lag.x) < 0.05 &&
        Math.abs(lag.y) < 0.05 &&
        Math.abs(cur.rx - target.rx) < 0.01 &&
        Math.abs(cur.ry - target.ry) < 0.01
      if (still) {
        sleeping = true
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      overlay.replaceChildren()
    }
  }, [maxTilt, d, size, authors])

  return (
    <div
      data-slot="wit-space"
      aria-hidden
      className={cx('wit-space', className)}
      style={
        {
          perspective: size * 6,
          width: size,
          aspectRatio: '15 / 7',
          '--wit-space-size': `${size}px`,
          '--wit-space-depth': `${d}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      <style>{`
        .wit-space {
          position: relative; display: inline-flex;
          align-items: center; justify-content: center;
        }
        .wit-space-cube {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
        }
        .wit-space-layer { position: absolute; inset: 0; pointer-events: none; }
        .wit-space-vert { pointer-events: all; }
        /* only authored verts are hover targets — the rest have no
           hit disc and no halo (pointer-events none also blocks the
           CSS :hover fallback) */
        .wit-space-vert:not([data-author]) { pointer-events: none; }
        .wit-space-edge {
          position: absolute; width: var(--wit-space-depth);
          height: calc(var(--wit-space-size) / 150 * 0.2);
          margin-top: calc(var(--wit-space-size) / 150 * -0.1);
          transform-origin: 0 50%;
          transform-style: preserve-3d;
        }
        .wit-space-edge u { position: absolute; inset: 0; opacity: 0.2; }
        .wit-space-edge u + u { transform: rotateX(90deg); }
        .wit-space-halo { opacity: 0; transition: opacity .3s ease; }
        .wit-space-vert:hover .wit-space-halo { opacity: 1; }
        .wit-space-vert:hover .wit-space-dot {
          fill: #c93018;
          animation: wit-space-dot 2.4s ease-in-out infinite;
        }
        @keyframes wit-space-dot { 0%, 100% { fill: currentColor; } 50% { fill: #c93018; } }
        @media (prefers-reduced-motion: reduce) { .wit-space-dot, .wit-space-ov-dot { animation: none; } }
        .wit-space-overlay { position: absolute; inset: 0; pointer-events: none; }
        .wit-space-label {
          position: absolute; left: 0; top: 0;
          transform-origin: 0 0;
          color: #fff; opacity: 0.5;
          font-family: var(--font-open-sans), sans-serif;
          letter-spacing: 0.1em; white-space: nowrap;
        }
        /* in-plane fallback only for reduced motion (no rAF loop) —
           hidden otherwise so only the overlay twin renders */
        @media (prefers-reduced-motion: no-preference) {
          .wit-space-label-static { display: none; }
        }
        /* author card — placeholder styling until the Figma molecule lands */
        .wit-space-author {
          position: absolute; left: 0; top: 0;
          display: flex; align-items: flex-start;
          width: 171px; box-sizing: border-box; overflow: hidden;
          gap: calc(var(--padding-padding-6px, 6) * 1px);
          padding: calc(var(--padding-padding-6px, 6) * 1px);
          background: var(--background-fill-background-fill-surface, #fafafa);
          color: var(--typography-heading, #0e1223);
          border: 1px solid var(--background-stroke-background-stroke-surface, #e0e2e7);
          border-radius: calc(var(--radius-radius-sm-3x, 6) * 1px);
          box-shadow: 0 8px calc(var(--blurr-blurr-sm, 10) * 1px) 0 rgb(0 0 0 / 0.06);
          opacity: 0; transition: opacity .3s ease;
          white-space: normal; pointer-events: none;
          text-decoration: none;
        }
        .wit-space-author-near { opacity: 1; }
        /* link cards stay interactive through the fade-out — the
           delayed visibility transition keeps them hoverable for the
           .3s it takes the pointer to cross the gap from the vertex */
        a.wit-space-author {
          pointer-events: auto; visibility: hidden;
          transition: opacity .3s ease, visibility 0s .3s;
        }
        a.wit-space-author-near {
          visibility: visible; transition: opacity .3s ease;
        }
        .wit-space-author-pic {
          width: 44px; height: 44px;
          border-radius: calc(var(--radius-radius-infinity, 9999) * 1px);
          object-fit: cover; flex: none;
        }
        .wit-space-author-pic-empty { background: var(--muted); display: block; }
        .wit-space-author-info {
          display: flex; flex-direction: column; justify-content: center;
          align-items: flex-start; flex: none; width: 115px; height: 44px;
          line-height: normal; word-break: break-word;
        }
        .wit-space-author-name {
          width: 100%; height: 21px; flex: none;
          font-size: 14.4px; font-weight: 600; letter-spacing: -0.3px;
        }
        .wit-space-author-role {
          width: 100%; flex: none; font-size: 12px; font-weight: 400;
          color: var(--typography-body-soft, #667085);
        }
        .wit-space-ov { position: absolute; left: 0; top: 0; opacity: 0; transition: opacity .3s ease; }
        .wit-space-ov-ring {
          position: absolute; border-radius: 50%;
          border-style: solid; box-sizing: border-box;
        }
        .wit-space-ov-ringw {
          position: absolute; border-radius: 50%;
          border: 0 solid #fff; box-sizing: border-box;
        }
        .wit-space-ov-dot {
          position: absolute; border-radius: 50%;
        }
        .wit-space-ov-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #c93018; opacity: 0;
          animation: wit-space-ov-dot 2.4s ease-in-out infinite;
        }
        @keyframes wit-space-ov-dot { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      `}</style>
      <div
        ref={cubeRef}
        className="wit-space-cube"
        style={{
          transform: 'rotateX(var(--wit-space-rx, -20deg)) rotateY(var(--wit-space-ry, 20deg))',
        }}
      >
        {Array.from({ length: LAYERS }, (_, i) => (
          <svg
            key={i}
            className="wit-space-layer"
            viewBox="0 227 150 70"
            style={{ transform: `translateZ(${((i / (LAYERS - 1) - 0.5) * d).toFixed(2)}px)` }}
          >
            {LOGO_PATHS.map((p, j) => (
              <path
                key={j}
                d={p.d}
                fill={p.fill}
                fillOpacity="0.5"
                stroke={p.fill}
                strokeWidth="0.4"
              />
            ))}
            {LABELS.map((L) =>
              i === L.layer ? (
                <g key={L.text} className="wit-space-label-anchor" data-text={L.text}>
                  <circle
                    className="wit-space-label-a"
                    cx={L.x}
                    cy={L.y}
                    r="0.5"
                    fill="#fff"
                    fillOpacity="0"
                  />
                  <circle
                    className="wit-space-label-b"
                    cx={L.x + 10 * Math.cos((L.a * Math.PI) / 180)}
                    cy={L.y + 10 * Math.sin((L.a * Math.PI) / 180)}
                    r="0.5"
                    fill="#fff"
                    fillOpacity="0"
                  />
                  <text
                    className="wit-space-label-static"
                    x={L.x}
                    y={L.y}
                    transform={`rotate(${L.a} ${L.x} ${L.y})`}
                    fontSize={LABEL_FONT}
                    fill="#fff"
                    fillOpacity="0.5"
                    style={{
                      fontFamily: 'var(--font-open-sans), sans-serif',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {L.text}
                  </text>
                </g>
              ) : null,
            )}
            {LOGO_PATHS.flatMap((p, j) =>
              p.verts.map(([x, y], k) => (
                <g
                  key={`${j}-${k}`}
                  className="wit-space-vert"
                  data-vert={VERT_OFFSETS[j] + k}
                  data-author={
                    (i === LAYERS - 1 ? authoredByFace.near : authoredByFace.far).has(
                      VERT_OFFSETS[j] + k,
                    ) || undefined
                  }
                >
                  <circle
                    className="wit-space-halo"
                    cx={x}
                    cy={y}
                    r="1.3125"
                    fill="none"
                    stroke={p.fill}
                    strokeWidth="0.25"
                  />
                  <circle
                    className="wit-space-halo"
                    cx={x}
                    cy={y}
                    r="1"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="0.4"
                  />
                  <circle
                    className="wit-space-dot"
                    cx={x}
                    cy={y}
                    r="0.705"
                    fill={p.fill}
                    style={{ color: p.fill }}
                  />
                  <circle className="wit-space-hit" cx={x} cy={y} r="3" fill="#fff" fillOpacity="0" />
                </g>
              )),
            )}
          </svg>
        ))}
        {EDGES.map((e, i) => (
          <i
            key={i}
            className="wit-space-edge"
            style={{
              left: `${(e.x / 150) * 100}%`,
              top: `${((e.y - 227) / 70) * 100}%`,
              transform: `translateZ(${d / 2}px) rotateY(90deg)`,
            }}
          >
            <u style={{ background: e.fill }} />
            <u style={{ background: e.fill }} />
          </i>
        ))}
      </div>
      <div className="wit-space-overlay" />
    </div>
  )
}

export { WitSpace }
