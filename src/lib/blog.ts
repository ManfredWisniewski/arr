import { getPayload, type Where } from 'payload'

import type { Media, Post } from '@/payload-types'
import config from '@/payload.config'
import type { Locale } from '@/i18n/routing'

// Shared queries for the /blog routes. Taxonomy is data: agent profiles
// live in the `structures` doc "agents", optional term labels in
// "taxonomies" — both pushed from <site>/+structure/*.yml.
// Every reader takes the route locale: public reads never fall back
// (D11), draft previews fall back to the default locale so editors see
// partially translated pages.
export const POSTS_PER_PAGE = 12

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

const localizedRead = (draft: boolean, locale: Locale) => ({
  draft,
  fallbackLocale: (draft ? 'de' : false) as 'de' | false,
  locale,
})

export async function getPostsPage({
  author,
  category,
  draft,
  locale,
  page = 1,
  tag,
}: {
  author?: string
  category?: string
  draft: boolean
  locale: Locale
  page?: number
  tag?: string
}) {
  const payload = await getPayload({ config: await config })
  return payload.find({
    collection: 'posts',
    ...localizedRead(draft, locale),
    limit: POSTS_PER_PAGE,
    page,
    sort: '-publishedAt',
    where: {
      ...publishedOnly(draft),
      ...(author ? { author: { equals: author } } : {}),
      ...(category ? { categories: { contains: category } } : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
    },
  })
}

export async function getPostByPath(
  path: string,
  draft: boolean,
  locale: Locale,
) {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'posts',
    ...localizedRead(draft, locale),
    limit: 1,
    where: {
      ...publishedOnly(draft),
      path: { equals: path },
    },
  })
  return docs[0] as Post | undefined
}

async function findStructure(name: string, draft: boolean, locale: Locale) {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      ...localizedRead(draft, locale),
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

export async function getAgents(
  draft: boolean,
  locale: Locale,
): Promise<AgentProfile[]> {
  const data = (await findStructure('agents', draft, locale)) as
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

export async function getAgent(
  slug: string,
  draft: boolean,
  locale: Locale,
) {
  return (await getAgents(draft, locale)).find((agent) => agent.slug === slug)
}

export type AgentRef = { avatarUrl?: string; name: string; slug: string }

// Display data for post-card bylines — one agents-doc lookup plus one
// media lookup per author actually present in the list.
export async function getAgentMap(
  slugs: (null | string | undefined)[],
  draft: boolean,
  locale: Locale,
): Promise<Record<string, AgentRef>> {
  const wanted = new Set(slugs.filter((slug): slug is string => !!slug))
  if (!wanted.size) {
    return {}
  }
  const agents = await getAgents(draft, locale)
  const entries = await Promise.all(
    agents
      .filter((agent) => wanted.has(agent.slug))
      .map(
        async (agent) =>
          [
            agent.slug,
            {
              avatarUrl: await getMediaUrl(agent.avatar, draft, 'avatar', locale),
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
  locale: Locale,
): Promise<TaxonomyTerm | undefined> {
  const data = (await findStructure('taxonomies', draft, locale)) as
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
  locale?: Locale,
) {
  if (!sourcePath) {
    return undefined
  }
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'media',
      ...localizedRead(draft, locale ?? 'de'),
      limit: 1,
      where: { sourcePath: { equals: sourcePath } },
    })
    const doc = docs[0] as Media | undefined
    return (size ? doc?.sizes?.[size]?.url : undefined) ?? doc?.url ?? undefined
  } catch {
    return undefined
  }
}

export function formatDate(
  value?: null | string,
  locale: Locale = 'de',
) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
