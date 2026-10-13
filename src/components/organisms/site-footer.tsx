import React from 'react'

import type { NavItem } from '../molecules/nav-item'
import { NavList } from '../molecules/nav-item'

// Site footer — the full navigation tree as a plain expanded list
// (group labels render as text, no hover needed).
export const SiteFooter = ({ navItems }: { navItems: NavItem[] }) => (
  <footer className="site-footer">
    {navItems.length ? (
      <nav aria-label="Footer" className="site-footer-nav">
        <NavList items={navItems} />
      </nav>
    ) : null}
  </footer>
)
