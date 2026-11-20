import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Script from 'next/script'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Theme } from '@/payload-types'
import config from '@/payload.config'
import { routing, type Locale } from '@/i18n/routing'

import { ConsentManager } from '@/components/organisms/consent-manager'
import { mapNavItems, type NavItem } from '@/components/molecules/nav-item'
import {
  type FooterData,
  SiteFooter,
} from '@/components/organisms/site-footer'
import { SiteHeader } from '@/components/organisms/site-header'
import { ANALYTICS_CATEGORY, hasConsent } from '@/lib/consent'
import { getRequestDraft } from '@/lib/review'

import 'vanilla-cookieconsent/dist/cookieconsent.css'
import '../consent.css'
import './styles.css'
import { ChatWidget } from './chat-widget'
import { ThemeSwitcher } from './theme-switcher'
import { getThemeVariants } from './theme-variants'

async function getTheme(): Promise<null | Theme> {
  try {
    const payload = await getPayload({ config: await config })
    return await payload.findGlobal({ slug: 'theme' })
  } catch {
    // render unstyled rather than fail (e.g. before migrations ran)
    return null
  }
}

async function getStructure(
  name: string,
  draft: boolean,
  locale: Locale,
): Promise<unknown> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      draft,
      // public reads never fall back (D16); draft previews show `de`
      // for labels not yet translated
      fallbackLocale: draft ? 'de' : false,
      limit: 1,
      locale,
      where: {
        name: { equals: name },
        ...(draft ? {} : { _status: { equals: 'published' } }),
      },
    })
    return docs[0]?.data
  } catch {
    return undefined
  }
}

async function getNavigation(
  draft: boolean,
  locale: Locale,
): Promise<NavItem[]> {
  const data = (await getStructure('navigation', draft, locale)) as
    | { items?: unknown }
    | undefined
  return mapNavItems(data?.items)
}

async function getFooter(
  draft: boolean,
  locale: Locale,
): Promise<FooterData | null> {
  const data = (await getStructure('footer', draft, locale)) as
    | { copyright?: unknown; links?: unknown }
    | undefined
  if (!data) {
    return null
  }
  return {
    copyright:
      typeof data.copyright === 'string' ? data.copyright : undefined,
    links: mapNavItems(data.links),
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const theme = await getTheme()
  return {
    title: theme?.meta?.siteName ?? 'witconsult',
    ...(hasLocale(routing.locales, lang)
      ? {
          openGraph: { locale: lang === 'de' ? 'de_DE' : 'en_GB' },
        }
      : {}),
  }
}

// Applies the stored theme preference before first paint (no flash) —
// counterpart to the ThemeToggle atom; key per design-tokens spec.
const THEME_INIT = `(function(){try{var v=localStorage.getItem('theme-variant');if(v){document.documentElement.dataset.variant=v}var t=localStorage.getItem('arr.theme')||'light';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.dataset.theme='dark'}}catch(e){}})()`

export default async function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { children, params } = props
  const { lang } = await params
  // the [lang] segment is the only locale source — anything else is a 404
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }
  const draft = await getRequestDraft()
  const [theme, navItems, footer, messages] = await Promise.all([
    getTheme(),
    getNavigation(draft, lang),
    getFooter(draft, lang),
    getMessages({ locale: lang }),
  ])
  const siteName = theme?.meta?.siteName ?? 'witconsult'
  // gtag.js targets (GA4 G-…, Google Tag GT-…, Ads AW-…, Floodlight
  // DC-…) — the stored value reaches a <script src>, so validate before
  // emitting rather than trusting the synced field verbatim
  const gaId =
    typeof theme?.tracking?.google === 'string' &&
    /^(G|GT|AW|DC)-[A-Z0-9]+$/i.test(theme.tracking.google)
      ? theme.tracking.google
      : undefined
  // D12 hard gate: gtag is emitted only when the visitor's consent
  // cookie already grants `analytics`; first accept injects the tag
  // live via ConsentManager, withdrawal reloads
  const analyticsConsented = gaId
    ? await hasConsent(ANALYTICS_CATEGORY)
    : false
  const privacyPath = theme?.consent?.privacyPath ?? '/datenschutz'
  // dev-only theme variants (empty in production / without biti build)
  const variants = getThemeVariants()

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        {theme?.favicon && typeof theme.favicon === 'object'
          ? <link href={(theme.favicon as Media).url ?? ''} rel="icon" />
          : null}
        {gaId && analyticsConsented ? (
          <>
            <Script
              id="gtag-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}')`}
            </Script>
          </>
        ) : null}
        {theme?.cssLight ? (
          <style dangerouslySetInnerHTML={{ __html: theme.cssLight }} />
        ) : null}
        {theme?.cssDark ? (
          <style dangerouslySetInnerHTML={{ __html: theme.cssDark }} />
        ) : null}
        {variants.map((variant) => (
          <style
            dangerouslySetInnerHTML={{ __html: variant.css }}
            key={variant.name}
          />
        ))}
      </head>
      <body>
        <NextIntlClientProvider locale={lang} messages={messages}>
          <SiteHeader
            logo={theme?.logo as Media | null | undefined}
            navItems={navItems}
            siteName={siteName}
          />
          <main>{children}</main>
          <SiteFooter
            consentSettings={Boolean(gaId)}
            footer={footer}
            navItems={navItems}
          />
          {gaId ? (
            <ConsentManager gaId={gaId} privacyPath={privacyPath} />
          ) : null}
          {process.env.CHAT_WEBHOOK_URL ? (
            <ChatWidget
              disclosure={
                process.env.CHAT_DISCLOSURE ??
                'Ich bin ein KI-Assistent. Ich arbeite mit einem Sprachmodell, kann Fehler machen und habe keine eigene Entscheidungsbefugnis.'
              }
              greeting={process.env.CHAT_GREETING}
              title={process.env.CHAT_TITLE ?? 'Assistent'}
            />
          ) : null}
          {variants.length ? (
            <ThemeSwitcher variants={variants.map((v) => v.name)} />
          ) : null}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
