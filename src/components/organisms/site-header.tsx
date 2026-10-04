import React from 'react'

import type { Media } from '@/payload-types'

import { Icon } from '../atoms/icon'
import { SiteLogo } from '../atoms/site-logo'
import { ThemeToggle } from '../atoms/theme-toggle'
import { NavList, type NavItem } from '../molecules/nav-item'

// Site header: brand mark + navigation. The horizontal nav collapses into
// a <details> menu below the shell.css breakpoint.
export const SiteHeader = ({
  logo,
  navItems,
  siteName,
}: {
  logo?: Media | null | number
  navItems: NavItem[]
  siteName: string
}) => (
  <header className="site-header">
    <SiteLogo logo={logo} siteName={siteName} />
    {navItems.length ? (
      <>
        <nav aria-label="Hauptnavigation" className="site-nav">
          <NavList items={navItems} />
        </nav>
        <details className="site-nav-toggle">
          <summary>
            <Icon name="menu" /> Menü
          </summary>
          <NavList items={navItems} />
        </details>
      </>
    ) : null}
    <ThemeToggle />
  </header>
)
