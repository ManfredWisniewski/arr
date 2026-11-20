import { getTranslations } from 'next-intl/server'

import { buildAtom, getFeedData } from '@/lib/feed'
import { isLocale } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

// /{de,en}/atom.xml — Atom variant of the blog feed.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  if (!isLocale(lang)) {
    return new Response('Not found', { status: 404 })
  }
  const [base, data, t] = await Promise.all([
    getSiteUrl(),
    getFeedData(lang),
    getTranslations({ locale: lang, namespace: 'blog' }),
  ])
  const body = buildAtom(
    {
      description:
        data.description ??
        t('feedDescription', { siteName: data.siteName }),
      items: data.items,
      title: t('feedTitle', { siteName: data.siteName }),
    },
    base,
    `/${lang}/atom.xml`,
    lang,
  )
  return new Response(body, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
