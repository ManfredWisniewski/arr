import React from 'react'

import type { Media } from '@/payload-types'
import { mediaUrl } from '@/lib/media'

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
  // Non-interactive brand copy for the submenu-band ghosts — same width as
  // .nav-brand so the band spacer can replicate the bar up to the parent
  // item and align the first band cell to its left edge and width.
  const spacerBrand = (
    <span className="site-name">
      {logo && typeof logo === 'object' && mediaUrl(logo, 'logo', 256) ? (
        <Img
          alt=""
          className="site-logo"
          loading="eager"
          src={mediaUrl(logo, 'logo', 256)}
        />
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
      {/* Marks open nav bands .is-wrapped when their items wrap onto
          extra rows so the ghost offset can be switched off (shell.css
          .band-ghosts). Sticky per open — resize re-evaluates. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function () {
  var pending = false
  function refresh() {
    pending = false
    var uls = document.querySelectorAll('.site-nav li > ul')
    for (var i = 0; i < uls.length; i++) {
      var ul = uls[i]
      if (!ul.offsetHeight) continue
      var kids = ul.children
      var wrapped = false
      for (var j = 1; j < kids.length; j++) {
        if (kids[j].offsetTop !== kids[0].offsetTop) {
          wrapped = true
          break
        }
      }
      if (wrapped) ul.classList.add('is-wrapped')
    }
  }
  function schedule() {
    if (!pending) {
      pending = true
      requestAnimationFrame(refresh)
    }
  }
  document.addEventListener('mouseover', function (e) {
    var t = e.target
    if (t && t.closest && t.closest('.site-nav')) schedule()
  })
  document.addEventListener('focusin', schedule)
  addEventListener('resize', function () {
    document
      .querySelectorAll('.site-nav li > ul.is-wrapped')
      .forEach(function (ul) {
        ul.classList.remove('is-wrapped')
      })
    schedule()
  })
})()`,
        }}
      />
    </header>
  )
}
