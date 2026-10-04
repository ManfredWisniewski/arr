import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'
import { Link } from '../atoms/link'

export type BreadcrumbItem = {
  label: string
  path?: string
}

// Breadcrumb trail — ordered list of links with separators; last item
// is the current page (.breadcrumb* contract classes).
export const Breadcrumb = ({
  className,
  items,
}: {
  className?: string
  items: BreadcrumbItem[]
}) => (
  <nav aria-label="Brotkrumen" className={cx('breadcrumb', className)}>
    <ol className="breadcrumb-list">
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <li className="breadcrumb-item" key={item.path ?? item.label}>
            {index > 0 ? (
              <Icon className="breadcrumb-separator" name="chevron-right" />
            ) : null}
            {item.path && !last ? (
              <Link href={item.path}>{item.label}</Link>
            ) : (
              <span aria-current={last ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        )
      })}
    </ol>
  </nav>
)
