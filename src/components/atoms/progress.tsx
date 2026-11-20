import React from 'react'

import { cx } from '@/lib/cx'

// Progress indicator — linear uses the native <progress> element (omit
// `value` for indeterminate); `variant="circular"` renders an SVG ring
// (.progress* contract classes). `indeterminate` forces the continuous
// animation on either variant.
export const Progress = ({
  className,
  indeterminate,
  max = 100,
  size = 48,
  value,
  variant = 'linear',
}: {
  className?: string
  indeterminate?: boolean
  max?: number
  size?: number
  value?: number
  variant?: 'circular' | 'linear'
}) => {
  if (variant === 'circular') {
    const strokeWidth = size / 8
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = value != null && max ? Math.min(Math.max((value / max) * 100, 0), 100) : 0
    return (
      <svg
        aria-hidden={indeterminate || undefined}
        className={cx('progress-circle', indeterminate && 'progress-spin', className)}
        height={size}
        role={indeterminate ? undefined : 'progressbar'}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuenow={indeterminate ? undefined : value}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        <circle
          className="progress-circle-track"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-circle-bar"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={
            indeterminate ? circumference * 0.75 : circumference * (1 - percentage / 100)
          }
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    )
  }
  return (
    <progress
      className={cx('progress', className)}
      max={max}
      value={indeterminate ? undefined : value}
    />
  )
}
