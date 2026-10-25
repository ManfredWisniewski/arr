import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'
import { Ripple } from '../atoms/ripple'
import { Link } from '../atoms/link'

export type NavBarItem = {
  active?: boolean
  badge?: React.ReactNode
  href?: string
  icon: IconName
  label?: string
}

// M3 navigation bar — bottom icon bar with labeled destinations
// (.bottomnav* contract classes; .navbar is taken by the site header).
export const NavigationBar = ({
  className,
  items,
}: {
  className?: string
  items: NavBarItem[]
}) => (
  <nav className={cx('bottomnav', className)}>
    {items.map((item) => {
      const inner = (
        <>
          <span className="bottomnav-iconwrap">
            <span className="bottomnav-icon">
              <Icon name={item.icon} />
              <Ripple />
            </span>
            {item.badge ? <span className="bottomnav-badge">{item.badge}</span> : null}
          </span>
          {item.label ? <span className="bottomnav-label">{item.label}</span> : null}
        </>
      )
      const cls = cx('bottomnav-item', item.active && 'bottomnav-on')
      return item.href ? (
        <Link
          aria-current={item.active ? 'page' : undefined}
          className={cls}
          href={item.href}
          key={item.label ?? item.icon}
        >
          {inner}
        </Link>
      ) : (
        <button
          aria-current={item.active ? 'page' : undefined}
          className={cls}
          key={item.label ?? item.icon}
          type="button"
        >
          {inner}
        </button>
      )
    })}
  </nav>
)
