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
const T_RING = poly('109.38,257.26 112.31,251.96 112.49,251.58 112.81,250.82 113.1,250.07 113.36,249.34 113.59,248.63 113.79,247.93 113.96,247.24 114.1,246.57 114.22,245.92 114.3,245.28 114.37,244.65 114.41,244.04 114.42,243.44 114.42,242.86 114.39,242.29 114.34,241.74 114.27,241.2 114.18,240.67 114.07,240.15 113.95,239.65 113.81,239.17 113.65,238.69 113.48,238.23 113.29,237.79 113.09,237.35 112.88,236.93 112.66,236.52 112.43,236.13 112.18,235.74 111.93,235.37 111.68,235.01 111.41,234.67 111.14,234.33 110.86,234.01 110.58,233.7 110.3,233.41 110.01,233.12 109.72,232.84 109.43,232.58 109.14,232.33 108.71,231.97 108.15,231.54 107.6,231.15 107.07,230.8 106.58,230.49 106.12,230.22 105.7,230 105.34,229.81 104.91,229.61 104.58,229.46 104.53,229.45 110.78,229.43 126.73,229.39 131.75,229.37 131.91,229.38 132.68,229.45 133.26,229.54 133.71,229.61 134.21,229.71 134.74,229.83 135.31,229.97 135.91,230.14 136.53,230.34 137.17,230.58 137.65,230.77 137.98,230.92 138.31,231.07 138.64,231.23 138.98,231.4 139.31,231.59 139.64,231.78 139.97,231.98 140.29,232.2 140.62,232.42 140.94,232.66 141.25,232.91 141.56,233.18 141.87,233.45 142.17,233.74 142.46,234.04 142.75,234.36 143.03,234.69 143.3,235.03 143.56,235.39 143.81,235.76 144.05,236.15 144.28,236.55 144.5,236.97 144.7,237.41 144.89,237.86 145.07,238.33 145.23,238.81 145.38,239.31 145.52,239.83 145.63,240.37 145.73,240.92 145.82,241.5 145.88,242.09 145.92,242.7 145.95,243.33 145.96,243.65 145.96,243.97 145.94,244.6 145.91,245.22 145.85,245.81 145.78,246.38 145.69,246.94 145.58,247.48 145.46,248 145.32,248.5 145.16,248.99 144.99,249.46 144.81,249.92 144.61,250.35 144.4,250.78 144.18,251.18 143.95,251.58 143.7,251.95 143.45,252.32 143.19,252.66 142.91,253 142.63,253.32 142.34,253.63 142.05,253.92 141.75,254.2 141.44,254.47 141.13,254.73 140.81,254.97 140.49,255.2 140.17,255.42 139.85,255.63 139.52,255.83 139.19,256.02 138.86,256.2 138.53,256.37 138.21,256.53 137.88,256.68 137.4,256.88 136.76,257.13 136.15,257.34 135.55,257.52 134.99,257.68 134.44,257.8 133.92,257.89 133.42,257.95 132.94,257.97 132.48,257.96 132.05,257.93 131.63,257.87 131.25,257.79 130.89,257.68 130.56,257.55 130.25,257.41 130.97,257.57 126.87,256.59 124.34,257.98 124.41,258.47 124.7,280.73 124.69,281.23 124.64,282.23 124.57,283.12 124.46,283.92 124.31,284.62 124.11,285.22 123.87,285.74 123.58,286.17 123.25,286.52 122.88,286.79 122.46,287 121.99,287.14 121.49,287.21 120.95,287.22 120.38,287.18 119.79,287.08 119.16,286.94 118.52,286.76 117.85,286.54 117.17,286.28 116.47,285.99 115.76,285.66 115.05,285.3 114.33,284.9 113.62,284.48 112.91,284.02 112.21,283.54 111.52,283.04 110.84,282.51 110.43,282.19 110.43,294.93 109.93,294.89 109.07,294.77 108.31,294.61 107.64,294.39 107.04,294.13 106.5,293.82 106.01,293.45 105.58,293.03 105.2,292.56 104.87,292.04 104.58,291.46 104.34,290.82 104.14,290.13 103.98,289.39 103.86,288.61 103.78,287.78 103.74,286.91 103.73,286.16 103.74,285.42 103.78,284.67 103.86,283.93 103.96,283.18 104.1,282.45 104.27,281.73 104.47,281.03 104.71,280.35 104.98,279.68 105.28,279.04 105.62,278.43 105.98,277.84 106.37,277.28 106.8,276.76 107.26,276.26 107.75,275.8 108.27,275.38 108.82,274.99 109.39,274.64 109.38,257.26')

