import React from 'react'

import { cx } from '@/lib/cx'

// Contextual hint on hover/focus — pure CSS reveal of a real
// role="tooltip" node (in the DOM for AT, shown via :hover/
// :focus-within). Wraps any trigger; focusable itself so keyboard
// users reach it. `.tooltip*` contract classes.
export const Tooltip = ({
  children,
  className,
  position = 'top',
  text,
}: {
  children: React.ReactNode
  className?: string
  position?: 'bottom' | 'top'
  text: string
}) => (
  <span
    className={cx('tooltip', `tooltip-${position}`, className)}
    tabIndex={0}
  >
    {children}
    <span className="tooltip-text" role="tooltip">
      {text}
    </span>
  </span>
)
