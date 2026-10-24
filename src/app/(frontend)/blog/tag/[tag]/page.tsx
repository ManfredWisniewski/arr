import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import React from 'react'

import { getAgentMap, getPostsPage, getTaxonomyTerm } from '@/lib/blog'

import { TaxonomyArchive } from '../../taxonomy-archive'

type Props = {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params
  const { isEnabled } = await draftMode()
  const term = await getTaxonomyTerm('tags', tag, isEnabled)
  return {
    description: term?.description,
    title: term?.label ?? `Tag: ${tag}`,
  }
}

export default async function TagArchive({ params, searchParams }: Props) {
  const { tag } = await params
  const { page } = await searchParams
  const { isEnabled } = await draftMode()
  const current = Math.max(1, Number(page) || 1)
  const [term, result] = await Promise.all([
    getTaxonomyTerm('tags', tag, isEnabled),
    getPostsPage({
      draft: isEnabled,
      page: current,
      pathPrefix: '/blog',
      tag,
    }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    isEnabled,
  )
  if (!result.docs.length && !term && !isEnabled) {
    notFound()
  }

  return (
    <TaxonomyArchive
      agents={agents}
      basePath={`/blog/tag/${tag}`}
      current={result.page ?? current}
      description={term?.description}
      heading={term?.label ?? `Tag: ${tag}`}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
