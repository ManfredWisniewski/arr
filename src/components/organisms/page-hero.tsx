import React from 'react'

import type { Media, Page } from '@/payload-types'
import { cx } from '@/lib/cx'
import { mediaUrl } from '@/lib/media'

import { Img } from '../atoms/image'
import { Heading, Lead } from '../atoms/text'

// Landing hero — .page-hero* hooks are styled by the pushed theme CSS
// (biti tokens/shell.css contract). With hero media (first upload node
// in the body) it renders as a full-bleed band capped at 35vh
// (.page-hero--media, Figma Hero Biti-WIT): cover image + tint/scrim,
// message block with the open-frame corner accent bottom-left
// (public/open-frame.svg, the Figma "Open frame" asset).
export const PageHero = ({
  media,
  page,
}: {
  media?: Media | null
  page: Page
}) => {
  const src = mediaUrl(media, 'hero', 1920)
  return (
    <header className={cx('page-hero', src && 'page-hero--media')}>
      {src ? (
        <div className="page-hero-media">
          <Img alt={media?.alt ?? ''} loading="eager" src={src} />
        </div>
      ) : null}
      <div className="page-hero-message">
        <Img
          alt=""
          aria-hidden="true"
          className="page-hero-frame"
          loading="eager"
          src="/open-frame.svg"
        />
        <Heading className="page-hero-title" level={1}>
          {page.title}
        </Heading>
        {page.meta?.description ? (
          <Lead className="page-hero-lead">{page.meta.description}</Lead>
        ) : null}
      </div>
    </header>
  )
}
