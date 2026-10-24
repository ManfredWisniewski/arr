import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import React from 'react'

import type { Page } from '@/payload-types'
import config from '@/payload.config'

import { renderTemplate } from '@/components/templates/registry'
import { jsxConverters } from '@/lib/jsx-converters'

import { LangBlog, isLangBlogPath, langBlogMetadata } from './lang-blog'

type Props = {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<{ page?: string }>
}

async function findPage(route: string, draft: boolean) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    where: {
      ...(draft ? {} : { _status: { equals: 'published' } }),
      path: { equals: route },
    },
  })
  return docs[0] as Page | undefined
}

export async function generateMetadata({ params }: Props) {
  const { path = [] } = await params
  const { isEnabled } = await draftMode()
  if (isLangBlogPath(path)) {
    return langBlogMetadata(path, isEnabled)
  }
  const page = await findPage(`/${path.join('/')}`, isEnabled)
  if (!page) {
    return {}
  }
  return {
    description: page.meta?.description ?? undefined,
    title: page.meta?.title ?? page.title,
  }
}

export default async function SitePage({ params, searchParams }: Props) {
  const { path = [] } = await params
  const { page } = await searchParams
  const { isEnabled } = await draftMode()

  if (isLangBlogPath(path)) {
    return <LangBlog draft={isEnabled} page={page} segments={path} />
  }

  const doc = await findPage(`/${path.join('/')}`, isEnabled)

  if (!doc) {
    notFound()
  }

  return renderTemplate(doc, (data) =>
    data ? <RichText converters={jsxConverters} data={data} /> : null,
  )
}
