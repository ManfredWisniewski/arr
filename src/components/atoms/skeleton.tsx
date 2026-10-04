import React from 'react'

import { cx } from '@/lib/cx'

// Loading placeholder shape — pulsing block (.skeleton contract class).
// `lines` renders stacked line placeholders (last line shortened).
export const Skeleton = ({
  className,
  lines = 1,
}: {
  className?: string
  lines?: number
}) =>
  lines <= 1 ? (
    <div aria-hidden="true" className={cx('skeleton', className)} />
  ) : (
    <div aria-hidden="true" className={cx('skeleton-lines', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  )
