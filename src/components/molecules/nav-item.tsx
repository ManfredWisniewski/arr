import React from 'react'

import { cx } from '@/lib/cx'

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

function NavItemCell({
  className,
  item,
}: {
  className?: string
  item: NavItem
}) {
  return (
    <div className={cx('nav-item', className)}>
      {item.path ? <Link href={item.path}>{item.label}</Link> : item.label}
      {item.children.length > 0 ? <NavCaret label={item.label} /> : null}
    </div>
  )
}

// shell.css navbar contract (biti +intent/components/navbar_prompt.md):
// li > .nav-item cell; a nested ul opens as the full-width submenu band
// anchored to .navbar. The band's first child is a .band-spacer li whose
// .band-ghosts invisibly replicates the bar up to but not including the
// parent item; .band-anchor then sizes to an invisible clone of the
// parent while the first band cell overlays it — same left edge, same
// width. Only top-level bands get ghosts; nested bands render plain.
function NavBand({
  ghosts,
  items,
  parent,
  parentEdge,
}: {
  ghosts?: React.ReactNode
  items: NavItem[]
  parent?: NavItem
  parentEdge?: boolean
}) {
  const [first, ...rest] = items
  if (!first) return null
  return (
    <ul>
      {ghosts ? (
        <li className="band-spacer">
          <div aria-hidden="true" className="band-ghosts">
            {ghosts}
          </div>
          <div className="band-anchor">
            <div aria-hidden="true" className="band-ghosts">
              {parent ? (
                <NavItemCell
                  className={parentEdge ? 'nav-item--edge' : undefined}
                  item={parent}
                />
              ) : null}
            </div>
            <NavItemCell item={first} />
          </div>
          {first.children.length > 0 ? (
            <NavBand items={first.children} />
          ) : null}
        </li>
      ) : (
        <NavItemEntry item={first} />
      )}
      {rest.map((child) => (
        <NavItemEntry item={child} key={child.label} />
      ))}
    </ul>
  )
}

function NavItemEntry({
  ghosts,
  item,
  parentEdge,
}: {
  ghosts?: React.ReactNode
  item: NavItem
  parentEdge?: boolean
}) {
  return (
    <li>
      <NavItemCell item={item} />
      {item.children.length > 0 ? (
        <NavBand
          ghosts={ghosts}
          items={item.children}
          parent={item}
          parentEdge={parentEdge}
        />
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
      {items.map((item, i) => (
        <NavItemEntry
          ghosts={
            <>
              <span className="nav-brand nav-brand--spacer">{brand}</span>
              {items.slice(0, i).map((ghost, j) => (
                <NavItemCell
                  className={j === 0 ? 'nav-item--edge' : undefined}
                  item={ghost}
                  key={ghost.label}
                />
              ))}
            </>
          }
          item={item}
          key={item.label}
          parentEdge={i === 0}
        />
      ))}
    </ul>
  )
}
