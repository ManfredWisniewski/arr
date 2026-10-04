import React from 'react'

import { Link } from '../atoms/link'

// Site footer — copyright line + optional link list (legal/sitemap).
export const SiteFooter = ({
  links,
  siteName,
  text,
}: {
  links?: { href: string; label: string }[]
  siteName: string
  text?: string
}) => (
  <footer className="site-footer">
    <p className="site-footer-copy">
      {text ?? `© ${new Date().getFullYear()} ${siteName}`}
    </p>
    {links?.length ? (
      <nav aria-label="Fußzeile" className="site-footer-nav">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    ) : null}
  </footer>
)
