import React from 'react'

import type { Page } from '@/payload-types'

import type { TemplateProps } from './default'
import { JourneyScene } from '../organisms/journey-scene'

type LexicalNode = NonNullable<Page['content']>['root']['children'][number]

// Scroll-driven parallax page: the Lexical body splits at every h2 —
// each section becomes one .journey-stage (a career/history point),
// presented over the pinned .journey-scene backdrop while scrolling.
// The sticky scene, per-stage progress and card timing are pure
// shell.css mechanics driven by --jp / --i / --journey-stages.
export const JourneyTemplate = ({ page, renderBody }: TemplateProps) => {
  const nodes = page.content?.root?.children ?? []
  const stages: LexicalNode[][] = []
  let current: LexicalNode[] = []
  for (const node of nodes) {
    if (
      node.type === 'heading' &&
      'tag' in node &&
      node.tag === 'h2' &&
      current.length
    ) {
      stages.push(current)
      current = []
    }
    current.push(node)
  }
  if (current.length) {
    stages.push(current)
  }

  const root = page.content?.root
  const stageBody = (children: LexicalNode[]) =>
    root ? { ...page.content, root: { ...root, children } } : page.content

  return (
    <article
      className="journey"
      data-template="journey"
      style={{ '--journey-stages': stages.length } as React.CSSProperties}
    >
      <JourneyScene />
      <div className="journey-track">
        {stages.map((children, i) => (
          <section
            className="journey-stage"
            key={i}
            style={{ '--i': i } as React.CSSProperties}
          >
            <div className="journey-card">{renderBody(stageBody(children))}</div>
          </section>
        ))}
      </div>
    </article>
  )
}
