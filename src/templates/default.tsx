import React from 'react'

import type { Page } from '@/payload-types'

export type TemplateProps = {
  page: Page
  children?: React.ReactNode
}

// Default article render — semantic classes only, styled by the pushed
// theme CSS (biti tokens/shell.css contract).
export const DefaultTemplate = ({ page, children }: TemplateProps) => (
  <article className="page" data-template={page.template || 'default'}>
    {children}
  </article>
)
