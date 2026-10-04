import React from 'react'

import { cx } from '@/lib/cx'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export const Heading = ({
  children,
  className,
  level = 2,
}: {
  children: React.ReactNode
  className?: string
  level?: HeadingLevel
}) => {
  const Tag = `h${level}` as 'h1'
  return <Tag className={className}>{children}</Tag>
}

export const Paragraph = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <p className={className}>{children}</p>

export const Lead = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <p className={cx('lead', className)}>{children}</p>

// Pill variant — renders the .badge contract class.
export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <span className={cx('badge', className)}>{children}</span>
