import React from 'react'

import type { Post } from '@/payload-types'

import { Pagination } from '@/components/molecules/pagination'
import { PostList } from '@/components/organisms/post-list'

// Shared archive body for /blog/kategorie/<slug> and /blog/tag/<slug>.
export const TaxonomyArchive = ({
  basePath,
  current,
  description,
  heading,
  posts,
  totalPages,
}: {
  basePath: string
  current: number
  description?: string
  heading: string
  posts: Post[]
  totalPages: number
}) => (
  <article className="page taxonomy-archive">
    <h1>{heading}</h1>
    {description ? <p className="lead">{description}</p> : null}
    {posts.length ? (
      <PostList posts={posts} />
    ) : (
      <p className="empty">Keine Beiträge gefunden.</p>
    )}
    <Pagination
      current={current}
      hrefFor={(page) => (page > 1 ? `${basePath}?page=${page}` : basePath)}
      total={totalPages}
    />
  </article>
)
