'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from './icon'
import { Ripple } from './ripple'

export type IconButtonVariant = 'filled' | 'outlined' | 'standard' | 'tonal'

// M3 icon button — icon-only round action (.iconbtn* contract classes).
// `toggle` flips `aria-pressed` and the selected style on click;
// controlled via `selected`/`onSelectedChange` or uncontrolled via
// `defaultSelected`. Distinct from molecules/IconButton, which is a
// labeled .btn with a leading/trailing icon.
export const IconButton = ({
  'aria-label': ariaLabel,
  className,
  defaultSelected = false,
  icon,
  onClick,
  onSelectedChange,
  selected: selectedProp,
  size = 'md',
  toggle = false,
  variant = 'standard',
  ...rest
}: {
  'aria-label': string
  className?: string
  defaultSelected?: boolean
  icon: IconName
  onSelectedChange?: (selected: boolean) => void
  selected?: boolean
  size?: 'lg' | 'md' | 'sm'
  toggle?: boolean
  variant?: IconButtonVariant
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultSelected)
  const selected = selectedProp ?? uncontrolled

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={toggle ? selected : undefined}
      className={cx(
        'iconbtn',
        variant !== 'standard' && `iconbtn-${variant}`,
        size !== 'md' && `iconbtn-${size}`,
        toggle && selected && 'iconbtn-on',
        className,
      )}
      onClick={(event) => {
        if (toggle) {
          if (selectedProp === undefined) {
            setUncontrolled(!selected)
          }
          onSelectedChange?.(!selected)
        }
        onClick?.(event)
      }}
      type="button"
      {...rest}
    >
      <Icon name={icon} />
      <Ripple />
    </button>
  )
}
