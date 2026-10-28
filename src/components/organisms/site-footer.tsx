import React from 'react'

import { Link } from '../atoms/link'
import type { NavItem } from '../molecules/nav-item'

// `structures` doc "footer" — { links: [{ label, path }], copyright }
// from <site>/+structure/footer.yml.
export type FooterData = {
  copyright?: string
  links: NavItem[]
}

// Site footer — top-level nav items as centered link columns (label =
// heading, children = links), plus a legal row below (Figma Footer-Nav,
// Biti-WIT 20072:2562). Legal links and copyright come from the
// `footer` structure doc; the row is omitted when it is absent.
export const SiteFooter = ({
  footer,
  navItems,
}: {
  footer?: FooterData | null
  navItems: NavItem[]
}) => (
  <footer className="site-footer">
    {navItems.length ? (
      <nav aria-label="Footer" className="site-footer-nav">
        {navItems.map((item) => (
          <div className="site-footer-group" key={item.label}>
            <p className="site-footer-heading">
              {item.path ? (
                <Link href={item.path}>{item.label}</Link>
              ) : (
                item.label
              )}
            </p>
            {item.children.length ? (
              <ul className="site-footer-links">
                {item.children.map((child) => (
                  <li key={child.label}>
                    {child.path ? (
                      <Link href={child.path}>{child.label}</Link>
                    ) : (
                      child.label
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </nav>
    ) : null}
    {footer && (footer.links.length > 0 || footer.copyright) ? (
      <div className="site-footer-legal">
        {footer.links.length ? (
          <nav aria-label="Legal" className="site-footer-legal-links">
            {footer.links.map((link, i) => (
              <React.Fragment key={link.label}>
                {i > 0 ? ' | ' : null}
                {link.path ? (
                  <Link href={link.path}>{link.label}</Link>
                ) : (
                  link.label
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : null}
        {footer.copyright ? (
          <p className="site-footer-copy">{footer.copyright}</p>
        ) : null}
      </div>
    ) : null}
  </footer>
)