/** flattened bar outline at tol 0.01 (the d keeps its beziers) */
const BAR_RING = poly('109.51,250.83 109.58,250.68 109.86,249.98 110.06,249.44 110.2,249.01 110.34,248.53 110.48,248.01 110.61,247.45 110.73,246.85 110.84,246.22 110.93,245.55 110.99,244.86 111.02,244.32 111.04,243.96 111.04,243.59 111.03,243.21 111.01,242.84 110.99,242.45 110.95,242.07 110.9,241.68 110.85,241.29 110.77,240.9 110.69,240.5 110.59,240.11 110.48,239.71 110.36,239.31 110.21,238.92 110.06,238.52 109.89,238.13 109.7,237.73 109.49,237.34 109.27,236.95 109.03,236.56 108.77,236.18 108.49,235.79 108.19,235.42 107.87,235.04 107.53,234.67 107.17,234.31 106.78,233.95 106.38,233.6 105.95,233.25 105.5,232.91 105.02,232.58 104.52,232.26 103.99,231.94 103.72,231.78 103.44,231.63 102.89,231.35 102.35,231.09 101.82,230.86 101.29,230.65 100.77,230.47 100.26,230.31 99.75,230.17 99.25,230.05 98.76,229.95 98.27,229.87 97.79,229.81 97.32,229.77 96.86,229.75 96.4,229.75 95.95,229.76 95.51,229.79 95.07,229.83 94.64,229.89 94.22,229.96 93.81,230.05 93.41,230.14 93.01,230.25 92.62,230.37 92.24,230.51 91.87,230.65 91.5,230.8 91.15,230.96 90.8,231.12 90.46,231.3 90.13,231.48 89.8,231.67 89.49,231.86 89.19,232.05 88.74,232.36 88.19,232.77 87.66,233.18 87.18,233.6 86.73,234.01 86.32,234.42 85.95,234.8 85.62,235.17 85.32,235.5 84.96,235.95 84.51,236.55 84.42,236.68 63.76,273.32 63.69,273.46 63.38,274.17 63.16,274.73 63.01,275.16 62.85,275.65 62.69,276.18 62.54,276.75 62.4,277.36 62.27,278.01 62.17,278.68 62.1,279.21 62.07,279.57 62.04,279.94 62.02,280.31 62.01,280.68 62.01,281.07 62.01,281.45 62.03,281.84 62.06,282.23 62.1,282.63 62.15,283.03 62.22,283.43 62.3,283.83 62.39,284.24 62.49,284.64 62.61,285.05 62.75,285.45 62.9,285.86 63.07,286.26 63.26,286.67 63.46,287.07 63.68,287.47 63.92,287.87 64.19,288.26 64.47,288.65 64.77,289.04 65.09,289.42 65.43,289.8 65.8,290.18 66.19,290.54 66.6,290.91 67.04,291.26 67.5,291.61 67.99,291.96 68.5,292.29 69.04,292.62 69.32,292.78 69.6,292.94 70.16,293.23 70.71,293.49 71.26,293.73 71.8,293.95 72.33,294.14 72.85,294.3 73.37,294.44 73.88,294.56 74.41,294.66 74.93,294.74 75.45,294.8 75.97,294.83 76.49,294.84 77,294.83 77.51,294.8 78.02,294.75 78.52,294.68 79.02,294.59 79.51,294.49 79.99,294.36 80.47,294.22 80.94,294.06 81.41,293.89 81.87,293.7 82.32,293.49 82.76,293.27 83.2,293.04 83.63,292.79 84.05,292.53 84.47,292.26 84.87,291.97 85.27,291.67 85.66,291.36 86.04,291.03 86.41,290.7 86.77,290.35 87.13,289.99 87.47,289.62 87.81,289.24 88.14,288.85 88.46,288.45 88.77,288.05 89.07,287.63 88.85,287.47')

