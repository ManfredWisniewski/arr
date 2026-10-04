import React from 'react'

import { cx } from '@/lib/cx'

import { ButtonGroup, type ButtonGroupItem } from '../molecules/button-group'
import { TextBlock } from '../molecules/text-block'

// Form section — titled group of fields + action buttons
// (.form-section contract classes). Children are FormFields etc.
export const FormSection = ({
  actions,
  children,
  className,
  lead,
  title,
}: {
  actions?: ButtonGroupItem[]
  children: React.ReactNode
  className?: string
  lead?: string
  title: string
}) => (
  <section className={cx('form-section', className)}>
    <TextBlock lead={lead} title={title} />
    <div className="form-section-fields">{children}</div>
    {actions?.length ? <ButtonGroup items={actions} /> : null}
  </section>
)
