import React from 'react'

import { cx } from '@/lib/cx'

import type { ButtonVariant } from '../atoms/button'
import { Icon, type IconName } from '../atoms/icon'
import { Link } from '../atoms/link'

type IconButtonBase = {
  children: React.ReactNode
  className?: string
  icon: IconName
  iconPosition?: 'left' | 'right'
  variant?: ButtonVariant
}

// Button with icon — .btn classes plus .btn-icon for icon/label layout.
// With `href` renders a link-styled button.
export const IconButton = ({
  children,
  className,
  icon,
  iconPosition = 'left',
  variant,
  ...rest
}: IconButtonBase &
  (React.AnchorHTMLAttributes<HTMLAnchorElement> &
    React.ButtonHTMLAttributes<HTMLButtonElement>)) => {
  const cls = cx('btn', variant && `btn-${variant}`, 'btn-icon', className)
  const inner = (
    <>
      {iconPosition === 'left' ? <Icon name={icon} /> : null}
      <span>{children}</span>
      {iconPosition === 'right' ? <Icon name={icon} /> : null}
    </>
  )
  if ('href' in rest && rest.href) {
    const { href, ...anchor } = rest
    return (
      <Link className={cls} href={href as string} {...anchor}>
        {inner}
      </Link>
    )
  }
  return (
    <button className={cls} type="button" {...rest}>
      {inner}
    </button>
  )
}
