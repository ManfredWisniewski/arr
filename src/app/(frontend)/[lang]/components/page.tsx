import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import type { Media } from '@/payload-types'
import config from '@/payload.config'

import { Heading, Lead } from '@/components/atoms'
import { ComponentShowcase } from '@/components/component-showcase'

// Dev-only component showcase — every atom/molecule/organism rendered with
// fixture props under the pushed theme. Static segment wins over the
// [[...path]] catch-all; a content page at /components would be shadowed.
// The `showcase` template renders the same gallery as a real page.
export default async function ComponentsPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  // reuse the theme logo as media fixture for Figure/Img
  let media: Media | null = null
  try {
    const payload = await getPayload({ config: await config })
    const theme = await payload.findGlobal({ slug: 'theme' })
    if (theme?.logo && typeof theme.logo === 'object') {
      media = theme.logo as Media
    }
  } catch {
    media = null
  }

  return (
    <article className="page">
      <Heading level={1}>Component showcase</Heading>
      <Lead>
        Every atom, molecule and organism under the currently pushed theme —
        use the theme widgets to check variants.
      </Lead>
      <ComponentShowcase media={media} />
    </article>
  )
}
