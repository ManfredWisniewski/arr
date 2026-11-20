import { defineRouting } from 'next-intl/routing'

// D09: both locales carry an explicit /de|/en prefix; the default locale
// never collapses to root. Middleware (src/middleware.ts) applies this to
// every frontend request and resolves `/` to /de.
export const routing = defineRouting({
  defaultLocale: 'de',
  localePrefix: 'always',
  locales: ['de', 'en'],
})

export type Locale = (typeof routing.locales)[number]
