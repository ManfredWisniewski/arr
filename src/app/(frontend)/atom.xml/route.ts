import { buildAtom, getFeedData } from '@/lib/feed'
import { getSiteUrl } from '@/lib/site'

export async function GET() {
  const base = await getSiteUrl()
  return new Response(buildAtom(await getFeedData(), base, '/atom.xml'), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
