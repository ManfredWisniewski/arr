import { notFound } from 'next/navigation.js'
import React from 'react'

import { DraftBanner } from '@/components/draft-banner'
import {
  getAgent,
  getMediaUrl,
  getPostByPath,
} from '@/lib/blog'
import { getRequestDraft } from '@/lib/review'

import { PostArticle } from '../../views'

type Props = {
  params: Promise<{ author: string; post: string }>
  searchParams: Promise<{ from?: string }>
}

const findPost = (author: string, post: string, draft: boolean) =>
  getPostByPath(`/blog/${author}/${post}`, draft)

export async function generateMetadata({ params }: Props) {
  const { author, post } = await params
  const draft = await getRequestDraft()
  const doc = await findPost(author, post, draft)
  if (!doc) {
    return {}
  }
  return {
    description: doc.meta?.description ?? doc.excerpt ?? undefined,
    title: doc.meta?.title ?? doc.title,
  }
}

export default async function BlogPost({ params, searchParams }: Props) {
  const { author, post } = await params
  const { from } = await searchParams
  const draft = await getRequestDraft()
  const doc = await findPost(author, post, draft)
  if (!doc) {
    notFound()
  }
  const agent = doc.author ? await getAgent(doc.author, draft) : undefined
  const avatarUrl = await getMediaUrl(agent?.avatar, draft)

  return (
    <>
      <PostArticle agent={agent} avatarUrl={avatarUrl} doc={doc} />
      <DraftBanner collection="posts" doc={doc} from={from} />
    </>
  )
}
