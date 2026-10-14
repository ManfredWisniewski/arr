import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import config from '@/payload.config'
import type { Locale } from '@/i18n/routing'

import { Breadcrumb } from '../molecules/breadcrumb'
import { mapNavItems, type NavItem } from '../molecules/nav-item'
import { Pagination } from '../molecules/pagination'
import { Tabs } from '../molecules/tabs'
import { TextBlock } from '../molecules/text-block'
import { Sidebar } from '../organisms/sidebar'
import type { TemplateProps } from './default'

async function getNavigation(locale: Locale): Promise<NavItem[]> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      fallbackLocale: false,
      limit: 1,
      locale,
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
export const DocsTemplate = async ({
  locale,
  page,
  renderBody,
}: TemplateProps) => {
  const [navItems, t] = await Promise.all([
    getNavigation(locale),
    getTranslations({ locale, namespace: 'docs' }),
  ])
  const segments = (page.path ?? '').split('/').filter(Boolean)
  const crumbs = [
    { label: t('home'), path: '/' },
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
          sections={[{ items: navItems, title: t('sidebarTitle') }]}
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
                label: t('contentTab'),
              },
              {
                content: <p>{t('notesBody')}</p>,
                icon: 'info',
                label: t('notesTab'),
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
