import React from 'react'

import { cx } from '@/lib/cx'

import type { Media } from '@/payload-types'

import { Button, type ButtonVariant } from '../atoms/button'
import { type IconName } from '../atoms/icon'
import { Img } from '../atoms/image'
import { BadgeGroup, type BadgeGroupItem } from './badge-group'
import { IconButton } from '../molecules/icon-button'
import { TextBlock } from '../molecules/text-block'

export type LeadAction = {
  href: string
  icon?: IconName
  label: string
  variant?: ButtonVariant
}

// Multi-purpose lead block — badges + TextBlock (eyebrow/title/lead) +
// action buttons + optional media, for section intros, CTAs and hero
// variants inside content. `.lead-section*` contract classes.
export const LeadSection = ({
  actions,
  align,
  badges,
  children,
  className,
  eyebrow,
  lead,
  level,
  media,
  title,
}: {
  actions?: LeadAction[]
  align?: 'center'
  badges?: BadgeGroupItem[]
  children?: React.ReactNode
  className?: string
  eyebrow?: string
  lead?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  media?: Media | null
  title: string
}) => (
  <section
    className={cx('lead-section', align && `lead-section-${align}`, className)}
  >
    {badges?.length ? <BadgeGroup items={badges} /> : null}
    <TextBlock
      align={align}
      eyebrow={eyebrow}
      lead={lead}
      level={level}
      title={title}
    />
    {actions?.length ? (
      <div className="page-actions lead-section-actions">
        {actions.map((action) =>
          action.icon ? (
            <IconButton
              href={action.href}
              icon={action.icon}
              key={action.label}
              variant={action.variant}
            >
              {action.label}
            </IconButton>
          ) : (
            <Button
              href={action.href}
              key={action.label}
              variant={action.variant}
            >
              {action.label}
            </Button>
          ),
        )}
      </div>
    ) : null}
    {media?.url ? (
      <Img alt={media.alt} className="lead-section-media" src={media.url} />
    ) : null}
    {children}
  </section>
)
