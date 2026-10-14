import { useTranslations } from 'next-intl'
import React from 'react'

import type { Post } from '@/payload-types'
import type { AgentRef } from '@/lib/blog'
import { formatDate } from '@/lib/blog'
import type { Locale } from '@/i18n/routing'
import { mediaUrl } from '@/lib/media'

import { Avatar } from '../atoms/avatar'
import { Link } from '../atoms/link'
import { CardGrid, type CardItem } from './card'

// Post -> card mapping; cover/date become media + badge, excerpt the body,
// and the author becomes a header byline: avatar left, linked name as
// subtitle — the link targets the agent's archive (/blog/<author>).
// `path` hrefs are locale-prefixed by the Link atom.
export const postToCardItem = (
  post: Post,
  agents: Record<string, AgentRef> | undefined,
  locale: Locale,
  linkLabel?: string,
): CardItem => {
  const media =
    post.cover && typeof post.cover === 'object' ? post.cover : undefined
  const author = post.author ? agents?.[post.author] : undefined
  const name = author?.name ?? post.author ?? ''
  return {
    badge: formatDate(post.publishedAt, locale) || undefined,
    description: post.excerpt ?? undefined,
    href: post.path,
    lead: post.author ? (
      <Avatar name={name} size="lg" src={author?.avatarUrl} />
    ) : undefined,
    linkLabel,
    mediaAlt: media?.alt ?? post.title,
    mediaSrc: mediaUrl(media, 'card', 640),
    subtitle: post.author ? (
      <Link href={`/blog/${post.author}`}>{name}</Link>
    ) : undefined,
    title: post.title,
  }
}

// Paginated archive card grid (.post-list over the .card-grid contract).
export const PostList = ({
  agents,
  className,
  locale,
  posts,
}: {
  agents?: Record<string, AgentRef>
  className?: string
  locale: Locale
  posts: Post[]
}) => {
  const t = useTranslations('blog')
  return (
    <CardGrid
      className={className ?? 'post-list'}
      items={posts.map((post) =>
        postToCardItem(post, agents, locale, t('readMore')),
      )}
    />
  )
}
