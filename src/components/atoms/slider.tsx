'use client'

import React from 'react'

import { cx } from '@/lib/cx'

const pct = (value: number, min: number, max: number) =>
  ((value - min) / (max - min || 1)) * 100

const useSlider = (
  value: number | undefined,
  defaultValue: number,
  onChange: ((value: number) => void) | undefined,
) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const set = (next: number) => {
    if (value === undefined) {
      setInternal(next)
    }
    onChange?.(next)
  }
  return [current, set] as const
}

// Single-thumb slider — native range input; `--slider-pct` drives the
// filled track portion (.slider* contract classes).
export const Slider = ({
  className,
  defaultValue = 50,
  disabled,
  max = 100,
  min = 0,
  name,
  onChange,
  step = 1,
  value,
}: {
  className?: string
  defaultValue?: number
  disabled?: boolean
  max?: number
  min?: number
  name?: string
  onChange?: (value: number) => void
  step?: number
  value?: number
}) => {
  const [current, set] = useSlider(value, defaultValue, onChange)
  return (
    <span className={cx('slider', className)} data-disabled={disabled || undefined}>
      <input
        className="slider-input"
        disabled={disabled}
        max={max}
        min={min}
        name={name}
        onChange={(event) => set(Number(event.target.value))}
        step={step}
        style={{ '--slider-pct': `${pct(current, min, max)}%` } as React.CSSProperties}
        type="range"
        value={current}
      />
    </span>
  )
}

// Two-thumb interval slider — stacked range inputs, thumbs clamped so
// start stays below end (.range-slider* contract classes).
export const RangeSlider = ({
  className,
  defaultValue = [25, 75],
  disabled,
  max = 100,
  min = 0,
  name = 'range',
  onRangeChange,
  step = 1,
  value,
}: {
  className?: string
  defaultValue?: [number, number]
  disabled?: boolean
  max?: number
  min?: number
  name?: string
  onRangeChange?: (value: [number, number]) => void
  step?: number
  value?: [number, number]
}) => {
  const [internal, setInternal] = React.useState<[number, number]>(defaultValue)
  const [start, end] = value ?? internal
  const set = (next: [number, number]) => {
    if (value === undefined) {
      setInternal(next)
    }
    onRangeChange?.(next)
  }

  return (
    <span className={cx('range-slider', className)} data-disabled={disabled || undefined}>
      <input
        className="range-input range-start"
        disabled={disabled}
        max={max}
        min={min}
        name={`${name}-start`}
        onChange={(event) => set([Math.min(Number(event.target.value), end), end])}
        step={step}
        type="range"
        value={start}
      />
      <input
        className="range-input range-end"
        disabled={disabled}
        max={max}
        min={min}
        name={`${name}-end`}
        onChange={(event) => set([start, Math.max(Number(event.target.value), start)])}
        step={step}
        type="range"
        value={end}
      />
      <span
        aria-hidden
        className="range-fill"
        style={
          {
            '--range-lo': `${pct(start, min, max)}%`,
            '--range-hi': `${pct(end, min, max)}%`,
          } as React.CSSProperties
        }
      />
    </span>
  )
}
