import React from 'react'

import { cx } from '@/lib/cx'

import { Img } from '../atoms/image'
import { Heading } from '../atoms/text'

// Media left + text block right — comment rows, profiles, product lines
// (.media-object* contract classes).
export const MediaObject = ({
  actions,
  children,
  className,
  mediaAlt = '',
  mediaSrc,
  title,
}: {
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  mediaAlt?: string
  mediaSrc: string
  title?: string
}) => (
  <div className={cx('media-object', className)}>
    <Img alt={mediaAlt} className="media-object-media" src={mediaSrc} />
    <div className="media-object-body">
      {title ? (
        <Heading className="media-object-title" level={3}>
          {title}
        </Heading>
      ) : null}
      {children}
      {actions ? <div className="media-object-actions">{actions}</div> : null}
    </div>
  </div>
)
