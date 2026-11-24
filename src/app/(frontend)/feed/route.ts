import { buildRss, getFeedData } from '@/lib/feed'
import { getSiteUrl } from '@/lib/site'

export async function GET() {
  const base = await getSiteUrl()
  return new Response(buildRss(await getFeedData(), base, '/feed'), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
