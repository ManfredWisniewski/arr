import React from 'react'

import { cx } from '@/lib/cx'

// Toolbar — grouped action row (.toolbar* contract classes).
// `docked`/`floating` render the elevated pill container.
export const Toolbar = ({
  'aria-label': ariaLabel,
  children,
  className,
  variant = 'standard',
}: {
  'aria-label'?: string
  children: React.ReactNode
  className?: string
  variant?: 'docked' | 'floating' | 'standard'
}) => (
  <div
    aria-label={ariaLabel}
    className={cx('toolbar', variant !== 'standard' && `toolbar-${variant}`, className)}
    role="toolbar"
  >
    {children}
  </div>
)
