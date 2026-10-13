import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import config from '@/payload.config'
import type { Locale } from '@/i18n/routing'

import { TextBlock } from '../molecules/text-block'
import { CardGrid } from '../organisms/card'
import { DashboardWidget } from '../organisms/dashboard-widget'
import { DataTable } from '../organisms/data-table'
import { FilterBar } from '../organisms/filter-bar'
import { NotificationList } from '../organisms/notification-list'
import { Timeline } from '../organisms/timeline'
import type { TemplateProps } from './default'

type DashboardData = {
  notifications?: {
    text?: string
    time?: string
    tone?: 'info' | 'negative' | 'positive' | 'warning'
  }[]
  steps?: {
    description?: string
    status?: 'current' | 'done' | 'upcoming'
    title?: string
  }[]
  table?: {
    columns?: { key?: string; label?: string }[]
    rows?: Record<string, string>[]
  }
  widgets?: { footer?: string; title?: string; value?: string }[]
}

async function getDashboard(locale: Locale): Promise<DashboardData> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      fallbackLocale: false,
      limit: 1,
      locale,
      where: { name: { equals: 'dashboard' } },
    })
    return (docs[0]?.data as DashboardData | undefined) ?? {}
  } catch {
    return {}
  }
}

// App-shell dashboard layout — FilterBar + metric widgets + data
// table + notifications + timeline, all fed by the `dashboard`
// structure doc (+structure/dashboard.yml). Demo template.
export const DashboardTemplate = async ({
  locale,
  page,
  renderBody,
}: TemplateProps) => {
  const [{ notifications = [], steps = [], table, widgets = [] }, t] =
    await Promise.all([
      getDashboard(locale),
      getTranslations({ locale, namespace: 'dashboard' }),
    ])
  const columns = (table?.columns ?? [])
    .filter((col) => col.key && col.label)
    .map((col) => ({ key: col.key as string, label: col.label as string }))
  return (
    <article className="page" data-template="dashboard">
      <TextBlock
        lead={page.meta?.description ?? undefined}
        title={page.title}
      />
      <FilterBar
        buttons={[{ label: t('reset'), variant: 'secondary' }]}
        selects={[
          {
            name: 'status',
            options: [
              { label: t('statusActive'), value: 'aktiv' },
              { label: t('statusDraft'), value: 'entwurf' },
            ],
            placeholder: t('statusPlaceholder'),
          },
        ]}
      />
      <CardGrid>
        {widgets
          .filter((widget) => widget.title)
          .map((widget) => (
            <DashboardWidget
              footer={widget.footer}
              key={widget.title}
              title={widget.title as string}
            >
              <p className="widget-metric">{widget.value}</p>
            </DashboardWidget>
          ))}
      </CardGrid>
      {columns.length && table?.rows?.length ? (
        <DataTable columns={columns} rows={table.rows} />
      ) : null}
      {notifications.length ? (
        <NotificationList
          items={notifications
            .filter((item) => item.text)
            .map((item) => ({
              text: item.text as string,
              time: item.time,
              tone: item.tone,
            }))}
          title="Aktivität"
        />
      ) : null}
      {steps.length ? (
        <Timeline
          items={steps
            .filter((step) => step.title)
            .map((step) => ({
              description: step.description,
              status: step.status,
              title: step.title as string,
            }))}
        />
      ) : null}
      <div className="page-body">{renderBody(page.content)}</div>
    </article>
  )
}
