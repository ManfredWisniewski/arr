import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

// Resolves the request locale from the middleware-set header (or an
// explicit `locale` override on getTranslations & friends); unknown or
// missing values fall back to the default locale.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
