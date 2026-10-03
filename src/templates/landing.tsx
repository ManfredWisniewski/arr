import React from 'react'

import type { TemplateProps } from './default'

// Vendored from biti (src/heros/MediumImpact) — hero header adapted to the
// semantic-markup + CSS-var contract: .page-hero* hooks live in biti's
// tokens/shell.css so the pushed theme CSS styles them.
export const LandingTemplate = ({ page, children }: TemplateProps) => (
  <article className="page page--landing" data-template="landing">
    <header className="page-hero">
      <h1 className="page-hero-title">{page.title}</h1>
      {page.meta?.description ? (
        <p className="page-hero-lead">{page.meta.description}</p>
      ) : null}
    </header>
    <div className="page-body">{children}</div>
  </article>
)
