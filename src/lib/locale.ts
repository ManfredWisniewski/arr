import { routing, type Locale } from '@/i18n/routing'

export type { Locale }

export const locales = routing.locales
export const defaultLocale = routing.defaultLocale

export const isLocale = (value: unknown): value is Locale =>
  routing.locales.includes(value as Locale)

// CMS paths are stored locale-independent; the public URL adds the prefix.
export const localeHref = (locale: Locale, path: string) =>
  `/${locale}${path === '/' ? '' : path}`

// hreflang alternates for a locale-independent path: one absolute URL per
// locale plus x-default pointing at the default locale.
export const localeAlternates = (
  base: string,
  path: string,
): Record<string, string> => ({
  ...Object.fromEntries(
    locales.map((locale) => [locale, `${base}${localeHref(locale, path)}`]),
  ),
  'x-default': `${base}${localeHref(defaultLocale, path)}`,
})
