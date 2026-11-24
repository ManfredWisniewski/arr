import NextLink from 'next/link'
import React from 'react'

// Link target policy (decision D08): absolute http(s) URLs open in a new
// tab, everything else — relative paths, fragments, other schemes —
// navigates in the same tab via next/link. Requirements:
//
// - an explicit `target` prop overrides the default on either branch
//   (that's how `{target="…"}` markdown attributes land — D09);
// - `target="_blank"` always carries `rel="noopener noreferrer"` —
//   internal links opened in a new tab get the same window.opener
//   protection as external ones — unless a `rel` is passed explicitly.
export const Link = ({
  children,
  className,
  href,
  rel,
  target,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  const target_ = target ?? (/^https?:\/\//.test(href) ? '_blank' : undefined)
  const rel_ = rel ?? (target_ === '_blank' ? 'noopener noreferrer' : undefined)
  const Tag = /^https?:\/\//.test(href) ? 'a' : NextLink
  return (
    <Tag
      className={className}
      href={href}
      rel={rel_}
      target={target_}
      {...rest}
    >
      {children}
    </Tag>
  )
}
