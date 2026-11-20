import { getTranslations } from 'next-intl/server'

import { buildRss, getFeedData } from '@/lib/feed'
import { isLocale } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

// /{de,en}/rss.xml — locale comes from the route param; the feed content
// is read strictly in that locale (D11, published posts only).
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
  const body = buildRss(
    {
      description:
        data.description ??
        t('feedDescription', { siteName: data.siteName }),
      items: data.items,
      title: t('feedTitle', { siteName: data.siteName }),
    },
    base,
    `/${lang}/rss.xml`,
    lang,
  )
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
