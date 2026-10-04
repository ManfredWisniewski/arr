import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'
import { Link } from '../atoms/link'

export type DropdownItem = {
  href?: string
  label: string
}

// Dropdown menu — <details> trigger + item list (.dropdown* contract
// classes). `align="right"` anchors the menu to the right edge.
export const Dropdown = ({
  align,
  children,
  className,
  items,
  label,
}: {
  align?: 'right'
  children?: React.ReactNode
  className?: string
  items?: DropdownItem[]
  label: React.ReactNode
}) => (
  <details className={cx('dropdown', align && `dropdown-${align}`, className)}>
    <summary className="dropdown-trigger">
      {label}
      <Icon className="dropdown-chevron" name="chevron-down" />
    </summary>
    <div className="dropdown-menu">
      {children ??
        items?.map((item) =>
          item.href ? (
            <Link className="dropdown-item" href={item.href} key={item.label}>
              {item.label}
            </Link>
          ) : (
            <span className="dropdown-item" key={item.label}>
              {item.label}
            </span>
          ),
        )}
    </div>
  </details>
)
