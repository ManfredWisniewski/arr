import React from 'react'

import type { Post } from '@/payload-types'
import { formatDate } from '@/lib/blog'

import { CardGrid, type CardItem } from './card'

// Post -> card mapping; cover/date become media + badge, excerpt the body.
export const postToCardItem = (post: Post): CardItem => {
  const media =
    post.cover && typeof post.cover === 'object' ? post.cover : undefined
  return {
    badge: formatDate(post.publishedAt) || undefined,
    description: post.excerpt ?? undefined,
    href: post.path,
    linkLabel: 'Weiterlesen',
    mediaAlt: media?.alt ?? post.title,
    mediaSrc: media?.url ?? undefined,
    title: post.title,
  }
}

// Paginated archive card grid (.post-list over the .card-grid contract).
export const PostList = ({
  className,
  posts,
}: {
  className?: string
  posts: Post[]
}) => <CardGrid className={className ?? 'post-list'} items={posts.map(postToCardItem)} />
