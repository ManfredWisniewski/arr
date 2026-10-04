import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { CardGrid, type CardItem } from '../organisms/card'
import { LeadSection } from '../organisms/lead-section'
import type { TemplateProps } from './default'

type FeatureItem = {
  description?: string
  href?: string
  icon?: string
  linkLabel?: string
  title?: string
}

async function getFeatures(): Promise<CardItem[]> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      limit: 1,
      where: { name: { equals: 'features' } },
    })
    const items = (docs[0]?.data as { items?: FeatureItem[] } | undefined)
      ?.items
    return (items ?? [])
      .filter((item) => item.title)
      .map((item) => ({
        description: item.description,
        href: item.href,
        icon: item.icon as CardItem['icon'],
        linkLabel: item.linkLabel,
        title: item.title as string,
      }))
  } catch {
    return []
  }
}

// Feature-grid layout — LeadSection (page title + meta description) +
// CardGrid fed by the `features` structure doc + markdown body.
// Convention mirrors `navigation`: structure name `features`.
export const FeaturesTemplate = async ({
  page,
  renderBody,
}: TemplateProps) => {
  const items = await getFeatures()
  return (
    <article className="page" data-template="features">
      <LeadSection
        lead={page.meta?.description ?? undefined}
        title={page.title}
      />
      <CardGrid items={items} />
      <div className="page-body">{renderBody(page.content)}</div>
    </article>
  )
}
