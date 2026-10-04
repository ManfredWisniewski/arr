import React from 'react'

import type { Media } from '@/payload-types'

import { Img } from '../atoms/image'

// figure/img/figcaption — used by the lexical upload converter.
export const Figure = ({ media }: { media: Media }) => {
  if (!media.url) {
    return null
  }
  return (
    <figure>
      <Img alt={media.alt} src={media.url} />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  )
}
