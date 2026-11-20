'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from './icon'
import { Ripple } from './ripple'

export type FabVariant = 'branded' | 'primary' | 'secondary' | 'surface' | 'tertiary'

// Floating action button — prominent circular action (.fab* contract
// classes). `extended` adds a text label next to the icon.
export const Fab = ({
  children,
  className,
  extended,
  icon = 'plus',
  label,
  size = 'md',
  variant = 'primary',
  ...rest
}: {
  children?: React.ReactNode
  className?: string
  extended?: boolean
  icon?: IconName
  label?: React.ReactNode
  size?: 'lg' | 'md' | 'sm'
  variant?: FabVariant
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cx(
      'fab',
      `fab-${variant}`,
      size !== 'md' && `fab-${size}`,
      extended && 'fab-ext',
      className,
    )}
    type="button"
    {...rest}
  >
    <Icon name={icon} />
    {extended ? <span className="fab-label">{label ?? children}</span> : null}
    <Ripple />
  </button>
)
