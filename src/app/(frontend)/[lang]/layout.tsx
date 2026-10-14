import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Theme } from '@/payload-types'
import config from '@/payload.config'
import { routing, type Locale } from '@/i18n/routing'

import { mapNavItems, type NavItem } from '@/components/molecules/nav-item'
import { SiteFooter } from '@/components/organisms/site-footer'
import { SiteHeader } from '@/components/organisms/site-header'

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

async function getNavigation(
  draft: boolean,
  locale: Locale,
): Promise<NavItem[]> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      draft,
      // public reads never fall back (D11); draft previews show `de`
      // for labels not yet translated
      fallbackLocale: draft ? 'de' : false,
      limit: 1,
      locale,
      where: {
        name: { equals: 'navigation' },
        ...(draft ? {} : { _status: { equals: 'published' } }),
      },
    })
    return mapNavItems(
      (docs[0]?.data as { items?: unknown } | undefined)?.items,
    )
  } catch {
    return []
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
const THEME_INIT = `(function(){try{var v=localStorage.getItem('theme-variant');if(v){document.documentElement.dataset.variant=v}var t=localStorage.getItem('arr.theme')||'system';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.dataset.theme='dark'}}catch(e){}})()`

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
  const { isEnabled } = await draftMode()
  const [theme, navItems, messages] = await Promise.all([
    getTheme(),
    getNavigation(isEnabled, lang),
    getMessages({ locale: lang }),
  ])
  const siteName = theme?.meta?.siteName ?? 'witconsult'
  // dev-only theme variants (empty in production / without biti build)
  const variants = getThemeVariants()

  return (
    <html lang={lang}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {theme?.favicon && typeof theme.favicon === 'object'
          ? <link href={(theme.favicon as Media).url ?? ''} rel="icon" />
          : null}
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
          <SiteFooter navItems={navItems} />
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
