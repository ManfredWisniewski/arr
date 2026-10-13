import { getPayload, type Where } from 'payload'

import type { Media, Post } from '@/payload-types'
import config from '@/payload.config'

// Shared queries for the /blog routes. Taxonomy is data: agent profiles
// live in the `structures` doc "agents", optional term labels in
// "taxonomies" — both pushed from <site>/+structure/*.yml.
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

export async function getPostsPage({
  author,
  category,
  draft,
  page = 1,
  tag,
}: {
  author?: string
  category?: string
  draft: boolean
  page?: number
  tag?: string
}) {
  const payload = await getPayload({ config: await config })
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
      ...(tag ? { tags: { contains: tag } } : {}),
    },
  })
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

export function formatDate(value?: null | string) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
