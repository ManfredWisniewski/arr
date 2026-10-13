import React from 'react'

import type { Post } from '@/payload-types'
import type { AgentRef } from '@/lib/blog'
import { formatDate } from '@/lib/blog'

import { AuthorLine } from '../molecules/author-line'
import { CardGrid, type CardItem } from './card'

// Post -> card mapping; cover/date become media + badge, excerpt the body,
// and the author slug becomes a byline linking to the agent's archive.
export const postToCardItem = (
  post: Post,
  agents?: Record<string, AgentRef>,
): CardItem => {
  const media =
    post.cover && typeof post.cover === 'object' ? post.cover : undefined
  const author = post.author ? agents?.[post.author] : undefined
  return {
    badge: formatDate(post.publishedAt) || undefined,
    description: post.excerpt ?? undefined,
    href: post.path,
    linkLabel: 'Continue',
    mediaAlt: media?.alt ?? post.title,
    mediaSrc: media?.url ?? undefined,
    meta: post.author ? (
      <AuthorLine
        avatarUrl={author?.avatarUrl}
        href={`/blog/${post.author}`}
        name={author?.name ?? post.author}
      />
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
