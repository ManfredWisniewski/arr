import React from 'react'

// Single <img> wrapper for Payload media URLs — lazy by default.
// next/image is deliberately not used (media ships via the Payload API,
// not the build); the eslint-disable lives here once.
export const Img = ({
  alt = '',
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={alt} loading="lazy" {...rest} />
)
