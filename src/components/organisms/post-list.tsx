import React from 'react'

import type { Post } from '@/payload-types'
import type { AgentRef } from '@/lib/blog'
import { formatDate, parentPath } from '@/lib/blog'
import { mediaUrl } from '@/lib/media'

import { Avatar } from '../atoms/avatar'
import { Link } from '../atoms/link'
import { CardGrid, type CardItem } from './card'

// Post -> card mapping; cover/date become media + badge, excerpt the body,
// and the author becomes a header byline: avatar left, linked name as
// subtitle — the link targets the agent's archive (/blog/<author>).
export const postToCardItem = (
  post: Post,
  agents?: Record<string, AgentRef>,
): CardItem => {
  const media =
    post.cover && typeof post.cover === 'object' ? post.cover : undefined
  const author = post.author ? agents?.[post.author] : undefined
  const name = author?.name ?? post.author ?? ''
  return {
    badge: formatDate(post.publishedAt) || undefined,
    description: post.excerpt ?? undefined,
    href: post.path,
    lead: post.author ? (
      <Avatar name={name} size="lg" src={author?.avatarUrl} />
    ) : undefined,
    linkLabel: 'Continue',
    mediaAlt: media?.alt ?? post.title,
    mediaSrc: mediaUrl(media, 'card', 640),
    subtitle: post.author ? (
      <Link href={parentPath(post.path)}>{name}</Link>
    ) : undefined,
    title: post.title,
  }
}

// Paginated archive card grid (.post-list over the .card-grid contract).
export const PostList = ({
  agents,
  className,
  posts,
}: {
  agents?: Record<string, AgentRef>
  className?: string
  posts: Post[]
}) => (
  <CardGrid
    className={className ?? 'post-list'}
    items={posts.map((post) => postToCardItem(post, agents))}
  />
)
