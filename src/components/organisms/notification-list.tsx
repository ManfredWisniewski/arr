import React from 'react'

import { cx } from '@/lib/cx'

import { Alert, type AlertTone } from '../molecules/alert'
import { Heading } from '../atoms/text'

export type NotificationItem = {
  text: string
  time?: string
  tone?: AlertTone
}

// Notification center — titled list of alert-style entries with
// optional timestamps (.notification-list* contract classes).
export const NotificationList = ({
  className,
  items,
  title = 'Mitteilungen',
}: {
  className?: string
  items: NotificationItem[]
  title?: string
}) => (
  <section className={cx('notification-list', className)}>
    <Heading className="notification-list-title" level={3}>
      {title}
    </Heading>
    <div className="notification-list-items">
      {items.map((item, index) => (
        <Alert key={index} tone={item.tone}>
          {item.text}
          {item.time ? (
            <span className="notification-list-time"> · {item.time}</span>
          ) : null}
        </Alert>
      ))}
    </div>
  </section>
)
