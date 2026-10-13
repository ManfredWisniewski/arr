import React from 'react'

import type { Media } from '@/payload-types'
import { mediaUrl } from '@/lib/media'

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
    {logo && typeof logo === 'object' && mediaUrl(logo, 'logo', 256) ? (
      <Img
        alt={logo.alt || siteName}
        className="site-logo"
        loading="eager"
        src={mediaUrl(logo, 'logo', 256)}
      />
    ) : (
      siteName
    )}
  </Link>
)
