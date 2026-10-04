'use client'

import React, { useEffect, useState } from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'

const toneIcons = {
  info: 'info',
  negative: 'warning',
  positive: 'check',
  warning: 'warning',
} as const satisfies Record<string, IconName>

// Corner notification — fixed position, auto-dismisses after `duration`
// ms (default 5s). `.toast` contract classes.
export const Toast = ({
  children,
  className,
  duration = 5000,
  onClose,
  tone = 'info',
}: {
  children: React.ReactNode
  className?: string
  duration?: number
  onClose?: () => void
  tone?: keyof typeof toneIcons
}) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) {
    return null
  }
  return (
    <div className={cx('toast', `toast-${tone}`, className)} role="status">
      <Icon name={toneIcons[tone]} />
      <div className="toast-content">{children}</div>
      <button
        aria-label="Schließen"
        className="toast-close"
        onClick={() => {
          setVisible(false)
          onClose?.()
        }}
        type="button"
      >
        <Icon name="close" />
      </button>
    </div>
  )
}
