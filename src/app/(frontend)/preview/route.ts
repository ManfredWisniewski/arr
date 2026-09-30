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
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid path', { status: 400 })
  }
  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
