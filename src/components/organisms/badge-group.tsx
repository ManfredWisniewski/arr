import React from 'react'

import { cx } from '@/lib/cx'

import { type IconName } from '../atoms/icon'
import { Pill } from '../molecules/pill'

export type BadgeGroupItem = {
  href?: string
  icon?: IconName
  label: string
}

// Labeled group of badge/pill items — tag clouds, category lists,
// status clusters. `.badge-group*` contract classes.
export const BadgeGroup = ({
  children,
  className,
  items,
  label,
}: {
  children?: React.ReactNode
  className?: string
  items?: BadgeGroupItem[]
  label?: string
}) => (
  <div className={cx('badge-group', className)}>
    {label ? <span className="badge-group-label">{label}</span> : null}
    <div className="badge-group-items">
      {children ??
        items?.map((item) => (
          <Pill href={item.href} icon={item.icon} key={item.label}>
            {item.label}
          </Pill>
        ))}
    </div>
  </div>
)
