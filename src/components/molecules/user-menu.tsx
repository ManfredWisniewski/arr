import React from 'react'

import { cx } from '@/lib/cx'

import { Avatar } from '../atoms/avatar'
import { Badge } from '../atoms/text'
import { Dropdown, type DropdownItem } from './dropdown'

// User menu trigger — Avatar + name/role + optional badge opening a
// dropdown of user links (.user-menu* contract classes).
export const UserMenu = ({
  badge,
  className,
  items,
  name,
  role,
  src,
}: {
  badge?: string
  className?: string
  items: DropdownItem[]
  name: string
  role?: string
  src?: string
}) => (
  <Dropdown
    align="right"
    className={cx('user-menu', className)}
    items={items}
    label={
      <>
        <Avatar name={name} size="sm" src={src} />
        <span className="user-menu-name">
          {name}
          {role ? <span className="user-menu-role">{role}</span> : null}
        </span>
        {badge ? <Badge>{badge}</Badge> : null}
      </>
    }
  />
)
