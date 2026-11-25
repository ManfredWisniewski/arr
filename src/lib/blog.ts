import { getPayload, type Where } from 'payload'

import type { Media, Page, Post } from '@/payload-types'
import config from '@/payload.config'

// Shared queries for the /blog routes. Taxonomy is data: agent profiles
// live in the `structures` doc "agents", optional term labels in
// "taxonomies" — both pushed from <site>/+structure/*.yml.
export const POSTS_PER_PAGE = 12

// ?page= parser shared by all blog routes — Number() alone would pass
// Infinity and fractions through to the Postgres OFFSET.
export const parsePageParam = (page: string | undefined): number => {
  const n = Number(page)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

// Tags inactive on the blog index filter until a ?hide= parameter
// overrides the default.
export const DEFAULT_EXCLUDED_TAGS = ['daily', 'diary', 'update']

// `?hide=a,b` lists the inactive tags on the blog index filter.
// Absent param -> undefined ("use the default"); an empty value means
// "hide nothing" — every category is active.
export const parseHideParam = (value?: string | string[]) =>
  value === undefined
    ? undefined
    : [
        ...new Set(
          (Array.isArray(value) ? value.join(',') : value)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      ]

export type AgentProfile = {
  // media sourcePath, resolved to a URL via getMediaUrl()
  avatar?: string
  bio?: string
  name: string
  role?: string
  slug: string
}

export type TaxonomyTerm = {
  description?: string
  label: string
  slug: string
}

const publishedOnly = (draft: boolean): Where =>
  draft ? {} : { _status: { equals: 'published' } }

// Path helpers for localized blogs: English posts live at /blog/…,
// translations under /<lang>/blog/… (mirrors the `*/blog/**` sync route).
// blogRoot('//blog/x' → ''), parentPath('/de/blog/a/b' → '/de/blog/a').
export const blogRoot = (path: string) => path.slice(0, path.indexOf('/blog'))
export const parentPath = (path: string) =>
  path.slice(0, path.lastIndexOf('/'))

// `like` is useless for prefixes — the drizzle adapter wraps the value in
// %…% (substring match), so '/de/blog/…' matches `like '/blog/%'`. Use a
// half-open range instead: '/' sorts just below '0', so
// [pathPrefix + '/', pathPrefix + '0') covers exactly pathPrefix/… .
export const pathPrefixWhere = (prefix: string): Where => ({
  and: [
    { path: { greater_than_equal: `${prefix}/` } },
    { path: { less_than: `${prefix}0` } },
  ],
})

// hide-if-any-inactive: a post carrying one of the excluded tags is
// dropped entirely. `tags: { not_in }` would match per joined row (any
// non-excluded tag saves the post), so the exclusion is an id subquery
// instead; posts without tags always pass.
async function hiddenPostIds({
  draft,
  excludeTags,
  pathPrefix,
}: {
  draft: boolean
  excludeTags?: string[]
  pathPrefix?: string
}) {
  if (!excludeTags?.length) {
    return []
  }
  const payload = await getPayload({ config: await config })
  const { docs: hidden } = await payload.find({
    collection: 'posts',
    draft,
    pagination: false,
    select: { tags: true },
    where: {
      ...publishedOnly(draft),
      ...(pathPrefix ? pathPrefixWhere(pathPrefix) : {}),
      tags: { in: excludeTags },
    },
  })
  return (hidden as Post[]).map((doc) => doc.id)
}

export async function getPostsPage({
  author,
  category,
  draft,
  excludeTags,
  page = 1,
  pathPrefix,
  tag,
}: {
  author?: string
  category?: string
  draft: boolean
  excludeTags?: string[]
  page?: number
  pathPrefix?: string
  tag?: string
}) {
  const payload = await getPayload({ config: await config })
  const hiddenIds = await hiddenPostIds({ draft, excludeTags, pathPrefix })
  return payload.find({
    collection: 'posts',
    draft,
    limit: POSTS_PER_PAGE,
    page,
    sort: '-publishedAt',
    where: {
      ...publishedOnly(draft),
      ...(author ? { author: { equals: author } } : {}),
      ...(category ? { categories: { contains: category } } : {}),
      ...(pathPrefix ? pathPrefixWhere(pathPrefix) : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
      ...(hiddenIds.length ? { id: { not_in: hiddenIds } } : {}),
    },
  })
}

// Tag pills for the blog index filter, ranked by post count over all
// published posts under pathPrefix — the order is independent of ?hide,
// so a toggled pill only flips its active state in place and never
// moves. DEFAULT_EXCLUDED_TAGS rank last regardless of count: they are
// the hidden-by-default floods (e.g. diary), not the top tags. Untagged
// posts are always shown, so they need no pill.
export async function getTags(pathPrefix: string, draft: boolean) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'posts',
    draft,
    pagination: false,
    select: { tags: true },
    where: {
      ...publishedOnly(draft),
      ...pathPrefixWhere(pathPrefix),
    },
  })
  const counts = new Map<string, number>()
  for (const doc of docs as Post[]) {
    for (const tag of doc.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  const rank = (a: string, b: string) =>
    (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
  const demoted = new Set(DEFAULT_EXCLUDED_TAGS)
  const all = [...counts.keys()]
  return [
    ...all.filter((tag) => !demoted.has(tag)).sort(rank),
    ...all.filter((tag) => demoted.has(tag)).sort(rank),
  ]
}

// Optional intro/meta source for a blog index: a `pages` doc at the index
// path (e.g. /blog or /de/blog) supplies copy above the post list.
export async function getIntroPage(path: string, draft: boolean) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    where: {
      ...publishedOnly(draft),
      path: { equals: path },
    },
  })
  return docs[0] as Page | undefined
}

