import { draftMode } from 'next/headers'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import React from 'react'

import type { Page } from '@/payload-types'
import config from '@/payload.config'

import { Pagination } from '@/components/molecules/pagination'
import { PostList } from '@/components/organisms/post-list'
import { getAgentMap, getPostsPage } from '@/lib/blog'
import { jsxConverters } from '@/lib/jsx-converters'

type Props = {
  searchParams: Promise<{ page?: string }>
}

// Optional intro/meta source: a `pages` doc at /blog supplies copy above
// the post list (and goes through the same draft review gate).
async function findIntro(draft: boolean) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    where: {
      ...(draft ? {} : { _status: { equals: 'published' } }),
      path: { equals: '/blog' },
    },
  })
  return docs[0] as Page | undefined
}

export async function generateMetadata() {
  const { isEnabled } = await draftMode()
  const intro = await findIntro(isEnabled)
  return {
    description: intro?.meta?.description ?? undefined,
    title: intro?.meta?.title ?? intro?.title ?? 'Blog',
  }
}

export default async function BlogIndex({ searchParams }: Props) {
  const { isEnabled } = await draftMode()
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const [intro, result] = await Promise.all([
    findIntro(isEnabled),
    getPostsPage({ draft: isEnabled, page: current }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    isEnabled,
  )

  return (
    <article className="page blog-index">
      {intro?.content ? (
        <RichText converters={jsxConverters} data={intro.content} />
      ) : null}
      {result.docs.length ? (
        <PostList agents={agents} posts={result.docs} />
      ) : (
        <p className="empty">No posts found.</p>
      )}
      <Pagination
        current={result.page ?? current}
        hrefFor={(p) => (p > 1 ? `/blog?page=${p}` : '/blog')}
        total={result.totalPages}
      />
    </article>
  )
}
