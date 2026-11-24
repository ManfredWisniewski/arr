import { headers } from 'next/headers'

// host[:port] only — anything else (markup, whitespace, commas beyond the
// first entry) would end up verbatim in sitemap/robots/feed output
const HOST_PATTERN = /^[a-z0-9.-]+(?::\d+)?$/i

// Validated host[:port] plus the forwarded or given default scheme.
// Returns undefined when no usable host header is present.
const originFromHeaders = (
  h: Headers,
  defaultProto: string,
): string | undefined => {
  const host = (h.get('x-forwarded-host') ?? h.get('host'))
    ?.split(',')[0]
    ?.trim()
  const proto = (h.get('x-forwarded-proto') ?? defaultProto)
    .split(',')[0]
    .trim()
  if (!host || !HOST_PATTERN.test(host)) {
    return undefined
  }
  const scheme = proto === 'http' ? 'http' : 'https'
  return `${scheme}://${host}`
}

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
  return (
    originFromHeaders(await headers(), 'https') ??
    'https://localhost:3000'
  )
}

// Public origin for absolute redirects inside route handlers — same
// precedence as getSiteUrl, but reads the request's own headers so it
// works without a Next request scope. request.url is only the last
// resort: inside the container it carries the listen origin
// (http://0.0.0.0:3000), never the public host.
export function getRequestSiteUrl(request: Request): string {
  const env = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL
  if (env) {
    return env.replace(/\/+$/, '')
  }
  const fallback = new URL(request.url)
  return (
    originFromHeaders(
      request.headers,
      fallback.protocol.replace(/:$/, ''),
    ) ?? fallback.origin
  )
}
