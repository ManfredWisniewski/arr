import { getPayload, type Where } from 'payload'

import config from '@/payload.config'
import { blogRoot, pathPrefixWhere } from '@/lib/blog'
import { getSiteUrl } from '@/lib/site'

// Translation contract: the root tree is the site's default language
// (theme.meta.lang); translations mirror it under /<lang>/… — the same
// convention the */blog/** sync route and isLangBlogPath already use.
const LANG_PREFIX = /^\/([a-z]{2})(?=\/|$)/

const publishedOnly = (draft: boolean): Where =>
  draft ? {} : { _status: { equals: 'published' } }

// meta.lang is pushed site config — clamp to the code shape before it
// reaches <html lang> or hreflang output.
const sanitizeLang = (value: unknown) =>
  typeof value === 'string' && /^[a-z]{2}$/.test(value) ? value : 'de'

export async function getDefaultLang(): Promise<string> {
  try {
    const payload = await getPayload({ config: await config })
    const theme = await payload.findGlobal({ slug: 'theme' })
    return sanitizeLang(theme?.meta?.lang)
  } catch {
    return 'de'
  }
}

type DocCollection = 'pages' | 'posts'

// Language codes present on docs of a collection — every /<xx>/ first
// segment counts as a language tree by site convention.
async function collectionLangs(
  collection: DocCollection,
  draft: boolean,
): Promise<Set<string>> {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection,
    draft,
    pagination: false,
    select: { path: true },
    where: publishedOnly(draft),
  })
  const langs = new Set<string>()
  for (const doc of docs) {
    const path = (doc as { path?: string }).path
    const lang = path?.match(LANG_PREFIX)?.[1]
    if (lang) {
      langs.add(lang)
    }
  }
  return langs
}

// Canonical + hreflang alternates for a stored doc path: /<lang>/<rest>
// pairs with <rest>; languages lists only siblings that resolve to a
// published doc, plus x-default pointing at the default-tree path.
export async function docAlternates(
  collection: DocCollection,
  path: string,
  draft: boolean,
) {
  const [base, defaultLang, langs] = await Promise.all([
    getSiteUrl(),
    getDefaultLang(),
    collectionLangs(collection, draft),
  ])
  const rest = path.replace(LANG_PREFIX, '') || '/'
  const candidates = new Map<string, string>([[defaultLang, rest]])
  for (const lang of langs) {
    candidates.set(lang, `/${lang}${rest === '/' ? '' : rest}`)
  }
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection,
    draft,
    limit: candidates.size,
    select: { path: true },
    where: {
      ...publishedOnly(draft),
      or: [...candidates.values()].map((p) => ({ path: { equals: p } })),
    },
  })
  const existing = new Set(docs.map((d) => (d as { path?: string }).path))
  const languages: Record<string, string> = {}
  for (const [lang, candidate] of candidates) {
    if (existing.has(candidate)) {
      languages[lang] = `${base}${candidate}`
    }
  }
  return {
    canonical: `${base}${path}`,
    ...(Object.keys(languages).length > 1
      ? { languages: { ...languages, 'x-default': `${base}${rest}` } }
      : {}),
  }
}

// Alternates for the computed /blog archive routes (index, author,
// taxonomy). A /<lang>/blog sibling is listed only when it has matching
// published posts — the archive 404s on an empty term otherwise.
export async function blogAlternates(
  routePath: string,
  draft: boolean,
  filter: Where = {},
) {
  const [base, defaultLang, langs] = await Promise.all([
    getSiteUrl(),
    getDefaultLang(),
    collectionLangs('posts', draft),
  ])
  const rest = routePath.replace(LANG_PREFIX, '')
  const candidates = new Map<string, string>([[defaultLang, rest]])
  for (const lang of langs) {
    candidates.set(lang, `/${lang}${rest}`)
  }
  const payload = await getPayload({ config: await config })
  const languages: Record<string, string> = {}
  for (const [lang, candidate] of candidates) {
    const { totalDocs } = await payload.find({
      collection: 'posts',
      draft,
      limit: 1,
      where: {
        ...publishedOnly(draft),
        and: [
          ...(pathPrefixWhere(`${blogRoot(candidate)}/blog`).and ?? []),
          filter,
        ],
      },
    })
    if (totalDocs > 0) {
      languages[lang] = `${base}${candidate}`
    }
  }
  return {
    canonical: `${base}${routePath}`,
    ...(Object.keys(languages).length > 1
      ? { languages: { ...languages, 'x-default': `${base}${rest}` } }
      : {}),
  }
}
