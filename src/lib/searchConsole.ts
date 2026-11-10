import { createSign } from 'node:crypto'

// Google Search Console sitemap resubmission — PUT sitemaps.submit with
// a service account that is a user on the Search Console property
// ("Full" permission or higher). The sitemap is already advertised in
// robots.txt and carries <lastmod>, so resubmission only brings Google's
// refetch forward; it never guarantees crawling or indexing. Disabled
// unless all three env vars are set (site-agnostic image, D02):
//   GSC_SITE         property id — 'sc-domain:example.com' or
//                    'https://example.com/' (URL-prefix)
//   GSC_CLIENT_EMAIL service account e-mail
//   GSC_PRIVATE_KEY  its PEM private key ('\n' escaped inside env)

const SCOPE = 'https://www.googleapis.com/auth/webmasters'
const SUBMIT_URL =
  'https://www.googleapis.com/webmasters/v3/sites'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
// Publish batches and sync runs collapse into a single submit.
const RESUBMIT_DELAY_MS = 60_000

const config = () => {
  const site = process.env.GSC_SITE
  const clientEmail = process.env.GSC_CLIENT_EMAIL
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n')
  return site && clientEmail && privateKey
    ? { clientEmail, privateKey, site }
    : undefined
}

const base64url = (value: string) => Buffer.from(value).toString('base64url')

// RFC 7523 service-account flow: self-signed JWT swapped for an access
// token — no google-auth-library needed for a single scope.
async function accessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = [
    base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
    base64url(
      JSON.stringify({
        aud: TOKEN_URL,
        exp: now + 3600,
        iat: now,
        iss: clientEmail,
        scope: SCOPE,
      }),
    ),
  ].join('.')
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  const res = await fetch(TOKEN_URL, {
    body: new URLSearchParams({
      assertion: `${unsigned}.${signer.sign(privateKey, 'base64url')}`,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    }),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(`token endpoint ${res.status}: ${await res.text()}`)
  }
  const { access_token } = (await res.json()) as { access_token?: string }
  if (!access_token) {
    throw new Error('token endpoint returned no access_token')
  }
  return access_token
}

let timer: NodeJS.Timeout | undefined
let pending = ''

async function resubmit() {
  const cfg = config()
  const feedpath = pending
  pending = ''
  if (!cfg || !feedpath) {
    return
  }
  const token = await accessToken(cfg.clientEmail, cfg.privateKey)
  const url = `${SUBMIT_URL}/${encodeURIComponent(cfg.site)}/sitemaps/${encodeURIComponent(feedpath)}`
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    method: 'PUT',
  })
  if (!res.ok) {
    throw new Error(`sitemaps.submit ${res.status}: ${await res.text()}`)
  }
}

// Schedule a debounced, fire-and-forget sitemap resubmission. `base` is
// the public origin of the site (SITE_URL or the request origin); the
// sitemap URL never changes, so only the latest one matters. Failures
// are logged, never propagated — a Google outage must not break writes.
export function scheduleSitemapSubmit(base: string) {
  const origin = base.replace(/\/+$/, '')
  if (!config() || !origin) {
    return
  }
  pending = `${origin}/sitemap.xml`
  clearTimeout(timer)
  timer = setTimeout(() => {
    resubmit().catch((err: unknown) =>
      console.error('[searchConsole] sitemap submit failed:', err),
    )
  }, RESUBMIT_DELAY_MS)
  timer.unref()
}
