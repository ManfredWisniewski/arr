import { headers } from 'next/headers'

// host[:port] only — anything else (markup, whitespace, commas beyond the
// first entry) would end up verbatim in sitemap/robots/feed output
const HOST_PATTERN = /^[a-z0-9.-]+(?::\d+)?$/i

// Public base URL of this instance, resolved per request so the
// site-agnostic image needs no baked-in domain. SITE_URL wins when set,
// then the deploy-time canonical host (NEXT_PUBLIC_SERVER_URL); the
// reverse proxy's forwarded headers are only the fallback. Canonical
// output (sitemap, robots, hreflang) therefore emits the configured
// host even on alias requests.
export async function getSiteUrl(): Promise<string> {
  const env = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL
  if (env) {
    return env.replace(/\/+$/, '')
  }
  const h = await headers()
  const host = (h.get('x-forwarded-host') ?? h.get('host'))
    ?.split(',')[0]
    ?.trim()
  const proto = (h.get('x-forwarded-proto') ?? 'https')
    .split(',')[0]
    .trim()
  if (!host || !HOST_PATTERN.test(host)) {
    return 'https://localhost:3000'
  }
  const scheme = proto === 'http' ? 'http' : 'https'
  return `${scheme}://${host}`
}
