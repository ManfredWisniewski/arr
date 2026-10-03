import { draftMode } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Theme } from '@/payload-types'
import config from '@/payload.config'
import './styles.css'

async function getTheme(): Promise<null | Theme> {
  try {
    const payload = await getPayload({ config: await config })
    return await payload.findGlobal({ slug: 'theme' })
  } catch {
    // render unstyled rather than fail (e.g. before migrations ran)
    return null
  }
}

type NavItem = { label: string; path?: string; children: NavItem[] }

// `structures` doc "navigation" — { items: [{ label, path, children? }] }
// from <site>/structure/navigation.yml. Draft-aware like the page renderer.
function mapNavItems(items: unknown): NavItem[] {
  if (!Array.isArray(items)) {
    return []
  }
  return items
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null,
    )
    .map((item) => ({
      label: typeof item.label === 'string' ? item.label : '',
      path: typeof item.path === 'string' ? item.path : undefined,
      children: mapNavItems(item.children),
    }))
    .filter((item) => item.label && (item.path || item.children.length > 0))
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

function NavEntry({ item }: { item: NavItem }) {
  return (
    <li>
      {item.path ? <Link href={item.path}>{item.label}</Link> : item.label}
      {item.children.length > 0 ? (
        <ul>
          {item.children.map((child) => (
            <NavEntry key={child.label} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export async function generateMetadata() {
  const theme = await getTheme()
  return {
    title: theme?.meta?.siteName ?? 'witconsult',
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { isEnabled } = await draftMode()
  const [theme, navItems] = await Promise.all([
    getTheme(),
    getNavigation(isEnabled),
  ])
  const siteName = theme?.meta?.siteName ?? 'witconsult'

  return (
    <html lang="de">
      <head>
        {theme?.favicon && typeof theme.favicon === 'object'
          ? <link href={(theme.favicon as Media).url ?? ''} rel="icon" />
          : null}
        {theme?.cssLight ? (
          <style dangerouslySetInnerHTML={{ __html: theme.cssLight }} />
        ) : null}
        {theme?.cssDark ? (
          <style dangerouslySetInnerHTML={{ __html: theme.cssDark }} />
        ) : null}
      </head>
      <body>
        <header className="site-header">
          <Link className="site-name" href="/">
            {theme?.logo && typeof theme.logo === 'object' && theme.logo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={(theme.logo as Media).alt || siteName}
                className="site-logo"
                src={(theme.logo as Media).url ?? ''}
              />
            ) : (
              siteName
            )}
          </Link>
          {navItems.length ? (
            <nav className="site-nav">
              <ul>
                {navItems.map((item) => (
                  <NavEntry key={item.label} item={item} />
                ))}
              </ul>
            </nav>
          ) : null}
        </header>
        <main>{children}</main>
        <footer className="site-footer">{siteName}</footer>
      </body>
    </html>
  )
}
