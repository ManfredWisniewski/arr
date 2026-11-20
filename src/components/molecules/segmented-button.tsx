'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'
import { Ripple } from '../atoms/ripple'

type SegmentedContextValue = {
  multi: boolean
  onChange: (value: string) => void
  orientation: 'horizontal' | 'vertical'
  selected: (value: string) => boolean
}

const SegmentedContext = React.createContext<SegmentedContextValue | null>(null)

// M3 segmented button set — joined buttons with single (radio semantics)
// or multi (aria-pressed) selection (.segmented* contract classes).
export const SegmentedButtonSet = ({
  children,
  className,
  defaultValue,
  multi = false,
  onChange,
  orientation = 'horizontal',
  value,
}: {
  children: React.ReactNode
  className?: string
  defaultValue?: string | string[]
  multi?: boolean
  onChange?: (value: string | string[]) => void
  orientation?: 'horizontal' | 'vertical'
  value?: string | string[]
}) => {
  const [internal, setInternal] = React.useState<string | string[]>(
    defaultValue ?? (multi ? [] : ''),
  )
  const current = value ?? internal

  const ctx = React.useMemo<SegmentedContextValue>(
    () => ({
      multi,
      onChange: (v) => {
        if (multi) {
          const list = Array.isArray(current) ? current : []
          const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
          if (value === undefined) {
            setInternal(next)
          }
          onChange?.(next)
        } else {
          if (value === undefined) {
            setInternal(v)
          }
          onChange?.(v)
        }
      },
      orientation,
      selected: (v) => (Array.isArray(current) ? current.includes(v) : current === v),
    }),
    [current, multi, onChange, orientation, value],
  )

  return (
    <SegmentedContext.Provider value={ctx}>
      <div
        className={cx('segmented', orientation === 'vertical' && 'segmented-vertical', className)}
        role={multi ? 'group' : 'radiogroup'}
      >
        {children}
      </div>
    </SegmentedContext.Provider>
  )
}

export const SegmentedButton = ({
  children,
  className,
  disabled,
  icon,
  value,
}: {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  icon?: IconName
  value: string
}) => {
  const ctx = React.useContext(SegmentedContext)
  if (!ctx) {
    throw new Error('SegmentedButton must be used inside <SegmentedButtonSet>')
  }
  const on = ctx.selected(value)

  return (
    <button
      aria-checked={ctx.multi ? undefined : on}
      aria-pressed={ctx.multi ? on : undefined}
      className={cx('segmented-btn', on && 'segmented-on', className)}
      disabled={disabled}
      onClick={() => ctx.onChange(value)}
      role={ctx.multi ? undefined : 'radio'}
      type="button"
    >
      {on ? <Icon className="segmented-check" name="check" /> : icon ? <Icon name={icon} /> : null}
      <span className="segmented-label">{children}</span>
      <Ripple />
    </button>
  )
}
