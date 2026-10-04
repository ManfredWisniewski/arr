import React from 'react'

import { cx } from '@/lib/cx'

import { Avatar } from '../atoms/avatar'

// Chat message unit — Avatar + sender/time meta + bubble text
// (.chat-bubble* contract classes); `own` aligns right.
export const ChatBubble = ({
  actions,
  author,
  className,
  own,
  src,
  text,
  time,
}: {
  actions?: React.ReactNode
  author: string
  className?: string
  own?: boolean
  src?: string
  text: string
  time?: string
}) => (
  <div className={cx('chat-bubble', own && 'chat-bubble-own', className)}>
    <Avatar name={author} size="sm" src={src} />
    <div className="chat-bubble-body">
      <p className="chat-bubble-meta">
        {author}
        {time ? ` · ${time}` : ''}
      </p>
      <p className="chat-bubble-text">{text}</p>
      {actions}
    </div>
  </div>
)
