import React from 'react'

import { cx } from '@/lib/cx'

import { type IconName } from '../atoms/icon'
import { Img } from '../atoms/image'
import { Heading } from '../atoms/text'
import { IconBox } from './icon-box'

// Composable card parts — the `Card` organism builds on these;
// use them directly for custom card layouts.
export const CardHeader = ({
  className,
  icon,
  subtext,
  title,
}: {
  className?: string
  icon?: IconName
  subtext?: string
  title: string
}) => (
  <div className={cx('card-header', className)}>
    {icon ? <IconBox name={icon} /> : null}
    <div>
      <Heading className="card-title" level={3}>
        {title}
      </Heading>
      {subtext ? <p className="card-subtext">{subtext}</p> : null}
    </div>
  </div>
)

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cx('card-body', className)}>{children}</div>

export const CardFooter = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cx('card-footer', className)}>{children}</div>

export const CardMedia = ({ alt, src }: { alt: string; src: string }) => (
  <Img alt={alt} className="card-media" src={src} />
)
