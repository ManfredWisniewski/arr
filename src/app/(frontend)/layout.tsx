import { draftMode } from 'next/headers'
import Script from 'next/script'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Theme } from '@/payload-types'
import config from '@/payload.config'

import { mapNavItems, type NavItem } from '@/components/molecules/nav-item'
import {
  type FooterData,
  SiteFooter,
} from '@/components/organisms/site-footer'
import { SiteHeader } from '@/components/organisms/site-header'

import './styles.css'
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
): Promise<unknown> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      draft,
      limit: 1,
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

async function getNavigation(draft: boolean): Promise<NavItem[]> {
  const data = (await getStructure('navigation', draft)) as
    | { items?: unknown }
    | undefined
  return mapNavItems(data?.items)
}

async function getFooter(draft: boolean): Promise<FooterData | null> {
  const data = (await getStructure('footer', draft)) as
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

export async function generateMetadata() {
  const theme = await getTheme()
  return {
    title: theme?.meta?.siteName ?? 'witconsult',
  }
}

// Applies the stored theme preference before first paint (no flash) —
// counterpart to the ThemeToggle atom; key per design-tokens spec.
const THEME_INIT = `(function(){try{var v=localStorage.getItem('theme-variant');if(v){document.documentElement.dataset.variant=v}var t=localStorage.getItem('arr.theme')||'light';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.dataset.theme='dark'}}catch(e){}})()`

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { isEnabled } = await draftMode()
  const [theme, navItems, footer] = await Promise.all([
    getTheme(),
    getNavigation(isEnabled),
    getFooter(isEnabled),
  ])
  const siteName = theme?.meta?.siteName ?? 'witconsult'
  // dev-only theme variants (empty in production / without biti build)
  const variants = getThemeVariants()

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
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
        <SiteHeader
          logo={theme?.logo as Media | null | undefined}
          navItems={navItems}
          siteName={siteName}
        />
        <main>{children}</main>
        <SiteFooter footer={footer} navItems={navItems} />
        {variants.length ? (
          <ThemeSwitcher variants={variants.map((v) => v.name)} />
        ) : null}
      </body>
    </html>
  )
}
