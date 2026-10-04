import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'

// Icon inside a box — visual emphasis/container for glyphs,
// .icon-box contract classes. `soft` = tinted fill, `outline` = stroked.
export const IconBox = ({
  className,
  name,
  variant = 'soft',
}: {
  className?: string
  name: IconName
  variant?: 'outline' | 'soft'
}) => (
  <span className={cx('icon-box', `icon-box-${variant}`, className)}>
    <Icon name={name} />
  </span>
)
