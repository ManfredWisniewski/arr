import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'

export type AccordionItem = {
  content: React.ReactNode
  title: string
}

// Expandable sections — native <details> per item, chevron rotates on
// open (.accordion* contract classes). No JS needed.
export const Accordion = ({
  className,
  items,
}: {
  className?: string
  items: AccordionItem[]
}) => (
  <div className={cx('accordion', className)}>
    {items.map((item) => (
      <details className="accordion-item" key={item.title}>
        <summary className="accordion-header">
          {item.title}
          <Icon className="accordion-chevron" name="chevron-down" />
        </summary>
        <div className="accordion-body">{item.content}</div>
      </details>
    ))}
  </div>
)
