import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Page, Post } from '@/payload-types'
import type { AgentProfile, AgentRef } from '@/lib/blog'
import {
  blogRoot,
  formatDate,
  parentPath,
} from '@/lib/blog'
import { stripMarkdownAttributes } from '@/lib/markdownAttributes'
import { jsxConverters } from '@/lib/jsx-converters'

import { asSlideOptions } from '@/lib/slides'

import { Avatar } from '@/components/atoms/avatar'
import { AuthorLine } from '@/components/molecules/author-line'
import { Figure } from '@/components/molecules/figure'
import { Pagination } from '@/components/molecules/pagination'
import { Pill } from '@/components/molecules/pill'
import { FilterBar } from '@/components/organisms/filter-bar'
import { PostList } from '@/components/organisms/post-list'
import { SlideDeck } from '@/components/organisms/slide-deck'

// Shared bodies for the /blog routes — the English tree (this folder) and
// localized trees served through [[...path]] (/<lang>/blog/…) render the
// same markup with a different basePath/emptyLabel.

// Tag filter state for the index: `tags` lists every tag in the tree
// ranked by post count, `inactive` the hidden ones (?hide=…).
export type BlogFilter = {
  tags: string[]
  inactive: string[]
}

const TOP_TAGS = 8

export const BlogIndexView = ({
  agents,
  basePath,
  current,
  emptyLabel = 'No posts found.',
  filter,
  intro,
  linkLabel,
  posts,
  totalPages,
}: {
  agents: Record<string, AgentRef>
  basePath: string
  current: number
  emptyLabel?: string
  filter?: BlogFilter
  intro?: Page
  linkLabel?: string
  posts: Post[]
  totalPages: number
}) => {
  // carry the active filter into pagination links; filter changes
  // always reset to page 1 (pill hrefs carry no page param)
  const hrefFor = (p: number) => {
    const params = new URLSearchParams()
    if (p > 1) {
      params.set('page', String(p))
    }
    if (filter) {
      params.set('hide', filter.inactive.join(','))
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }
  const tagPill = (tag: string) => {
    const active = !filter?.inactive.includes(tag)
    const inactive = active
      ? [...(filter?.inactive ?? []), tag]
      : (filter?.inactive ?? []).filter((t) => t !== tag)
    return (
      <Pill
        active={active}
        href={`${basePath}?hide=${inactive.join(',')}`}
        key={tag}
      >
        {tag}
      </Pill>
    )
  }
  // fixed tag order (ranked by post count): the top 8 sit in the first
  // row, "+" expands the rest — toggling only flips a pill's active
  // state in place, positions never change
  const visible = filter?.tags.slice(0, TOP_TAGS) ?? []
  const more = filter?.tags.slice(TOP_TAGS) ?? []
  return (
    <article className="page blog-index">
      {intro?.content ? (
        <RichText converters={jsxConverters} data={intro.content} />
      ) : null}
      {filter?.tags.length ? (
        <FilterBar className="blog-filter">
          {visible.map(tagPill)}
          {more.length ? (
            <>
              <details className="filter-more">
                <summary className="pill" />
              </details>
              <span className="filter-more-list">
                {more.map(tagPill)}
                <span aria-hidden="true" className="filter-more-sep">
                  •
                </span>
                <Pill href={basePath}>reset</Pill>
              </span>
            </>
          ) : null}
        </FilterBar>
      ) : null}
      {posts.length ? (
        <PostList agents={agents} linkLabel={linkLabel} posts={posts} />
      ) : (
        <p className="empty">{emptyLabel}</p>
      )}
      <Pagination current={current} hrefFor={hrefFor} total={totalPages} />
    </article>
  )
}

export const AuthorArchiveView = ({
  agent,
  avatarUrl,
  basePath,
  current,
  emptyLabel = 'No posts found.',
  linkLabel,
  posts,
  totalPages,
}: {
  agent: AgentProfile
  avatarUrl?: string
  basePath: string
  current: number
  emptyLabel?: string
  linkLabel?: string
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
        linkLabel={linkLabel}
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

export const PostArticle = ({
  agent,
  avatarUrl,
  doc,
}: {
  agent?: AgentProfile
  avatarUrl?: string
  doc: Post
}) => {
  const root = blogRoot(doc.path)
  const cover =
    doc.cover && typeof doc.cover === 'object' ? doc.cover : undefined
  const date = doc.publishedAt || doc.createdAt

  return (
    <article
      className="page post"
      data-author={doc.author ?? undefined}
      data-template={doc.template || undefined}
    >
      <header className="post-header">
        <h1>{doc.title}</h1>
        <div className="post-meta">
          <time dateTime={date}>{formatDate(date, doc.path)}</time>
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
      {doc.template === 'slide' ? (
        <SlideDeck
          markdown={stripMarkdownAttributes(doc.markdownRaw ?? '')}
          options={asSlideOptions(doc.slideOptions)}
        />
      ) : (
        <>
          {cover ? <Figure media={cover} /> : null}
          {doc.content ? (
            <RichText converters={jsxConverters} data={doc.content} />
          ) : null}
        </>
      )}
    </article>
  )
}
