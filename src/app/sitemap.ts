import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { locales, localeHref, type Locale } from '@/lib/locale'
import { getSiteUrl } from '@/lib/site'

// Published pages + posts plus the public /blog archive routes, one URL
// per locale (/de/*, /en/*) — D09/D11. `alternates.languages` carries the
// hreflang cross-links for the locales where the document is published;
// x-default points at the German URL (falls back to English if only en
// is published). Drafts are never listed; a failing DB yields just the
// static entries instead of a 500 (same fail-open pattern as layout.tsx).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteUrl()

  const published = { _status: { equals: 'published' } }
  const read = {
    draft: false,
    fallbackLocale: false,
    pagination: false,
  } as const

  try {
    const payload = await getPayload({ config: await config })
    // path -> set of locales where a published version exists
    const byPath = new Map<string, { locales: Set<Locale>; modified?: string }>()

    const add = (path: string | null | undefined, locale: Locale, modified?: string) => {
      if (!path) {
        return
      }
      const entry = byPath.get(path) ?? { locales: new Set<Locale>(), modified }
      entry.locales.add(locale)
      if (modified && (!entry.modified || modified > entry.modified)) {
        entry.modified = modified
      }
      byPath.set(path, entry)
    }

    for (const locale of locales) {
      const [pages, posts] = await Promise.all([
        payload.find({ collection: 'pages', locale, ...read, where: published }),
        payload.find({
          collection: 'posts',
          locale,
          ...read,
          sort: '-publishedAt',
          where: published,
        }),
      ])
      for (const doc of pages.docs) {
        add(doc.path, locale, doc.updatedAt)
      }
      for (const doc of posts.docs) {
        add(doc.path, locale, doc.publishedAt ?? doc.updatedAt)
        if (doc.author) {
          add(`/blog/${doc.author}`, locale)
        }
        for (const category of doc.categories ?? []) {
          add(`/blog/category/${category}`, locale)
        }
        for (const tag of doc.tags ?? []) {
          add(`/blog/tag/${tag}`, locale)
        }
      }
      // the /blog index exists in every locale regardless of posts
      add('/blog', locale)
    }

    return [...byPath.entries()].map(([path, { locales: publishedLocales, modified }]) => {
      const languages = Object.fromEntries(
        [...publishedLocales].map((locale) => [
          locale,
          `${base}${localeHref(locale, path)}`,
        ]),
      )
      languages['x-default'] =
        languages[locales[0]] ?? Object.values(languages)[0]
      return {
        alternates: { languages },
        lastModified: modified,
        url: `${base}${localeHref(
          publishedLocales.has(locales[0]) ? locales[0] : [...publishedLocales][0],
          path,
        )}`,
      }
    })
  } catch {
    return locales.map((locale) => ({ url: `${base}/${locale}` }))
  }
}
