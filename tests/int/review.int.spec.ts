import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

import { POST } from '@/app/(frontend)/publish/route'
import {
  docViewPath,
  getPendingDocs,
} from '@/lib/review'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Spec: +wit/specs/arr/preview-confirm/ — pending-set semantics (FR-004),
// the publish gate (FR-002/FR-003) and redirect flow (FR-005).
let payload: Payload
const pageIds: number[] = []
const structureIds: number[] = []
const userIds: number[] = []

const EDITOR = { email: 'review-editor@test.local', password: 'test1234' }
const BOT = { email: 'review-bot@test.local', password: 'test1234' }

const publishRequest = async (
  fields: Record<string, string>,
  token?: string,
) => {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value)
  }
  return POST(
    new Request('http://localhost:3000/publish', {
      body: form,
      headers: token ? { cookie: `payload-token=${token}` } : {},
      method: 'POST',
    }),
  )
}

const login = async (email: string, password: string) => {
  const result = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  return result.token
}

const createPage = async (
  slug: string,
  published: boolean,
  markdown: string,
) =>
  payload.create({
    collection: 'pages',
    data: {
      markdownRaw: markdown,
      path: `/${slug}`,
      slug,
      sourcePath: `test/${slug}.md`,
      title: slug,
      _status: published ? 'published' : 'draft',
    },
    draft: !published,
  })

describe('preview-confirm', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const editor = await payload.create({
      collection: 'users',
      data: { ...EDITOR, role: 'editor' },
    })
    const bot = await payload.create({
      collection: 'users',
      data: { ...BOT, role: 'content-bot' },
    })
    userIds.push(editor.id, bot.id)
  })

  afterAll(async () => {
    for (const id of pageIds) {
      await payload.delete({ collection: 'pages', id })
    }
    for (const id of structureIds) {
      await payload.delete({ collection: 'structures', id })
    }
    for (const id of userIds) {
      await payload.delete({ collection: 'users', id })
    }
  })

  it('lists docs whose latest version is a draft and skips clean published docs', async () => {
    const draftPage = await createPage('review-draft', false, '# Draft')
    pageIds.push(draftPage.id)
    const cleanPage = await createPage(
      'review-clean',
      true,
      '# Clean',
    )
    pageIds.push(cleanPage.id)
    const dirtyPage = await createPage('review-dirty', true, '# Old')
    pageIds.push(dirtyPage.id)
    await payload.update({
      collection: 'pages',
      data: { markdownRaw: '# New draft' },
      draft: true,
      id: dirtyPage.id,
    })
    const structure = await payload.create({
      collection: 'structures',
      data: {
        data: { items: [] },
        name: 'review-nav',
        sourcePath: 'test/review-nav.yml',
      },
      draft: true,
    })
    structureIds.push(structure.id)

    const pending = await getPendingDocs()
    const keys = pending.map((doc) => `${doc.collection}:${doc.id}`)

    expect(keys).toContain(`pages:${draftPage.id}`)
    expect(keys).toContain(`pages:${dirtyPage.id}`)
    expect(keys).toContain(`structures:${structure.id}`)
    expect(keys).not.toContain(`pages:${cleanPage.id}`)

    const structureEntry = pending.find(
      (doc) => doc.collection === 'structures',
    )
    expect(structureEntry?.viewPath).toBe('/')
    expect(
      pending.find((doc) => doc.id === draftPage.id)?.viewPath,
    ).toBe('/review-draft')
  })

  it('resolves docViewPath per collection', () => {
    expect(
      docViewPath('pages', {
        path: '/a',
      } as Parameters<typeof docViewPath>[1]),
    ).toBe('/a')
    expect(
      docViewPath('structures', {} as Parameters<
        typeof docViewPath
      >[1]),
    ).toBe('/')
  })

  it('rejects publish without a session', async () => {
    const res = await publishRequest({
      collection: 'pages',
      id: '1',
    })
    expect(res.status).toBe(403)
  })

  it('rejects publish for the content-bot role', async () => {
    const token = await login(BOT.email, BOT.password)
    const res = await publishRequest(
      { collection: 'pages', id: '1' },
      token,
    )
    expect(res.status).toBe(403)
  })

  it('publishes a draft for an editor and redirects to its path', async () => {
    const page = await createPage('review-publish', false, '# Draft body')
    pageIds.push(page.id)
    const token = await login(EDITOR.email, EDITOR.password)

    const res = await publishRequest(
      { collection: 'pages', id: String(page.id) },
      token,
    )

    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/review-publish',
    )

    const { docs } = await payload.find({
      collection: 'pages',
      where: { id: { equals: page.id } },
    })
    expect(docs[0]?._status).toBe('published')
    const children = docs[0]?.content?.root?.children ?? []
    expect(children[0]?.type).toBe('heading')
  })

  it('advances to the next pending doc when publishing from review context', async () => {
    const first = await createPage('review-next-1', false, '# One')
    const second = await createPage('review-next-2', false, '# Two')
    pageIds.push(first.id, second.id)
    const token = await login(EDITOR.email, EDITOR.password)

    const res = await publishRequest(
      {
        collection: 'pages',
        from: 'review',
        id: String(first.id),
      },
      token,
    )

    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/review-next-2?from=review',
    )
  })

  it('returns to /review from index context and when the queue is empty', async () => {
    const page = await createPage('review-last', false, '# Last')
    pageIds.push(page.id)
    const token = await login(EDITOR.email, EDITOR.password)

    const fromIndex = await publishRequest(
      {
        collection: 'pages',
        from: 'index',
        id: String(page.id),
      },
      token,
    )
    expect(fromIndex.headers.get('location')).toBe(
      'http://localhost:3000/review',
    )
  })
})
