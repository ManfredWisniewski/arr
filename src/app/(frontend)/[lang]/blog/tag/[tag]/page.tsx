import { getRequestDraft } from '@/lib/review'
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
  params: Promise<{ lang: string; tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { lang, tag } = await params
  if (!hasLocale(routing.locales, lang)) {
    return {}
  }
  const draft = await getRequestDraft()
  const [term, t, base] = await Promise.all([
    getTaxonomyTerm('tags', tag, draft, lang),
    getTranslations({ locale: lang, namespace: 'blog' }),
    getSiteUrl(),
  ])
  const path = `/blog/tag/${tag}`
  return {
    alternates: {
      canonical: `${base}${localeHref(lang, path)}`,
      languages: localeAlternates(base, path),
    },
    description: term?.description,
    title: term?.label ?? t('tagFallback', { slug: tag }),
  }
}

export default async function TagArchive({ params, searchParams }: Props) {
  const { lang, tag } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const { page } = await searchParams
  const draft = await getRequestDraft()
  const current = Math.max(1, Number(page) || 1)
  const [term, result, t] = await Promise.all([
    getTaxonomyTerm('tags', tag, draft, lang),
    getPostsPage({ draft: draft, locale: lang, page: current, tag }),
    getTranslations({ locale: lang, namespace: 'blog' }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    draft,
    lang,
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
      heading={term?.label ?? t('tagFallback', { slug: tag })}
      locale={lang}
      posts={result.docs}
      totalPages={result.totalPages}
    />
  )
}
