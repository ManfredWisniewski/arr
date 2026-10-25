'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'
import { Ripple } from '../atoms/ripple'

export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion'

// M3 chip (.chip* contract classes) — assist/filter/input/suggestion
// variants. Filter chips toggle `aria-checked`; input chips get a
// remove button via `onRemove`.
export const Chip = ({
  children,
  className,
  icon,
  interactive,
  onRemove,
  onSelect,
  selected,
  variant = 'suggestion',
}: {
  children: React.ReactNode
  className?: string
  icon?: IconName
  interactive?: boolean
  onRemove?: () => void
  onSelect?: (selected: boolean) => void
  selected?: boolean
  variant?: ChipVariant
}) => {
  const clickable = interactive ?? variant === 'filter'
  const showCheck = variant === 'filter' && selected

  const toggle = () => {
    if (clickable) {
      onSelect?.(!selected)
    }
  }

  return (
    <span
      aria-checked={variant === 'filter' ? !!selected : undefined}
      className={cx(
        'chip',
        `chip-${variant}`,
        selected && 'chip-selected',
        clickable && 'chip-interactive',
        className,
      )}
      onClick={toggle}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggle()
              }
            }
          : undefined
      }
      role={variant === 'filter' ? 'checkbox' : clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {showCheck ? <Icon name="check" /> : icon ? <Icon name={icon} /> : null}
      <span className="chip-label">{children}</span>
      {variant === 'input' && onRemove ? (
        <button
          aria-label="Entfernen"
          className="chip-remove"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          type="button"
        >
          <Icon name="close" />
        </button>
      ) : null}
      <Ripple />
    </span>
  )
}

// Grouped chip container — wraps with even spacing (.chips contract).
export const ChipSet = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cx('chips', className)} role="list">
    {children}
  </div>
)
