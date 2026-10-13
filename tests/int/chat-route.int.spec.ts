import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/(frontend)/api/chat/route'

const WEBHOOK_URL = 'https://n8n.example.org/webhook/chat/test'
const WEBHOOK_SECRET = 'test-secret'

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://site.example/api/chat', {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
    method: 'POST',
  })
}

let fetchMock: ReturnType<typeof vi.fn>
let seq = 0
const session = () => `test-session-${(seq += 1)}`

describe('POST /api/chat', () => {
  beforeEach(() => {
    process.env.CHAT_WEBHOOK_URL = WEBHOOK_URL
    process.env.CHAT_WEBHOOK_SECRET = WEBHOOK_SECRET
    fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ output: 'Hallo!' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    delete process.env.CHAT_WEBHOOK_URL
    delete process.env.CHAT_WEBHOOK_SECRET
    vi.unstubAllGlobals()
  })

  it('returns 404 when CHAT_WEBHOOK_URL is unset', async () => {
    delete process.env.CHAT_WEBHOOK_URL
    const res = await POST(
      makeRequest({ chatInput: 'hi', sessionId: session() }),
    )
    expect(res.status).toBe(404)
  })

  it('forwards Chat-Trigger-shaped payload with Bearer secret', async () => {
    const res = await POST(
      makeRequest({
        chatInput: 'Was bietet ihr an?',
        metadata: { page: '/leistungen' },
        sessionId: session(),
      }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ reply: 'Hallo!' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(WEBHOOK_URL)
    expect(init.headers.Authorization).toBe(`Bearer ${WEBHOOK_SECRET}`)
    const sent = JSON.parse(init.body)
    expect(sent).toMatchObject({
      action: 'sendMessage',
      chatInput: 'Was bietet ihr an?',
      metadata: { page: '/leistungen' },
    })
    expect(sent.sessionId).toMatch(/^test-session-/)
  })

  it('accepts array and plain-text upstream replies', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([{ output: 'eins' }, { output: 'zwei' }]), {
        status: 200,
      }),
    )
    let res = await POST(
      makeRequest({ chatInput: 'a', sessionId: session() }),
    )
    expect(await res.json()).toEqual({ reply: 'eins' })

    fetchMock.mockResolvedValueOnce(new Response('plain ok', { status: 200 }))
    res = await POST(makeRequest({ chatInput: 'b', sessionId: session() }))
    expect(await res.json()).toEqual({ reply: 'plain ok' })
  })

  it('rejects invalid payloads', async () => {
    for (const body of [
      'not json{',
      {},
      { chatInput: '', sessionId: session() },
      { chatInput: 'x'.repeat(2001), sessionId: session() },
      { chatInput: 'hi' },
      { chatInput: 'hi', sessionId: 'x'.repeat(101) },
    ]) {
      const res = await POST(makeRequest(body))
      expect(res.status).toBe(400)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rate-limits after the per-session window cap', async () => {
    const sid = session()
    for (let i = 0; i < 20; i += 1) {
      const res = await POST(makeRequest({ chatInput: 'x', sessionId: sid }))
      expect(res.status).toBe(200)
    }
    const res = await POST(makeRequest({ chatInput: 'x', sessionId: sid }))
    expect(res.status).toBe(429)
  })

  it('maps upstream failure to 502', async () => {
    fetchMock.mockResolvedValueOnce(new Response('boom', { status: 500 }))
    const res = await POST(
      makeRequest({ chatInput: 'hi', sessionId: session() }),
    )
    expect(res.status).toBe(502)
  })

  it('maps empty upstream reply to 502', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ other: 1 }), { status: 200 }),
    )
    const res = await POST(
      makeRequest({ chatInput: 'hi', sessionId: session() }),
    )
    expect(res.status).toBe(502)
  })
})
