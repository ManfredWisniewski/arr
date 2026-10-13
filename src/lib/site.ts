import { headers } from 'next/headers'

// Public base URL of this instance, resolved per request so the
// site-agnostic image needs no baked-in domain. SITE_URL wins when set;
// otherwise the reverse proxy's forwarded headers are used.
export async function getSiteUrl(): Promise<string> {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '')
  }
  const h = await headers()
  const host = (h.get('x-forwarded-host') ?? h.get('host'))
    ?.split(',')[0]
    ?.trim()
  const proto = (h.get('x-forwarded-proto') ?? 'https')
    .split(',')[0]
    .trim()
  return `${proto}://${host ?? 'localhost:3000'}`
}
