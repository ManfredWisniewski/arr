import React from 'react'

import {
  DEFAULT_EXCLUDED_CATEGORIES,
  getAgentMap,
  getCategories,
  getIntroPage,
  getPostsPage,
  parseHideParam,
  parsePageParam,
} from '@/lib/blog'
import { getRequestDraft } from '@/lib/review'
import { blogAlternates } from '@/lib/seo'

import { BlogIndexView } from './views'

type Props = {
  searchParams: Promise<{ hide?: string | string[]; page?: string }>
}

export async function generateMetadata() {
  const draft = await getRequestDraft()
  const [intro, alternates] = await Promise.all([
    getIntroPage('/blog', draft),
    blogAlternates('/blog', draft),
  ])
  return {
    alternates,
    description: intro?.meta?.description ?? undefined,
    openGraph: { url: alternates.canonical },
    robots: { index: false },
    title: intro?.meta?.title ?? intro?.title ?? 'Blog',
  }
}

export default async function BlogIndex({ searchParams }: Props) {
  const draft = await getRequestDraft()
  const { hide, page } = await searchParams
  const current = parsePageParam(page)
  const inactive = parseHideParam(hide) ?? DEFAULT_EXCLUDED_CATEGORIES
  const [categories, intro, result] = await Promise.all([
    getCategories('/blog', draft),
    getIntroPage('/blog', draft),
    getPostsPage({
      draft: draft,
      excludeCategories: inactive,
      page: current,
      pathPrefix: '/blog',
    }),
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
      filter={{ categories, inactive }}
      intro={intro}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
