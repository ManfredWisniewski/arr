import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import { routing } from '@/i18n/routing'

import { getAgentMap, getPostsPage, getTaxonomyTerm } from '@/lib/blog'
import { localeAlternates, localeHref } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

import { TaxonomyArchive } from '../../taxonomy-archive'

type Props = {
  params: Promise<{ category: string; lang: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { category, lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    return {}
  }
  const { isEnabled } = await draftMode()
  const [term, t, base] = await Promise.all([
    getTaxonomyTerm('categories', category, isEnabled, lang),
    getTranslations({ locale: lang, namespace: 'blog' }),
    getSiteUrl(),
  ])
  const path = `/blog/category/${category}`
  return {
    alternates: {
      canonical: `${base}${localeHref(lang, path)}`,
      languages: localeAlternates(base, path),
    },
    description: term?.description,
    title: term?.label ?? t('categoryFallback', { slug: category }),
  }
}

export default async function CategoryArchive({ params, searchParams }: Props) {
  const { category, lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const { page } = await searchParams
  const { isEnabled } = await draftMode()
  const current = Math.max(1, Number(page) || 1)
  const [term, result, t] = await Promise.all([
    getTaxonomyTerm('categories', category, isEnabled, lang),
    getPostsPage({ category, draft: isEnabled, locale: lang, page: current }),
    getTranslations({ locale: lang, namespace: 'blog' }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    isEnabled,
    lang,
  )
  if (!result.docs.length && !term && !isEnabled) {
    notFound()
  }

  return (
    <TaxonomyArchive
      agents={agents}
      basePath={`/blog/category/${category}`}
      current={result.page ?? current}
      description={term?.description}
      heading={term?.label ?? t('categoryFallback', { slug: category })}
      locale={lang}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
