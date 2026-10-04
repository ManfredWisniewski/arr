import React from 'react'

import { cx } from '@/lib/cx'

import { Button } from '../atoms/button'
import type { ButtonVariant } from '../atoms/button'

export type ButtonGroupItem = {
  href?: string
  label: string
  variant?: ButtonVariant
}

// Row of related buttons (.button-group contract class) — renders
// children or an `items` list. `aria-label` describes the group.
export const ButtonGroup = ({
  children,
  className,
  items,
  label,
}: {
  children?: React.ReactNode
  className?: string
  items?: ButtonGroupItem[]
  label?: string
}) => (
  <div aria-label={label} className={cx('button-group', className)} role="group">
    {children ??
      items?.map((item) =>
        item.href ? (
          <Button href={item.href} key={item.label} variant={item.variant}>
            {item.label}
          </Button>
        ) : (
          <Button key={item.label} variant={item.variant}>
            {item.label}
          </Button>
        ),
      )}
  </div>
)
