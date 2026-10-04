import React from 'react'

import { Link } from '../atoms/link'

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

function NavItemEntry({ item }: { item: NavItem }) {
  return (
    <li>
      {item.path ? <Link href={item.path}>{item.label}</Link> : item.label}
      {item.children.length > 0 ? (
        <ul>
          {item.children.map((child) => (
            <NavItemEntry key={child.label} item={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul>
      {items.map((item) => (
        <NavItemEntry key={item.label} item={item} />
      ))}
    </ul>
  )
}
