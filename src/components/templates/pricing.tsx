import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

import { Accordion } from '../molecules/accordion'
import { CardGrid } from '../organisms/card'
import { LeadSection } from '../organisms/lead-section'
import { PricingCard } from '../organisms/pricing-card'
import { Heading } from '../atoms/text'
import type { TemplateProps } from './default'

type PricingData = {
  faq?: { content?: string; title?: string }[]
  plans?: {
    badge?: string
    ctaHref?: string
    ctaLabel?: string
    ctaVariant?: 'ghost' | 'primary' | 'secondary'
    features?: string[]
    name?: string
    period?: string
    price?: string
  }[]
}

async function getPricing(): Promise<PricingData> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'structures',
      limit: 1,
      where: { name: { equals: 'pricing' } },
    })
    return (docs[0]?.data as PricingData | undefined) ?? {}
  } catch {
    return {}
  }
}

// Pricing-page layout — LeadSection + plan cards (PricingCard) in a
// grid + FAQ accordion, all fed by the `pricing` structure doc
// (+structure/pricing.yml) + markdown body.
export const PricingTemplate = async ({ page, renderBody }: TemplateProps) => {
  const { faq = [], plans = [] } = await getPricing()
  return (
    <article className="page" data-template="pricing">
      <LeadSection
        lead={page.meta?.description ?? undefined}
        title={page.title}
      />
      <CardGrid>
        {plans
          .filter((plan) => plan.name && plan.price)
          .map((plan) => (
            <PricingCard
              badge={plan.badge}
              cta={{
                href: plan.ctaHref ?? '/kontakt',
                label: plan.ctaLabel ?? 'Anfragen',
                variant: plan.ctaVariant,
              }}
              features={plan.features ?? []}
              key={plan.name}
              name={plan.name as string}
              period={plan.period}
              price={plan.price as string}
            />
          ))}
      </CardGrid>
      {faq.length ? (
        <>
          <Heading level={2}>Häufige Fragen</Heading>
          <Accordion
            items={faq
              .filter((item) => item.title)
              .map((item) => ({
                content: <p>{item.content}</p>,
                title: item.title as string,
              }))}
          />
        </>
      ) : null}
      <div className="page-body">{renderBody(page.content)}</div>
    </article>
  )
}
