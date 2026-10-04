'use client'

import React, { useState } from 'react'

import { cx } from '@/lib/cx'

import { type IconName } from '../atoms/icon'
import { Icon } from '../atoms/icon'

export type TabItem = {
  content: React.ReactNode
  icon?: IconName
  label: string
}

// Tab switcher — tablist of triggers + single visible panel, proper
// tab/tabpanel roles (.tabs* contract classes).
export const Tabs = ({
  className,
  defaultIndex = 0,
  items,
}: {
  className?: string
  defaultIndex?: number
  items: TabItem[]
}) => {
  const [active, setActive] = useState(defaultIndex)
  const id = React.useId()
  return (
    <div className={cx('tabs', className)}>
      <div className="tabs-list" role="tablist">
        {items.map((item, index) => (
          <button
            aria-controls={`${id}-panel-${index}`}
            aria-selected={index === active}
            className={cx('tabs-tab', index === active && 'tabs-tab-active')}
            id={`${id}-tab-${index}`}
            key={item.label}
            onClick={() => setActive(index)}
            role="tab"
            type="button"
          >
            {item.icon ? <Icon name={item.icon} /> : null}
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          aria-labelledby={`${id}-tab-${index}`}
          className="tabs-panel"
          hidden={index !== active}
          id={`${id}-panel-${index}`}
          key={item.label}
          role="tabpanel"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
