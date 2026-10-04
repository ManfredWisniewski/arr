import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'

export type TimelineItem = {
  description?: string
  status?: 'current' | 'done' | 'upcoming'
  title: string
}

// Vertical step/event sequence — status marker + title + description
// (.timeline* contract classes).
export const Timeline = ({
  className,
  items,
}: {
  className?: string
  items: TimelineItem[]
}) => (
  <ol className={cx('timeline', className)}>
    {items.map((item) => (
      <li
        className={cx(
          'timeline-item',
          item.status && `timeline-item-${item.status}`,
        )}
        key={item.title}
      >
        <span aria-hidden="true" className="timeline-marker">
          {item.status === 'done' ? <Icon name="check" /> : null}
        </span>
        <div className="timeline-content">
          <p className="timeline-title">{item.title}</p>
          {item.description ? (
            <p className="timeline-description">{item.description}</p>
          ) : null}
        </div>
      </li>
    ))}
  </ol>
)
