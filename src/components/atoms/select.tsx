import React from 'react'

import { cx } from '@/lib/cx'

// Single-choice dropdown — .input look plus .select chevron spacing.
export const Select = ({
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cx('input', 'select', className)} {...rest}>
    {children}
  </select>
)
