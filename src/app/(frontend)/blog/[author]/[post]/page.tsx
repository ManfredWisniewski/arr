import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import React from 'react'

import {
  getAgent,
  getMediaUrl,
  getPostByPath,
} from '@/lib/blog'

import { PostArticle } from '../../views'

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

  return <PostArticle agent={agent} avatarUrl={avatarUrl} doc={doc} />
}
