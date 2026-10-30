import React from 'react'

import { asSlideOptions } from '@/lib/slides'

import { SlideDeck } from '@/components/organisms/slide-deck'

import type { TemplateProps } from './default'

// Renders a HedgeDoc slide document (front matter `type: slide`) as an
// embedded reveal.js deck; `markdownRaw` holds the slide body, the
// `slideOptions` field carries the deck config.
export const SlideTemplate = ({ page }: TemplateProps) => (
  <article className="page" data-template="slide">
    <SlideDeck
      markdown={page.markdownRaw ?? ''}
      options={asSlideOptions(page.slideOptions)}
    />
  </article>
)
