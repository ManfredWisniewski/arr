import React from 'react'

import { Link as IntlLink } from '@/i18n/navigation'

// Internal paths go through the locale-aware link (client navigation,
// /de|/en prefix added automatically); external URLs get a plain <a>
// opening in a new tab.
export const Link = ({
  children,
  className,
  href,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  if (/^https?:\/\//.test(href)) {
    return (
      <a
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <IntlLink className={className} href={href} {...rest}>
      {children}
    </IntlLink>
  )
}