export async function getPostByPath(path: string, draft: boolean) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    where: {
      ...publishedOnly(draft),
      path: { equals: path },
    },
  })
  return docs[0] as Post | undefined
}

async function findStructure(name: string, draft: boolean) {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      draft,
      limit: 1,
      where: {
        name: { equals: name },
        ...publishedOnly(draft),
      },
    })
    return docs[0]?.data
  } catch {
    return undefined
  }
}

export async function getAgents(draft: boolean): Promise<AgentProfile[]> {
  const data = (await findStructure('agents', draft)) as
    | { agents?: unknown }
    | unknown[]
    | undefined
  const list = Array.isArray(data) ? data : data?.agents
  if (!Array.isArray(list)) {
    return []
  }
  return list.flatMap((raw) => {
    const agent = raw as Record<string, unknown>
    if (
      typeof agent?.slug !== 'string' ||
      typeof agent?.name !== 'string'
    ) {
      return []
    }
    return [
      {
        avatar: typeof agent.avatar === 'string' ? agent.avatar : undefined,
        bio: typeof agent.bio === 'string' ? agent.bio : undefined,
        name: agent.name,
        role: typeof agent.role === 'string' ? agent.role : undefined,
        slug: agent.slug,
      },
    ]
  })
}

export async function getAgent(slug: string, draft: boolean) {
  return (await getAgents(draft)).find((agent) => agent.slug === slug)
}

export type AgentRef = { avatarUrl?: string; name: string; slug: string }

// Display data for post-card bylines — one agents-doc lookup plus one
// media lookup per author actually present in the list.
export async function getAgentMap(
  slugs: (null | string | undefined)[],
  draft: boolean,
): Promise<Record<string, AgentRef>> {
  const wanted = new Set(slugs.filter((slug): slug is string => !!slug))
  if (!wanted.size) {
    return {}
  }
  const agents = await getAgents(draft)
  const entries = await Promise.all(
    agents
      .filter((agent) => wanted.has(agent.slug))
      .map(
        async (agent) =>
          [
            agent.slug,
            {
              avatarUrl: await getMediaUrl(agent.avatar, draft, 'avatar'),
              name: agent.name,
              slug: agent.slug,
            },
          ] as const,
      ),
  )
  return Object.fromEntries(entries)
}

export async function getTaxonomyTerm(
  kind: 'categories' | 'tags',
  slug: string,
  draft: boolean,
): Promise<TaxonomyTerm | undefined> {
  const data = (await findStructure('taxonomies', draft)) as
    | Record<string, unknown>
    | undefined
  const raw = data?.[kind]
  // accepts both [{ slug, label, … }] and { slug: { label, … } } shapes
  const term = Array.isArray(raw)
    ? (raw as Record<string, unknown>[]).find((t) => t?.slug === slug)
    : ((raw as Record<string, Record<string, unknown>> | undefined)?.[slug])
  if (!term || typeof term !== 'object') {
    return undefined
  }
  const record = term as Record<string, unknown>
  return {
    description:
      typeof record.description === 'string'
        ? record.description
        : undefined,
    label: typeof record.label === 'string' ? record.label : slug,
    slug,
  }
}

export async function getMediaUrl(
  sourcePath: string | undefined,
  draft: boolean,
  size?: 'avatar' | 'card',
) {
  if (!sourcePath) {
    return undefined
  }
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'media',
      draft,
      limit: 1,
      where: { sourcePath: { equals: sourcePath } },
    })
    const doc = docs[0] as Media | undefined
    return (size ? doc?.sizes?.[size]?.url : undefined) ?? doc?.url ?? undefined
  } catch {
    return undefined
  }
}

export function formatDate(value?: null | string, path?: string) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  // post paths carry the lang prefix (/<lang>/blog/…); the default tree
  // is German, /en keeps the previous en-GB rendering
  const lang = path ? blogRoot(path).slice(1) : ''
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : lang || 'de', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
