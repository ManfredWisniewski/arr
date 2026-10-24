import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// GET /preview?secret=…&path=/route — enables Draft Mode, then redirects to the page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (
    !process.env.PREVIEW_SECRET ||
    searchParams.get('secret') !== process.env.PREVIEW_SECRET
  ) {
    return new Response('Invalid preview secret', { status: 401 })
  }
  const path = searchParams.get('path') ?? ''
  // Canonicalise before checking: backslashes and control characters can
  // otherwise smuggle a protocol-relative '//host' past the literal check
  // (browsers normalise '\' to '/' and strip tabs).
  const normalized = path.replace(/\\/g, '/').replace(/[\t\r\n]/g, '')
  if (!normalized.startsWith('/') || normalized.startsWith('//')) {
    return new Response('Invalid path', { status: 400 })
  }
  const draft = await draftMode()
  draft.enable()
  redirect(normalized)
}
