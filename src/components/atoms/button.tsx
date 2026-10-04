import React from 'react'

import { cx } from '@/lib/cx'

import { Link } from './link'
import { Spinner } from './spinner'

export type ButtonVariant = 'ghost' | 'primary' | 'secondary'

type ButtonShared = {
  className?: string
  loading?: boolean
  size?: 'lg' | 'sm'
  variant?: ButtonVariant
}

type ButtonProps = ButtonShared &
  React.ButtonHTMLAttributes<HTMLButtonElement>

type LinkButtonProps = ButtonShared &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

// .btn contract classes — with `href` renders a link-styled button.
// `loading` swaps the label for a spinner and disables interaction.
export function Button(props: ButtonProps): React.ReactNode
export function Button(props: LinkButtonProps): React.ReactNode
export function Button({
  children,
  className,
  loading,
  size,
  variant,
  ...rest
}: ButtonProps | LinkButtonProps) {
  const cls = cx(
    'btn',
    variant && `btn-${variant}`,
    size && `btn-${size}`,
    loading && 'btn-loading',
    className,
  )
  const inner = loading ? <Spinner label="Lädt" /> : children
  if ('href' in rest && rest.href) {
    const { href, ...anchor } = rest as LinkButtonProps
    return (
      <Link className={cls} href={href} {...anchor}>
        {inner}
      </Link>
    )
  }
  const { disabled, ...buttonProps } = rest as ButtonProps
  return (
    <button
      className={cls}
      disabled={loading || disabled}
      type="button"
      {...buttonProps}
    >
      {inner}
    </button>
  )
}
