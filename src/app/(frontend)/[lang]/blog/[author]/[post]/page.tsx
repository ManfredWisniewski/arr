import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { hasLocale } from 'next-intl'
import { getFormatter } from 'next-intl/server'
import React from 'react'

import { routing, type Locale } from '@/i18n/routing'

import { AuthorLine } from '@/components/molecules/author-line'
import { Figure } from '@/components/molecules/figure'
import { Pill } from '@/components/molecules/pill'
import {
  getAgent,
  getMediaUrl,
  getPostByPath,
} from '@/lib/blog'
import { jsxConverters } from '@/lib/jsx-converters'
import { localeAlternates, localeHref } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ author: string; lang: string; post: string }>
}

const findPost = (author: string, post: string, draft: boolean, locale: Locale) =>
  getPostByPath(`/blog/${author}/${post}`, draft, locale)

export async function generateMetadata({ params }: Props) {
  const { author, lang, post } = await params
  if (!hasLocale(routing.locales, lang)) {
    return {}
  }
  const { isEnabled } = await draftMode()
  const doc = await findPost(author, post, isEnabled, lang)
  if (!doc) {
    return {}
  }
  const base = await getSiteUrl()
  return {
    alternates: {
      canonical: `${base}${localeHref(lang, doc.path)}`,
      languages: localeAlternates(base, doc.path),
    },
    description: doc.meta?.description ?? doc.excerpt ?? undefined,
    title: doc.meta?.title ?? doc.title,
  }
}

export default async function BlogPost({ params }: Props) {
  const { author, lang, post } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const { isEnabled } = await draftMode()
  const [doc, format] = await Promise.all([
    findPost(author, post, isEnabled, lang),
    getFormatter({ locale: lang }),
  ])
  if (!doc) {
    notFound()
  }
  const agent = doc.author
    ? await getAgent(doc.author, isEnabled, lang)
    : undefined
  const avatarUrl = await getMediaUrl(agent?.avatar, isEnabled, 'avatar', lang)
  const cover =
    doc.cover && typeof doc.cover === 'object' ? doc.cover : undefined

  return (
    <article className="page post" data-author={doc.author ?? undefined}>
      <header className="post-header">
        <h1>{doc.title}</h1>
        <div className="post-meta">
          {doc.publishedAt ? (
            <time dateTime={doc.publishedAt}>
              {format.dateTime(new Date(doc.publishedAt), {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          ) : null}
          {doc.author ? (
            <AuthorLine
              avatarUrl={avatarUrl}
              href={`/blog/${doc.author}`}
              name={agent?.name ?? doc.author}
            />
          ) : null}
        </div>
        {doc.categories?.length || doc.tags?.length ? (
          <nav className="post-taxonomy">
            {doc.categories?.map((category) => (
              <Pill href={`/blog/category/${category}`} key={category}>
                {category}
              </Pill>
            ))}
            {doc.tags?.map((tag) => (
              <Pill href={`/blog/tag/${tag}`} key={tag}>
                {tag}
              </Pill>
            ))}
          </nav>
        ) : null}
      </header>
      {cover ? <Figure media={cover} /> : null}
      {doc.content ? (
        <RichText converters={jsxConverters(lang)} data={doc.content} />
      ) : null}
    </article>
  )
}
