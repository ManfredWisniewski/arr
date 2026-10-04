import { createElement } from 'react'
import type React from 'react'

import type { Page } from '@/payload-types'

import { DefaultTemplate, type TemplateProps } from './default'
import { LandingTemplate } from './landing'

// Template name -> renderer. Names come from pages.template (webtext front
// matter); unknown/absent names fall back to the default article render.
// Vendored biti components — keep markup semantic + CSS-var driven so theme
// CSS stays the only site-specific styling.
const registry: Record<string, React.ComponentType<TemplateProps>> = {
  landing: LandingTemplate,
}

export const resolveTemplate = (name?: null | string) =>
  (name && registry[name]) || DefaultTemplate

// Render-time resolution lives here so call sites never assign a component
// type inside render (react-hooks/static-components).
export const renderTemplate = (
  page: Page,
  renderBody: TemplateProps['renderBody'],
) => createElement(resolveTemplate(page.template), { page, renderBody })
