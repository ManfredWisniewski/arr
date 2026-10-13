import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

// next-intl locale negotiation: sets the x-next-intl-locale request header
// and redirects unprefixed frontend URLs ("/" -> "/de"). Excluded: Payload
// admin/API/draft preview, Next internals and file paths (feeds, sitemap,
// robots.txt resolve their locale from the [lang] route param instead).
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!admin|api|preview|_next|_vercel|.*\\..*).*)'],
}
