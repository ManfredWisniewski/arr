import React from 'react'

import { cx } from '@/lib/cx'

import type { ButtonVariant } from '../atoms/button'
import { Button } from '../atoms/button'
import { Icon } from '../atoms/icon'
import { Link } from '../atoms/link'

export type SplitButtonItem = {
  href?: string
  label: string
}

// Split button — primary action + chevron trigger opening a small menu
// (.splitbtn* contract classes). The menu uses a <details> disclosure
// like the Dropdown molecule.
export const SplitButton = ({
  action,
  className,
  items,
  label,
  variant,
}: {
  action: React.ReactNode
  className?: string
  items?: SplitButtonItem[]
  label?: string
  variant?: ButtonVariant
}) => (
  <span className={cx('splitbtn', className)}>
    <Button className="splitbtn-action" variant={variant}>
      {action}
    </Button>
    <details className="splitbtn-menu">
      <summary aria-label={label ?? 'Weitere Aktionen'} className={cx('btn', variant && `btn-${variant}`, 'splitbtn-trigger')}>
        <Icon name="chevron-down" />
      </summary>
      <div className="splitbtn-list">
        {items?.map((item) =>
          item.href ? (
            <Link className="splitbtn-item" href={item.href} key={item.label}>
              {item.label}
            </Link>
          ) : (
            <span className="splitbtn-item" key={item.label}>
              {item.label}
            </span>
          ),
        )}
      </div>
    </details>
  </span>
)
