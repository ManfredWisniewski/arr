import type {
  DefaultNodeTypes,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import type { Media } from '@/payload-types'

// Upload nodes hold the populated media document when depth > 0 (default).
const upload = ({ node }: { node: SerializedUploadNode }) => {
  const media = node.value as Media | number | undefined
  if (!media || typeof media !== 'object' || !media.url) {
    return null
  }
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={media.alt} src={media.url} />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  )
}

export const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  upload,
})
