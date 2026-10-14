import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation.js'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { hasLocale } from 'next-intl'
import { getPayload } from 'payload'
import React from 'react'

import type { Page } from '@/payload-types'
import config from '@/payload.config'
import { routing, type Locale } from '@/i18n/routing'

import { renderTemplate } from '@/components/templates/registry'
import { jsxConverters } from '@/lib/jsx-converters'
import { localeAlternates, localeHref } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ lang: string; path?: string[] }>
}

// `path` stays locale-independent (D09); the [lang] prefix selects which
// localized field values are read. Public reads never fall back (D11);
// draft previews fall back to `de`.
async function findPage(route: string, draft: boolean, locale: Locale) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft,
    fallbackLocale: draft ? 'de' : false,
    limit: 1,
    locale,
    where: {
      ...(draft ? {} : { _status: { equals: 'published' } }),
      path: { equals: route },
    },
  })
  return docs[0] as Page | undefined
}

export async function generateMetadata({ params }: Props) {
  const { lang, path = [] } = await params
  if (!hasLocale(routing.locales, lang)) {
    return {}
  }
  const { isEnabled } = await draftMode()
  const page = await findPage(`/${path.join('/')}`, isEnabled, lang)
  if (!page) {
    return {}
  }
  const base = await getSiteUrl()
  return {
    alternates: {
      canonical: `${base}${localeHref(lang, page.path)}`,
      languages: localeAlternates(base, page.path),
    },
    description: page.meta?.description ?? undefined,
    title: page.meta?.title ?? page.title,
  }
}

export default async function SitePage({ params }: Props) {
  const { lang, path = [] } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const { isEnabled } = await draftMode()
  const page = await findPage(`/${path.join('/')}`, isEnabled, lang)

  if (!page) {
    notFound()
  }

  return renderTemplate(page, lang, (data) =>
    data ? <RichText converters={jsxConverters(lang)} data={data} /> : null,
  )
}
