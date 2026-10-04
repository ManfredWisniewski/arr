import React from 'react'

import type { Media } from '@/payload-types'

import { PageHero } from '../organisms/page-hero'
import type { TemplateProps } from './default'

// Vendored from biti (src/heros/MediumImpact) — hero header adapted to the
// semantic-markup + CSS-var contract: .page-hero* hooks live in biti's
// tokens/shell.css so the pushed theme CSS styles them.
// Convention: the first upload node in the markdown body is the hero media.
export const LandingTemplate = ({ page, renderBody }: TemplateProps) => {
  const nodes = page.content?.root?.children ?? []
  const [first, ...rest] = nodes
  const hero =
    first?.type === 'upload' && typeof first.value === 'object'
      ? (first.value as Media)
      : null
  const body =
    hero && page.content?.root
      ? { ...page.content, root: { ...page.content.root, children: rest } }
      : page.content

  return (
    <article className="page page--landing" data-template="landing">
      <PageHero media={hero} page={page} />
      <div className="page-body">{renderBody(body)}</div>
    </article>
  )
}
