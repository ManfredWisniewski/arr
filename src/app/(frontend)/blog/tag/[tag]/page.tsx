import { notFound } from 'next/navigation.js'
import React from 'react'

import { getAgentMap, getPostsPage, getTaxonomyTerm,
  parsePageParam,
} from '@/lib/blog'
import { getRequestDraft } from '@/lib/review'

import { TaxonomyArchive } from '../../taxonomy-archive'

type Props = {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params
  const draft = await getRequestDraft()
  const term = await getTaxonomyTerm('tags', tag, draft)
  return {
    description: term?.description,
    title: term?.label ?? `Tag: ${tag}`,
  }
}

export default async function TagArchive({ params, searchParams }: Props) {
  const { tag } = await params
  const { page } = await searchParams
  const draft = await getRequestDraft()
  const current = parsePageParam(page)
  const [term, result] = await Promise.all([
    getTaxonomyTerm('tags', tag, draft),
    getPostsPage({
      draft: draft,
      page: current,
      pathPrefix: '/blog',
      tag,
    }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    draft,
  )
  if (!result.docs.length && !term && !draft) {
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
