import { getPayload } from 'payload'

import config from '@/payload.config'

import { getAgents } from './blog'

// Shared builders for the blog feed endpoints (/rss.xml, /feed,
// /index.xml → RSS 2.0; /atom.xml → Atom). Published posts only — feeds
// never go through draft mode.
export const FEED_POST_LIMIT = 50

export type FeedItem = {
  author?: string
  categories: string[]
  excerpt?: string
  image?: {
    length: number
    type: string
    url: string
  }
  path: string
  publishedAt?: string
  title: string
  updatedAt: string
}

export type FeedData = {
  description: string
  items: FeedItem[]
  title: string
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toDate(value?: null | string): Date {
  const date = value ? new Date(value) : new Date(0)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

export async function getFeedData(): Promise<FeedData> {
  const payload = await getPayload({ config: await config })

  const [{ docs: posts }, agents, intro, theme] = await Promise.all([
    payload.find({
      collection: 'posts',
      limit: FEED_POST_LIMIT,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }),
    getAgents(false),
    payload
      .find({
        collection: 'pages',
        limit: 1,
        where: {
          _status: { equals: 'published' },
          path: { equals: '/blog' },
        },
      })
      .then((res) => res.docs[0])
      .catch(() => undefined),
    payload
      .findGlobal({ slug: 'theme' })
      .catch(() => undefined),
  ])

  const authorNames = new Map(agents.map((a) => [a.slug, a.name]))
  const siteName = theme?.meta?.siteName ?? 'witconsult'

  const items = posts.map((post) => ({
      author: post.author ? authorNames.get(post.author) : undefined,
      categories: [
        ...(post.categories ?? []),
        ...(post.tags ?? []),
      ],
      excerpt: post.excerpt ?? post.meta?.description ?? undefined,
      image:
        post.cover && typeof post.cover === 'object' && post.cover.url
          ? {
              length: post.cover.filesize ?? 0,
              type: post.cover.mimeType ?? 'image/jpeg',
              url: post.cover.url,
            }
          : undefined,
      path: post.path,
      publishedAt: post.publishedAt ?? undefined,
      title: post.meta?.title ?? post.title,
      updatedAt: post.updatedAt,
    }))

  return {
    description:
      intro?.meta?.description ??
      `${siteName} Blog`,
    items,
    title: `${siteName} Blog`,
  }
}

export function buildRss(
  { description, items, title }: FeedData,
  base: string,
  selfPath: string,
): string {
  const updated = items.length
    ? toDate(items[0].publishedAt ?? items[0].updatedAt)
    : new Date()
  const entries = items
    .map((item) => {
      const url = `${base}${item.path}`
      return [
        '    <item>',
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toDate(item.publishedAt ?? item.updatedAt).toUTCString()}</pubDate>`,
        item.author
          ? `      <dc:creator>${escapeXml(item.author)}</dc:creator>`
          : '',
        item.excerpt
          ? `      <description>${escapeXml(item.excerpt)}</description>`
          : '',
        item.image
          ? `      <enclosure url="${escapeXml(base + item.image.url)}" type="${escapeXml(item.image.type)}" length="${item.image.length}"/>`
          : '',
        ...item.categories.map(
          (c) => `      <category>${escapeXml(c)}</category>`,
        ),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(`${base}/blog`)}</link>
    <atom:link href="${escapeXml(`${base}${selfPath}`)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(description)}</description>
    <language>de</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
${entries}
  </channel>
</rss>
`
}

export function buildAtom(
  { description, items, title }: FeedData,
  base: string,
  selfPath: string,
): string {
  const updated = items.length
    ? toDate(items[0].updatedAt)
    : new Date()
  const entries = items
    .map((item) => {
      const url = `${base}${item.path}`
      return [
        '  <entry>',
        `    <title>${escapeXml(item.title)}</title>`,
        `    <link href="${escapeXml(url)}"/>`,
        `    <id>${escapeXml(url)}</id>`,
        `    <updated>${toDate(item.updatedAt).toISOString()}</updated>`,
        `    <published>${toDate(item.publishedAt ?? item.updatedAt).toISOString()}</published>`,
        item.author
          ? `    <author><name>${escapeXml(item.author)}</name></author>`
          : '',
        item.excerpt
          ? `    <summary>${escapeXml(item.excerpt)}</summary>`
          : '',
        ...item.categories.map(
          (c) => `    <category term="${escapeXml(c)}"/>`,
        ),
        '  </entry>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="de">
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(description)}</subtitle>
  <link href="${escapeXml(`${base}/blog`)}"/>
  <link href="${escapeXml(`${base}${selfPath}`)}" rel="self"/>
  <id>${escapeXml(`${base}/blog`)}</id>
  <updated>${updated.toISOString()}</updated>
${entries}
</feed>
`
}
