import React from 'react'

import { cx } from '@/lib/cx'

import { NavList, type NavItem } from '../molecules/nav-item'

export type SidebarSection = {
  items: NavItem[]
  title?: string
}

// Navigation panel — grouped sections with optional headings
// (.sidebar* contract classes). For app shells/docs layouts.
export const Sidebar = ({
  className,
  sections,
}: {
  className?: string
  sections: SidebarSection[]
}) => (
  <aside className={cx('sidebar', className)}>
    {sections.map((section, index) => (
      <div className="sidebar-section" key={section.title ?? index}>
        {section.title ? (
          <p className="sidebar-title">{section.title}</p>
        ) : null}
        <nav className="sidebar-nav">
          <NavList items={section.items} />
        </nav>
      </div>
    ))}
  </aside>
)
