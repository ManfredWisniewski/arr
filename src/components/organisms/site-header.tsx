import React from 'react'

import type { Media } from '@/payload-types'

import { Icon } from '../atoms/icon'
import { Img } from '../atoms/image'
import { SiteLogo } from '../atoms/site-logo'
import { ThemeToggle } from '../atoms/theme-toggle'
import { NavList, type NavItem } from '../molecules/nav-item'

// Site header per the shell.css navbar contract (biti +intent/components/
// navbar_prompt.md): .site-header is the unstyled section wrapper, .navbar
// the bar — nav-brand slot, .site-nav > ul.primary-nav of .nav-item cells,
// .nav-actions flush right. The horizontal nav collapses into the
// <details> .site-nav-toggle below the 48rem breakpoint.
export const SiteHeader = ({
  logo,
  navItems,
  siteName,
}: {
  logo?: Media | null | number
  navItems: NavItem[]
  siteName: string
}) => {
  // Non-interactive brand copy for the submenu-band spacer — same width as
  // .nav-brand so band items align under .site-nav.
  const spacerBrand = (
    <span className="site-name">
      {logo && typeof logo === 'object' && logo.url ? (
        <Img alt="" className="site-logo" loading="eager" src={logo.url} />
      ) : (
        siteName
      )}
    </span>
  )
  return (
    <header className="site-header">
      <nav className="navbar">
        <div className="nav-brand">
          <SiteLogo logo={logo} siteName={siteName} />
        </div>
        {navItems.length ? (
          <nav aria-label="Hauptnavigation" className="site-nav">
            <NavList brand={spacerBrand} items={navItems} primary />
          </nav>
        ) : null}
        <div className="nav-actions">
          {navItems.length ? (
            <details className="site-nav-toggle">
              <summary>
                <Icon name="menu" /> Menü
              </summary>
              <NavList items={navItems} />
            </details>
          ) : null}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
