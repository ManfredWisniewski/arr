import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import React from 'react'

import type { Page } from '@/payload-types'
import config from '@/payload.config'

import { DraftBanner } from '@/components/draft-banner'
import { renderTemplate } from '@/components/templates/registry'
import { jsxConverters } from '@/lib/jsx-converters'
import { getRequestDraft } from '@/lib/review'
import { docAlternates } from '@/lib/seo'

import { LangBlog, isLangBlogPath, langBlogMetadata } from './lang-blog'

type Props = {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<{
    from?: string
    hide?: string | string[]
    page?: string
  }>
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
  const draft = await getRequestDraft()
  if (isLangBlogPath(path)) {
    return langBlogMetadata(path, draft)
  }
  const page = await findPage(`/${path.join('/')}`, draft)
  if (!page) {
    return {}
  }
  const alternates = await docAlternates('pages', page.path, draft)
  return {
    alternates,
    description: page.meta?.description ?? undefined,
    openGraph: { url: alternates.canonical },
    ...(page.meta?.noindex ? { robots: { index: false } } : {}),
    title: page.meta?.title ?? page.title,
  }
}

export default async function SitePage({ params, searchParams }: Props) {
  const { path = [] } = await params
  const { from, hide, page } = await searchParams
  const draft = await getRequestDraft()

  if (isLangBlogPath(path)) {
    return (
      <LangBlog
          draft={draft}
          from={from}
          hide={hide}
          page={page}
          segments={path}
        />
    )
  }

  const doc = await findPage(`/${path.join('/')}`, draft)

  if (!doc) {
    notFound()
  }

  return (
    <>
      {renderTemplate(doc, (data) =>
        data ? <RichText converters={jsxConverters} data={data} /> : null,
      )}
      <DraftBanner collection="pages" doc={doc} from={from} />
    </>
  )
}
