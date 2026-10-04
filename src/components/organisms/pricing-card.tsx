import React from 'react'

import { cx } from '@/lib/cx'

import { Button, type ButtonVariant } from '../atoms/button'
import { Icon } from '../atoms/icon'
import { Badge, Heading } from '../atoms/text'

// Pricing plan card — name + optional badge + price + feature list +
// CTA (.pricing-card* contract classes).
export const PricingCard = ({
  badge,
  className,
  cta,
  features,
  name,
  period,
  price,
}: {
  badge?: string
  className?: string
  cta: { href: string; label: string; variant?: ButtonVariant }
  features: string[]
  name: string
  period?: string
  price: string
}) => (
  <div className={cx('pricing-card', className)}>
    <div className="pricing-card-header">
      <Heading className="pricing-card-name" level={3}>
        {name}
      </Heading>
      {badge ? <Badge>{badge}</Badge> : null}
    </div>
    <p className="pricing-card-price">
      {price}
      {period ? <span className="pricing-card-period">{period}</span> : null}
    </p>
    <ul className="pricing-card-features">
      {features.map((feature) => (
        <li key={feature}>
          <Icon name="check" /> {feature}
        </li>
      ))}
    </ul>
    <Button href={cta.href} variant={cta.variant ?? 'primary'}>
      {cta.label}
    </Button>
  </div>
)
