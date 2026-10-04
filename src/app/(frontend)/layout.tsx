import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Theme } from '@/payload-types'
import config from '@/payload.config'

import { mapNavItems, type NavItem } from '@/components/molecules/nav-item'
import { SiteFooter } from '@/components/organisms/site-footer'
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

async function getNavigation(draft: boolean): Promise<NavItem[]> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      draft,
      limit: 1,
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

export async function generateMetadata() {
  const theme = await getTheme()
  return {
    title: theme?.meta?.siteName ?? 'witconsult',
  }
}

// Applies the stored theme preference before first paint (no flash) —
// counterpart to the ThemeToggle atom; key per design-tokens spec.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('arr.theme')||'system';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.dataset.theme='dark'}}catch(e){}})()`

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { isEnabled } = await draftMode()
  const [theme, navItems] = await Promise.all([
    getTheme(),
    getNavigation(isEnabled),
  ])
  const siteName = theme?.meta?.siteName ?? 'witconsult'
  // dev-only theme variants (empty in production / without biti build)
  const variants = getThemeVariants()

  return (
    <html lang="de">
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
        <SiteHeader
          logo={theme?.logo as Media | null | undefined}
          navItems={navItems}
          siteName={siteName}
        />
        <main>{children}</main>
        <SiteFooter siteName={siteName} />
        {variants.length ? (
          <ThemeSwitcher variants={variants.map((v) => v.name)} />
        ) : null}
      </body>
    </html>
  )
}
