import NextLink from 'next/link'
import React from 'react'

// Internal paths go through next/link (client navigation); external URLs
// get a plain <a> opening in a new tab.
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
    <NextLink className={className} href={href} {...rest}>
      {children}
    </NextLink>
  )
}
