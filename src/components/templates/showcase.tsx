import { getPayload } from 'payload'
import React from 'react'

import type { Media } from '@/payload-types'
import config from '@/payload.config'

import { Heading } from '../atoms/text'
import { ComponentShowcase } from '../component-showcase'
import type { TemplateProps } from './default'

// Component gallery template — renders every atom/molecule/organism with
// fixture props (theme logo doubles as media fixture). Demo template.
export const ShowcaseTemplate = async ({ page }: TemplateProps) => {
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
    <article className="page" data-template="showcase">
      <Heading level={1}>{page.title}</Heading>
      <ComponentShowcase media={media} />
    </article>
  )
}
