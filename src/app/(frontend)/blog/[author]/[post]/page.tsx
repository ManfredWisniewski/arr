import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { AuthorLine } from '@/components/molecules/author-line'
import { Figure } from '@/components/molecules/figure'
import { Pill } from '@/components/molecules/pill'
import {
  formatDate,
  getAgent,
  getMediaUrl,
  getPostByPath,
} from '@/lib/blog'
import { jsxConverters } from '@/lib/jsx-converters'

type Props = {
  params: Promise<{ author: string; post: string }>
}

const findPost = (author: string, post: string, draft: boolean) =>
  getPostByPath(`/blog/${author}/${post}`, draft)

export async function generateMetadata({ params }: Props) {
  const { author, post } = await params
  const { isEnabled } = await draftMode()
  const doc = await findPost(author, post, isEnabled)
  if (!doc) {
    return {}
  }
  return {
    description: doc.meta?.description ?? doc.excerpt ?? undefined,
    title: doc.meta?.title ?? doc.title,
  }
}

export default async function BlogPost({ params }: Props) {
  const { author, post } = await params
  const { isEnabled } = await draftMode()
  const doc = await findPost(author, post, isEnabled)
  if (!doc) {
    notFound()
  }
  const agent = doc.author ? await getAgent(doc.author, isEnabled) : undefined
  const avatarUrl = await getMediaUrl(agent?.avatar, isEnabled)
  const cover =
    doc.cover && typeof doc.cover === 'object' ? doc.cover : undefined

  return (
    <article className="page post" data-author={doc.author ?? undefined}>
      <header className="post-header">
        <h1>{doc.title}</h1>
        <div className="post-meta">
          {doc.publishedAt ? (
            <time dateTime={doc.publishedAt}>
              {formatDate(doc.publishedAt)}
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
              <Pill href={`/blog/kategorie/${category}`} key={category}>
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
        <RichText converters={jsxConverters} data={doc.content} />
      ) : null}
    </article>
  )
}
