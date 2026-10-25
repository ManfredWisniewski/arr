'use client'

import { cx } from '@/lib/cx'
import * as React from 'react'

const FACE_TURNS = [
  'rotateY(0deg)',
  'rotateY(90deg)',
  'rotateY(180deg)',
  'rotateY(270deg)',
  'rotateX(90deg)',
  'rotateX(-90deg)',
]

/** Per-face local frame in cube space (unit coords, centred at origin):
    a = local +x axis, b = local +y axis, o = local (0,0) corner. Maps a
    face-local grid point (lx, ly ∈ 0..1) to a world position
    o + lx·a + ly·b — used to share one node per 3D lattice point across
    the 2-3 faces that meet there, so shared edges can't disconnect. */
const FACE_FRAMES = [
  { a: [1, 0, 0], b: [0, 1, 0], o: [-0.5, -0.5, 0.5] }, // front  z=+½
  { a: [0, 0, -1], b: [0, 1, 0], o: [0.5, -0.5, 0.5] }, // right  x=+½
  { a: [-1, 0, 0], b: [0, 1, 0], o: [0.5, -0.5, -0.5] }, // back  z=-½
  { a: [0, 0, 1], b: [0, 1, 0], o: [-0.5, -0.5, -0.5] }, // left  x=-½
  { a: [1, 0, 0], b: [0, 0, 1], o: [-0.5, -0.5, -0.5] }, // top   y=-½
  { a: [1, 0, 0], b: [0, 0, -1], o: [-0.5, 0.5, 0.5] }, // bottom y=+½
]

/** 16 nodes per face at the 4×4 grid points (col, row as fractions). */
const DOTS = Array.from({ length: 16 }, (_, i) => ({ c: i % 4, r: (i / 4) | 0 }))

/** 24 grid segments per face — 12 horizontal then 12 vertical (contract
    order, face children 17-40). a/b are dot indices 0-15. */
const LINES: { a: number; b: number; vert: boolean }[] = []
for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) LINES.push({ a: r * 4 + c, b: r * 4 + c + 1, vert: false })
for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) LINES.push({ a: r * 4 + c, b: r * 4 + c + 4, vert: true })

/** Shared edges/vertices render once — on the lowest-index face touching
    them — otherwise coincident segments on adjacent faces stack alpha and
    split under sub-pixel drift. Indices are 0-based dot/line indexes. */
const PERIMETER = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15]
const HIDE_DOTS: ReadonlySet<number>[] = [
  new Set(),
  new Set([0, 4, 8, 12]), // right — c0 column (front edge)
  new Set([0, 4, 8, 12]), // back — c0 column (right edge)
  new Set([0, 3, 4, 7, 8, 11, 12, 15]), // left — c0 + c3
  new Set(PERIMETER), // top
  new Set(PERIMETER), // bottom
]
const HIDE_LINES: ReadonlySet<number>[] = [
  new Set(),
  new Set([12, 16, 20]), // right — vertical col 0
  new Set([12, 16, 20]), // back
  new Set([12, 15, 16, 19, 20, 23]), // left — vertical cols 0 + 3
  new Set([0, 1, 2, 9, 10, 11, 12, 15, 16, 19, 20, 23]), // top — all perimeter
  new Set([0, 1, 2, 9, 10, 11, 12, 15, 16, 19, 20, 23]), // bottom
]

interface NodeState {
  dir: [number, number, number]
  dist: number
  gain: number
  o: [number, number, number]
  v: [number, number, number]
}

interface DotRef {
  el: HTMLElement
  bx: number
  by: number
  ax: [number, number, number]
  ay: [number, number, number]
  node: NodeState
  x: number
  y: number
}

export interface WitCubeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Cube edge length in px. */
  size?: number
  /** Max tilt per axis in degrees (cursor at viewport edge). */
  maxTilt?: number
}

/** Baseline reference copy of WitSpace — frozen wit-cube-* classes so the
    .wit-space contract can evolve without changing this variant. */
