// Visitor chat relay — proxies widget messages to the configured chat
// backend (n8n webhook) so the webhook URL and secret stay server-side.
// Disabled entirely unless CHAT_WEBHOOK_URL is set.

const MAX_MESSAGE_LENGTH = 2000
const MAX_SESSION_ID_LENGTH = 100
const MAX_METADATA_BYTES = 2048
const UPSTREAM_TIMEOUT_MS = 45_000
const RATE_WINDOW_MS = 60 * 60 * 1000
const RATE_MAX_MESSAGES = 20
const MAX_CONCURRENT = 5

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
let inflight = 0

function rateKey(request: Request, sessionId: string): string {
  const ip = (request.headers.get('x-forwarded-for') ?? 'local')
    .split(',')[0]
    .trim()
  return `${ip}|${sessionId}`
}

function rateLimited(key: string): boolean {
  const now = Date.now()
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) {
        buckets.delete(k)
      }
    }
  }
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_MAX_MESSAGES
}

// Accepts {output}, {reply}, {text}, an array thereof, or plain text.
function extractReply(body: unknown): string | null {
  if (typeof body === 'string') {
    return body || null
  }
  if (Array.isArray(body)) {
    for (const item of body) {
      const reply = extractReply(item)
      if (reply) {
        return reply
      }
    }
    return null
  }
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    for (const key of ['output', 'reply', 'text']) {
      const value = record[key]
      if (typeof value === 'string' && value) {
        return value
      }
    }
  }
  return null
}

function json(data: Record<string, unknown>, status: number) {
  return Response.json(data, { status })
}

export async function POST(request: Request) {
  const webhookUrl = process.env.CHAT_WEBHOOK_URL
  if (!webhookUrl) {
    return json({ error: 'chat not configured' }, 404)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }

  const sessionId = body.sessionId
  const chatInput = body.chatInput
  if (
    typeof sessionId !== 'string' ||
    !sessionId ||
    sessionId.length > MAX_SESSION_ID_LENGTH ||
    typeof chatInput !== 'string' ||
    !chatInput.trim() ||
    chatInput.length > MAX_MESSAGE_LENGTH
  ) {
    return json({ error: 'invalid payload' }, 400)
  }

  let metadata: unknown
  if (body.metadata !== undefined) {
    try {
      if (
        JSON.stringify(body.metadata).length <= MAX_METADATA_BYTES &&
        body.metadata !== null &&
        typeof body.metadata === 'object'
      ) {
        metadata = body.metadata
      }
    } catch {
      // unserializable metadata — drop it
    }
  }

  if (rateLimited(rateKey(request, sessionId))) {
    return json({ error: 'rate limit exceeded' }, 429)
  }
  if (inflight >= MAX_CONCURRENT) {
    return json({ error: 'too many requests' }, 429)
  }

  inflight += 1
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    const secret = process.env.CHAT_WEBHOOK_SECRET
    if (secret) {
      headers.Authorization = `Bearer ${secret}`
    }
    const upstream = await fetch(webhookUrl, {
      body: JSON.stringify({
        action: 'sendMessage',
        chatInput,
        ...(metadata !== undefined ? { metadata } : {}),
        sessionId,
      }),
      headers,
      method: 'POST',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
    if (!upstream.ok) {
      return json({ error: 'upstream error' }, 502)
    }
    const raw = await upstream.text()
    let parsed: unknown = raw
    try {
      parsed = JSON.parse(raw)
    } catch {
      // plain-text reply
    }
    const reply = extractReply(parsed)
    if (!reply) {
      return json({ error: 'empty upstream reply' }, 502)
    }
    return json({ reply }, 200)
  } catch {
    return json({ error: 'upstream unavailable' }, 502)
  } finally {
    inflight -= 1
  }
}
