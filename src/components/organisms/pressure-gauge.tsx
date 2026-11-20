import { cx } from '@/lib/cx'
import * as React from 'react'

const polar = (deg: number, r: number, px = 100, py = 100) => ({
  x: Number((px + r * Math.cos((deg * Math.PI) / 180)).toFixed(2)),
  y: Number((py + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)),
})

/** Arc along the semicircle between two dial angles (0..180). */
const arcPath = (from: number, to: number, r: number) => {
  const a = polar(from, r)
  const b = polar(to, r)
  return `M${a.x.toFixed(2)},${a.y.toFixed(2)}A${r},${r} 0 0 1 ${b.x.toFixed(2)},${b.y.toFixed(2)}`
}

export interface PressureGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dial reading, 0–100. Clamped. */
  value: number
  /** Caption under the dial, e.g. "steam". */
  label?: string
  /** Unit shown after the value, e.g. "kPa", "%". */
  unit?: string
  /** Reading at which the red zone begins. */
  dangerFrom?: number
}

/** Analog pressure gauge — semicircular dial with tick marks, red zone and needle. */
const PressureGauge: React.FC<PressureGaugeProps> = ({
  className,
  value,
  label,
  unit,
  dangerFrom = 75,
  ...props
}) => {
  const clamped = Math.min(100, Math.max(0, value))
  // 180 = left stop (0), 0 = right stop (100); the dial sweeps over the top.
  const angle = (v: number) => 180 - (v / 100) * 180
  const needle = polar(angle(clamped), 66)

  return (
    <div
      data-slot="pressure-gauge"
      className={cx('gauge', className)}
      {...props}
    >
      <svg className="gauge-svg" viewBox="0 0 200 122" role="img" aria-label={`${label ?? 'gauge'}: ${clamped}${unit ?? ''}`}>
        {/* dial ring */}
        <path d={arcPath(180, 0, 92)} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={4} />
        {/* danger zone */}
        <path
          d={arcPath(angle(100), angle(dangerFrom), 92)}
          fill="none"
          className="gauge-danger"
          strokeWidth={6}
        />
        {/* tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const deg = angle(i * 10)
          const major = i % 5 === 0
          const o = polar(deg, 84)
          const t = polar(deg, major ? 70 : 76)
          return (
            <line
              key={i}
              x1={o.x} y1={o.y} x2={t.x} y2={t.y}
              stroke="currentColor"
              strokeOpacity={0.7}
              strokeWidth={major ? 2.5 : 1.2}
            />
          )
        })}
        {/* needle */}
        <line x1={100} y1={100} x2={needle.x} y2={needle.y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        <circle cx={100} cy={100} r={6} className="gauge-hub" />
        {/* reading */}
        <text x={100} y={118} textAnchor="middle" fill="currentColor" className="gauge-value" fontSize={14} fontWeight={600}>
          {Math.round(clamped)}
          {unit ? <tspan fontSize={10} fontWeight={400}> {unit}</tspan> : null}
        </text>
      </svg>
      {label ? <span className="gauge-label">{label}</span> : null}
    </div>
  )
}

export { PressureGauge }
