import { notFound } from 'next/navigation.js'
import React from 'react'

import { getAgentMap, getPostsPage, getTaxonomyTerm,
  parsePageParam,
} from '@/lib/blog'
import { getRequestDraft } from '@/lib/review'

import { TaxonomyArchive } from '../../taxonomy-archive'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const draft = await getRequestDraft()
  const term = await getTaxonomyTerm('categories', category, draft)
  return {
    description: term?.description,
    title: term?.label ?? `Category: ${category}`,
  }
}

export default async function CategoryArchive({ params, searchParams }: Props) {
  const { category } = await params
  const { page } = await searchParams
  const draft = await getRequestDraft()
  const current = parsePageParam(page)
  const [term, result] = await Promise.all([
    getTaxonomyTerm('categories', category, draft),
    getPostsPage({
      category,
      draft: draft,
      page: current,
      pathPrefix: '/blog',
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
      basePath={`/blog/kategorie/${category}`}
      current={result.page ?? current}
      description={term?.description}
      heading={term?.label ?? `Category: ${category}`}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
