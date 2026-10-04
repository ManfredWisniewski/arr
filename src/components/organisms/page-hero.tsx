import React from 'react'

import type { Media, Page } from '@/payload-types'

import { Img } from '../atoms/image'
import { Heading, Lead } from '../atoms/text'

// Landing hero header + hoisted hero media — .page-hero* hooks are styled
// by the pushed theme CSS (biti tokens/shell.css contract).
export const PageHero = ({
  media,
  page,
}: {
  media?: Media | null
  page: Page
}) => (
  <>
    <header className="page-hero">
      <Heading className="page-hero-title" level={1}>
        {page.title}
      </Heading>
      {page.meta?.description ? (
        <Lead className="page-hero-lead">{page.meta.description}</Lead>
      ) : null}
    </header>
    {media?.url ? (
      <div className="page-hero-media">
        <Img alt={media.alt} loading="eager" src={media.url} />
      </div>
    ) : null}
  </>
)
