import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import React from 'react'

import { Avatar } from '@/components/atoms/avatar'
import { Pagination } from '@/components/molecules/pagination'
import { PostList } from '@/components/organisms/post-list'
import { getAgent, getMediaUrl, getPostsPage } from '@/lib/blog'

type Props = {
  params: Promise<{ author: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { author } = await params
  const { isEnabled } = await draftMode()
  const agent = await getAgent(author, isEnabled)
  if (!agent) {
    return {}
  }
  return {
    description: agent.bio,
    title: agent.name,
  }
}

export default async function AuthorBlog({ params, searchParams }: Props) {
  const { author } = await params
  const { page } = await searchParams
  const { isEnabled } = await draftMode()
  const agent = await getAgent(author, isEnabled)
  if (!agent) {
    notFound()
  }
  const current = Math.max(1, Number(page) || 1)
  const [avatarUrl, result] = await Promise.all([
    getMediaUrl(agent.avatar, isEnabled),
    getPostsPage({ author: agent.slug, draft: isEnabled, page: current }),
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
        <PostList posts={result.docs} />
      ) : (
        <p className="empty">Keine Beiträge gefunden.</p>
      )}
      <Pagination
        current={result.page ?? current}
        hrefFor={(p) => (p > 1 ? `${basePath}?page=${p}` : basePath)}
        total={result.totalPages}
      />
    </article>
  )
}
