import { RichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import type { Page, Post } from '@/payload-types'
import type { AgentProfile, AgentRef } from '@/lib/blog'
import {
  blogRoot,
  formatDate,
  originalPostPath,
  parentPath,
} from '@/lib/blog'
import { jsxConverters } from '@/lib/jsx-converters'

import { Link } from '@/components/atoms/link'
import { Avatar } from '@/components/atoms/avatar'
import { Alert } from '@/components/molecules/alert'
import { AuthorLine } from '@/components/molecules/author-line'
import { Figure } from '@/components/molecules/figure'
import { Pagination } from '@/components/molecules/pagination'
import { Pill } from '@/components/molecules/pill'
import { PostList } from '@/components/organisms/post-list'

// Shared bodies for the /blog routes — the English tree (this folder) and
// localized trees served through [[...path]] (/<lang>/blog/…) render the
// same markup with a different basePath/emptyLabel.

export const BlogIndexView = ({
  agents,
  basePath,
  current,
  emptyLabel = 'No posts found.',
  intro,
  posts,
  totalPages,
}: {
  agents: Record<string, AgentRef>
  basePath: string
  current: number
  emptyLabel?: string
  intro?: Page
  posts: Post[]
  totalPages: number
}) => (
  <article className="page blog-index">
    {intro?.content ? (
      <RichText converters={jsxConverters} data={intro.content} />
    ) : null}
    {posts.length ? (
      <PostList agents={agents} posts={posts} />
    ) : (
      <p className="empty">{emptyLabel}</p>
    )}
    <Pagination
      current={current}
      hrefFor={(p) => (p > 1 ? `${basePath}?page=${p}` : basePath)}
      total={totalPages}
    />
  </article>
)

export const AuthorArchiveView = ({
  agent,
  avatarUrl,
  basePath,
  current,
  emptyLabel = 'No posts found.',
  posts,
  totalPages,
}: {
  agent: AgentProfile
  avatarUrl?: string
  basePath: string
  current: number
  emptyLabel?: string
  posts: Post[]
  totalPages: number
}) => (
  <article className="page author-archive">
    <header className="author-header">
      <Avatar name={agent.name} size="lg" src={avatarUrl} />
      <div>
        <h1>{agent.name}</h1>
        {agent.role ? <p className="author-role">{agent.role}</p> : null}
        {agent.bio ? <p className="author-bio">{agent.bio}</p> : null}
      </div>
    </header>
    {posts.length ? (
      <PostList
        agents={{
          [agent.slug]: {
            avatarUrl,
            name: agent.name,
            slug: agent.slug,
          },
        }}
        posts={posts}
      />
    ) : (
      <p className="empty">{emptyLabel}</p>
    )}
    <Pagination
      current={current}
      hrefFor={(p) => (p > 1 ? `${basePath}?page=${p}` : basePath)}
      total={totalPages}
    />
  </article>
)

// Machine-translation disclaimer on localized posts; links back to the
// English original at /blog/….
export const TranslationNotice = ({ path }: { path: string }) => (
  <Alert tone="info">
    Dieser Beitrag wurde maschinell ins Deutsche übersetzt.{' '}
    <Link href={originalPostPath(path)}>
      Zum englischen Original
    </Link>
    .
  </Alert>
)

export const PostArticle = ({
  agent,
  avatarUrl,
  doc,
  notice,
}: {
  agent?: AgentProfile
  avatarUrl?: string
  doc: Post
  notice?: React.ReactNode
}) => {
  const root = blogRoot(doc.path)
  const cover =
    doc.cover && typeof doc.cover === 'object' ? doc.cover : undefined

  return (
    <article className="page post" data-author={doc.author ?? undefined}>
      <header className="post-header">
        <h1>{doc.title}</h1>
        <div className="post-meta">
          {doc.publishedAt ? (
            <time dateTime={doc.publishedAt}>
              {formatDate(doc.publishedAt, doc.path)}
            </time>
          ) : null}
          {doc.author ? (
            <AuthorLine
              avatarUrl={avatarUrl}
              href={parentPath(doc.path)}
              name={agent?.name ?? doc.author}
            />
          ) : null}
        </div>
        {doc.categories?.length || doc.tags?.length ? (
          <nav className="post-taxonomy">
            {doc.categories?.map((category) => (
              <Pill href={`${root}/blog/kategorie/${category}`} key={category}>
                {category}
              </Pill>
            ))}
            {doc.tags?.map((tag) => (
              <Pill href={`${root}/blog/tag/${tag}`} key={tag}>
                {tag}
              </Pill>
            ))}
          </nav>
        ) : null}
      </header>
      {notice}
      {cover ? <Figure media={cover} /> : null}
      {doc.content ? (
        <RichText converters={jsxConverters} data={doc.content} />
      ) : null}
    </article>
  )
}
