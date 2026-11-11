import { cookies } from 'next/headers'

// vanilla-cookieconsent stores the visitor's choices in a first-party
// JSON cookie — the same object the lib writes client-side, readable
// server-side so the SSR pass can decide whether gated scripts may be
// emitted at all (D12 hard gate).
export const CONSENT_COOKIE = 'cc_cookie'
export const ANALYTICS_CATEGORY = 'analytics'

const parseConsent = (raw: string | undefined) => {
  if (!raw) {
    return undefined
  }
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as {
      categories?: unknown
    }
    return Array.isArray(value?.categories)
      ? (value.categories as string[])
      : undefined
  } catch {
    return undefined
  }
}

// True when the consent cookie already grants `category` — treated as
// no-consent on any parse failure (never emit trackers on doubt).
export async function hasConsent(category: string): Promise<boolean> {
  const jar = await cookies()
  return (
    parseConsent(jar.get(CONSENT_COOKIE)?.value)?.includes(category) ??
    false
  )
}
