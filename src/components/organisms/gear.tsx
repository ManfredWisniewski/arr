import { cx } from '@/lib/cx'
import * as React from 'react'

/** Gear outline with straight flanks — trurl machinist silhouette. */
const gearPath = (teeth: number, rOut: number, rRoot: number, px: number, py: number): string => {
  const step = (Math.PI * 2) / teeth
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    for (const [ang, r] of [
      [a - 0.45 * step, rRoot],
      [a - 0.2 * step, rOut],
      [a + 0.2 * step, rOut],
      [a + 0.45 * step, rRoot],
    ]) {
      pts.push(`${(px + r * Math.cos(ang)).toFixed(2)},${(py + r * Math.sin(ang)).toFixed(2)}`)
    }
  }
  return `M${pts.join('L')}Z`
}

const holePath = (r: number, px: number, py: number): string =>
  `M${px - r},${py}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`

const round = (n: number): number => Number(n.toFixed(2))

export interface GearProps extends React.SVGProps<SVGSVGElement> {
  /** Number of teeth; fewer teeth read larger/chunkier. */
  teeth?: number
  /** Seconds per revolution. Set to 0 to render a static gear. */
  speed?: number
  /** Counter-rotate — pair two meshing gears. */
  reverse?: boolean
}

const Gear: React.FC<GearProps> = ({
  className,
  teeth = 10,
  speed = 12,
  reverse = false,
  ...props
}) => {
  const c = 50
  const d = `${gearPath(teeth, 48, 38, c, c)}${holePath(14, c, c)}${holePath(5, c, c)}`
  const spinning = speed > 0

  return (
    <svg
      data-slot="gear"
      viewBox="0 0 100 100"
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cx('gear', spinning && 'gear-spin', className)}
      style={
        spinning
          ? { animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : undefined }
          : undefined
      }
      {...props}
    >
      <path d={d} fillRule="evenodd" />
      {/* bolt circle */}
      <circle cx={c} cy={c} r={24} fill="none" stroke="currentColor" strokeOpacity={0.5} />
      {Array.from({ length: Math.max(3, Math.round(teeth / 2)) }, (_, i) => {
        const a = (i / Math.max(3, Math.round(teeth / 2))) * Math.PI * 2
        return (
          <circle key={i} cx={round(c + 24 * Math.cos(a))} cy={round(c + 24 * Math.sin(a))} r={2.4} fill="currentColor" />
        )
      })}
    </svg>
  )
}

export { Gear }
