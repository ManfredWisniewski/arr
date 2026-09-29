import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const createdIds: number[] = []

describe('Pages', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    for (const id of createdIds) {
      await payload.delete({ collection: 'pages', id })
    }
  })

  it('converts markdownRaw into lexical content on create', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Test',
        slug: 'test',
        path: '/test',
        markdownRaw: '# Heading\n\nSome text.',
        sourcePath: 'test_webtext_locked.md',
      },
    })
    createdIds.push(page.id)

    const children = page.content?.root?.children ?? []
    expect(children[0]?.type).toBe('heading')
    expect(children[1]?.type).toBe('paragraph')
  })

  it('does not overwrite content when markdownRaw is unchanged', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Keep',
        slug: 'keep',
        path: '/keep',
        markdownRaw: '# Keep me',
        sourcePath: 'keep_webtext_locked.md',
      },
    })
    createdIds.push(page.id)

    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        title: 'Keep (edited)',
        markdownRaw: '# Keep me',
        content: page.content,
      },
    })

    expect(updated.title).toBe('Keep (edited)')
    const children = updated.content?.root?.children ?? []
    expect(children[0]?.type).toBe('heading')
  })

  it('regenerates content when markdownRaw changes', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Regen',
        slug: 'regen',
        path: '/regen',
        markdownRaw: '# Before',
        sourcePath: 'regen_webtext_locked.md',
      },
    })
    createdIds.push(page.id)

    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: { markdownRaw: '# After\n\nNew body.' },
    })

    const children = updated.content?.root?.children ?? []
    expect(children).toHaveLength(2)
    expect(children[1]?.type).toBe('paragraph')
  })
})
