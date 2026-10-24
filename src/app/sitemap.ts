import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { blogRoot } from '@/lib/blog'
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

// Published pages + posts plus the public /blog archive routes. Drafts
// are never listed; a failing DB yields just the static entries instead
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

    const archives = new Set<string>(['/blog'])
    for (const post of posts.docs) {
      const root = blogRoot(post.path)
      archives.add(`${root}/blog`)
      if (post.author) {
        archives.add(`${root}/blog/${escapeXml(post.author)}`)
      }
      for (const c of post.categories ?? []) {
        archives.add(`${root}/blog/kategorie/${escapeXml(c)}`)
      }
      for (const t of post.tags ?? []) {
        archives.add(`${root}/blog/tag/${escapeXml(t)}`)
      }
    }

    return [
      ...pages.docs.map((doc) => ({
        lastModified: doc.updatedAt,
        url: `${base}${escapeXml(doc.path)}`,
      })),
      ...posts.docs.map((doc) => ({
        lastModified: doc.publishedAt ?? doc.updatedAt,
        url: `${base}${escapeXml(doc.path)}`,
      })),
      ...[...archives].map((path) => ({ url: `${base}${path}` })),
    ]
  } catch {
    return [{ url: `${base}/` }, { url: `${base}/blog` }]
  }
}
