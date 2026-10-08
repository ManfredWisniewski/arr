import React from 'react'

import { Link } from '../atoms/link'
import { NavCaret } from './nav-caret'

export type NavItem = { label: string; path?: string; children: NavItem[] }

// `structures` doc "navigation" — { items: [{ label, path, children? }] }
// from <site>/+structure/navigation.yml. Draft-aware like the page renderer.
export function mapNavItems(items: unknown): NavItem[] {
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

// shell.css navbar contract (biti +intent/components/navbar_prompt.md):
// li > .nav-item cell; a nested ul opens as the full-width submenu band
// anchored to .navbar. First band child is a .nav-brand--spacer aligning
// the band items under .site-nav.
function NavItemEntry({
  brand,
  item,
}: {
  brand?: React.ReactNode
  item: NavItem
}) {
  return (
    <li>
      <div className="nav-item">
        {item.path ? <Link href={item.path}>{item.label}</Link> : item.label}
        {item.children.length > 0 ? <NavCaret label={item.label} /> : null}
      </div>
      {item.children.length > 0 ? (
        <ul>
          {brand ? (
            <li aria-hidden="true" className="nav-brand nav-brand--spacer">
              {brand}
            </li>
          ) : null}
          {item.children.map((child) => (
            <NavItemEntry key={child.label} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

// Mobile variant — plain nested list; .site-nav-toggle styles it.
function NavItemEntryPlain({ item }: { item: NavItem }) {
  return (
    <li>
      {item.path ? <Link href={item.path}>{item.label}</Link> : item.label}
      {item.children.length > 0 ? (
        <ul>
          {item.children.map((child) => (
            <NavItemEntryPlain key={child.label} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function NavList({
  brand,
  items,
  primary,
}: {
  brand?: React.ReactNode
  items: NavItem[]
  primary?: boolean
}) {
  if (!primary) {
    return (
      <ul>
        {items.map((item) => (
          <NavItemEntryPlain key={item.label} item={item} />
        ))}
      </ul>
    )
  }
  return (
    <ul className="primary-nav">
      {items.map((item) => (
        <NavItemEntry brand={brand} item={item} key={item.label} />
      ))}
    </ul>
  )
}
