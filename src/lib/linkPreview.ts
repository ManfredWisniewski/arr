import { getPayload, type Where } from 'payload'

import type { Page, Post } from '@/payload-types'
import config from '@/payload.config'

// Preview source for `{preview}` link attributes (markdownAttributes.ts):
// an internal href (/path or /path#fragment) resolves against the linked
// page/post. A fragment selects the section under the heading carrying
// that {#anchor} id — headline is the heading text, body the text up to
// the next heading. Without a fragment the doc's meta description (posts:
// excerpt first) is the body, its title the headline.
const PREVIEW_MAX = 320

type LexNode = {
  children?: LexNode[]
  id?: unknown
  text?: unknown
  type?: string
}

const nodeText = (node: LexNode): string =>
  typeof node.text === 'string'
    ? node.text
    : (node.children ?? []).map(nodeText).join('')

const truncate = (text: string) =>
  text.length <= PREVIEW_MAX
    ? text
    : `${text.slice(0, PREVIEW_MAX).trimEnd()}…`

export type LinkPreview = { headline?: string; text: string }

export async function getLinkPreview(
  href: string,
  draft: boolean,
): Promise<LinkPreview | undefined> {
  const hash = href.indexOf('#')
  const path = hash < 0 ? href : href.slice(0, hash)
  const fragment = hash < 0 ? '' : href.slice(hash + 1)
  if (!path.startsWith('/')) {
    return undefined
  }
  const payload = await getPayload({ config: await config })
  const where: Where = {
    path: { equals: path },
    ...(draft ? {} : { _status: { equals: 'published' } }),
  }
  let docs = (
    await payload.find({ collection: 'pages', draft, limit: 1, where })
  ).docs
  if (!docs.length) {
    docs = (
      await payload.find({ collection: 'posts', draft, limit: 1, where })
    ).docs
  }
  const found = docs[0] as Page | Post | undefined
  if (!found) {
    return undefined
  }
  const children =
    (found.content as { root?: { children?: LexNode[] } } | null | undefined)
      ?.root?.children ?? []
  if (fragment) {
    const start = children.findIndex(
      (n) => n.type === 'heading' && n.id === fragment,
    )
    if (start < 0) {
      return undefined
    }
    const parts: string[] = []
    for (const node of children.slice(start + 1)) {
      if (node.type === 'heading') {
        break
      }
      const text = nodeText(node).trim()
      if (text) {
        parts.push(text)
      }
    }
    if (!parts.length) {
      return undefined
    }
    const headline = nodeText(children[start]!).trim()
    return {
      headline: headline || undefined,
      text: truncate(parts.join(' ')),
    }
  }
  const text = (
    ('excerpt' in found ? found.excerpt : undefined) ??
    found.meta?.description ??
    ''
  ).trim()
  if (!text) {
    return undefined
  }
  return { headline: found.meta?.title ?? found.title, text }
}
