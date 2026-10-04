import React from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'

// Icon left, text right — callout/hint line (.info-text contract class).
export const InfoText = ({
  children,
  className,
  icon = 'info',
}: {
  children: React.ReactNode
  className?: string
  icon?: IconName
}) => (
  <p className={cx('info-text', className)}>
    <Icon name={icon} />
    <span>{children}</span>
  </p>
)
