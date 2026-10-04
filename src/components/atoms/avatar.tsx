import React from 'react'

import { cx } from '@/lib/cx'

import { Img } from './image'

// Rounded image/initials for a person or entity (.avatar contract class).
// Falls back to initials from `name` when no `src` is given.
export const Avatar = ({
  className,
  name,
  size,
  src,
}: {
  className?: string
  name: string
  size?: 'lg' | 'sm'
  src?: string
}) => {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className={cx('avatar', size && `avatar-${size}`, className)}>
      {src ? <Img alt={name} src={src} /> : initials}
    </span>
  )
}
