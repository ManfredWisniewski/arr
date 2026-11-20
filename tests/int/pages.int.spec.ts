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

  it('strips {#id} heading anchors and stamps them on heading nodes', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Anchors',
        slug: 'anchors',
        path: '/anchors',
        markdownRaw:
          '## Headless CMS {#headless-cms}\n\nBody.\n\n## Plain heading\n\n```markdown\n## fenced {#nope}\n```\n',
        sourcePath: 'anchors_webtext.md',
      },
    })
    createdIds.push(page.id)

    const children = page.content?.root?.children ?? []
    const headings = children.filter(
      (n) => n.type === 'heading',
    ) as (Record<string, unknown> & {
      children?: { text?: string }[]
      id?: string
    })[]

    expect(headings).toHaveLength(2)
    expect(headings[0]?.id).toBe('headless-cms')
    expect(headings[0]?.children?.[0]?.text).toBe('Headless CMS')
    expect(headings[1]?.id).toBeUndefined()
    // fenced `## … {#nope}` stays literal code, never a heading anchor
    expect(JSON.stringify(children)).toContain('## fenced {#nope}')
  })

  it('applies {target} link overrides and strips the markup', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Link targets',
        slug: 'link-targets',
        path: '/link-targets',
        markdownRaw:
          '[ext](https://example.com){target="_self"} and ' +
          '[rel](/p){target="_blank"} and [plain](/x) and ' +
          '`code {target="_blank"}`.\n\n' +
          '[bad](/y){target="banana"} stays literal.\n',
        sourcePath: 'link-targets_webtext.md',
      },
    })
    createdIds.push(page.id)

    const children = page.content?.root?.children ?? []
    const paragraph = children[0] as
      | { children?: { fields?: { target?: string }; type?: string }[] }
      | undefined
    const links = (paragraph?.children ?? []).filter(
      (n) => n.type === 'link',
    )

    expect(links).toHaveLength(3)
    expect(links[0]?.fields?.target).toBe('_self')
    expect(links[1]?.fields?.target).toBe('_blank')
    expect(links[2]?.fields?.target).toBeUndefined()

    const serialized = JSON.stringify(children)
    // consumed attributes are gone; inline-code and invalid values stay
    expect(serialized).not.toContain('{target="_self"}')
    expect(serialized).not.toContain('and [rel')
    expect(serialized).toContain('code {target="_blank"}')
    expect(serialized).toContain('{target="banana"}')
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
