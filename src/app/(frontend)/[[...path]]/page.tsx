import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import React from 'react'

import type { Page } from '@/payload-types'
import config from '@/payload.config'

import { jsxConverters } from './converters'

type Props = {
  params: Promise<{ path?: string[] }>
}

async function findPage(route: string) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    where: {
      _status: { equals: 'published' },
      path: { equals: route },
    },
  })
  return docs[0] as Page | undefined
}

export async function generateMetadata({ params }: Props) {
  const { path = [] } = await params
  const page = await findPage(`/${path.join('/')}`)
  if (!page) {
    return {}
  }
  return {
    description: page.meta?.description ?? undefined,
    title: page.meta?.title ?? page.title,
  }
}

export default async function SitePage({ params }: Props) {
  const { path = [] } = await params
  const page = await findPage(`/${path.join('/')}`)

  if (!page) {
    notFound()
  }

  return (
    <article className="page">
      {page.content ? (
        <RichText converters={jsxConverters} data={page.content} />
      ) : null}
    </article>
  )
}
