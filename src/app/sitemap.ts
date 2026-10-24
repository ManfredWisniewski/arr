import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { blogRoot } from '@/lib/blog'
import { getSiteUrl } from '@/lib/site'

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
        archives.add(`${root}/blog/${post.author}`)
      }
      for (const c of post.categories ?? []) {
        archives.add(`${root}/blog/kategorie/${c}`)
      }
      for (const t of post.tags ?? []) {
        archives.add(`${root}/blog/tag/${t}`)
      }
    }

    return [
      ...pages.docs.map((doc) => ({
        lastModified: doc.updatedAt,
        url: `${base}${doc.path}`,
      })),
      ...posts.docs.map((doc) => ({
        lastModified: doc.publishedAt ?? doc.updatedAt,
        url: `${base}${doc.path}`,
      })),
      ...[...archives].map((path) => ({ url: `${base}${path}` })),
    ]
  } catch {
    return [{ url: `${base}/` }, { url: `${base}/blog` }]
  }
}
