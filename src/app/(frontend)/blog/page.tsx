import { draftMode } from 'next/headers'
import React from 'react'

import { getAgentMap, getIntroPage, getPostsPage } from '@/lib/blog'

import { BlogIndexView } from './views'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata() {
  const { isEnabled } = await draftMode()
  const intro = await getIntroPage('/blog', isEnabled)
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
    getIntroPage('/blog', isEnabled),
    getPostsPage({ draft: isEnabled, page: current, pathPrefix: '/blog' }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    isEnabled,
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
