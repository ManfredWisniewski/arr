import React from 'react'

import { cx } from '@/lib/cx'

import { type IconName } from '../atoms/icon'
import { Link } from '../atoms/link'
import { IconBox } from '../molecules/icon-box'

// Rich list entry — optional IconBox + title/description + trailing
// action slot (Toggle, Checkbox, IconButton, …). .list-item* contract.
export const ListItem = ({
  action,
  className,
  description,
  href,
  icon,
  meta,
  title,
}: {
  action?: React.ReactNode
  className?: string
  description?: string
  href?: string
  icon?: IconName
  meta?: string
  title: string
}) => (
  <li className={cx('list-item', className)}>
    {icon ? <IconBox name={icon} /> : null}
    <div className="list-item-content">
      {href ? (
        <Link className="list-item-title" href={href}>
          {title}
        </Link>
      ) : (
        <span className="list-item-title">{title}</span>
      )}
      {meta ? <span className="list-item-meta">{meta}</span> : null}
      {description ? (
        <span className="list-item-description">{description}</span>
      ) : null}
    </div>
    {action ? <div className="list-item-action">{action}</div> : null}
  </li>
)

// Semantic wrapper — renders the <ul> for a set of ListItems.
export const ItemList = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <ul className={cx('item-list', className)}>{children}</ul>