const WitCube: React.FC<WitCubeProps> = ({ className, size = 360, maxTilt = 30, ...props }) => {
  const cubeRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const cube = cubeRef.current
    if (!cube || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const u = size / 3
    const nodes = new Map<string, NodeState>()
    const faces = Array.from(cube.children).map((face, fi) => {
      const { a, b, o } = FACE_FRAMES[fi]
      const dots: DotRef[] = Array.from(face.querySelectorAll('.wit-cube-dot')).map((el, i) => {
        const lx = (i % 4) / 3
        const ly = ((i / 4) | 0) / 3
        const p = [o[0] + lx * a[0] + ly * b[0], o[1] + lx * a[1] + ly * b[1], o[2] + lx * a[2] + ly * b[2]]
        const key = p.map((v) => Math.round((v + 0.5) * 3)).join(',')
        let node = nodes.get(key)
        if (!node) {
          const dist = Math.hypot(p[0], p[1], p[2])
          node = {
            dir: [p[0] / dist, p[1] / dist, p[2] / dist],
            dist,
            gain: 0.75 + Math.random() * 0.5,
            o: [0, 0, 0],
            v: [0, 0, 0],
          }
          nodes.set(key, node)
        }
        return {
          el: el as HTMLElement,
          bx: (i % 4) * u,
          by: ((i / 4) | 0) * u,
          ax: a as DotRef['ax'],
          ay: b as DotRef['ay'],
          node,
          x: 0,
          y: 0,
        }
      })
      return { dots, lines: Array.from(face.querySelectorAll('.wit-cube-line')) as HTMLElement[] }
    })

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
      target.ry = ((e.clientX / window.innerWidth) * 2 - 1) * maxTilt
      target.rx = -((e.clientY / window.innerHeight) * 2 - 1) * maxTilt
      wake()
    }
    window.addEventListener('pointermove', onMove)

    const cur = { rx: -20, ry: 20 }
    const tick = () => {
      const prx = cur.rx
      const pry = cur.ry
      cur.rx += (target.rx - cur.rx) * 0.12
      cur.ry += (target.ry - cur.ry) * 0.12
      cube.style.setProperty('--wit-cube-rx', `${cur.rx}deg`)
      cube.style.setProperty('--wit-cube-ry', `${cur.ry}deg`)

      // node inertia — each 3D lattice node springs outward along its
      // radial direction while the cube moves (corners trail most), then
      // every face-dot projects the shared world offset onto its face
      // axes, so nodes shared by adjacent faces stay glued together
      const speed = Math.hypot(cur.rx - prx, cur.ry - pry)
      let maxO = 0
      for (const n of nodes.values()) {
        const t = Math.min(speed * n.dist * n.gain * 8.8, 28)
        for (let k = 0; k < 3; k++) {
          n.v[k] += (t * n.dir[k] - n.o[k]) * 0.09
          n.v[k] = n.v[k] * 0.86 + (Math.random() - 0.5) * speed
          n.o[k] += n.v[k]
          const m = Math.abs(n.o[k])
          if (m > maxO) maxO = m
        }
      }
      for (const f of faces) {
        for (const d of f.dots) {
          const x = d.node.o[0] * d.ax[0] + d.node.o[1] * d.ax[1] + d.node.o[2] * d.ax[2]
          const y = d.node.o[0] * d.ay[0] + d.node.o[1] * d.ay[1] + d.node.o[2] * d.ay[2]
          d.x = x
          d.y = y
          d.el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`
        }
        for (let i = 0; i < f.lines.length; i++) {
          const ad = f.dots[LINES[i].a]
          const bd = f.dots[LINES[i].b]
          const x1 = ad.bx + ad.x
          const y1 = ad.by + ad.y
          const dx = bd.bx + bd.x - x1
          const dy = bd.by + bd.y - y1
          f.lines[i].style.transform =
            `translate(${x1.toFixed(2)}px,${y1.toFixed(2)}px) ` +
            `rotate(${Math.atan2(dy, dx)}rad) scaleX(${(Math.hypot(dx, dy) / u).toFixed(3)})`
        }
      }
      // sleep when settled — stop scheduling rAF until the pointer moves
      if (
        speed < 0.01 &&
        maxO < 0.05 &&
        Math.abs(cur.rx - target.rx) < 0.01 &&
        Math.abs(cur.ry - target.ry) < 0.01
      ) {
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
  }, [maxTilt, size])

  const half = size / 2
  const u = size / 3
  return (
    <div
      data-slot="wit-cube"
      aria-hidden
      className={cx('wit-cube', className)}
      style={
        {
          perspective: size * 6,
          width: size,
          height: size,
          '--wit-cube-size': `${size}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      <style>{`
        .wit-cube { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .wit-cube-cube { position: relative; transform-style: preserve-3d; }
        .wit-cube-face {
          position: absolute; inset: 0;
          background-color: color-mix(in srgb, currentColor 3%, transparent);
          opacity: 0.5;
        }
        .wit-cube-dot {
          position: absolute; width: 6px; height: 6px;
          margin: -3px 0 0 -3px;
          border-radius: 50%; background: currentColor;
        }
        .wit-cube-line {
          position: absolute; left: 0; top: 0;
          width: calc(var(--wit-cube-size) / 3); height: 2px;
          background: currentColor; transform-origin: 0 50%;
        }
      `}</style>
      <div
        ref={cubeRef}
        className="wit-cube-cube"
        style={{
          width: size,
          height: size,
          transform: 'rotateX(var(--wit-cube-rx, -20deg)) rotateY(var(--wit-cube-ry, 20deg))',
        }}
      >
        {FACE_TURNS.map((turn, i) => (
          <div key={i} className="wit-cube-face" style={{ transform: `${turn} translateZ(${half}px)` }}>
            {DOTS.map((d, j) => (
              <i
                key={j}
                className="wit-cube-dot"
                style={{
                  left: `${(d.c / 3) * 100}%`,
                  top: `${(d.r / 3) * 100}%`,
                  display: HIDE_DOTS[i].has(j) ? 'none' : undefined,
                }}
              />
            ))}
            {LINES.map((l, j) => (
              <u
                key={j}
                className="wit-cube-line"
                style={{
                  transform: `translate(${(l.a % 4) * u}px,${((l.a / 4) | 0) * u}px)${
                    l.vert ? ' rotate(90deg)' : ''
                  }`,
                  display: HIDE_LINES[i].has(j) ? 'none' : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { WitCube }
