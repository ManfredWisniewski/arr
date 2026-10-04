import React from 'react'

import { cx } from '@/lib/cx'

import { Link } from './link'

export type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
  variant?: ButtonVariant
}

type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  variant?: ButtonVariant
}

// .btn contract classes — with `href` renders a link-styled button.
export function Button(props: ButtonProps): React.ReactNode
export function Button(props: LinkButtonProps): React.ReactNode
export function Button({
  className,
  variant,
  ...rest
}: ButtonProps | LinkButtonProps) {
  const cls = cx('btn', variant && `btn-${variant}`, className)
  if ('href' in rest && rest.href) {
    const { href, ...anchor } = rest as LinkButtonProps
    return <Link className={cls} href={href} {...anchor} />
  }
  return <button className={cls} type="button" {...rest as ButtonProps} />
}
