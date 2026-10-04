import React from 'react'

import { cx } from '@/lib/cx'

// Vertical spacing atom — token-scaled gap (.spacer*, sm/md/lg).
export const Spacer = ({
  className,
  size,
}: {
  className?: string
  size?: 'lg' | 'sm'
}) => <div aria-hidden="true" className={cx('spacer', size && `spacer-${size}`, className)} />
