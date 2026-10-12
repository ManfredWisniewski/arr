import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const createdIds: number[] = []

describe('Posts', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    for (const id of createdIds) {
      await payload.delete({ collection: 'posts', id })
    }
  })

  it('converts markdownRaw into lexical content on create', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Post',
        slug: 'post',
        path: '/blog/alisa/post',
        markdownRaw: '# Heading\n\nSome text.',
        sourcePath: 'blog/alisa/post_webtext_locked.md',
        author: 'alisa',
        categories: ['seo', 'content'],
        tags: ['intern'],
        publishedAt: '2026-10-01',
      },
    })
    createdIds.push(post.id)

    const children = post.content?.root?.children ?? []
    expect(children[0]?.type).toBe('heading')
    expect(children[1]?.type).toBe('paragraph')
    expect(post.categories).toEqual(['seo', 'content'])
    expect(post.tags).toEqual(['intern'])
    expect(post.author).toBe('alisa')
  })

  it('regenerates content when markdownRaw changes', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Regen',
        slug: 'regen-post',
        path: '/blog/carson/regen',
        markdownRaw: '# Before',
        sourcePath: 'blog/carson/regen_webtext_locked.md',
      },
    })
    createdIds.push(post.id)

    const updated = await payload.update({
      collection: 'posts',
      id: post.id,
      data: { markdownRaw: '# After\n\nNew body.' },
    })

    const children = updated.content?.root?.children ?? []
    expect(children).toHaveLength(2)
    expect(children[1]?.type).toBe('paragraph')
  })

  it('filters posts by taxonomy fields', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Tagged',
        slug: 'tagged',
        path: '/blog/lena/tagged',
        sourcePath: 'blog/lena/tagged_webtext_locked.md',
        author: 'lena',
        categories: ['produkt'],
        tags: ['eeat'],
      },
    })
    createdIds.push(post.id)

    const byAuthor = await payload.find({
      collection: 'posts',
      where: { author: { equals: 'lena' } },
    })
    expect(byAuthor.docs.map((d) => d.id)).toContain(post.id)

    const byCategory = await payload.find({
      collection: 'posts',
      where: { categories: { contains: 'produkt' } },
    })
    expect(byCategory.docs.map((d) => d.id)).toContain(post.id)

    const byTag = await payload.find({
      collection: 'posts',
      where: { tags: { contains: 'eeat' } },
    })
    expect(byTag.docs.map((d) => d.id)).toContain(post.id)
  })
})
