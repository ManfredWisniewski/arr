import React from 'react'

import type { Media } from '@/payload-types'

import { Img } from './image'
import { Link } from './link'

// Brand mark linking home — theme global logo, else the site name.
export const SiteLogo = ({
  logo,
  siteName,
}: {
  logo?: Media | null | number
  siteName: string
}) => (
  <Link className="site-name" href="/">
    {logo && typeof logo === 'object' && logo.url ? (
      <Img
        alt={logo.alt || siteName}
        className="site-logo"
        loading="eager"
        src={logo.url}
      />
    ) : (
      siteName
    )}
  </Link>
)
