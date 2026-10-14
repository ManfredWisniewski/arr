import { useTranslations } from 'next-intl'
import React from 'react'

import type { Post } from '@/payload-types'
import type { AgentRef } from '@/lib/blog'
import type { Locale } from '@/i18n/routing'

import { Pagination } from '@/components/molecules/pagination'
import { PostList } from '@/components/organisms/post-list'

// Shared archive body for /{lang}/blog/category/<slug> and /blog/tag/<slug>.
export const TaxonomyArchive = ({
  agents,
  basePath,
  current,
  description,
  heading,
  locale,
  posts,
  totalPages,
}: {
  agents?: Record<string, AgentRef>
  basePath: string
  current: number
  description?: string
  heading: string
  locale: Locale
  posts: Post[]
  totalPages: number
}) => {
  const t = useTranslations('blog')
  return (
    <article className="page taxonomy-archive">
      <h1>{heading}</h1>
      {description ? <p className="lead">{description}</p> : null}
      {posts.length ? (
        <PostList agents={agents} locale={locale} posts={posts} />
      ) : (
        <p className="empty">{t('empty')}</p>
      )}
      <Pagination
        current={current}
        hrefFor={(page) => (page > 1 ? `${basePath}?page=${page}` : basePath)}
        total={totalPages}
      />
    </article>
  )
}
