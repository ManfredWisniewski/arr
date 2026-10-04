import React from 'react'

import { cx } from '@/lib/cx'

import { Heading } from '../atoms/text'

// Self-contained panel — header (title + actions) + body + optional
// footer (.widget* contract classes). Generic dashboard card.
export const DashboardWidget = ({
  actions,
  children,
  className,
  footer,
  title,
}: {
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
  title: string
}) => (
  <section className={cx('widget', className)}>
    <header className="widget-header">
      <Heading className="widget-title" level={3}>
        {title}
      </Heading>
      {actions ? <div className="widget-actions">{actions}</div> : null}
    </header>
    <div className="widget-body">{children}</div>
    {footer ? <footer className="widget-footer">{footer}</footer> : null}
  </section>
)
