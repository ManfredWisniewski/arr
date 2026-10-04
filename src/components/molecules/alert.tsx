'use client'

import React, { useState } from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'

const toneIcons = {
  info: 'info',
  negative: 'warning',
  positive: 'check',
  warning: 'warning',
} as const satisfies Record<string, IconName>

export type AlertTone = keyof typeof toneIcons

// Contextual message — icon + content + optional close button
// (.alert + .alert-<tone> contract classes).
export const Alert = ({
  children,
  className,
  dismissible,
  tone = 'info',
}: {
  children: React.ReactNode
  className?: string
  dismissible?: boolean
  tone?: AlertTone
}) => {
  const [visible, setVisible] = useState(true)
  if (!visible) {
    return null
  }
  return (
    <div className={cx('alert', `alert-${tone}`, className)} role="alert">
      <Icon name={toneIcons[tone]} />
      <div className="alert-content">{children}</div>
      {dismissible ? (
        <button
          aria-label="Schließen"
          className="alert-close"
          onClick={() => setVisible(false)}
          type="button"
        >
          <Icon name="close" />
        </button>
      ) : null}
    </div>
  )
}
