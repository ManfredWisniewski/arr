import { notFound } from 'next/navigation.js'
import React from 'react'

import {
  getAgent,
  getMediaUrl,
  getPostsPage,
  parsePageParam,
} from '@/lib/blog'
import { getRequestDraft } from '@/lib/review'
import { blogAlternates } from '@/lib/seo'

import { AuthorArchiveView } from '../views'

type Props = {
  params: Promise<{ author: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { author } = await params
  const draft = await getRequestDraft()
  const agent = await getAgent(author, draft)
  if (!agent) {
    return {}
  }
  const alternates = await blogAlternates(`/blog/${agent.slug}`, draft, {
    author: { equals: agent.slug },
  })
  return {
    alternates,
    description: agent.bio,
    openGraph: { url: alternates.canonical },
    robots: { index: false },
    title: agent.name,
  }
}

export default async function AuthorBlog({ params, searchParams }: Props) {
  const { author } = await params
  const { page } = await searchParams
  const draft = await getRequestDraft()
  const agent = await getAgent(author, draft)
  if (!agent) {
    notFound()
  }
  const current = parsePageParam(page)
  const [avatarUrl, result] = await Promise.all([
    getMediaUrl(agent.avatar, draft),
    getPostsPage({
      author: agent.slug,
      draft: draft,
      page: current,
      pathPrefix: '/blog',
    }),
  ])

  return (
    <AuthorArchiveView
      agent={agent}
      avatarUrl={avatarUrl}
      basePath={`/blog/${agent.slug}`}
      current={result.page ?? current}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
