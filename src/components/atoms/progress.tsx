import React from 'react'

import { cx } from '@/lib/cx'

// Progress bar — native <progress> element, .progress contract class.
// value 0–max; omit `value` for indeterminate state.
export const Progress = ({
  className,
  max = 100,
  value,
}: {
  className?: string
  max?: number
  value?: number
}) => (
  <progress className={cx('progress', className)} max={max} value={value} />
)