/** V outline — flattened union ring at tol 0.01 */
const V_RING = poly('39.6,251.06 47.72,236.64 47.81,236.51 48.26,235.91 48.62,235.47 48.92,235.13 49.25,234.77 49.62,234.38 50.03,233.98 50.48,233.57 50.97,233.15 51.49,232.73 52.05,232.32 52.49,232.02 52.79,231.82 53.11,231.63 53.43,231.45 53.76,231.27 54.1,231.09 54.45,230.92 54.81,230.76 55.17,230.61 55.54,230.47 55.92,230.34 56.31,230.22 56.71,230.11 57.11,230.01 57.53,229.93 57.95,229.86 58.37,229.8 58.81,229.75 59.25,229.73 59.7,229.71 60.16,229.72 60.63,229.74 61.1,229.78 61.58,229.84 62.06,229.92 62.56,230.01 63.06,230.13 63.56,230.27 64.08,230.43 64.6,230.62 65.12,230.83 65.66,231.06 66.2,231.32 66.74,231.6 67.02,231.75 67.29,231.91 67.82,232.22 68.32,232.55 68.8,232.88 69.25,233.22 69.68,233.57 70.09,233.92 70.47,234.28 70.83,234.64 71.17,235.01 71.49,235.38 71.79,235.76 72.07,236.14 72.33,236.53 72.57,236.91 72.8,237.3 73,237.7 73.19,238.09 73.36,238.49 73.52,238.88 73.66,239.28 73.78,239.68 73.89,240.07 73.99,240.47 74.08,240.86 74.15,241.26 74.21,241.65 74.26,242.03 74.29,242.42 74.32,242.8 74.33,243.18 74.34,243.55 74.34,243.92 74.33,244.29 74.3,244.82 74.23,245.51 74.15,246.18 74.04,246.81 73.92,247.41 73.78,247.98 73.64,248.5 73.5,248.97 73.36,249.4 73.17,249.95 72.88,250.65 72.82,250.79 52.15,287.43 52.07,287.55 51.68,288.11 51.36,288.53 51.11,288.85 50.82,289.2 50.49,289.57 50.13,289.95 49.74,290.35 49.31,290.76 48.85,291.18 48.36,291.59 47.83,292 47.28,292.4 46.84,292.69 46.54,292.88 46.23,293.06 45.91,293.24 45.59,293.41 45.26,293.57 44.92,293.73 44.57,293.88 44.22,294.01 43.86,294.15 43.49,294.27 43.12,294.38 42.73,294.48 42.34,294.57 41.95,294.64 41.55,294.71 41.13,294.76 40.72,294.79 40.29,294.82 39.86,294.82 39.43,294.82 38.98,294.79 38.53,294.75 38.08,294.7 37.61,294.62 37.14,294.53 36.67,294.41 36.18,294.28 35.69,294.13 35.2,293.95 34.95,293.86 34.8,293.8 34.5,293.68 34.06,293.5 33.5,293.23 32.96,292.94 32.7,292.79 32.66,292.77 32.62,292.75 32.32,292.58 31.74,292.22 31.2,291.86 30.68,291.49 30.19,291.11 29.73,290.73 29.3,290.34 28.9,289.94 28.53,289.55 28.19,289.16 27.89,288.78 27.62,288.41 27.38,288.05 27.17,287.7 26.99,287.36 26.84,287.03 26.72,286.71 26.63,286.4 26.56,286.11 26.52,285.83 26.5,285.57 26.51,285.33 26.54,285.1 26.6,284.89 26.68,284.7 26.78,284.52 26.91,284.36 27.06,284.22 26.43,286.35 6.53,251.07 6.44,250.89 6.1,250.17 5.85,249.49 5.66,248.85 5.52,248.26 5.44,247.71 5.41,247.2 5.44,246.73 5.52,246.31 5.65,245.93 5.83,245.6 6.06,245.31 6.33,245.06 6.66,244.86 7.02,244.7 7.43,244.6 7.88,244.54 8.37,244.53 8.9,244.57 9.46,244.67 10.06,244.81 10.7,245.01 11.37,245.26 12.09,245.57 12.09,231.6 12.47,231.46 13.16,231.14 13.81,230.87 14.43,230.65 15.01,230.49 15.55,230.39 16.05,230.35 16.52,230.37 16.95,230.45 17.34,230.6 17.69,230.81 18,231.08 18.28,231.42 18.51,231.82 18.71,232.28 18.87,232.8 18.99,233.38 19.07,234.02 19.11,234.71 19.12,235.47 19.09,236.28 19.02,237.15 18.92,238.08 18.78,239.07 18.6,240.11 18.38,241.21 18.12,242.37 17.83,243.58 17.5,244.84 17.14,246.15 16.74,247.51 16.31,248.92 15.85,250.38 15.36,251.88 14.83,253.42 14.28,255 13.7,256.61 13.09,258.26 12.45,259.95 11.79,261.66 11.1,263.41 10.39,265.18 9.66,266.98 8.91,268.8 8.14,270.65 7.36,272.51 6.56,274.39 5.75,276.28 4.93,278.18 4.09,280.1 3.25,282.02 2.4,283.95 1.55,285.88 0.7,287.81 -0.16,289.74 39.6,251.06')

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

export interface WitSpaceSmallProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logo width in px. */
  size?: number
  /** Max tilt per axis in degrees (pointer at viewport edge). */
  maxTilt?: number
  /** Extrusion depth in px (default size * 0.15). */
  depth?: number
}

/** Small vector-space logo — same extruded shear+tilt as `WitSpace`,
    minus the interactive overlays: no vertex halos, no face labels,
    no author cards. */
const WitSpaceSmall: React.FC<WitSpaceSmallProps> = ({
  className,
  size = 900,
  maxTilt = 30,
  depth,
  ...props
}) => {
  const cubeRef = React.useRef<HTMLDivElement>(null)
  const d = depth ?? size * 0.15

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
    }
  }, [maxTilt, d, size])

  return (
    <div
      data-slot="wit-space--small"
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
        .wit-space { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .wit-space-cube { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
        .wit-space-layer { position: absolute; inset: 0; pointer-events: none; }
        .wit-space-edge {
          position: absolute; width: var(--wit-space-depth);
          height: calc(var(--wit-space-size) / 150 * 0.2);
          margin-top: calc(var(--wit-space-size) / 150 * -0.1);
          transform-origin: 0 50%;
          transform-style: preserve-3d;
        }
        .wit-space-edge u { position: absolute; inset: 0; opacity: 0.2; }
        .wit-space-edge u + u { transform: rotateX(90deg); }
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
            {LOGO_PATHS.flatMap((p, j) =>
              p.verts.map(([x, y], k) => (
                <circle
                  key={`${j}-${k}`}
                  cx={x}
                  cy={y}
                  r="0.705"
                  fill={p.fill}
                />
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
    </div>
  )
}

export { WitSpaceSmall }
