import { useTranslations } from 'next-intl'
import React from 'react'

import type { NavItem } from '../molecules/nav-item'
import { NavList } from '../molecules/nav-item'

// Site footer — the full navigation tree as a plain expanded list
// (group labels render as text, no hover needed).
export const SiteFooter = ({ navItems }: { navItems: NavItem[] }) => {
  const t = useTranslations('nav')
  return (
    <footer className="site-footer">
      {navItems.length ? (
        <nav aria-label={t('footer')} className="site-footer-nav">
          <NavList items={navItems} />
        </nav>
      ) : null}
    </footer>
  )
}

