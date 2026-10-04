import React from 'react'

import { cx } from '@/lib/cx'

import { Heading, Lead } from '../atoms/text'

// Text arrangement — eyebrow label + heading + lead + body, stacked with
// consistent rhythm. .text-block* contract classes; `align="center"`
// centers the group (section intros, CTAs).
export const TextBlock = ({
  align,
  children,
  className,
  eyebrow,
  lead,
  level = 2,
  title,
}: {
  align?: 'center'
  children?: React.ReactNode
  className?: string
  eyebrow?: string
  lead?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  title: string
}) => (
  <div className={cx('text-block', align && `text-block-${align}`, className)}>
    {eyebrow ? <span className="text-block-eyebrow">{eyebrow}</span> : null}
    <Heading className="text-block-title" level={level}>
      {title}
    </Heading>
    {lead ? <Lead className="text-block-lead">{lead}</Lead> : null}
    {children ? <div className="text-block-body">{children}</div> : null}
  </div>
)
