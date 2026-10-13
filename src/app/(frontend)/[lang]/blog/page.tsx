import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import React from 'react'

import type { Page } from '@/payload-types'
import config from '@/payload.config'
import { routing, type Locale } from '@/i18n/routing'

import { Pagination } from '@/components/molecules/pagination'
import { PostList } from '@/components/organisms/post-list'
import { getAgentMap, getPostsPage } from '@/lib/blog'
import { jsxConverters } from '@/lib/jsx-converters'
import { localeAlternates, localeHref } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string }>
}

// Optional intro/meta source: a `pages` doc at /blog supplies copy above
// the post list (and goes through the same draft review gate).
async function findIntro(draft: boolean, locale: Locale) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft,
    fallbackLocale: draft ? 'de' : false,
    limit: 1,
    locale,
    where: {
      ...(draft ? {} : { _status: { equals: 'published' } }),
      path: { equals: '/blog' },
    },
  })
  return docs[0] as Page | undefined
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    return {}
  }
  const { isEnabled } = await draftMode()
  const [intro, t, base] = await Promise.all([
    findIntro(isEnabled, lang),
    getTranslations({ locale: lang, namespace: 'blog' }),
    getSiteUrl(),
  ])
  return {
    alternates: {
      canonical: `${base}${localeHref(lang, '/blog')}`,
      languages: localeAlternates(base, '/blog'),
    },
    description: intro?.meta?.description ?? undefined,
    title: intro?.meta?.title ?? intro?.title ?? t('title'),
  }
}

export default async function BlogIndex({ params, searchParams }: Props) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const { isEnabled } = await draftMode()
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const [intro, result, t] = await Promise.all([
    findIntro(isEnabled, lang),
    getPostsPage({ draft: isEnabled, locale: lang, page: current }),
    getTranslations({ locale: lang, namespace: 'blog' }),
  ])
  const agents = await getAgentMap(
    result.docs.map((post) => post.author),
    isEnabled,
    lang,
  )

  return (
    <article className="page blog-index">
      {intro?.content ? (
        <RichText converters={jsxConverters(lang)} data={intro.content} />
      ) : null}
      {result.docs.length ? (
        <PostList agents={agents} locale={lang} posts={result.docs} />
      ) : (
        <p className="empty">{t('empty')}</p>
      )}
      <Pagination
        current={result.page ?? current}
        hrefFor={(p) => (p > 1 ? `/blog?page=${p}` : '/blog')}
        total={result.totalPages}
      />
    </article>
  )
}
