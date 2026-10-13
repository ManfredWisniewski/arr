import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import { routing } from '@/i18n/routing'

import { Avatar } from '@/components/atoms/avatar'
import { Pagination } from '@/components/molecules/pagination'
import { PostList } from '@/components/organisms/post-list'
import { getAgent, getMediaUrl, getPostsPage } from '@/lib/blog'
import { localeAlternates, localeHref } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ author: string; lang: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { author, lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    return {}
  }
  const { isEnabled } = await draftMode()
  const [agent, base] = await Promise.all([
    getAgent(author, isEnabled, lang),
    getSiteUrl(),
  ])
  if (!agent) {
    return {}
  }
  const path = `/blog/${agent.slug}`
  return {
    alternates: {
      canonical: `${base}${localeHref(lang, path)}`,
      languages: localeAlternates(base, path),
    },
    description: agent.bio,
    title: agent.name,
  }
}

export default async function AuthorBlog({ params, searchParams }: Props) {
  const { author, lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const { page } = await searchParams
  const { isEnabled } = await draftMode()
  const [agent, t] = await Promise.all([
    getAgent(author, isEnabled, lang),
    getTranslations({ locale: lang, namespace: 'blog' }),
  ])
  if (!agent) {
    notFound()
  }
  const current = Math.max(1, Number(page) || 1)
  const [avatarUrl, result] = await Promise.all([
    getMediaUrl(agent.avatar, isEnabled, 'avatar', lang),
    getPostsPage({ author: agent.slug, draft: isEnabled, locale: lang, page: current }),
  ])
  const basePath = `/blog/${agent.slug}`

  return (
    <article className="page author-archive">
      <header className="author-header">
        <Avatar name={agent.name} size="lg" src={avatarUrl} />
        <div>
          <h1>{agent.name}</h1>
          {agent.role ? <p className="author-role">{agent.role}</p> : null}
          {agent.bio ? <p className="author-bio">{agent.bio}</p> : null}
        </div>
      </header>
      {result.docs.length ? (
        <PostList
          agents={{
            [agent.slug]: {
              avatarUrl,
              name: agent.name,
              slug: agent.slug,
            },
          }}
          locale={lang}
          posts={result.docs}
        />
      ) : (
        <p className="empty">{t('empty')}</p>
      )}
      <Pagination
        current={result.page ?? current}
        hrefFor={(p) => (p > 1 ? `${basePath}?page=${p}` : basePath)}
        total={result.totalPages}
      />
    </article>
  )
}
