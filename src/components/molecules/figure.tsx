import React from 'react'

import type { Media } from '@/payload-types'
import { mediaUrl } from '@/lib/media'

import { Img } from '../atoms/image'

// figure/img/figcaption — used by the lexical upload converter.
export const Figure = ({ media }: { media: Media }) => {
  const src = mediaUrl(media, 'content', 960)
  if (!src) {
    return null
  }
  return (
    <figure>
      <Img alt={media.alt} src={src} />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  )
}
