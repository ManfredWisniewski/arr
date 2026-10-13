import React from 'react'

import { cx } from '@/lib/cx'
import { mediaUrl } from '@/lib/media'

import type { Media } from '@/payload-types'

import { Progress } from '../atoms/progress'
import { Img } from '../atoms/image'
import { ButtonGroup, type ButtonGroupItem } from '../molecules/button-group'
import { TextBlock } from '../molecules/text-block'

// Single step of a multi-step flow — TextBlock + optional media +
// progress + actions (.onboarding-step contract classes).
export const OnboardingStep = ({
  actions,
  className,
  lead,
  media,
  step,
  title,
  total,
}: {
  actions?: ButtonGroupItem[]
  className?: string
  lead?: string
  media?: Media | null
  step: number
  title: string
  total: number
}) => (
  <section className={cx('onboarding-step', className)}>
    <Progress
      aria-label={`Schritt ${step} von ${total}`}
      max={total}
      value={step}
    />
    <TextBlock lead={lead} title={title} />
    {mediaUrl(media, 'content', 960) ? (
      <Img
        alt={media?.alt ?? ''}
        className="onboarding-step-media"
        src={mediaUrl(media, 'content', 960)}
      />
    ) : null}
    {actions?.length ? <ButtonGroup items={actions} /> : null}
  </section>
)
