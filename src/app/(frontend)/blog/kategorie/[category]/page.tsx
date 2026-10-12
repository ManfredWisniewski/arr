import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import React from 'react'

import { getPostsPage, getTaxonomyTerm } from '@/lib/blog'

import { TaxonomyArchive } from '../../taxonomy-archive'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const { isEnabled } = await draftMode()
  const term = await getTaxonomyTerm('categories', category, isEnabled)
  return {
    description: term?.description,
    title: term?.label ?? `Kategorie: ${category}`,
  }
}

export default async function CategoryArchive({ params, searchParams }: Props) {
  const { category } = await params
  const { page } = await searchParams
  const { isEnabled } = await draftMode()
  const current = Math.max(1, Number(page) || 1)
  const [term, result] = await Promise.all([
    getTaxonomyTerm('categories', category, isEnabled),
    getPostsPage({ category, draft: isEnabled, page: current }),
  ])
  if (!result.docs.length && !term && !isEnabled) {
    notFound()
  }

  return (
    <TaxonomyArchive
      basePath={`/blog/kategorie/${category}`}
      current={result.page ?? current}
      description={term?.description}
      heading={term?.label ?? `Kategorie: ${category}`}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
