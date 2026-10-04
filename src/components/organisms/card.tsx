import React from 'react'

import { cx } from '@/lib/cx'

import { Badge } from '../atoms/text'
import { Link } from '../atoms/link'
import { CardBody, CardFooter, CardHeader, CardMedia } from '../molecules/card-section'
import type { IconName } from '../atoms/icon'

export type CardItem = {
  badge?: string
  description?: string
  href?: string
  icon?: IconName
  linkLabel?: string
  mediaAlt?: string
  mediaSrc?: string
  title: string
}

// Content/product card — CardHeader (icon + title) + optional media,
// badge, description and link footer, built on the card-section
// molecules. `.card` contract classes.
export const Card = ({
  badge,
  description,
  href,
  icon,
  linkLabel,
  mediaAlt,
  mediaSrc,
  title,
}: CardItem) => (
  <div className="card">
    {badge ? <Badge className="card-badge">{badge}</Badge> : null}
    {mediaSrc ? <CardMedia alt={mediaAlt ?? title} src={mediaSrc} /> : null}
    <CardHeader icon={icon} title={title} />
    {description ? (
      <CardBody>
        <p className="card-text">{description}</p>
      </CardBody>
    ) : null}
    {href ? (
      <CardFooter>
        <Link className="card-link" href={href}>
          {linkLabel ?? 'Mehr erfahren'}
        </Link>
      </CardFooter>
    ) : null}
  </div>
)

// Responsive card grid — auto-fits columns, .card-grid contract class.
export const CardGrid = ({
  children,
  className,
  items,
}: {
  children?: React.ReactNode
  className?: string
  items?: CardItem[]
}) => (
  <div className={cx('card-grid', className)}>
    {children ?? items?.map((item) => <Card key={item.title} {...item} />)}
  </div>
)
