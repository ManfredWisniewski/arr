import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import React from 'react'

import type { Job, Page } from '@/payload-types'
import config from '@/payload.config'

import { DraftBanner } from '@/components/draft-banner'
import { JobDetailTemplate } from '@/components/templates/job-detail'
import { JobsListFallback } from '@/components/templates/jobs-list'
import { renderTemplate } from '@/components/templates/registry'
import { jsxConverters } from '@/lib/jsx-converters'
import { getRequestDraft } from '@/lib/review'
import { docAlternates } from '@/lib/seo'
import { jobsPluginOptions } from '@/plugins/jobs'

import { LangBlog, isLangBlogPath, langBlogMetadata } from './lang-blog'

type Props = {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<{
    applied?: string
    from?: string
    hide?: string | string[]
    page?: string
    [key: string]: string | string[] | undefined
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

// Jobs plugin (spec +wit/specs/arr/jobs/, FR-008): detail routes resolve
// the same way pages do — by the document's own `path` field.
async function findJob(route: string, draft: boolean) {
  if (jobsPluginOptions.enabled === false) {
    return undefined
  }
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'jobs',
    draft,
    limit: 1,
    where: {
      ...(draft ? {} : { _status: { equals: 'published' } }),
      path: { equals: route },
    },
  })
  return docs[0] as Job | undefined
}

export async function generateMetadata({ params }: Props) {
  const { path = [] } = await params
  const draft = await getRequestDraft()
  if (isLangBlogPath(path)) {
    return langBlogMetadata(path, draft)
  }
  const page = await findPage(`/${path.join('/')}`, draft)
  if (!page) {
    const job = await findJob(`/${path.join('/')}`, draft)
    if (!job) {
      return {}
    }
    return {
      description: job.meta?.description ?? undefined,
      ...(job.meta?.noindex ? { robots: { index: false } } : {}),
      title: job.meta?.title ?? job.title,
    }
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
  const query = await searchParams
  const { applied, from, hide, page } = query
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

  const route = `/${path.join('/')}`
  const doc = await findPage(route, draft)

  if (!doc) {
    // FR-006/FR-013: the configured basePath falls back to the jobs list
    // when no document claims the route.
    if (
      jobsPluginOptions.enabled !== false &&
      route === jobsPluginOptions.basePath
    ) {
      const fallback = await JobsListFallback({ searchParams: query })
      if (fallback) {
        return fallback
      }
    }
    const job = await findJob(route, draft)
    if (!job) {
      notFound()
    }
    return (
      <>
        <JobDetailTemplate applied={applied === '1'} job={job} />
        <DraftBanner collection="jobs" doc={job} from={from} />
      </>
    )
  }

  return (
    <>
      {renderTemplate(doc, (data) =>
        data ? <RichText converters={jsxConverters} data={data} /> : null,
      query)}
      <DraftBanner collection="pages" doc={doc} from={from} />
    </>
  )
}
