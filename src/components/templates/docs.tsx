import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { Breadcrumb } from '../molecules/breadcrumb'
import { mapNavItems, type NavItem } from '../molecules/nav-item'
import { Pagination } from '../molecules/pagination'
import { Tabs } from '../molecules/tabs'
import { TextBlock } from '../molecules/text-block'
import { Sidebar } from '../organisms/sidebar'
import type { TemplateProps } from './default'

async function getNavigation(): Promise<NavItem[]> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      limit: 1,
      where: { name: { equals: 'navigation' } },
    })
    return mapNavItems(
      (docs[0]?.data as { items?: unknown } | undefined)?.items,
    )
  } catch {
    return []
  }
}

// Docs layout — Breadcrumb from the page path + sidebar nav (from the
// `navigation` structure) beside the markdown body, with tabbed
// sections and bottom pagination. Demo template.
export const DocsTemplate = async ({ page, renderBody }: TemplateProps) => {
  const navItems = await getNavigation()
  const segments = (page.path ?? '').split('/').filter(Boolean)
  const crumbs = [
    { label: 'Start', path: '/' },
    ...segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: `/${segments.slice(0, index + 1).join('/')}`,
    })),
  ]
  return (
    <article className="page" data-template="docs">
      <Breadcrumb items={crumbs} />
      <div className="layout-sidebar">
        <Sidebar
          sections={[{ items: navItems, title: 'Dokumentation' }]}
        />
        <div>
          <TextBlock
            lead={page.meta?.description ?? undefined}
            title={page.title}
          />
          <Tabs
            items={[
              {
                content: (
                  <div className="page-body">{renderBody(page.content)}</div>
                ),
                label: 'Inhalt',
              },
              {
                content: (
                  <p>
                    Hinweise-Tab — ergänzende Informationen zum gleichen
                    Dokument ohne eigenen Seitenwechsel.
                  </p>
                ),
                icon: 'info',
                label: 'Hinweise',
              },
            ]}
          />
          <Pagination
            current={segments.length}
            hrefFor={(index) => `/${segments.slice(0, index).join('/') || ''}`}
            total={segments.length + 1}
          />
        </div>
      </div>
    </article>
  )
}
