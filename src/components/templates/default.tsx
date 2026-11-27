import React from 'react'

import type { Page } from '@/payload-types'

export type TemplateProps = {
  page: Page
  // renders the Lexical content (upload/figure converters applied)
  renderBody: (data: Page['content']) => React.ReactNode
  // raw query params — templates with filters (jobs-list) read these
  searchParams?: Record<string, string | string[] | undefined>
}

// Default article render — semantic classes only, styled by the pushed
// theme CSS (biti tokens/shell.css contract).
export const DefaultTemplate = ({ page, renderBody }: TemplateProps) => (
  <article className="page" data-template={page.template || 'default'}>
    {renderBody(page.content)}
  </article>
)
