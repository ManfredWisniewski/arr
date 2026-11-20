import { useTranslations } from 'next-intl'
import React from 'react'

import { Link } from '../atoms/link'
import { ConsentSettingsButton } from '../molecules/consent-settings-button'
import { NavList, type NavItem } from '../molecules/nav-item'

// `structures` doc "footer" — { links: [{ label, path }], copyright }
// from <site>/+structure/footer.yml.
export type FooterData = {
  copyright?: string
  links: NavItem[]
}

// Site footer — the full navigation tree as a plain expanded list
// (group labels render as text, no hover needed), plus a legal row
// below (Figma Footer-Nav, Biti-WIT 20072:2562). Legal links and
// copyright come from the `footer` structure doc; the row is omitted
// when it is absent and no consent opt-out is needed.
export const SiteFooter = ({
  consentSettings = false,
  footer,
  navItems,
}: {
  // renders the "Cookie-Einstellungen" withdrawal entry even when the
  // footer structure doc is absent — the opt-out path must exist
  // whenever the consent banner can appear (D12)
  consentSettings?: boolean
  footer?: FooterData | null
  navItems: NavItem[]
}) => {
  const t = useTranslations('nav')
  return (
    <footer className="site-footer">
      {navItems.length ? (
        <nav aria-label={t('footer')} className="site-footer-nav">
          <NavList items={navItems} />
        </nav>
      ) : null}
      {(footer && (footer.links.length > 0 || footer.copyright)) ||
      consentSettings ? (
        <div className="site-footer-legal">
          {(footer?.links.length ?? 0) > 0 || consentSettings ? (
            <nav
              aria-label={t('legal')}
              className="site-footer-legal-links"
            >
              {(footer?.links ?? []).map((link, i) => (
                <React.Fragment key={link.label}>
                  {i > 0 ? ' | ' : null}
                  {link.path ? (
                    <Link href={link.path}>{link.label}</Link>
                  ) : (
                    link.label
                  )}
                </React.Fragment>
              ))}
              {consentSettings ? (
                <React.Fragment>
                  {(footer?.links.length ?? 0) > 0 ? ' | ' : null}
                  <ConsentSettingsButton />
                </React.Fragment>
              ) : null}
            </nav>
          ) : null}
          {footer?.copyright ? (
            <p className="site-footer-copy">{footer.copyright}</p>
          ) : null}
        </div>
      ) : null}
    </footer>
  )
}
