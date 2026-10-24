import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import React from 'react'

import {
  getAgent,
  getMediaUrl,
  getPostsPage,
} from '@/lib/blog'

import { AuthorArchiveView } from '../views'

type Props = {
  params: Promise<{ author: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { author } = await params
  const { isEnabled } = await draftMode()
  const agent = await getAgent(author, isEnabled)
  if (!agent) {
    return {}
  }
  return {
    description: agent.bio,
    title: agent.name,
  }
}

export default async function AuthorBlog({ params, searchParams }: Props) {
  const { author } = await params
  const { page } = await searchParams
  const { isEnabled } = await draftMode()
  const agent = await getAgent(author, isEnabled)
  if (!agent) {
    notFound()
  }
  const current = Math.max(1, Number(page) || 1)
  const [avatarUrl, result] = await Promise.all([
    getMediaUrl(agent.avatar, isEnabled),
    getPostsPage({
      author: agent.slug,
      draft: isEnabled,
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
