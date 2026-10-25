import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'
import { Ripple } from '../atoms/ripple'
import { Link } from '../atoms/link'

export type NavRailItem = {
  active?: boolean
  badge?: React.ReactNode
  href?: string
  icon: IconName
  label?: string
}

// M3 navigation rail — narrow vertical icon column (.navrail* contract
// classes). `items` renders NavRailItems; children allowed for custom
// header content (e.g. a Fab or menu button).
export const NavigationRail = ({
  children,
  className,
  items,
}: {
  children?: React.ReactNode
  className?: string
  items?: NavRailItem[]
}) => (
  <nav className={cx('navrail', className)}>
    {children}
    {items ? (
      <div className="navrail-content">
        {items.map((item) => (
          <NavRailItem key={item.label ?? item.icon} {...item} />
        ))}
      </div>
    ) : null}
  </nav>
)

export const NavigationRailHeader = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cx('navrail-header', className)}>{children}</div>

export const NavRailItem = ({
  active,
  badge,
  href,
  icon,
  label,
}: NavRailItem & { key?: React.Key }) => {
  const inner = (
    <>
      <span className="navrail-iconwrap">
        <span className="navrail-icon">
          <Icon name={icon} />
          <Ripple />
        </span>
        {badge ? <span className="navrail-badge">{badge}</span> : null}
      </span>
      {label ? <span className="navrail-label">{label}</span> : null}
    </>
  )
  const cls = cx('navrail-item', active && 'navrail-on')
  return href ? (
    <Link aria-current={active ? 'page' : undefined} className={cls} href={href}>
      {inner}
    </Link>
  ) : (
    <button aria-current={active ? 'page' : undefined} className={cls} type="button">
      {inner}
    </button>
  )
}
