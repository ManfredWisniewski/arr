import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getSiteUrl } from '@/lib/site'

// Next serialises <loc> verbatim, so stored fields reaching the URL must
// be XML-escaped (field validation is the primary control; this is the
// belt-and-suspenders layer for pre-existing rows).
const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// Published pages + posts. Drafts, meta.noindex docs and the /blog
// archive routes (navigation, not search inventory — noindexed) are
// never listed; a failing DB yields just the static entries instead
// of a 500 (same fail-open pattern as layout.tsx).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteUrl()

  try {
    const payload = await getPayload({ config: await config })
    const published = { _status: { equals: 'published' } }
    const [pages, posts] = await Promise.all([
      payload.find({
        collection: 'pages',
        pagination: false,
        where: published,
      }),
      payload.find({
        collection: 'posts',
        pagination: false,
        sort: '-publishedAt',
        where: published,
      }),
    ])

    return [
      ...pages.docs
        .filter((doc) => !doc.meta?.noindex)
        .map((doc) => ({
          lastModified: doc.updatedAt,
          url: `${base}${escapeXml(doc.path)}`,
        })),
      ...posts.docs
        .filter((doc) => !doc.meta?.noindex)
        .map((doc) => ({
          lastModified: doc.publishedAt ?? doc.updatedAt,
          url: `${base}${escapeXml(doc.path)}`,
        })),
    ]
  } catch {
    return [{ url: `${base}/` }]
  }
}
