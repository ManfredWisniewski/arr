import React from 'react'

import { cx } from '@/lib/cx'

// Rich tooltip — supporting text card with optional headline and action
// row (.rich-tooltip* contract classes). Pure-CSS reveal on hover /
// focus-within like the plain Tooltip; the card itself stays open while
// hovered so actions are reachable.
export const RichTooltip = ({
  actions,
  children,
  className,
  content,
  headline,
}: {
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  content: React.ReactNode
  headline?: React.ReactNode
}) => (
  <span className={cx('rich-tooltip', className)}>
    {children}
    <span className="rich-tooltip-content" role="tooltip">
      {headline ? <span className="rich-tooltip-headline">{headline}</span> : null}
      <span className="rich-tooltip-body">{content}</span>
      {actions ? <span className="rich-tooltip-actions">{actions}</span> : null}
    </span>
  </span>
)
