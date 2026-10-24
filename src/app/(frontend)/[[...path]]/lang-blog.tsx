import { notFound } from 'next/navigation.js'
import React from 'react'

import {
  getAgent,
  getAgentMap,
  getIntroPage,
  getMediaUrl,
  getPostByPath,
  getPostsPage,
  getTaxonomyTerm,
  parsePageParam,
} from '@/lib/blog'

import { TaxonomyArchive } from '../blog/taxonomy-archive'
import {
  AuthorArchiveView,
  BlogIndexView,
  PostArticle,
  TranslationNotice,
} from '../blog/views'

// Localized blog tree: /<lang>/blog/… mirrors the English /blog routes,
// served through the catch-all (a wildcard [lang] segment can't coexist
// with [[...path]]). Matches the `*/blog/**` posts-route in .arrcontent.yml.
export const isLangBlogPath = (segments: string[]) =>
  segments.length >= 2 && segments[1] === 'blog'

const EMPTY_LABEL = 'Keine Beiträge gefunden.'

export async function langBlogMetadata(segments: string[], draft: boolean) {
  const base = `/${segments[0]}/blog`
  const rest = segments.slice(2)

  if (!rest.length) {
    const intro = await getIntroPage(base, draft)
    return {
      description: intro?.meta?.description ?? undefined,
      title: intro?.meta?.title ?? intro?.title ?? 'Blog',
    }
  }
  if (
    (rest[0] === 'kategorie' || rest[0] === 'tag') &&
    rest.length === 2
  ) {
    const term = await getTaxonomyTerm(
      rest[0] === 'kategorie' ? 'categories' : 'tags',
      rest[1],
      draft,
    )
    const label = rest[0] === 'kategorie' ? 'Kategorie' : 'Tag'
    return {
      description: term?.description,
      title: term?.label ?? `${label}: ${rest[1]}`,
    }
  }
  if (rest.length === 1) {
    const agent = await getAgent(rest[0], draft)
    return agent ? { description: agent.bio, title: agent.name } : {}
  }
  if (rest.length === 2) {
    const doc = await getPostByPath(`${base}/${rest[0]}/${rest[1]}`, draft)
    if (!doc) {
      return {}
    }
    return {
      description: doc.meta?.description ?? doc.excerpt ?? undefined,
      title: doc.meta?.title ?? doc.title,
    }
  }
  return {}
}

export async function LangBlog({
  draft,
  page,
  segments,
}: {
  draft: boolean
  page?: string
  segments: string[]
}) {
  const base = `/${segments[0]}/blog`
  const rest = segments.slice(2)
  const current = parsePageParam(page)

  if (!rest.length) {
    const [intro, result] = await Promise.all([
      getIntroPage(base, draft),
      getPostsPage({ draft, page: current, pathPrefix: base }),
    ])
    const agents = await getAgentMap(
      result.docs.map((post) => post.author),
      draft,
    )
    return (
      <BlogIndexView
        agents={agents}
        basePath={base}
        current={result.page ?? current}
        emptyLabel={EMPTY_LABEL}
        intro={intro}
        posts={result.docs}
        totalPages={result.totalPages}
      />
    )
  }

  if (rest[0] === 'kategorie' || rest[0] === 'tag') {
    if (rest.length !== 2) {
      notFound()
    }
    const slug = rest[1]
    const isCategory = rest[0] === 'kategorie'
    const [term, result] = await Promise.all([
      getTaxonomyTerm(isCategory ? 'categories' : 'tags', slug, draft),
      getPostsPage(
        isCategory
          ? { category: slug, draft, page: current, pathPrefix: base }
          : { draft, page: current, pathPrefix: base, tag: slug },
      ),
    ])
    const agents = await getAgentMap(
      result.docs.map((post) => post.author),
      draft,
    )
    if (!result.docs.length && !term && !draft) {
      notFound()
    }
    return (
      <TaxonomyArchive
        agents={agents}
        basePath={`${base}/${rest[0]}/${slug}`}
        current={result.page ?? current}
        description={term?.description}
        heading={
          term?.label ?? `${isCategory ? 'Kategorie' : 'Tag'}: ${slug}`
        }
        posts={result.docs}
        totalPages={result.totalPages}
      />
    )
  }

  if (rest.length === 1) {
    const agent = await getAgent(rest[0], draft)
    if (!agent) {
      notFound()
    }
    const [avatarUrl, result] = await Promise.all([
      getMediaUrl(agent.avatar, draft),
      getPostsPage({
        author: agent.slug,
        draft,
        page: current,
        pathPrefix: base,
      }),
    ])
    return (
      <AuthorArchiveView
        agent={agent}
        avatarUrl={avatarUrl}
        basePath={`${base}/${agent.slug}`}
        current={result.page ?? current}
        emptyLabel={EMPTY_LABEL}
        posts={result.docs}
        totalPages={result.totalPages}
      />
    )
  }

  if (rest.length === 2) {
    const doc = await getPostByPath(`${base}/${rest[0]}/${rest[1]}`, draft)
    if (!doc) {
      notFound()
    }
    const agent = doc.author ? await getAgent(doc.author, draft) : undefined
    const avatarUrl = await getMediaUrl(agent?.avatar, draft)
    return (
      <PostArticle
        agent={agent}
        avatarUrl={avatarUrl}
        doc={doc}
        notice={<TranslationNotice path={doc.path} />}
      />
    )
  }

  notFound()
}
