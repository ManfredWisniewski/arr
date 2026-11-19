import React from 'react'

import { getAgentMap, getIntroPage, getPostsPage,
  parsePageParam,
} from '@/lib/blog'
import { getRequestDraft } from '@/lib/review'

import { BlogIndexView } from './views'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata() {
  const draft = await getRequestDraft()
  const intro = await getIntroPage('/blog', draft)
  return {
    description: intro?.meta?.description ?? undefined,
    title: intro?.meta?.title ?? intro?.title ?? 'Blog',
  }
}

export default async function BlogIndex({ searchParams }: Props) {
  const draft = await getRequestDraft()
  const { page } = await searchParams
  const current = parsePageParam(page)
  const [intro, result] = await Promise.all([
    getIntroPage('/blog', draft),
    getPostsPage({ draft: draft, page: current, pathPrefix: '/blog' }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    draft,
  )

  return (
    <BlogIndexView
      agents={agents}
      basePath="/blog"
      current={result.page ?? current}
      intro={intro}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
