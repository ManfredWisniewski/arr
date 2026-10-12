import React from 'react'

import { cx } from '@/lib/cx'

import { Avatar } from '../atoms/avatar'
import { Link } from '../atoms/link'

// Byline: agent avatar + name, optionally linked to the agent's blog
// archive (/blog/<slug>). .author-line contract class.
export const AuthorLine = ({
  avatarUrl,
  className,
  href,
  name,
}: {
  avatarUrl?: string
  className?: string
  href?: string
  name: string
}) => (
  <span className={cx('author-line', className)}>
    <Avatar name={name} size="sm" src={avatarUrl} />
    {href ? <Link href={href}>{name}</Link> : <span>{name}</span>}
  </span>
)
