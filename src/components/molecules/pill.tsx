import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'
import { Link } from '../atoms/link'

// Tag/category pill — rounded element for labels, filters, tag links.
// .pill contract class; with `href` renders as a link pill.
export const Pill = ({
  children,
  className,
  href,
  icon,
}: {
  children: React.ReactNode
  className?: string
  href?: string
  icon?: IconName
}) => {
  const cls = cx('pill', className)
  const inner = (
    <>
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
    </>
  )
  return href ? (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  )
}
